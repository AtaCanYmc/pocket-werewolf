import { RoleDefinition, RoleId, RolePreset } from '@/types/game';

/**
 * Helper to resolve public assets correctly across base URLs (e.g. GitHub Pages or subpaths).
 */
export function getAssetPath(path: string): string {
  const base = import.meta.env?.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Pocket Werewolf - Role Definitions, Assets, and Presets
 */
export const ROLES: Record<RoleId, RoleDefinition> = {
  Werewolf: {
    id: 'Werewolf',
    name: 'Kurtadam',
    team: 'evil',
    image: getAssetPath('assets/roles/Werewolf.png'),
    fallbackIcon: '🐺',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    glowColor: 'blood',
    description: 'Geceleri diğer kurtadamlarla birlikte bir köylüyü avlar. Köylüleri kandırıp hayatta kalmaya çalışın.',
    nightOrder: 2,
    hasNightAction: true,
    actionPrompt: 'Bu gece kimi avlamak istiyorsunuz?',
    actionType: 'werewolf_kill',
    targetScope: 'alive_villagers',
  },
  Villager: {
    id: 'Villager',
    name: 'Köylü',
    team: 'good',
    image: getAssetPath('assets/roles/Villager1.png'),
    fallbackIcon: '👨‍🌾',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
    glowColor: 'emerald',
    description: 'Geceleri uyur. Gündüzleri tartışmalara katılarak kurtadamları tespit etmeye ve asmaya çalışır.',
    nightOrder: null,
    hasNightAction: false,
    actionPrompt: null,
    actionType: null,
  },
  Seer: {
    id: 'Seer',
    name: 'Gözcü (Kahin)',
    team: 'good',
    image: getAssetPath('assets/roles/Seer.png'),
    fallbackIcon: '🔮',
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
    glowColor: 'mystic',
    description: 'Her gece bir oyuncunun zihnini okuyarak onun Masum mu yoksa Kurtadam mı olduğunu öğrenir.',
    nightOrder: 1,
    hasNightAction: true,
    actionPrompt: 'Bu gece kimin rolünü görmek istiyorsunuz?',
    actionType: 'seer_inspect',
    targetScope: 'alive_others',
  },
  Doctor: {
    id: 'Doctor',
    name: 'Doktor',
    team: 'good',
    image: getAssetPath('assets/roles/Doctor.png'),
    fallbackIcon: '💉',
    color: 'text-sky-400 border-sky-500/30 bg-sky-950/20',
    glowColor: 'mystic',
    description: 'Her gece bir oyuncuyu (kendisi dahil) korur. Kurtlar o oyuncuya saldırırsa oyuncu ölmez.',
    nightOrder: 3,
    hasNightAction: true,
    actionPrompt: 'Bu gece kimi korumak istiyorsunuz?',
    actionType: 'doctor_heal',
    targetScope: 'alive_all',
  },
  Witch: {
    id: 'Witch',
    name: 'Cadı',
    team: 'good',
    image: getAssetPath('assets/roles/Witch.png'),
    fallbackIcon: '🧙‍♀️',
    color: 'text-purple-400 border-purple-500/30 bg-purple-950/20',
    glowColor: 'mystic',
    description: 'Oyun boyunca 1 kez İyileştirme İksiri (kurtların hedefi kurtarır) ve 1 kez Zehir İksiri (birini öldürür) kullanabilir.',
    nightOrder: 4,
    hasNightAction: true,
    actionPrompt: 'İksirlerinizi kullanmak ister misiniz?',
    actionType: 'witch_potion',
    targetScope: 'witch_choice',
  },
  Hunter: {
    id: 'Hunter',
    name: 'Avcı',
    team: 'good',
    image: getAssetPath('assets/roles/Hunter.png'),
    fallbackIcon: '🏹',
    color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
    glowColor: 'emerald',
    description: 'Öldürüldüğünde (gece veya asılarak), son nefesinde yanında bir oyuncuyu daha vurup götürebilir.',
    nightOrder: null,
    hasNightAction: false,
    actionPrompt: null,
    actionType: 'hunter_shot',
  },
  Sorceress: {
    id: 'Sorceress',
    name: 'Büyücü',
    team: 'evil',
    image: getAssetPath('assets/roles/Sorceress.png'),
    fallbackIcon: '✨',
    color: 'text-pink-400 border-pink-500/30 bg-pink-950/20',
    glowColor: 'blood',
    description: 'Kurtadamların müttefikidir. Her gece seçtiği bir kişinin Gözcü olup olmadığını öğrenir.',
    nightOrder: 1,
    hasNightAction: true,
    actionPrompt: 'Bu gece kimin Gözcü olduğunu test etmek istiyorsunuz?',
    actionType: 'sorceress_inspect',
    targetScope: 'alive_others',
  },
  BlindMinion: {
    id: 'BlindMinion',
    name: 'Kör Minyon',
    team: 'evil',
    image: getAssetPath('assets/roles/BlindMinion.png'),
    fallbackIcon: '👺',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    glowColor: 'blood',
    description: 'Kurtlar kazanırsa kazanır, ancak kurtların kim olduğunu bilmez ve gece uyanmaz.',
    nightOrder: null,
    hasNightAction: false,
    actionPrompt: null,
    actionType: null,
  },
  KnowingMinion: {
    id: 'KnowingMinion',
    name: 'Bilen Minyon',
    team: 'evil',
    image: getAssetPath('assets/roles/KnowingMinion.png'),
    fallbackIcon: '👁️',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    glowColor: 'blood',
    description: 'Kurtların kim olduğunu bilir, ancak kurtlar onun kim olduğunu bilmez. Kurtlar kazanırsa kazanır.',
    nightOrder: null,
    hasNightAction: false,
    actionPrompt: null,
    actionType: null,
  },
  DreamWolf: {
    id: 'DreamWolf',
    name: 'Rüya Kurdu',
    team: 'evil',
    image: getAssetPath('assets/roles/DreamWolf.png'),
    fallbackIcon: '🌙',
    color: 'text-rose-400 border-rose-500/30 bg-rose-950/20',
    glowColor: 'blood',
    description: 'Kurtadamdır fakat diğer kurtlardan biri ölene kadar geceleri uyanmaz.',
    nightOrder: null,
    hasNightAction: false,
    actionPrompt: null,
    actionType: null,
  }
};

// Default role deck presets
export const DEFAULT_PRESETS: RolePreset[] = [
  {
    id: 'quick_4',
    name: 'Quick Start (4 Players)',
    minPlayers: 4,
    deck: [
      { role: 'Werewolf', count: 1 },
      { role: 'Doctor', count: 1 },
      { role: 'Seer', count: 1 },
      { role: 'Villager', count: 1 }
    ]
  },
  {
    id: 'classic_6',
    name: 'Classic Village (6 Players)',
    minPlayers: 6,
    deck: [
      { role: 'Werewolf', count: 2 },
      { role: 'Doctor', count: 1 },
      { role: 'Seer', count: 1 },
      { role: 'Villager', count: 2 }
    ]
  },
  {
    id: 'mystery_8',
    name: 'Mystery Night (8 Players)',
    minPlayers: 8,
    deck: [
      { role: 'Werewolf', count: 2 },
      { role: 'Doctor', count: 1 },
      { role: 'Seer', count: 1 },
      { role: 'Witch', count: 1 },
      { role: 'Hunter', count: 1 },
      { role: 'Villager', count: 2 }
    ]
  },
  {
    id: 'chaos_10',
    name: 'Chaos & Betrayal (10 Players)',
    minPlayers: 10,
    deck: [
      { role: 'Werewolf', count: 3 },
      { role: 'Doctor', count: 1 },
      { role: 'Seer', count: 1 },
      { role: 'Witch', count: 1 },
      { role: 'Hunter', count: 1 },
      { role: 'KnowingMinion', count: 1 },
      { role: 'Villager', count: 2 }
    ]
  }
];
