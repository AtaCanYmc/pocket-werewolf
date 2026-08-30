import { getSupabase } from '@/lib/supabase';
import { Player, Vote, DeathReason } from '@/types/game';
import { ROLES } from '@/config/roles';
import { checkWinCondition } from './winCondition';
import { advanceToNight } from './nightService';
import { logger } from '@/utils/logger';

export interface VoteTallyResult {
  voteCounts: Record<string, number>;
  skipVotes: number;
  maxVotes: number;
  targetIdToLynch: string | null;
  isTie: boolean;
  isSkipped: boolean;
}

/**
 * Advances to Voting phase and clears previous round votes.
 */
export async function advanceToVoting(roomId: string, round: number): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from('votes').delete().eq('room_id', roomId);

  await supabase.from('game_logs').insert([
    {
      room_id: roomId,
      round,
      message: 'Voting has begun! Cast your vote on the suspect.',
      type: 'info'
    }
  ]);

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'voting',
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  if (error) {
    logger.error('Failed to advance to voting:', error);
    throw error;
  }
}

/**
 * Submits a vote (targetId: string for player, null for Blank/Skip vote, or isRetract to remove vote).
 */
export async function submitVote(
  roomId: string,
  round: number,
  voterId: string,
  targetId: string | null,
  isRetract: boolean = false
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('room_id', roomId)
    .eq('round', round)
    .eq('voter_id', voterId)
    .maybeSingle();

  if (isRetract) {
    if (existing) {
      await supabase.from('votes').delete().eq('id', existing.id);
    }
    return;
  }

  if (existing) {
    const { error } = await supabase.from('votes').update({ target_id: targetId }).eq('id', existing.id);
    if (error) {
      logger.error('Failed to update vote:', error);
      throw error;
    }
  } else {
    const { error } = await supabase.from('votes').insert([
      {
        room_id: roomId,
        round,
        voter_id: voterId,
        target_id: targetId
      }
    ]);
    if (error) {
      logger.error('Failed to insert vote:', error);
      throw error;
    }
  }
}

/**
 * Pure function to calculate voting outcome from an array of votes.
 */
export function calculateVoteTally(votes: Vote[]): VoteTallyResult {
  const voteCounts: Record<string, number> = {};
  let skipVotes = 0;

  votes.forEach(v => {
    if (v.target_id === null) {
      skipVotes++;
    } else {
      voteCounts[v.target_id] = (voteCounts[v.target_id] || 0) + 1;
    }
  });

  let maxVotes = 0;
  let targetIdToLynch: string | null = null;
  let isTie = false;

  for (const [targetId, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      targetIdToLynch = targetId;
      isTie = false;
    } else if (count === maxVotes && count > 0) {
      isTie = true;
    }
  }

  const isSkipped = skipVotes >= maxVotes && skipVotes > 0;

  return {
    voteCounts,
    skipVotes,
    maxVotes,
    targetIdToLynch: isSkipped ? null : targetIdToLynch,
    isTie,
    isSkipped
  };
}

/**
 * Resolves voting tally and applies lynch execution.
 */
export async function resolveVotingPhase(
  roomId: string,
  round: number,
  players: Player[],
  votes: Vote[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const alivePlayers = players.filter(p => p.is_alive);
  if (votes.length < alivePlayers.length && alivePlayers.length > 0) {
    logger.warn('Cannot resolve voting: some living players have not cast their vote yet.');
    return;
  }

  const tally = calculateVoteTally(votes);
  let updatedPlayers = [...players];

  if (tally.isSkipped) {
    // Village majority voted to skip/pass execution
    await supabase.from('game_logs').insert([
      {
        room_id: roomId,
        round,
        message: `⚖️ The village voted to skip execution (${tally.skipVotes} pass votes). No one was executed today!`,
        type: 'lynch'
      }
    ]);
  } else if (tally.isTie || !tally.targetIdToLynch || tally.maxVotes === 0) {
    await supabase.from('game_logs').insert([
      {
        room_id: roomId,
        round,
        message: '⚖️ Voting resulted in a tie or insufficient votes. No one was executed today!',
        type: 'lynch'
      }
    ]);
  } else {
    const executedPlayer = players.find(p => p.id === tally.targetIdToLynch);
    if (executedPlayer) {
      await supabase
        .from('players')
        .update({
          is_alive: false,
          death_reason: 'lynched',
          death_round: round,
          is_revealed: true
        })
        .eq('id', tally.targetIdToLynch);

      const roleDef = executedPlayer.role ? ROLES[executedPlayer.role] : null;
      const roleName = roleDef ? roleDef.name : executedPlayer.role;

      await supabase.from('game_logs').insert([
        {
          room_id: roomId,
          round,
          message: `⚖️ The village made its decision: ${executedPlayer.name} (${roleName}) was executed!`,
          type: 'lynch'
        }
      ]);

      updatedPlayers = updatedPlayers.map(p =>
        p.id === tally.targetIdToLynch
          ? { ...p, is_alive: false, is_revealed: true, death_reason: 'lynched' as DeathReason }
          : p
      );
    }
  }

  // Check victory condition
  const winResult = checkWinCondition(updatedPlayers);

  if (winResult) {
    await supabase
      .from('rooms')
      .update({
        status: 'ended',
        winner: winResult,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId);
  } else {
    // Advance to next night
    await advanceToNight(roomId, round + 1);
  }
}
