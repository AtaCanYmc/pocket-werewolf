import { useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { sound } from '@/utils/audio';
import { logger } from '@/utils/logger';
import { Room, Player, NightAction, Vote, GameLog, UserProfile } from '@/types/game';
import { RealtimePostgresChangesPayload, RealtimePresenceState } from '@supabase/supabase-js';

interface UseRealtimeRoomProps {
  room: Room | null;
  sessionId: string;
  profile: UserProfile;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setNightActions: React.Dispatch<React.SetStateAction<NightAction[]>>;
  setVotes: React.Dispatch<React.SetStateAction<Vote[]>>;
  setLogs: React.Dispatch<React.SetStateAction<GameLog[]>>;
  setOnlinePresence: React.Dispatch<React.SetStateAction<RealtimePresenceState>>;
}

export function useRealtimeRoom({
  room,
  sessionId,
  profile,
  setRoom,
  setPlayers,
  setNightActions,
  setVotes,
  setLogs,
  setOnlinePresence
}: UseRealtimeRoomProps) {
  // Refresh all room data from Supabase
  const refreshRoomData = useCallback(async (roomId: string) => {
    const supabase = getSupabase();
    if (!supabase || !roomId) return;

    try {
      const [
        { data: roomData },
        { data: playersData },
        { data: actionsData },
        { data: votesData },
        { data: logsData }
      ] = await Promise.all([
        supabase.from('rooms').select('*').eq('id', roomId).single(),
        supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true }),
        supabase.from('night_actions').select('*').eq('room_id', roomId),
        supabase.from('votes').select('*').eq('room_id', roomId),
        supabase.from('game_logs').select('*').eq('room_id', roomId).order('created_at', { ascending: true })
      ]);

      if (roomData) setRoom(roomData);
      if (playersData) setPlayers(playersData);
      if (actionsData) setNightActions(actionsData);
      if (votesData) setVotes(votesData);
      if (logsData) setLogs(logsData);
    } catch (err: unknown) {
      logger.error('Error refreshing room data:', err);
    }
  }, [setRoom, setPlayers, setNightActions, setVotes, setLogs]);

  // Supabase Realtime Channel Subscription
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !room?.id) return;

    const roomId = room.id;
    const channelName = `room_realtime:${roomId}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload: RealtimePostgresChangesPayload<Room>) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedRoom = payload.new as Room;
            setRoom(updatedRoom);
            if (updatedRoom.status === 'night') sound.playNightFall();
            else if (updatedRoom.status === 'day' || updatedRoom.status === 'dawn') sound.playMorningBell();
            else if (updatedRoom.status === 'ended') sound.playVictory();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload: RealtimePostgresChangesPayload<Player>) => {
          if (payload.eventType === 'INSERT') {
            const newPlayer = payload.new as Player;
            setPlayers(prev => {
              const exists = prev.some(p => p.id === newPlayer.id);
              if (exists) return prev.map(p => p.id === newPlayer.id ? { ...p, ...newPlayer } : p);
              return [...prev, newPlayer];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedPlayer = payload.new as Player;
            setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p));
          } else if (payload.eventType === 'DELETE') {
            const deletedPlayer = payload.old as Partial<Player>;
            setPlayers(prev => prev.filter(p => p.id !== deletedPlayer.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'night_actions', filter: `room_id=eq.${roomId}` },
        (payload: RealtimePostgresChangesPayload<NightAction>) => {
          if (payload.eventType === 'INSERT') {
            const newAction = payload.new as NightAction;
            setNightActions(prev => {
              const exists = prev.some(a => a.id === newAction.id);
              if (exists) return prev.map(a => a.id === newAction.id ? { ...a, ...newAction } : a);
              return [...prev, newAction];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedAction = payload.new as NightAction;
            setNightActions(prev => prev.map(a => a.id === updatedAction.id ? { ...a, ...updatedAction } : a));
          } else if (payload.eventType === 'DELETE') {
            const deletedAction = payload.old as Partial<NightAction>;
            setNightActions(prev => prev.filter(a => a.id !== deletedAction.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
        (payload: RealtimePostgresChangesPayload<Vote>) => {
          if (payload.eventType === 'INSERT') {
            const newVote = payload.new as Vote;
            setVotes(prev => {
              const exists = prev.some(v => v.id === newVote.id);
              if (exists) return prev.map(v => v.id === newVote.id ? { ...v, ...newVote } : v);
              return [...prev, newVote];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedVote = payload.new as Vote;
            setVotes(prev => prev.map(v => v.id === updatedVote.id ? { ...v, ...updatedVote } : v));
          } else if (payload.eventType === 'DELETE') {
            const deletedVote = payload.old as Partial<Vote>;
            setVotes(prev => prev.filter(v => v.id !== deletedVote.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_logs', filter: `room_id=eq.${roomId}` },
        (payload: RealtimePostgresChangesPayload<GameLog>) => {
          const newLog = payload.new as GameLog;
          setLogs(prev => {
            if (prev.some(l => l.id === newLog.id)) return prev;
            return [...prev, newLog];
          });
          if (newLog.type === 'lynch' || newLog.type === 'night_result') {
            sound.playDeathGong();
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlinePresence(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            sessionId,
            name: profile.name,
            avatar: profile.avatar,
            onlineAt: new Date().toISOString()
          });
        }
      });

    refreshRoomData(roomId);

    return () => {
      channel.unsubscribe();
    };
  }, [room?.id, sessionId, profile.name, profile.avatar, refreshRoomData, setRoom, setPlayers, setNightActions, setVotes, setLogs, setOnlinePresence]);

  // Background Heartbeat & Visibility Recovery
  useEffect(() => {
    if (!room?.id) return;

    const roomId = room.id;

    const interval = setInterval(() => {
      refreshRoomData(roomId);
    }, 3000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshRoomData(roomId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [room?.id, refreshRoomData]);

  return { refreshRoomData };
}
