import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { getSupabaseCredentials } from '@/lib/supabase';
import { getSessionId, getStoredProfile, saveStoredProfile } from '@/utils/session';
import { sound } from '@/utils/audio';
import { ROLES } from '@/config/roles';
import { useRealtimeRoom } from '@/hooks/useRealtimeRoom';
import { useRoomActions } from '@/hooks/useRoomActions';
import { usePhaseActions } from '@/hooks/usePhaseActions';
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
  createRoom: (customDeck?: RoleDeckItem[] | null, settings?: RoomSettings, adminPassword?: string) => Promise<Room>;
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
  submitVote: (targetId: string | null, isRetract?: boolean) => Promise<void>;
  resolveVoting: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
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

  // Hook 1: Realtime Synchronization & Polling
  const { refreshRoomData } = useRealtimeRoom({
    room,
    sessionId,
    profile,
    setRoom,
    setPlayers,
    setNightActions,
    setVotes,
    setLogs,
    setOnlinePresence
  });

  // Hook 2: Room Lifecycle Actions
  const {
    loading: roomLoading,
    error: roomError,
    setError: setRoomError,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    toggleReady: handleToggleReady,
    kickPlayer: handleKickPlayer,
    updateDeck: handleUpdateDeck
  } = useRoomActions({
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
  });

  // Hook 3: Phase Progression & In-game Actions
  const {
    phaseLoading,
    startGame: handleStartGame,
    advanceToNight: handleAdvanceToNight,
    submitNightAction: handleNightAction,
    resolveNight: handleResolveNight,
    advanceToDay: handleAdvanceToDay,
    advanceToVoting: handleAdvanceToVoting,
    submitVote: handleVote,
    resolveVoting: handleResolveVoting,
    sendChatMessage: handleSendChatMessage,
    resetToLobby: handleResetToLobby
  } = usePhaseActions({
    room,
    players,
    me,
    isHost,
    nightActions,
    votes,
    setNightActions,
    setVotes,
    setLogs,
    setError: setRoomError
  });

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
    loading: roomLoading || phaseLoading,
    error: roomError,
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
    sendChatMessage: handleSendChatMessage,
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
