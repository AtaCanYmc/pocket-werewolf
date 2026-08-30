import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { sound } from '@/utils/audio';
import { logger } from '@/utils/logger';
import { DEFAULT_PRESETS } from '@/config/roles';
import { createRoom, joinRoom } from '@/services/roomService';
import { Room, Player, RoleDeckItem, RoomSettings, UserProfile } from '@/types/game';

interface UseRoomActionsProps {
  sessionId: string;
  profile: UserProfile;
  room: Room | null;
  players: Player[];
  me: Player | null;
  isHost: boolean;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setNightActions: React.Dispatch<React.SetStateAction<any[]>>;
  setVotes: React.Dispatch<React.SetStateAction<any[]>>;
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useRoomActions({
  sessionId,
  profile,
  room,
  players,
  me,
  isHost,
  setRoom,
  setPlayers,
  setNightActions,
  setVotes,
  setLogs
}: UseRoomActionsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatErrorMessage = (err: any): string => {
    const msg = err?.message || String(err);
    if (
      msg.includes('410') ||
      msg.toLowerCase().includes('preflight') ||
      msg.toLowerCase().includes('failed to fetch') ||
      msg.toLowerCase().includes('load failed') ||
      msg.toLowerCase().includes('access control checks')
    ) {
      return 'Supabase project is unreachable (HTTP 410 Gone / Network Error). Your project may be paused due to inactivity. Please unpause/restore it in the Supabase Dashboard or update your URL/Key in Settings.';
    }
    return msg;
  };

  const handleCreateRoom = async (
    customDeck: RoleDeckItem[] | null = null,
    settings: RoomSettings = {},
    adminPassword?: string
  ): Promise<Room> => {
    setLoading(true);
    setError(null);
    try {
      const initialDeck = customDeck || DEFAULT_PRESETS[1].deck;
      const { room: newRoom, player: newPlayer } = await createRoom(
        sessionId,
        profile.name,
        profile.avatar,
        initialDeck,
        settings,
        adminPassword
      );
      setRoom(newRoom);
      setPlayers([newPlayer]);
      return newRoom;
    } catch (err: any) {
      const formatted = formatErrorMessage(err);
      setError(formatted);
      logger.error('Failed to create room:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (code: string): Promise<Room> => {
    setLoading(true);
    setError(null);
    try {
      const { room: joinedRoom } = await joinRoom(
        code,
        sessionId,
        profile.name,
        profile.avatar
      );
      setRoom(joinedRoom);
      return joinedRoom;
    } catch (err: any) {
      const formatted = formatErrorMessage(err);
      setError(formatted);
      logger.error('Failed to join room:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (): Promise<void> => {
    const supabase = getSupabase();
    if (supabase && me && room) {
      try {
        if (isHost && players.length > 1) {
          const nextHost = players.find(p => p.id !== me.id);
          if (nextHost) {
            await supabase.from('players').update({ is_host: true }).eq('id', nextHost.id);
            await supabase.from('rooms').update({ host_session_id: nextHost.session_id }).eq('id', room.id);
          }
          await supabase.from('players').delete().eq('id', me.id);
        } else if (isHost || players.length <= 1) {
          await supabase.from('rooms').delete().eq('id', room.id);
        } else {
          await supabase.from('players').delete().eq('id', me.id);
        }
      } catch (err) {
        logger.error('Error during leave room:', err);
      }
    }
    setRoom(null);
    setPlayers([]);
    setNightActions([]);
    setVotes([]);
    setLogs([]);
  };

  const handleToggleReady = async (): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase || !me) return;

    sound.playClick();
    const newReadyState = !me.is_ready;

    // Optimistic update
    setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, is_ready: newReadyState } : p));

    try {
      const { error: updateError } = await supabase.from('players').update({ is_ready: newReadyState }).eq('id', me.id);
      if (updateError) {
        setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, is_ready: !newReadyState } : p));
        logger.error('Failed to toggle ready status:', updateError);
      }
    } catch (err) {
      setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, is_ready: !newReadyState } : p));
      logger.error('Failed to toggle ready status:', err);
    }
  };

  const handleKickPlayer = async (playerId: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase || !isHost) return;

    setPlayers(prev => prev.filter(p => p.id !== playerId));
    try {
      await supabase.from('players').delete().eq('id', playerId);
    } catch (err) {
      logger.error('Failed to kick player:', err);
    }
  };

  const handleUpdateDeck = async (newDeck: RoleDeckItem[]): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase || !isHost || !room) return;

    setRoom(prev => prev ? { ...prev, deck: newDeck } : null);
    try {
      await supabase.from('rooms').update({ deck: newDeck }).eq('id', room.id);
    } catch (err) {
      logger.error('Failed to update deck:', err);
    }
  };

  return {
    loading,
    error,
    setError,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    toggleReady: handleToggleReady,
    kickPlayer: handleKickPlayer,
    updateDeck: handleUpdateDeck
  };
}
