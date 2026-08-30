import { describe, it, expect } from 'vitest';
import { checkNightActionsStatus, calculateNightCasualties } from '@/services/nightService';
import { Player, NightAction } from '@/types/game';

function createMockPlayer(overrides: Partial<Player>): Player {
  return {
    id: 'p-' + Math.random().toString(36).substr(2, 6),
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

describe('checkNightActionsStatus', () => {
  it('correctly tracks status when all required living roles complete their actions', () => {
    const wolf = createMockPlayer({ id: 'wolf-1', role: 'Werewolf', team: 'evil', is_alive: true });
    const seer = createMockPlayer({ id: 'seer-1', role: 'Seer', team: 'good', is_alive: true });
    const doctor = createMockPlayer({ id: 'doctor-1', role: 'Doctor', team: 'good', is_alive: true });
    const villager = createMockPlayer({ id: 'vill-1', role: 'Villager', team: 'good', is_alive: true });

    const players = [wolf, seer, doctor, villager];

    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: wolf.id, action_type: 'werewolf_kill', target_id: villager.id },
      { id: '2', room_id: 'room-1', round: 1, actor_id: seer.id, action_type: 'seer_inspect', target_id: wolf.id },
      { id: '3', room_id: 'room-1', round: 1, actor_id: doctor.id, action_type: 'doctor_heal', target_id: villager.id }
    ];

    const result = checkNightActionsStatus(players, actions, 1);
    expect(result.allCompleted).toBe(true);
    expect(result.totalRequired).toBe(3);
    expect(result.totalCompleted).toBe(3);
    expect(result.wolfDone).toBe(true);
    expect(result.seerDone).toBe(true);
    expect(result.doctorDone).toBe(true);
  });

  it('reports allCompleted: false if the Seer has not submitted inspection', () => {
    const wolf = createMockPlayer({ id: 'wolf-1', role: 'Werewolf', team: 'evil', is_alive: true });
    const seer = createMockPlayer({ id: 'seer-1', role: 'Seer', team: 'good', is_alive: true });
    const players = [wolf, seer];

    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: wolf.id, action_type: 'werewolf_kill', target_id: seer.id }
    ];

    const result = checkNightActionsStatus(players, actions, 1);
    expect(result.allCompleted).toBe(false);
    expect(result.wolfDone).toBe(true);
    expect(result.seerDone).toBe(false);
    expect(result.totalRequired).toBe(2);
    expect(result.totalCompleted).toBe(1);
  });

  it('does not require dead roles to act', () => {
    const wolf = createMockPlayer({ id: 'wolf-1', role: 'Werewolf', team: 'evil', is_alive: true });
    const deadSeer = createMockPlayer({ id: 'seer-1', role: 'Seer', team: 'good', is_alive: false });
    const players = [wolf, deadSeer];

    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: wolf.id, action_type: 'werewolf_kill', target_id: null }
    ];

    const result = checkNightActionsStatus(players, actions, 1);
    expect(result.allCompleted).toBe(true);
    expect(result.totalRequired).toBe(1);
    expect(result.totalCompleted).toBe(1);
    expect(result.seerDone).toBe(true);
  });
});

describe('calculateNightCasualties', () => {
  it('wolf kill succeeds when target is not protected or saved', () => {
    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: 'wolf-1', action_type: 'werewolf_kill', target_id: 'target-1' }
    ];

    const { deadPlayerIds, deathReasons } = calculateNightCasualties(actions);
    expect(deadPlayerIds).toEqual(['target-1']);
    expect(deathReasons['target-1']).toBe('night_kill');
  });

  it('doctor protection prevents wolf kill casualty', () => {
    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: 'wolf-1', action_type: 'werewolf_kill', target_id: 'target-1' },
      { id: '2', room_id: 'room-1', round: 1, actor_id: 'doc-1', action_type: 'doctor_heal', target_id: 'target-1' }
    ];

    const { deadPlayerIds } = calculateNightCasualties(actions);
    expect(deadPlayerIds).toHaveLength(0);
  });

  it('witch save potion prevents wolf kill casualty', () => {
    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: 'wolf-1', action_type: 'werewolf_kill', target_id: 'target-1' },
      { id: '2', room_id: 'room-1', round: 1, actor_id: 'witch-1', action_type: 'witch_heal', target_id: 'target-1' }
    ];

    const { deadPlayerIds } = calculateNightCasualties(actions);
    expect(deadPlayerIds).toHaveLength(0);
  });

  it('witch poison kills target regardless of doctor protection on a different target', () => {
    const actions: NightAction[] = [
      { id: '1', room_id: 'room-1', round: 1, actor_id: 'wolf-1', action_type: 'werewolf_kill', target_id: 'target-1' },
      { id: '2', room_id: 'room-1', round: 1, actor_id: 'doc-1', action_type: 'doctor_heal', target_id: 'target-1' },
      { id: '3', room_id: 'room-1', round: 1, actor_id: 'witch-1', action_type: 'witch_kill', target_id: 'target-2' }
    ];

    const { deadPlayerIds, deathReasons } = calculateNightCasualties(actions);
    expect(deadPlayerIds).toEqual(['target-2']);
    expect(deathReasons['target-2']).toBe('witch_poison');
  });
});
