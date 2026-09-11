import { GALLERY_ITEMS } from "../data/galleryItems";
// Storage & Persistence for User Profiles, Custom Fighters, and Match History

import { UserProfile, MatchResult, LeaderboardEntry, Fighter, GamepadMapping, KeyboardMapping, CustomFighterDraft, HakiAuraConfig } from '../types/fighter';
import { PREMADE_TEAMS } from '../data/premadeTeams';

const PROFILE_KEY = 'op_kof_user_profile_v2';
const LEADERBOARD_KEY = 'op_kof_leaderboard_v2';
const GLOBAL_STATS_KEY = 'op_kof_global_stats_v1';
export const CUSTOM_FIGHTER_DRAFT_KEY = 'op_kof_custom_fighter_draft_v1';

export const DEFAULT_GAMEPAD_MAPPING: GamepadMapping = {
  guardButton: 0,       // A / Cross
  dodgeButton: 1,       // B / Circle
  tauntButton: 2,       // X / Square
  exMoveButton: 3,      // Y / Triangle
  superMoveButton: 4,   // LB / L1
  finisherButton: 5,    // RB / R1
  maxModeButton: 9,     // Start / Options / Menu
  menuConfirmButton: 0, // A
  menuBackButton: 1,    // B
};

export const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  move1Key: 'KeyJ',       // Attack 1 (J)
  move2Key: 'KeyK',       // Attack 2 (K)
  exMoveKey: 'KeyU',      // EX Move (U)
  superMoveKey: 'KeyI',   // Super Move (I)
  guardKey: 'KeyL',       // Guard (L)
  dodgeKey: 'Space',      // Dodge (SPACE)
  tauntKey: 'KeyT',       // Taunt (T)
  finisherKey: 'KeyO',    // Finisher (O)
  maxModeKey: 'KeyM',     // MAX Mode (M)
  pauseKey: 'KeyP',       // Pause (P)
};

export const DEFAULT_P2_KEYBOARD_MAPPING: KeyboardMapping = {
  move1Key: 'Numpad1',    // Attack 1 (NUM 1)
  move2Key: 'Numpad2',    // Attack 2 (NUM 2)
  exMoveKey: 'Numpad4',   // EX Move (NUM 4)
  superMoveKey: 'Numpad5',// Super Move (NUM 5)
  guardKey: 'Numpad3',    // Guard (NUM 3)
  dodgeKey: 'Numpad0',    // Dodge (NUM 0)
  tauntKey: 'Numpad7',    // Taunt (NUM 7)
  finisherKey: 'Numpad9', // Finisher (NUM 9)
  maxModeKey: 'NumpadEnter', // MAX Mode (NUM ENTER)
  pauseKey: 'Escape',     // Pause (ESC)
};

export function formatKeyLabel(code: string): string {
  if (!code) return 'UNBOUND';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `NUM ${code.slice(6)}`;
  
  const labelMap: Record<string, string> = {
    Space: 'SPACE',
    ShiftLeft: 'L-SHIFT',
    ShiftRight: 'R-SHIFT',
    ControlLeft: 'L-CTRL',
    ControlRight: 'R-CTRL',
    AltLeft: 'L-ALT',
    AltRight: 'R-ALT',
    Enter: 'ENTER',
    Escape: 'ESC',
    Tab: 'TAB',
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    Backspace: 'BACKSPACE',
  };

  return labelMap[code] || code.toUpperCase();
}

export const DEFAULT_PRESETS: Record<string, GamepadMapping> = {
  'Aggressive': { ...DEFAULT_GAMEPAD_MAPPING, exMoveButton: 5, finisherButton: 3 },
  'Technical': { ...DEFAULT_GAMEPAD_MAPPING, superMoveButton: 2, tauntButton: 4 },
  'Defensive': { ...DEFAULT_GAMEPAD_MAPPING, guardButton: 4, dodgeButton: 5 },
};

export interface GlobalStats {
  totalFights: number;
  totalDamage: number;
  fighterPickCounts: Record<string, number>;
}

