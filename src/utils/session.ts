import { UserProfile } from '@/types/game';

/**
 * User Session and Profile Management (LocalStorage)
 */

export const AVATARS: string[] = ['🐺', '🧙‍♀️', '🧛', '🕵️', '👨‍🌾', '🛡️', '🌙', '⚔️', '🔮', '🦇', '🔥', '👑'];

const ADJECTIVES: string[] = ['Shadow', 'Silent', 'Mystic', 'Brave', 'Clever', 'Fearless', 'Night', 'Loyal', 'Swift', 'Dark'];
const NOUNS: string[] = ['Wolf', 'Villager', 'Hunter', 'Seer', 'Witch', 'Doctor', 'Knight', 'Guardian', 'Ranger', 'Watcher'];

export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90 + 10);
  return `${adj}${noun}${num}`;
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem('PW_SESSION_ID');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('PW_SESSION_ID', sessionId);
  }
  return sessionId;
}

export function getStoredProfile(): UserProfile {
  const name = localStorage.getItem('PW_PLAYER_NAME') || generateRandomName();
  const avatar = localStorage.getItem('PW_PLAYER_AVATAR') || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  return { name, avatar };
}

export function saveStoredProfile(name: string, avatar: string): void {
  if (name) localStorage.setItem('PW_PLAYER_NAME', name.trim());
  if (avatar) localStorage.setItem('PW_PLAYER_AVATAR', avatar);
}
