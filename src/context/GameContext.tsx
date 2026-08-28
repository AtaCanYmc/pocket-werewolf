import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { getSupabase, getSupabaseCredentials } from '@/lib/supabase';
import { getSessionId, getStoredProfile, saveStoredProfile } from '@/utils/session';
import { sound } from '@/utils/audio';
import {
  createRoom,
  joinRoom,
  startGame,
  advanceToNight,
  advanceToDay,
  advanceToVoting,
  submitNightAction,
  resolveNightPhase,
  submitVote,
  resolveVotingPhase,
  resetToLobby
} from '@/services/gameEngine';
import { DEFAULT_PRESETS, ROLES } from '@/config/roles';
import {
  Room,
  Player,
  NightAction,
  Vote,
  GameLog,
  UserProfile,
  SupabaseCredentials,
  RoleDefinition,
  RoleDeckItem,
  NightActionType,
  RoomSettings
} from '@/types/game';

interface GameContextValue {
  credentials: SupabaseCredentials;
  profile: UserProfile;
  updateProfile: (name: string, avatar: string) => void;
  sessionId: string;
  room: Room | null;
  players: Player[];
  me: Player | null;
  isHost: boolean;
  myRole: RoleDefinition | null;
  nightActions: NightAction[];
  votes: Vote[];
  logs: GameLog[];
  loading: boolean;
  error: string | null;
  soundEnabled: boolean;
  toggleSound: () => void;
  onlinePresence: Record<string, any>;
  createRoom: (customDeck?: RoleDeckItem[] | null, settings?: RoomSettings) => Promise<Room>;
  joinRoom: (code: string) => Promise<Room>;
  leaveRoom: () => Promise<void>;
  toggleReady: () => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
  updateDeck: (newDeck: RoleDeckItem[]) => Promise<void>;
  startGame: () => Promise<void>;
  advanceToNight: () => Promise<void>;
  submitNightAction: (actionType: NightActionType, targetId: string | null, result?: any) => Promise<void>;
  resolveNight: () => Promise<void>;
  advanceToDay: () => Promise<void>;
  advanceToVoting: () => Promise<void>;
  submitVote: (targetId: string | null) => Promise<void>;
  resolveVoting: () => Promise<void>;
  resetToLobby: () => Promise<void>;
  refreshRoomData: (roomId: string) => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [credentials] = useState<SupabaseCredentials>(getSupabaseCredentials());
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [sessionId] = useState<string>(getSessionId());

  // Game States
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [nightActions, setNightActions] = useState<NightAction[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);
  const [onlinePresence, setOnlinePresence] = useState<Record<string, any>>({});

  // Profile Update
  const updateProfile = (name: string, avatar: string) => {
    saveStoredProfile(name, avatar);
    setProfile({ name, avatar });
  };

  // Toggle Sound FX
  const toggleSound = () => {
    const isNowOn = sound.toggleSound();
    setSoundEnabled(isNowOn);
  };

  // Current Player
  const me = useMemo(() => {
    return players.find(p => p.session_id === sessionId) || null;
  }, [players, sessionId]);

  const isHost = Boolean(me?.is_host);