const DEFAULT_GLOBAL_STATS: GlobalStats = {
  totalFights: 142,
  totalDamage: 8420000,
  fighterPickCounts: {
    'Monkey D. Luffy': 42,
    'Roronoa Zoro': 38,
    'Kaido': 35,
    'Shanks': 31,
    'Whitebeard': 28,
  }
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_strawhat_captain',
  username: 'Captain JoyBoy',
  crewName: 'New Dawn Pirates',
  title: 'Master of Haoshoku Haki',
  flagIcon: '☠️',
  flagColor: '#ef4444',
  bounty: 1500000000,
  tierRank: 'Supernova',
  stats: {
    matchesPlayed: 14,
    matchesWon: 11,
    matchesLost: 3,
    totalKOs: 32,
    highestDamageCombo: 14,
    perfectRounds: 2,
    hakiClashesWon: 8,
  },
  savedTeams: PREMADE_TEAMS.slice(0, 3),
  customFighters: [],
  matchHistory: [],
  unlockedGalleryItems: [],
  unlockedAchievements: [
    'FIRST_BLOOD',
    'CONQUEROR_SURGE',
    'GRAND_LINE_VETERAN',
    'MAX_DESPERATION_FINISHER',
  ],
  gamepadMapping: DEFAULT_GAMEPAD_MAPPING,
  gamepadPresets: DEFAULT_PRESETS,
  activeGamepadPreset: 'Aggressive',
  keyboardMapping: DEFAULT_KEYBOARD_MAPPING,
  p2KeyboardMapping: DEFAULT_P2_KEYBOARD_MAPPING,
  savedCombos: [],
  vibrationIntensity: 70,
};

const DEFAULT_LEADERBOARDS: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'p_roger',
    playerName: 'Gol D. Roger (Ghost)',
    crewName: 'Roger Pirates',
    bounty: 5564800000,
    tier: 'Pirate King',
    winRate: 98.8,
    matchesPlayed: 98,
    signatureFighter: 'Gol D. Roger',
  },
  {
    rank: 2,
    playerId: 'p_whitebeard',
    playerName: 'Edward Newgate',
    crewName: 'Whitebeard Pirates',
    bounty: 5046000000,
    tier: 'Yonko',
    winRate: 96.5,
    matchesPlayed: 95,
    signatureFighter: 'Whitebeard',
  },
  {
    rank: 3,
    playerId: 'p_kaido',
    playerName: 'Kaido of Beasts',
    crewName: 'Beasts Pirates',
    bounty: 4611100000,
    tier: 'Yonko',
    winRate: 91.8,
    matchesPlayed: 86,
    signatureFighter: 'Kaido',
  },
  {
    rank: 4,
    playerId: 'p_shanks',
    playerName: 'Red-Haired Shanks',
    crewName: 'Red Hair Pirates',
    bounty: 4048900000,
    tier: 'Yonko',
    winRate: 94.2,
    matchesPlayed: 72,
    signatureFighter: 'Red-Haired Shanks',
  },
  {
    rank: 5,
    playerId: 'p_teach',
    playerName: 'Marshall D. Teach',
    crewName: 'Blackbeard Pirates',
    bounty: 3996000000,
    tier: 'Yonko',
    winRate: 88.5,
    matchesPlayed: 64,
    signatureFighter: 'Blackbeard',
  },
  {
    rank: 6,
    playerId: 'p_mihawk',
    playerName: 'Dracule Mihawk',
    crewName: 'Cross Guild',
    bounty: 3590000000,
    tier: 'Warlord',
    winRate: 93.0,
    matchesPlayed: 78,
    signatureFighter: 'Dracule Mihawk',
  },
  {
    rank: 7,
    playerId: 'p_sakazuki',
    playerName: 'Fleet Admiral Sakazuki',
    crewName: 'Marine Headquarters',
    bounty: 3500000000,
    tier: 'Admiral',
    winRate: 92.4,
    matchesPlayed: 73,
    signatureFighter: 'Sakazuki (Akainu)',
  },
  {
    rank: 8,
    playerId: 'p_buggy',
    playerName: 'Buggy the Star Clown',
    crewName: 'Cross Guild Fleet',
    bounty: 3189000000,
    tier: 'Yonko',
    winRate: 66.0,
    matchesPlayed: 65,
    signatureFighter: 'Buggy the Star Clown',
  },
  {
    rank: 9,
    playerId: 'p_law',
    playerName: 'Trafalgar Law',
    crewName: 'Heart Pirates',
    bounty: 3000000000,
    tier: 'Supernova',
    winRate: 87.5,
    matchesPlayed: 50,
    signatureFighter: 'Trafalgar Law',
  },
];

