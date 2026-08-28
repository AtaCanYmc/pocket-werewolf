import { getSupabase } from '@/lib/supabase';
import { ROLES } from '@/config/roles';
import {
  Player,
  Room,
  RoleDeckItem,
  RoomSettings,
  NightAction,
  Vote,
  WinnerTeam,
  NightActionType,
  DeathReason
} from '@/types/game';

/**
 * Generates a random 4-character alphanumeric room code.
 */
export function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

/**
 * 1. Creates a new room and registers the host player.
 */
export async function createRoom(
  hostSessionId: string,
  hostName: string,
  hostAvatar: string,
  initialDeck: RoleDeckItem[],
  settings: RoomSettings = {}
): Promise<{ room: Room; player: Player }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured!');

  const code = generateRoomCode();

  // Create room record
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert([
      {
        code,
        host_session_id: hostSessionId,
        status: 'lobby',
        round: 1,
        deck: initialDeck,
        settings: {
          revealRoleOnDeath: true,
          nightDuration: 45,
          dayDuration: 90,
          votingDuration: 45,
          allowSelfProtect: true,
          ...settings,
        }
      }
    ])
    .select()
    .single();

  if (roomError) throw roomError;

  // Add host player to room
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert([
      {
        room_id: room.id,
        session_id: hostSessionId,
        name: hostName,
        avatar: hostAvatar,
        is_host: true,
        is_ready: true,
        is_alive: true
      }
    ])
    .select()
    .single();

  if (playerError) throw playerError;

  return { room, player };
}

/**
 * 2. Joins an existing room or reconnects a player.
 */
export async function joinRoom(
  roomCode: string,
  sessionId: string,
  playerName: string,
  playerAvatar: string
): Promise<{ room: Room; player: Player }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured!');

  const cleanCode = roomCode.trim().toUpperCase();

  // Find room by code
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', cleanCode)
    .single();

  if (roomError || !room) {
    throw new Error('Room not found. Please verify the room code.');
  }

  if (room.status !== 'lobby') {
    // Check if player is reconnecting
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existingPlayer) {
      return { room, player: existingPlayer };
    }
    throw new Error('Game is already in progress!');
  }

  // Check if player previously joined this lobby
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', room.id)
    .eq('session_id', sessionId)
    .maybeSingle();

  if (existingPlayer) {
    // Update name or avatar
    const { data: updatedPlayer } = await supabase
      .from('players')
      .update({ name: playerName, avatar: playerAvatar })
      .eq('id', existingPlayer.id)
      .select()
      .single();

    return { room, player: updatedPlayer || existingPlayer };
  }

  // Insert new player
  const { data: newPlayer, error: joinError } = await supabase
    .from('players')
    .insert([
      {
        room_id: room.id,
        session_id: sessionId,
        name: playerName,
        avatar: playerAvatar,
        is_host: false,
        is_ready: false,
        is_alive: true
      }
    ])
    .select()
    .single();

  if (joinError) throw joinError;

  return { room, player: newPlayer };
}

/**
 * 3. Randomly assigns roles using Fisher-Yates shuffle and starts the game.
 */