  // Current Player's Role
  const myRole = useMemo(() => {
    if (!me || !me.role) return null;
    return ROLES[me.role] || null;
  }, [me]);

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
      console.error('Error refreshing room data:', err);
    }
  }, []);

  // Supabase Realtime Subscription
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !room?.id) return;

    const roomId = room.id;
    const channelName = `room_realtime:${roomId}`;

    // Realtime Postgres Changes & Presence Channel
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    // Listen to Database Changes
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload: any) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setRoom(payload.new);
            // Trigger atmospheric sound effects
            if (payload.new.status === 'night') sound.playNightFall();
            else if (payload.new.status === 'day' || payload.new.status === 'dawn') sound.playMorningBell();
            else if (payload.new.status === 'ended') sound.playVictory();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => {
          supabase.from('players').select('*').eq('room_id', roomId).order('joined_at', { ascending: true })
            .then(({ data }) => data && setPlayers(data));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'night_actions', filter: `room_id=eq.${roomId}` },
        () => {
          supabase.from('night_actions').select('*').eq('room_id', roomId)
            .then(({ data }) => data && setNightActions(data));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` },
        () => {
          supabase.from('votes').select('*').eq('room_id', roomId)
            .then(({ data }) => data && setVotes(data));
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_logs', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          setLogs(prev => [...prev, payload.new]);
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
  }, [room?.id, sessionId, profile.name, profile.avatar, refreshRoomData]);

  // 1. Create Room Action
  const handleCreateRoom = async (customDeck: RoleDeckItem[] | null = null, settings: RoomSettings = {}): Promise<Room> => {
    setLoading(true);
    setError(null);
    try {
      const initialDeck = customDeck || DEFAULT_PRESETS[1].deck;
      const { room: newRoom, player: newPlayer } = await createRoom(
        sessionId,
        profile.name,
        profile.avatar,
        initialDeck,
        settings
      );
      setRoom(newRoom);
      setPlayers([newPlayer]);
      return newRoom;
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Join Room Action
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
      setError(err.message || 'Error joining room.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Leave Room Action
  const handleLeaveRoom = async (): Promise<void> => {
    const supabase = getSupabase();
    if (supabase && me && room) {
      if (isHost && players.length > 1) {
        const nextHost = players.find(p => p.id !== me.id);
        if (nextHost) {
          await supabase.from('players').update({ is_host: true }).eq('id', nextHost.id);
          await supabase.from('rooms').update({ host_session_id: nextHost.session_id }).eq('id', room.id);
        }
      }
      await supabase.from('players').delete().eq('id', me.id);
    }
    setRoom(null);
    setPlayers([]);
    setNightActions([]);
    setVotes([]);
    setLogs([]);
  };

  // 4. Toggle Ready Status
  const handleToggleReady = async (): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase || !me) return;

    sound.playClick();
    const newReadyState = !me.is_ready;
    await supabase.from('players').update({ is_ready: newReadyState }).eq('id', me.id);
  };

  // 5. Kick Player Action (Host only)
  const handleKickPlayer = async (playerId: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase || !isHost) return;

    await supabase.from('players').delete().eq('id', playerId);
  };

  // 6. Update Role Deck (Host only)
  const handleUpdateDeck = async (newDeck: RoleDeckItem[]): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase || !isHost || !room) return;

    await supabase.from('rooms').update({ deck: newDeck }).eq('id', room.id);
  };

  // 7. Start Game Action (Host only)
  const handleStartGame = async (): Promise<void> => {
    if (!isHost || !room) return;
    setLoading(true);
    try {
      sound.playWolfHowl();
      await startGame(room.id, room.deck, players);
    } catch (err: any) {
      setError(err.message || 'Failed to start game.');
    } finally {
      setLoading(false);
    }
  };

  // 8. Advance to Night Phase (Host only)
  const handleAdvanceToNight = async (): Promise<void> => {
    if (!room) return;
    await advanceToNight(room.id, room.round);
  };

  // 9. Submit Night Action
  const handleNightAction = async (actionType: NightActionType, targetId: string | null, result: any = null): Promise<void> => {
    if (!room || !me) return;
    sound.playClick();
    await submitNightAction(room.id, room.round, me.id, actionType, targetId, result);
  };

  // 10. Resolve Night Actions (Host only)
  const handleResolveNight = async (): Promise<void> => {
    if (!room || !isHost) return;
    setLoading(true);
    try {
      await resolveNightPhase(room.id, room.round, players, nightActions);
    } finally {
      setLoading(false);
    }
  };

  // 11. Advance to Day Discussion (Host only)
  const handleAdvanceToDay = async (): Promise<void> => {
    if (!room) return;
    await advanceToDay(room.id, room.round);
  };

  // 12. Advance to Voting Phase (Host only)
  const handleAdvanceToVoting = async (): Promise<void> => {
    if (!room) return;
    await advanceToVoting(room.id, room.round);
  };

  // 13. Cast Vote
  const handleVote = async (targetId: string | null): Promise<void> => {
    if (!room || !me) return;
    sound.playClick();
    await submitVote(room.id, room.round, me.id, targetId);
  };

  // 14. Resolve Voting Results (Host only)
  const handleResolveVoting = async (): Promise<void> => {
    if (!room || !isHost) return;
    setLoading(true);
    try {
      await resolveVotingPhase(room.id, room.round, players, votes);
    } finally {
      setLoading(false);
    }
  };

  // 15. Reset Back to Lobby (Host only)
  const handleResetToLobby = async (): Promise<void> => {
    if (!room || !isHost) return;
    await resetToLobby(room.id);
  };

  const value: GameContextValue = {
    credentials,
    profile,
    updateProfile,
    sessionId,
    room,
    players,
    me,
    isHost,
    myRole,
    nightActions,
    votes,
    logs,
    loading,
    error,
    soundEnabled,
    toggleSound,
    onlinePresence,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    toggleReady: handleToggleReady,
    kickPlayer: handleKickPlayer,
    updateDeck: handleUpdateDeck,
    startGame: handleStartGame,
    advanceToNight: handleAdvanceToNight,
    submitNightAction: handleNightAction,
    resolveNight: handleResolveNight,
    advanceToDay: handleAdvanceToDay,
    advanceToVoting: handleAdvanceToVoting,
    submitVote: handleVote,
    resolveVoting: handleResolveVoting,
    resetToLobby: handleResetToLobby,
    refreshRoomData
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