export function getGlobalStats(): GlobalStats {
  try {
    const raw = localStorage.getItem(GLOBAL_STATS_KEY);
    if (!raw) return DEFAULT_GLOBAL_STATS;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_GLOBAL_STATS;
  }
}

export function saveGlobalStats(stats: GlobalStats): void {
  try {
    localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
  } catch (e) {}
}

export function updateGlobalStats(result: MatchResult): void {
  const stats = getGlobalStats();
  stats.totalFights += 1;
  const matchDamage = result.combatLogs.reduce((acc, log) => acc + (log.damage || 0), 0);
  stats.totalDamage += matchDamage;
  const allFightersInMatch = [
    ...(result.team1.fighters || []),
    ...(result.team2.fighters || [])
  ];
  allFightersInMatch.forEach(name => {
    stats.fighterPickCounts[name] = (stats.fighterPickCounts[name] || 0) + 1;
  });
  saveGlobalStats(stats);
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      stats: {
        ...DEFAULT_PROFILE.stats,
        ...(parsed.stats || {}),
      },
      savedTeams: parsed.savedTeams || DEFAULT_PROFILE.savedTeams,
      customFighters: parsed.customFighters || DEFAULT_PROFILE.customFighters,
      matchHistory: parsed.matchHistory || DEFAULT_PROFILE.matchHistory,
      unlockedAchievements: parsed.unlockedAchievements || DEFAULT_PROFILE.unlockedAchievements,
      unlockedGalleryItems: parsed.unlockedGalleryItems || DEFAULT_PROFILE.unlockedGalleryItems,
      gamepadMapping: parsed.gamepadMapping || DEFAULT_PROFILE.gamepadMapping,
      gamepadPresets: parsed.gamepadPresets || DEFAULT_PROFILE.gamepadPresets,
      activeGamepadPreset: parsed.activeGamepadPreset || DEFAULT_PROFILE.activeGamepadPreset,
      keyboardMapping: {
        ...DEFAULT_KEYBOARD_MAPPING,
        ...(parsed.keyboardMapping || {}),
      },
      p2KeyboardMapping: {
        ...DEFAULT_P2_KEYBOARD_MAPPING,
        ...(parsed.p2KeyboardMapping || {}),
      },
      savedCombos: parsed.savedCombos || DEFAULT_PROFILE.savedCombos,
      vibrationIntensity: parsed.vibrationIntensity !== undefined ? parsed.vibrationIntensity : 70,
    };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function addMatchResultToProfile(result: MatchResult, isUserWinner: boolean): UserProfile {
  const profile = getUserProfile();
  
  const bountyDelta = isUserWinner 
    ? Math.round(result.bountyEarned * 1.5)
    : Math.max(0, Math.round(result.bountyEarned * 0.2));

  profile.bounty += bountyDelta;
  profile.stats.matchesPlayed += 1;
  if (isUserWinner) {
    profile.stats.matchesWon += 1;
  } else {
    profile.stats.matchesLost += 1;
  }

  // Update tier based on bounty
  if (profile.bounty >= 5_000_000_000) {
    profile.tierRank = 'Pirate King';
  } else if (profile.bounty >= 3_000_000_000) {
    profile.tierRank = 'Yonko';
  } else if (profile.bounty >= 2_000_000_000) {
    profile.tierRank = 'Admiral';
  } else if (profile.bounty >= 1_000_000_000) {
    profile.tierRank = 'Warlord';
  } else if (profile.bounty >= 500_000_000) {
    profile.tierRank = 'Supernova';
  }


  profile.matchHistory = [result, ...profile.matchHistory.filter((m) => m.id !== result.id).slice(0, 19)]; // Keep last 20 unique
  
  // Check Gallery Unlocks
  if (!profile.unlockedGalleryItems) profile.unlockedGalleryItems = [];
  let newlyUnlockedGallery = false;
  GALLERY_ITEMS.forEach(item => {
    if (!profile.unlockedGalleryItems!.includes(item.id)) {
      if (item.checkUnlock(result, isUserWinner, profile)) {
        profile.unlockedGalleryItems!.push(item.id);
        newlyUnlockedGallery = true;
      }
    }
  });

  updateGlobalStats(result);

  saveUserProfile(profile);
  return profile;
}

