import { describe, it, expect } from 'vitest';
import { generateRoomCode, shuffleDeck } from '@/services/roomService';
import { RoleDeckItem } from '@/types/game';

describe('generateRoomCode', () => {
  it('generates a 4-character uppercase alphanumeric code', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(4);
    expect(/^[A-Z0-9]{4}$/.test(code)).toBe(true);
  });

  it('generates non-identical codes across consecutive calls', () => {
    const code1 = generateRoomCode();
    const code2 = generateRoomCode();
    const code3 = generateRoomCode();
    const set = new Set([code1, code2, code3]);
    expect(set.size).toBeGreaterThanOrEqual(2);
  });
});

describe('shuffleDeck', () => {
  it('flattens and shuffles roles correctly for players', () => {
    const deck: RoleDeckItem[] = [
      { role: 'Werewolf', count: 2 },
      { role: 'Seer', count: 1 },
      { role: 'Doctor', count: 1 },
      { role: 'Villager', count: 2 }
    ];

    const shuffled = shuffleDeck(deck, 6);
    expect(shuffled).toHaveLength(6);
    expect(shuffled.filter(r => r === 'Werewolf')).toHaveLength(2);
    expect(shuffled.filter(r => r === 'Seer')).toHaveLength(1);
    expect(shuffled.filter(r => r === 'Doctor')).toHaveLength(1);
    expect(shuffled.filter(r => r === 'Villager')).toHaveLength(2);
  });

  it('throws an error if deck size is smaller than player count', () => {
    const deck: RoleDeckItem[] = [
      { role: 'Werewolf', count: 1 },
      { role: 'Villager', count: 2 }
    ];

    expect(() => shuffleDeck(deck, 5)).toThrowError(/less than player count/);
  });
});
