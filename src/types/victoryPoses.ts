export type PoseRarity = 'common' | 'rare' | 'legendary' | 'mythic';

export type PoseAnimationEffect =
  | 'joyboy_bounce'
  | 'blade_sheathe'
  | 'conqueror_aura'
  | 'club_slam'
  | 'world_quake'
  | 'dark_vortex'
  | 'magma_eruption'
  | 'blade_salute'
  | 'light_glint'
  | 'fist_crack'
  | 'room_snap'
  | 'circus_carnival'
  | 'future_sight'
  | 'flame_pillar'
  | 'ice_sculpture'
  | 'thunder_god'
  | 'dragon_wind'
  | 'phoenix_wings'
  | 'void_domination';

export interface VictoryPose {
  id: string;
  fighterId?: string; // Optional: specific to a fighter, or universal if undefined
  name: string;
  nameJP: string;
  kanjiStamp: string;
  description: string;
  rarity: PoseRarity;
  requiredWins: number;
  bountyCost?: number;
  quote: string;
  quoteJP: string;
  voiceTextJP?: string;
  triumphantAction: string;
  signatureMoveName: string;
  animationEffect: PoseAnimationEffect;
  hakiAuraColor: string;
  badgeEmoji: string;
  clipDurationSeconds: number;
  cameraPreset?: 'cinematic_zoom' | 'wide_stage' | 'anime_split';
}

export const DEFAULT_VICTORY_POSES: VictoryPose[] = [
  {
    id: 'pose_default',
    name: 'Standard Stance',
    nameJP: '基本の構え',
    kanjiStamp: '闘魂・凱旋',
    description: 'The reliable fighting posture ready for any challenger on the Grand Line.',
    rarity: 'common',
    requiredWins: 0,
    quote: 'The battle is won through absolute determination!',
    quoteJP: '戦いは不屈の闘志で制する！',
    voiceTextJP: 'たたかいはふくつのとうしでせいする！',
    triumphantAction: 'Strikes a balanced combat stance, fists clenching with radiant resolve.',
    signatureMoveName: 'Grand Line Master Strike',
    animationEffect: 'fist_crack',
    hakiAuraColor: '#f59e0b',
    badgeEmoji: '🏆',
    clipDurationSeconds: 3.5,
    cameraPreset: 'wide_stage',
  },
  {
    id: 'pose_roar',
    name: 'Conqueror’s Roar',
    nameJP: '覇王の咆哮',
    kanjiStamp: '覇王色の咆哮',
    description: 'Unleash a terrifying burst of Conqueror’s Haki that shakes the entire arena.',
    rarity: 'rare',
    requiredWins: 1,
    bountyCost: 5000,
    quote: 'There is only one king in this arena!',
    quoteJP: 'この場に王は一人しかいらん！',
    voiceTextJP: 'このばにおうはひとりしかいらん！',
    triumphantAction: 'Bellows a roaring challenge as crimson black lightning surges around the perimeter.',
    signatureMoveName: 'Conqueror’s Royal Pulse',
    animationEffect: 'conqueror_aura',
    hakiAuraColor: '#ef4444',
    badgeEmoji: '👑',
    clipDurationSeconds: 4.0,
    cameraPreset: 'cinematic_zoom',
  },
  {
    id: 'pose_meditate',
    name: 'Future Sight Zen',
    nameJP: '未来視の境地',
    kanjiStamp: '見聞色・未来視',
    description: 'Calm the mind and gaze effortlessly beyond the horizon, anticipating all.',
    rarity: 'rare',
    requiredWins: 3,
    bountyCost: 10000,
    quote: 'Everything you are about to do... I have already foreseen.',
    quoteJP: 'お前の次の行動など、すべてお見通しだ。',
    voiceTextJP: 'おまえのつぎのこうどうなど、すべておみとおしだ。',
    triumphantAction: 'Closes eyes serenely as glowing cyan observation ripples pulse outwards across space.',
    signatureMoveName: 'Future Sight Transcendence',
    animationEffect: 'future_sight',
    hakiAuraColor: '#06b6d4',
    badgeEmoji: '👁️',
    clipDurationSeconds: 3.8,
    cameraPreset: 'anime_split',
  },
  {
    id: 'pose_aura',
    name: 'Awakened Supremacy',
    nameJP: '覚醒の覇気',
    kanjiStamp: '極限覚醒・天覇',
    description: 'Surround yourself in a blazing crimson and purple aura of supreme transcendent might.',
    rarity: 'legendary',
    requiredWins: 5,
    bountyCost: 20000,
    quote: 'My fists will shatter even the fabric of destiny!',
    quoteJP: '我が拳は運命の糸をも断ち切る！',
    voiceTextJP: 'わがこぶしはうんめのいとをもたちきる！',
    triumphantAction: 'Unleashes an explosive dual-color aura erupting with celestial shockwaves.',
    signatureMoveName: 'Supreme Awakening Zenith',
    animationEffect: 'conqueror_aura',
    hakiAuraColor: '#8b5cf6',
    badgeEmoji: '⚡',
    clipDurationSeconds: 4.5,
    cameraPreset: 'cinematic_zoom',
  },
  {
    id: 'pose_pirate_king',
    name: 'Pirate King Mythic Glory',
    nameJP: '海賊王の威光',
    kanjiStamp: '天下無双・大海賊',
    description: 'The pinnacle of triumph recognized across all oceans of the Grand Line.',
    rarity: 'mythic',
    requiredWins: 10,
    bountyCost: 50000,
    quote: 'The ocean bows to true freedom and unyielding strength!',
    quoteJP: '大海原は真の自由と力にひれ伏す！',
    voiceTextJP: 'おおうなばらはしんのじゆうとちからにひれふす！',
    triumphantAction: 'Ascends on a golden pillar of light as golden laurels and fireworks illuminate the sky.',
    signatureMoveName: 'Crown of the Grand Seas',
    animationEffect: 'joyboy_bounce',
    hakiAuraColor: '#eab308',
    badgeEmoji: '🌟',
    clipDurationSeconds: 5.0,
    cameraPreset: 'cinematic_zoom',
  }
];
