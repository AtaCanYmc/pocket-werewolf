import { describe, it, expect } from 'vitest';
import { calculateVoteTally } from '@/services/voteService';
import { Vote } from '@/types/game';

describe('calculateVoteTally', () => {
  it('correctly identifies single highest voted player to be lynched', () => {
    const votes: Vote[] = [
      { id: '1', room_id: 'r1', round: 1, voter_id: 'p1', target_id: 'suspect-a' },
      { id: '2', room_id: 'r1', round: 1, voter_id: 'p2', target_id: 'suspect-a' },
      { id: '3', room_id: 'r1', round: 1, voter_id: 'p3', target_id: 'suspect-b' }
    ];

    const result = calculateVoteTally(votes);
    expect(result.targetIdToLynch).toBe('suspect-a');
    expect(result.maxVotes).toBe(2);
    expect(result.isTie).toBe(false);
    expect(result.isSkipped).toBe(false);
  });

  it('detects a tie when two players receive equal top votes', () => {
    const votes: Vote[] = [
      { id: '1', room_id: 'r1', round: 1, voter_id: 'p1', target_id: 'suspect-a' },
      { id: '2', room_id: 'r1', round: 1, voter_id: 'p2', target_id: 'suspect-a' },
      { id: '3', room_id: 'r1', round: 1, voter_id: 'p3', target_id: 'suspect-b' },
      { id: '4', room_id: 'r1', round: 1, voter_id: 'p4', target_id: 'suspect-b' }
    ];

    const result = calculateVoteTally(votes);
    expect(result.isTie).toBe(true);
    expect(result.maxVotes).toBe(2);
  });

  it('marks isSkipped: true when skip/pass votes match or exceed max player votes', () => {
    const votes: Vote[] = [
      { id: '1', room_id: 'r1', round: 1, voter_id: 'p1', target_id: 'suspect-a' },
      { id: '2', room_id: 'r1', round: 1, voter_id: 'p2', target_id: 'suspect-a' },
      { id: '3', room_id: 'r1', round: 1, voter_id: 'p3', target_id: null }, // skip
      { id: '4', room_id: 'r1', round: 1, voter_id: 'p4', target_id: null }, // skip
      { id: '5', room_id: 'r1', round: 1, voter_id: 'p5', target_id: null }  // skip
    ];

    const result = calculateVoteTally(votes);
    expect(result.isSkipped).toBe(true);
    expect(result.targetIdToLynch).toBeNull();
    expect(result.skipVotes).toBe(3);
  });
});
