// Match Achievements Interface & Definitions
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface MatchAchievement {
  id: string;
  key: string;
  name: string;
  japaneseName: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  timestamp: number;
  awardedToSide: 'team1' | 'team2';
  awardedToFighter: string;
  points: number;
}

export interface AchievementTemplate {
  key: string;
  name: string;
  japaneseName: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  points: number;
}

export const MATCH_ACHIEVEMENT_TEMPLATES: Record<string, AchievementTemplate> = {
  FIRST_BLOOD: {
    key: 'FIRST_BLOOD',
    name: 'First Blood',
    japaneseName: '先手必勝',
    description: 'Landed the first clean damaging blow of the tournament match.',
    icon: '🩸',
    rarity: 'bronze',
    points: 100,
  },
  PERFECT_GUARD: {
    key: 'PERFECT_GUARD',
    name: 'Perfect Guard',
    japaneseName: '鉄壁の武装色',
    description: 'Blocked multiple consecutive attacks cleanly using Armament Haki.',
    icon: '🛡️',
    rarity: 'silver',
    points: 250,
  },
  COMEBACK_KING: {
    key: 'COMEBACK_KING',
    name: 'Comeback King',
    japaneseName: '逆転の覇王',
    description: 'Turned the battle around and secured a K.O. with under 15% HP remaining!',
    icon: '👑',
    rarity: 'legendary',
    points: 1000,
  },
  RYUO_MASTER: {
    key: 'RYUO_MASTER',
    name: 'Conqueror Clash',
    japaneseName: '覇王色の激突',
    description: 'Split the heavens with a MAX Mode Conqueror Haki shockwave.',
    icon: '⚡',
    rarity: 'gold',
    points: 500,
  },
  UNTOUCHABLE: {
    key: 'UNTOUCHABLE',
    name: 'Future Sight Master',
    japaneseName: '見聞色の極意',
    description: 'Evaded 2 or more attacks in a row using advanced Observation Haki.',
    icon: '👁️',
    rarity: 'silver',
    points: 300,
  },
  CLIMAX_FINISHER: {
    key: 'CLIMAX_FINISHER',
    name: 'Climax Finisher',
    japaneseName: '決着の必殺奥義',
    description: 'Defeated an opponent with a devastating Super Move in the final battle phase.',
    icon: '💥',
    rarity: 'gold',
    points: 400,
  },
  GUARD_BREAKER: {
    key: 'GUARD_BREAKER',
    name: 'Guard Breaker',
    japaneseName: '防御崩し',
    description: 'Shattered the opponent\'s guard gauge with relentless heavy pressure!',
    icon: '🔨',
    rarity: 'silver',
    points: 200,
  },
  CRITICAL_OVERDRIVE: {
    key: 'CRITICAL_OVERDRIVE',
    name: 'Critical Overdrive',
    japaneseName: '会心の一撃',
    description: 'Landed 2 or more bone-crushing critical hits in a single round.',
    icon: '🎯',
    rarity: 'silver',
    points: 250,
  },
  COMBO_MAESTRO: {
    key: 'COMBO_MAESTRO',
    name: 'Combo Maestro',
    japaneseName: '連撃の達人',
    description: 'Connected a seamless 6+ hit combo flurry!',
    icon: '🔥',
    rarity: 'gold',
    points: 450,
  },
  TAUNT_DOMINANCE: {
    key: 'TAUNT_DOMINANCE',
    name: 'Mind Games Master',
    japaneseName: '心理戦の覇者',
    description: 'Successfully taunted and provoked the enemy without suffering punishment.',
    icon: '😈',
    rarity: 'bronze',
    points: 150,
  },
};
