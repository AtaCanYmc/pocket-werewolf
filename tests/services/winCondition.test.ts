import { describe, it, expect } from 'vitest';
import { checkWinCondition } from '@/services/winCondition';
import { Player } from '@/types/game';

function createMockPlayer(overrides: Partial<Player>): Player {
  return {
    id: 'p-' + Math.random().toString(36).substr(2, 4),
    room_id: 'room-1',
    session_id: 'sess-1',
    name: 'Player',
    avatar: '🐺',
    is_host: false,
    is_ready: true,
    is_alive: true,
    is_revealed: false,
    role: 'Villager',
    team: 'good',
    death_reason: null,
    death_round: null,
    ...overrides
  };
}

describe('checkWinCondition', () => {
  it('returns "draw" when all players are dead', () => {
    const players = [
      createMockPlayer({ is_alive: false, team: 'good' }),
      createMockPlayer({ is_alive: false, team: 'evil' })
    ];
    expect(checkWinCondition(players)).toBe('draw');
  });

  it('returns "good" (Villagers win) when all evil players are dead and good players remain', () => {
    const players = [
      createMockPlayer({ is_alive: true, team: 'good', role: 'Villager' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Seer' }),
      createMockPlayer({ is_alive: false, team: 'evil', role: 'Werewolf' })
    ];
    expect(checkWinCondition(players)).toBe('good');
  });

  it('returns "evil" (Werewolves win) when living evil players >= living good players', () => {
    // 2 Werewolves vs 2 Villagers
    const playersEqual = [
      createMockPlayer({ is_alive: true, team: 'evil', role: 'Werewolf' }),
      createMockPlayer({ is_alive: true, team: 'evil', role: 'Werewolf' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Villager' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Doctor' })
    ];
    expect(checkWinCondition(playersEqual)).toBe('evil');

    // 2 Werewolves vs 1 Villager
    const playersDominant = [
      createMockPlayer({ is_alive: true, team: 'evil', role: 'Werewolf' }),
      createMockPlayer({ is_alive: true, team: 'evil', role: 'Werewolf' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Villager' })
    ];
    expect(checkWinCondition(playersDominant)).toBe('evil');
  });

  it('returns null (game continues) when good players outnumber evil players and evil players are alive', () => {
    const players = [
      createMockPlayer({ is_alive: true, team: 'evil', role: 'Werewolf' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Villager' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Seer' }),
      createMockPlayer({ is_alive: true, team: 'good', role: 'Doctor' })
    ];
    expect(checkWinCondition(players)).toBeNull();
  });
});