export function saveCustomFighter(fighter: Fighter): UserProfile {
  const profile = getUserProfile();
  const existingIdx = profile.customFighters.findIndex((f) => f.id === fighter.id);
  if (existingIdx >= 0) {
    profile.customFighters[existingIdx] = fighter;
  } else {
    profile.customFighters.push(fighter);
  }
  saveUserProfile(profile);
  return profile;
}

export function getCustomFighterDraft(): CustomFighterDraft | null {
  try {
    const raw = localStorage.getItem(CUSTOM_FIGHTER_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom fighter draft', e);
    return null;
  }
}

export function saveCustomFighterDraft(draft: CustomFighterDraft): void {
  try {
    localStorage.setItem(
      CUSTOM_FIGHTER_DRAFT_KEY,
      JSON.stringify({
        ...draft,
        lastSavedAt: Date.now(),
      })
    );
  } catch (e) {
    console.error('Failed to save custom fighter draft', e);
  }
}

export function clearCustomFighterDraft(): void {
  try {
    localStorage.removeItem(CUSTOM_FIGHTER_DRAFT_KEY);
  } catch (e) {
    console.error('Failed to clear custom fighter draft', e);
  }
}

export function getLeaderboards(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    let list = raw ? JSON.parse(raw) : DEFAULT_LEADERBOARDS;
    
    // Inject user profile into leaderboard
    const profile = getUserProfile();
    const userWinRate = profile.stats.matchesPlayed > 0
      ? Number(((profile.stats.matchesWon / profile.stats.matchesPlayed) * 100).toFixed(1))
      : 0;

    const userEntry: LeaderboardEntry = {
      rank: 1,
      playerId: profile.id,
      playerName: `${profile.username} (You)`,
      crewName: profile.crewName,
      bounty: profile.bounty,
      tier: profile.tierRank,
      winRate: userWinRate,
      matchesPlayed: profile.stats.matchesPlayed,
      signatureFighter: profile.savedTeams[0]?.fighters[0]?.name || 'Luffy',
      isUser: true,
    };

    // Filter out previous user entry and re-insert sorted by bounty
    const nonUserEntries = list.filter((e: LeaderboardEntry) => !e.isUser && e.playerId !== profile.id);
    const combined = [...nonUserEntries, userEntry].sort((a, b) => b.bounty - a.bounty);

    return combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  } catch (e) {
    return DEFAULT_LEADERBOARDS;
  }
}

const CUSTOM_AURAS_KEY = 'op_kof_fighter_custom_auras_v1';

export function getFighterCustomAura(fighterId: string): HakiAuraConfig | undefined {
  try {
    const raw = localStorage.getItem(CUSTOM_AURAS_KEY);
    if (!raw) return undefined;
    const map = JSON.parse(raw);
    return map[fighterId];
  } catch (e) {
    return undefined;
  }
}

export function saveFighterCustomAura(fighterId: string, aura: HakiAuraConfig): void {
  try {
    const raw = localStorage.getItem(CUSTOM_AURAS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[fighterId] = aura;
    localStorage.setItem(CUSTOM_AURAS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save custom aura config', e);
  }
}

export function decorateFighterWithCustomAura(fighter: Fighter): Fighter {
  if (!fighter) return fighter;
  const customAura = getFighterCustomAura(fighter.id);
  if (customAura) {
    return {
      ...fighter,
      hakiAura: customAura,
    };
  }
  return fighter;
}