export async function startGame(
  roomId: string,
  deck: RoleDeckItem[],
  players: Player[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured!');

  // Flatten deck to role array (e.g. 2 Werewolf -> ['Werewolf', 'Werewolf'])
  const rolePool: string[] = [];
  deck.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      rolePool.push(item.role);
    }
  });

  if (rolePool.length < players.length) {
    throw new Error(`Deck role count (${rolePool.length}) is less than player count (${players.length})!`);
  }

  // Fisher-Yates Shuffle
  for (let i = rolePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolePool[i], rolePool[j]] = [rolePool[j], rolePool[i]];
  }

  // Assign roles to players
  const updatePromises = players.map((p, idx) => {
    const roleId = (rolePool[idx] || 'Villager') as keyof typeof ROLES;
    const roleDef = ROLES[roleId] || ROLES.Villager;

    return supabase
      .from('players')
      .update({
        role: roleId,
        team: roleDef.team,
        is_alive: true,
        is_revealed: false,
        death_reason: null,
        death_round: null,
        witch_used_save: false,
        witch_used_kill: false,
      })
      .eq('id', p.id);
  });

  await Promise.all(updatePromises);

  // Clear previous actions, votes, and logs
  await supabase.from('night_actions').delete().eq('room_id', roomId);
  await supabase.from('votes').delete().eq('room_id', roomId);
  await supabase.from('game_logs').delete().eq('room_id', roomId);

  // Add initial narrative log
  await supabase.from('game_logs').insert([
    {
      room_id: roomId,
      round: 1,
      message: 'A new game has begun. Roles have been distributed!',
      type: 'info'
    }
  ]);

  // Transition room to role_reveal status
  const { error: roomUpdateError } = await supabase
    .from('rooms')
    .update({
      status: 'role_reveal',
      round: 1,
      winner: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  if (roomUpdateError) throw roomUpdateError;
}

/**
 * 4. Advances room status to night.
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

  await supabase
    .from('rooms')
    .update({
      status: 'night',
      round: currentRound,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);
}

/**
 * 5. Submits or updates a night action (Kill, Protect, Inspect, Potion).
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
    await supabase
      .from('night_actions')
      .update({ target_id: targetId, result, created_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
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
  }
}

/**
 * 6. Resolves all night actions and transitions to Dawn / Morning.
 */
export async function resolveNightPhase(
  roomId: string,
  round: number,
  players: Player[],
  actions: NightAction[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

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
  const deadPlayerIds = new Set<string>();
  const deathReasons: Record<string, DeathReason> = {};

  if (wolfTargetId && !isProtectedByDoctor && !isSavedByWitch) {
    deadPlayerIds.add(wolfTargetId);
    deathReasons[wolfTargetId] = 'night_kill';
  }

  if (witchKillTargetId) {
    deadPlayerIds.add(witchKillTargetId);
    deathReasons[witchKillTargetId] = 'witch_poison';
  }

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

  if (deadPlayerIds.size === 0) {
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
    if (deadPlayerIds.has(p.id)) {
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

/**
 * 7. Advances to Day discussion.
 */
export async function advanceToDay(roomId: string, round: number): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from('game_logs').insert([
    {
      room_id: roomId,
      round,
      message: `Day ${round}: Villagers gather in the town square to discuss suspicions!`,
      type: 'info'
    }
  ]);

  await supabase
    .from('rooms')
    .update({
      status: 'day',
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);
}

/**
 * 8. Advances to Voting phase.
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

  await supabase
    .from('rooms')
    .update({
      status: 'voting',
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);
}

/**
 * 9. Submits a vote.
 */
export async function submitVote(
  roomId: string,
  round: number,
  voterId: string,
  targetId: string | null
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

  if (existing) {
    if (targetId === null) {
      await supabase.from('votes').delete().eq('id', existing.id);
    } else {
      await supabase.from('votes').update({ target_id: targetId }).eq('id', existing.id);
    }
  } else if (targetId !== null) {
    await supabase.from('votes').insert([
      {
        room_id: roomId,
        round,
        voter_id: voterId,
        target_id: targetId
      }
    ]);
  }
}

/**
 * 10. Resolves voting tally and applies lynch execution.
 */
export async function resolveVotingPhase(
  roomId: string,
  round: number,
  players: Player[],
  votes: Vote[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const voteCounts: Record<string, number> = {};
  votes.forEach(v => {
    voteCounts[v.target_id] = (voteCounts[v.target_id] || 0) + 1;
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

  let updatedPlayers = [...players];

  if (isTie || !targetIdToLynch || maxVotes === 0) {
    await supabase.from('game_logs').insert([
      {
        room_id: roomId,
        round,
        message: '⚖️ Voting resulted in a tie or insufficient votes. No one was executed today!',
        type: 'lynch'
      }
    ]);
  } else {
    const executedPlayer = players.find(p => p.id === targetIdToLynch);
    if (executedPlayer) {
      await supabase
        .from('players')
        .update({
          is_alive: false,
          death_reason: 'lynched',
          death_round: round,
          is_revealed: true
        })
        .eq('id', targetIdToLynch);

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
        p.id === targetIdToLynch ? { ...p, is_alive: false, is_revealed: true, death_reason: 'lynched' as DeathReason } : p
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

/**
 * 11. Checks win conditions based on living players.
 */
export function checkWinCondition(players: Player[]): WinnerTeam {
  const alivePlayers = players.filter(p => p.is_alive);
  if (alivePlayers.length === 0) return 'draw';

  const evilPlayers = alivePlayers.filter(p => p.team === 'evil');
  const goodPlayers = alivePlayers.filter(p => p.team === 'good');

  // If all evil players are dead -> Villagers (good) win!
  if (evilPlayers.length === 0) {
    return 'good';
  }

  // If living evil players >= living good players -> Werewolves (evil) win!
  if (evilPlayers.length >= goodPlayers.length) {
    return 'evil';
  }

  return null; // Game continues
}

/**
 * 12. Resets the room and players back to the lobby state.
 */
export async function resetToLobby(roomId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase
    .from('players')
    .update({
      role: null,
      team: null,
      is_alive: true,
      is_revealed: false,
      death_reason: null,
      death_round: null,
      is_ready: false,
      witch_used_save: false,
      witch_used_kill: false,
    })
    .eq('room_id', roomId);

  await supabase.from('night_actions').delete().eq('room_id', roomId);
  await supabase.from('votes').delete().eq('room_id', roomId);
  await supabase.from('game_logs').delete().eq('room_id', roomId);

  await supabase
    .from('rooms')
    .update({
      status: 'lobby',
      round: 1,
      winner: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);
}
