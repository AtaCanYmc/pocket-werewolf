import { Player, WinnerTeam } from '@/types/game';

/**
 * Checks win conditions based on living players.
 * Pure function with no side-effects for maximum testability.
 * 
 * Rules:
 * 1. If 0 players remain alive -> 'draw'
 * 2. If 0 evil team members remain alive -> 'good' (Villagers win)
 * 3. If living evil players >= living good players -> 'evil' (Werewolves win)
 * 4. Otherwise -> null (Game continues)
 */
export function checkWinCondition(players: Player[]): WinnerTeam {
  const alivePlayers = players.filter(p => p.is_alive);
  if (alivePlayers.length === 0) return 'draw';

  const evilPlayers = alivePlayers.filter(p => p.team === 'evil');
  const goodPlayers = alivePlayers.filter(p => p.team === 'good');

  // If all evil players are dead -> Villagers (good) win!
  if (evilPlayers.length === 0) {
    return 'good';
  }

  // If living evil players >= living good players -> Werewolves (evil) win!
  if (evilPlayers.length >= goodPlayers.length) {
    return 'evil';
  }

  return null; // Game continues
}
