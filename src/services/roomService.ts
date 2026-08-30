import { getSupabase } from '@/lib/supabase';
import { ROLES } from '@/config/roles';
import { Player, Room, RoleDeckItem, RoomSettings } from '@/types/game';
import { checkAdminPasswordRequired, verifyAdminPassword } from './adminService';
import { logger } from '@/utils/logger';

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
 * Pure function to flatten and shuffle roles from a deck.
 */
export function shuffleDeck(deck: RoleDeckItem[], playerCount: number): string[] {
  const rolePool: string[] = [];
  deck.forEach(item => {
    for (let i = 0; i < item.count; i++) {
      rolePool.push(item.role);
    }
  });

  if (rolePool.length < playerCount) {
    throw new Error(`Deck role count (${rolePool.length}) is less than player count (${playerCount})!`);
  }

  // Fisher-Yates Shuffle
  const shuffled = [...rolePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Opportunistically purges stale abandoned lobbies (> 6 hours) and finished matches (> 24 hours).
 * Runs in the background without blocking client execution.
 */
export async function cleanupStaleRooms(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Purge stale lobbies created over 6 hours ago
    await supabase
      .from('rooms')
      .delete()
      .eq('status', 'lobby')
      .lt('created_at', sixHoursAgo);

    // 2. Purge stale matches created over 24 hours ago
    await supabase
      .from('rooms')
      .delete()
      .lt('created_at', twentyFourHoursAgo);

    // 3. Purge old game chat logs and events created over 24 hours ago
    await supabase
      .from('game_logs')
      .delete()
      .lt('created_at', twentyFourHoursAgo);
  } catch (err) {
    logger.debug('Opportunistic stale rooms cleanup notice:', err);
  }
}

/**
 * Creates a new room and registers the host player.
 */
export async function createRoom(
  hostSessionId: string,
  hostName: string,
  hostAvatar: string,
  initialDeck: RoleDeckItem[],
  settings: RoomSettings = {},
  adminPassword?: string
): Promise<{ room: Room; player: Player }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured!');

  // Verify admin password if required by Supabase or env
  const isRequired = await checkAdminPasswordRequired();
  if (isRequired) {
    const isValid = await verifyAdminPassword(adminPassword || '');
    if (!isValid) {
      throw new Error('Incorrect admin password. Room creation is restricted.');
    }
  }

  // Trigger non-blocking background stale rooms cleanup
  cleanupStaleRooms().catch(() => {});

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

  if (roomError) {
    logger.error('Failed to create room:', roomError);
    throw roomError;
  }

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

  if (playerError) {
    logger.error('Failed to insert host player:', playerError);
    throw playerError;
  }

  return { room, player };
}

/**
 * Joins an existing room or reconnects a player.
 */
export async function joinRoom(
  roomCode: string,
  sessionId: string,
  playerName: string,
  playerAvatar: string
): Promise<{ room: Room; player: Player }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured!');

  // Trigger non-blocking background stale rooms cleanup
  cleanupStaleRooms().catch(() => {});

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
    const { data: updatedPlayer, error: updateError } = await supabase
      .from('players')
      .update({ name: playerName, avatar: playerAvatar })
      .eq('id', existingPlayer.id)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to update reconnecting player:', updateError);
    }

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

  if (joinError) {
    logger.error('Failed to join room:', joinError);
    throw joinError;
  }

  return { room, player: newPlayer };
}

/**
 * Randomly assigns roles using Fisher-Yates shuffle and starts the game.
 */
export async function startGame(
  roomId: string,
  deck: RoleDeckItem[],
  players: Player[]
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured!');

  const rolePool = shuffleDeck(deck, players.length);

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

  if (roomUpdateError) {
    logger.error('Failed to transition room to role_reveal:', roomUpdateError);
    throw roomUpdateError;
  }
}

/**
 * Advances to Day discussion.
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

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'day',
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  if (error) {
    logger.error('Failed to advance room to day:', error);
    throw error;
  }
}

/**
 * Resets the room and players back to the lobby state.
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

  const { error } = await supabase
    .from('rooms')
    .update({
      status: 'lobby',
      round: 1,
      winner: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId);

  if (error) {
    logger.error('Failed to reset room to lobby:', error);
    throw error;
  }
}
