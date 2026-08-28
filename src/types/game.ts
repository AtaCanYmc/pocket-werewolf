/**
 * Pocket Werewolf - TypeScript Core Game Type Definitions
 */

export type RoleId =
  | 'Werewolf'
  | 'Villager'
  | 'Seer'
  | 'Doctor'
  | 'Witch'
  | 'Hunter'
  | 'Sorceress'
  | 'BlindMinion'
  | 'KnowingMinion'
  | 'DreamWolf';

export type Team = 'good' | 'evil' | 'neutral';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  team: Team;
  image: string;
  fallbackIcon: string;
  color: string;
  glowColor: string;
  description: string;
  nightOrder: number | null;
  hasNightAction: boolean;
  actionPrompt: string | null;
  actionType: string | null;
  targetScope?: string;
}

export interface RoleDeckItem {
  role: RoleId;
  count: number;
}

export interface RolePreset {
  id: string;
  name: string;
  minPlayers: number;
  deck: RoleDeckItem[];
}

export type RoomStatus =
  | 'lobby'
  | 'role_reveal'
  | 'night'
  | 'dawn'
  | 'day'
  | 'voting'
  | 'ended';

export type WinnerTeam = 'good' | 'evil' | 'draw' | null;

export interface RoomSettings {
  revealRoleOnDeath?: boolean;
  nightDuration?: number;
  dayDuration?: number;
  votingDuration?: number;
  allowSelfProtect?: boolean;
  anonymousVoting?: boolean;
}

export interface Room {
  id: string;
  code: string;
  host_session_id: string;
  status: RoomStatus;
  round: number;
  phase_timer_seconds?: number;
  phase_end_time?: string | null;
  is_timer_paused?: boolean;
  timer_remaining_ms?: number;
  deck: RoleDeckItem[];
  settings: RoomSettings;
  winner: WinnerTeam;
  created_at?: string;
  updated_at?: string;
}

export type DeathReason =
  | 'night_kill'
  | 'lynched'
  | 'witch_poison'
  | 'hunter_shot'
  | null;

export interface Player {
  id: string;
  room_id: string;
  session_id: string;
  name: string;
  avatar: string;
  is_host: boolean;
  is_ready: boolean;
  is_alive: boolean;
  is_revealed: boolean;
  role: RoleId | null;
  team: Team | null;
  death_reason: DeathReason;
  death_round: number | null;
  witch_used_save?: boolean;
  witch_used_kill?: boolean;
  joined_at?: string;
}

export type NightActionType =
  | 'werewolf_kill'
  | 'seer_inspect'
  | 'doctor_heal'
  | 'witch_heal'
  | 'witch_kill'
  | 'sorceress_inspect';

export interface NightAction {
  id: string;
  room_id: string;
  round: number;
  actor_id: string;
  action_type: NightActionType;
  target_id: string | null;
  result?: any;
  created_at?: string;
}

export interface Vote {
  id: string;
  room_id: string;
  round: number;
  voter_id: string;
  target_id: string | null;
  created_at?: string;
}

export type GameLogType =
  | 'info'
  | 'night_result'
  | 'lynch'
  | 'warning'
  | 'chat';

export interface GameLog {
  id: string;
  room_id: string;
  round: number;
  message: string;
  type: GameLogType;
  target_role?: string | null;
  created_at?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
}

export interface SupabaseCredentials {
  url: string;
  key: string;
  isConfigured: boolean;
}

export type LanguageCode = 'en' | 'tr' | 'fr' | 'de';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  flag: string;
}
