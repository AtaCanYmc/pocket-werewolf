import { useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { sound } from '@/utils/audio';
import { logger } from '@/utils/logger';
import { Room, Player, NightAction, Vote, GameLog, UserProfile } from '@/types/game';

interface UseRealtimeRoomProps {
  room: Room | null;
  sessionId: string;
  profile: UserProfile;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setNightActions: React.Dispatch<React.SetStateAction<NightAction[]>>;
  setVotes: React.Dispatch<React.SetStateAction<Vote[]>>;
  setLogs: React.Dispatch<React.SetStateAction<GameLog[]>>;
  setOnlinePresence: React.Dispatch<React.SetStateAction<Record<string, any>>>;
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
    } catch (err) {
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
        (payload: any) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setRoom(payload.new);
            if (payload.new.status === 'night') sound.playNightFall();
            else if (payload.new.status === 'day' || payload.new.status === 'dawn') sound.playMorningBell();
            else if (payload.new.status === 'ended') sound.playVictory();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setPlayers(prev => {
              const exists = prev.some(p => p.id === payload.new.id);
              if (exists) return prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p);
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setPlayers(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
          } else if (payload.eventType === 'DELETE') {
            setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'night_actions', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setNightActions(prev => {
              const exists = prev.some(a => a.id === payload.new.id);
              if (exists) return prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a);
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setNightActions(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a));
          } else if (payload.eventType === 'DELETE') {
            setNightActions(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setVotes(prev => {
              const exists = prev.some(v => v.id === payload.new.id);
              if (exists) return prev.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v);
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setVotes(prev => prev.map(v => v.id === payload.new.id ? { ...v, ...payload.new } : v));
          } else if (payload.eventType === 'DELETE') {
            setVotes(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_logs', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          setLogs(prev => {
            if (prev.some(l => l.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          if (payload.new.type === 'lynch' || payload.new.type === 'night_result') {
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
