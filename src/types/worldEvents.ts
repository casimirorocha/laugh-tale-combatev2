// World Map & Global Events Types

export type GlobalEventType =
  | 'marine_invasion'
  | 'pirate_summit'
  | 'cross_guild_hunt'
  | 'celestial_siege'
  | 'darkness_ambush'
  | 'skypiea_clash';

export type EventSector =
  | 'all'
  | 'new_world'
  | 'paradise'
  | 'calm_belt'
  | 'red_line'
  | 'sky_island';

export type StageModifierMechanic =
  | 'super_charge'
  | 'fire_artillery'
  | 'haki_surge'
  | 'bounty_boost'
  | 'guard_fragile'
  | 'speed_overdrive'
  | 'devil_fruit_dampener'
  | 'low_hp_desperation'
  | 'lightning_storm';

export interface StageModifier {
  id: string;
  name: string;
  nameJP: string;
  description: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  mechanic: StageModifierMechanic;
  valueMultiplier: number; // e.g. 1.3 for 30% boost
}

export interface ExclusiveReward {
  id: string;
  type: 'title' | 'flag' | 'bounty' | 'badge';
  name: string;
  value: string | number;
  description: string;
  icon: string;
  rarity: 'epic' | 'legendary' | 'mythic';
}

export interface GlobalEvent {
  id: string;
  title: string;
  subtitle: string;
  japaneseTitle: string;
  type: GlobalEventType;
  sector: EventSector;
  sectorName: string;
  locationName: string;
  stageId: string;
  coordinates: { x: number; y: number }; // Percentage 0-100% on Grand Line chart
  threatLevel: 'A' | 'S' | 'SS' | 'Calamity' | 'Yonko-Class';
  threatColor: string;
  durationHours: number;
  expiresAt: number; // UTC timestamp ms
  activeQueues: number; // Simulated active captains currently queued
  briefing: string;
  denDenMushiCall: string;
  modifiers: StageModifier[];
  rewards: ExclusiveReward[];
  hostileFactions: string[];
  recommendedTCP: number;
  bannerGradient: string;
  accentColor: string;
  iconEmoji: string;
  opponentTeamPreset: {
    name: string;
    bannerColor: string;
    crestEmoji: string;
    fighterNames: string[];
    captainName: string;
  };
}

export interface EventCompletionRecord {
  eventId: string;
  clearedAt: number;
  rewardsClaimed: boolean;
  clearCount: number;
  highScore: number;
}
