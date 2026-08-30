import { Room, Player, NightAction, Vote, GameLog } from '@/types/game';

export const MOCK_ROOM_ID = 'mock-room-uuid-1234';
export const MOCK_HOST_SESSION_ID = 'mock-host-session';

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p-host-1',
    room_id: MOCK_ROOM_ID,
    session_id: MOCK_HOST_SESSION_ID,
    name: 'Alice (Host)',
    avatar: '👑',
    is_host: true,
    is_ready: true,
    is_alive: true,
    is_revealed: false,
    role: 'Seer',
    team: 'good',
    death_reason: null,
    death_round: null,
    joined_at: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'p-player-2',
    room_id: MOCK_ROOM_ID,
    session_id: 'mock-session-2',
    name: 'Bob (Wolf)',
    avatar: '🐺',
    is_host: false,
    is_ready: true,
    is_alive: true,
    is_revealed: false,
    role: 'Werewolf',
    team: 'evil',
    death_reason: null,
    death_round: null,
    joined_at: new Date(Date.now() - 250000).toISOString()
  },
  {
    id: 'p-player-3',
    room_id: MOCK_ROOM_ID,
    session_id: 'mock-session-3',
    name: 'Charlie (Doc)',
    avatar: '💉',
    is_host: false,
    is_ready: true,
    is_alive: true,
    is_revealed: false,
    role: 'Doctor',
    team: 'good',
    death_reason: null,
    death_round: null,
    joined_at: new Date(Date.now() - 200000).toISOString()
  },
  {
    id: 'p-player-4',
    room_id: MOCK_ROOM_ID,
    session_id: 'mock-session-4',
    name: 'Diana (Villager)',
    avatar: '👩‍🌾',
    is_host: false,
    is_ready: true,
    is_alive: true,
    is_revealed: false,
    role: 'Villager',
    team: 'good',
    death_reason: null,
    death_round: null,
    joined_at: new Date(Date.now() - 150000).toISOString()
  },
  {
    id: 'p-player-5',
    room_id: MOCK_ROOM_ID,
    session_id: 'mock-session-5',
    name: 'Eve (Wolf 2)',
    avatar: '👺',
    is_host: false,
    is_ready: true,
    is_alive: true,
    is_revealed: false,
    role: 'Werewolf',
    team: 'evil',
    death_reason: null,
    death_round: null,
    joined_at: new Date(Date.now() - 100000).toISOString()
  },
  {
    id: 'p-player-6',
    room_id: MOCK_ROOM_ID,
    session_id: 'mock-session-6',
    name: 'Frank (Witch)',
    avatar: '🧙‍♂️',
    is_host: false,
    is_ready: true,
    is_alive: false,
    is_revealed: true,
    role: 'Witch',
    team: 'good',
    death_reason: 'night_kill',
    death_round: 1,
    joined_at: new Date(Date.now() - 50000).toISOString()
  }
];

export const MOCK_ROOM: Room = {
  id: MOCK_ROOM_ID,
  code: 'TEST',
  host_session_id: MOCK_HOST_SESSION_ID,
  status: 'day',
  round: 1,
  deck: [
    { role: 'Werewolf', count: 2 },
    { role: 'Doctor', count: 1 },
    { role: 'Seer', count: 1 },
    { role: 'Witch', count: 1 },
    { role: 'Villager', count: 1 }
  ],
  settings: {
    revealRoleOnDeath: true,
    nightDuration: 45,
    dayDuration: 90,
    votingDuration: 45,
    allowSelfProtect: true,
    anonymousVoting: false
  },
  winner: null,
  created_at: new Date(Date.now() - 360000).toISOString()
};

export const MOCK_NIGHT_ACTIONS: NightAction[] = [
  {
    id: 'act-1',
    room_id: MOCK_ROOM_ID,
    round: 1,
    actor_id: 'p-player-2',
    action_type: 'werewolf_kill',
    target_id: 'p-player-6',
    result: null
  },
  {
    id: 'act-2',
    room_id: MOCK_ROOM_ID,
    round: 1,
    actor_id: 'p-host-1',
    action_type: 'seer_inspect',
    target_id: 'p-player-2',
    result: { targetId: 'p-player-2', targetName: 'Bob', isEvil: true, roleName: 'Evil / Werewolf' }
  },
  {
    id: 'act-3',
    room_id: MOCK_ROOM_ID,
    round: 1,
    actor_id: 'p-player-3',
    action_type: 'doctor_heal',
    target_id: 'p-host-1',
    result: null
  }
];

export const MOCK_VOTES: Vote[] = [
  {
    id: 'v-1',
    room_id: MOCK_ROOM_ID,
    round: 1,
    voter_id: 'p-host-1',
    target_id: 'p-player-2'
  },
  {
    id: 'v-2',
    room_id: MOCK_ROOM_ID,
    round: 1,
    voter_id: 'p-player-3',
    target_id: 'p-player-2'
  },
  {
    id: 'v-3',
    room_id: MOCK_ROOM_ID,
    round: 1,
    voter_id: 'p-player-4',
    target_id: null // Skip
  }
];

export const MOCK_GAME_LOGS: GameLog[] = [
  {
    id: 'log-1',
    room_id: MOCK_ROOM_ID,
    round: 1,
    message: 'A new game has begun. Roles have been distributed!',
    type: 'info',
    created_at: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'log-2',
    room_id: MOCK_ROOM_ID,
    round: 1,
    message: '☀️ Dawn breaks... Frank (Witch) was brutally murdered during the night!',
    type: 'night_result',
    created_at: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: 'log-3',
    room_id: MOCK_ROOM_ID,
    round: 1,
    message: 'I suspect Bob after seeing his movement!',
    type: 'chat',
    sender_id: 'p-host-1',
    sender_name: 'Alice (Host)',
    sender_avatar: '👑',
    created_at: new Date(Date.now() - 30000).toISOString()
  }
];
