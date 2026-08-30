import { getSupabase } from '@/lib/supabase';
import { Player, NightAction, NightActionType, DeathReason } from '@/types/game';
import { checkWinCondition } from './winCondition';
import { logger } from '@/utils/logger';

export interface NightStatusResult {
  allCompleted: boolean;
  totalRequired: number;
  totalCompleted: number;
  wolfDone: boolean;
  seerDone: boolean;
  doctorDone: boolean;
  sorceressDone: boolean;
}

/**
 * Advances room status to night and logs atmospheric message.
 */
export async function advanceToNight(roomId: string, currentRound: number = 1): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from('game_logs').insert([
    {
      room_id: roomId,
      round: currentRound,
      message: `Night ${currentRound} falls. The entire village falls into deep sleep...`,
      type: 'info'
    }
  ]);

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'night',
      round: currentRound,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  if (error) {
    logger.error('Failed to advance room to night:', error);
    throw error;
  }
}

/**
 * Submits or updates a night action (Kill, Protect, Inspect, Potion).
 */
export async function submitNightAction(
  roomId: string,
  round: number,
  actorId: string,
  actionType: NightActionType,
  targetId: string | null,
  result: any = null
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from('night_actions')
    .select('id')
    .eq('room_id', roomId)
    .eq('round', round)
    .eq('actor_id', actorId)
    .eq('action_type', actionType)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('night_actions')
      .update({ target_id: targetId, result, created_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) {
      logger.error('Failed to update night action:', error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from('night_actions')
      .insert([
        {
          room_id: roomId,
          round,
          actor_id: actorId,
          action_type: actionType,
          target_id: targetId,
          result
        }
      ]);

    if (error) {
      logger.error('Failed to insert night action:', error);
      throw error;
    }
  }
}

/**
 * Evaluates whether all required living night roles have submitted their night actions.
 * Pure logic function for easy unit testing.
 */
export function checkNightActionsStatus(
  players: Player[],
  actions: NightAction[],
  round: number
): NightStatusResult {
  const alivePlayers = players.filter(p => p.is_alive);

  const livingWolves = alivePlayers.filter(p => p.role === 'Werewolf');
  const livingSeer = alivePlayers.find(p => p.role === 'Seer');
  const livingDoctor = alivePlayers.find(p => p.role === 'Doctor');
  const livingSorceress = alivePlayers.find(p => p.role === 'Sorceress');

  // Werewolf pack requires at least 1 action (attack or pass) submitted by living wolves
  const wolfDone = livingWolves.length === 0 || actions.some(
    a => a.round === round && a.action_type === 'werewolf_kill'
  );

  // Seer requires 1 inspection
  const seerDone = !livingSeer || actions.some(
    a => a.round === round && a.actor_id === livingSeer.id && a.action_type === 'seer_inspect'
  );

  // Doctor requires 1 protection
  const doctorDone = !livingDoctor || actions.some(
    a => a.round === round && a.actor_id === livingDoctor.id && a.action_type === 'doctor_heal'
  );

  // Sorceress requires 1 inspection
  const sorceressDone = !livingSorceress || actions.some(
    a => a.round === round && a.actor_id === livingSorceress.id && a.action_type === 'sorceress_inspect'
  );

  let totalRequired = 0;
  let totalCompleted = 0;

  if (livingWolves.length > 0) {
    totalRequired++;
    if (wolfDone) totalCompleted++;
  }
  if (livingSeer) {
    totalRequired++;
    if (seerDone) totalCompleted++;
  }
  if (livingDoctor) {
    totalRequired++;
    if (doctorDone) totalCompleted++;
  }
  if (livingSorceress) {
    totalRequired++;
    if (sorceressDone) totalCompleted++;
  }

  const allCompleted = (totalRequired === 0) || (totalCompleted >= totalRequired);

  return {
    allCompleted,
    totalRequired,
    totalCompleted,
    wolfDone,
    seerDone,
    doctorDone,
    sorceressDone
  };
}

/**
 * Calculates casualties from night actions.
 * Pure logic helper for testing and separation of concerns.
 */
export function calculateNightCasualties(
  actions: NightAction[]
): { deadPlayerIds: string[]; deathReasons: Record<string, DeathReason> } {
  // 1. Determine Werewolf Attack Target
  const wolfKills = actions.filter(a => a.action_type === 'werewolf_kill' && a.target_id);
  let wolfTargetId: string | null = null;
  if (wolfKills.length > 0) {
    const voteCounts: Record<string, number> = {};
    wolfKills.forEach(a => {
      if (a.target_id) {
        voteCounts[a.target_id] = (voteCounts[a.target_id] || 0) + 1;
      }
    });
    let maxVotes = 0;
    for (const [targetId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        wolfTargetId = targetId;
      }
    }
  }

  // 2. Check Doctor Protection
  const doctorHeals = actions.filter(a => a.action_type === 'doctor_heal' && a.target_id);
  const isProtectedByDoctor = doctorHeals.some(a => a.target_id === wolfTargetId);

  // 3. Check Witch Potions
  const witchSave = actions.find(a => a.action_type === 'witch_heal');
  const isSavedByWitch = Boolean(witchSave && witchSave.target_id === wolfTargetId);

  const witchKill = actions.find(a => a.action_type === 'witch_kill' && a.target_id);
  const witchKillTargetId = witchKill ? witchKill.target_id : null;

  // 4. Calculate Casualties
  const deadPlayerIds: string[] = [];
  const deathReasons: Record<string, DeathReason> = {};

  if (wolfTargetId && !isProtectedByDoctor && !isSavedByWitch) {
    deadPlayerIds.push(wolfTargetId);
    deathReasons[wolfTargetId] = 'night_kill';
  }

  if (witchKillTargetId && !deadPlayerIds.includes(witchKillTargetId)) {
    deadPlayerIds.push(witchKillTargetId);
    deathReasons[witchKillTargetId] = 'witch_poison';
  }

  return { deadPlayerIds, deathReasons };
}

/**
 * Resolves all night actions and transitions to Dawn / Morning.
 */
export async function resolveNightPhase(
  roomId: string,
  round: number,
  players: Player[],
  actions: NightAction[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  // Verify all required night actions are completed before resolving
  const status = checkNightActionsStatus(players, actions, round);
  if (!status.allCompleted) {
    logger.warn('Cannot resolve night: some active roles have not completed their actions yet.');
    return;
  }

  const { deadPlayerIds, deathReasons } = calculateNightCasualties(actions);

  // Update dead players in database
  const logsToInsert: any[] = [];

  for (const playerId of deadPlayerIds) {
    const player = players.find(p => p.id === playerId);
    await supabase
      .from('players')
      .update({
        is_alive: false,
        death_reason: deathReasons[playerId] || 'night_kill',
        death_round: round
      })
      .eq('id', playerId);

    if (player) {
      logsToInsert.push({
        room_id: roomId,
        round,
        message: `☀️ Dawn breaks... ${player.name} was brutally murdered during the night!`,
        type: 'night_result'
      });
    }
  }

  if (deadPlayerIds.length === 0) {
    logsToInsert.push({
      room_id: roomId,
      round,
      message: '☀️ Dawn breaks... A peaceful night for the village; no casualties were found!',
      type: 'night_result'
    });
  }

  await supabase.from('game_logs').insert(logsToInsert);

  // Check win conditions with updated players
  const updatedPlayers = players.map(p => {
    if (deadPlayerIds.includes(p.id)) {
      return { ...p, is_alive: false, death_reason: deathReasons[p.id] };
    }
    return p;
  });

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
    // Transition to dawn phase
    await supabase
      .from('rooms')
      .update({
        status: 'dawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId);
  }
}
