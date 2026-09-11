// Fighter & Combat Types for One Piece: Grand Line Fighter Arcade (KOF Edition)

export type FruitType = 
  | 'Paramecia' 
  | 'Logia' 
  | 'Zoan' 
  | 'Ancient Zoan' 
  | 'Mythical Zoan' 
  | 'Dual-Fruit' 
  | 'Void Entity (Primordial)'
  | 'None (Pure Haki)';

export type AwakeningState = 'Awakened' | 'Mastered' | 'Eternal' | 'Standard' | 'None';

export type Affiliation = 
  | 'Straw Hat Pirates'
  | 'Red Hair Pirates'
  | 'Beasts Pirates'
  | 'Blackbeard Pirates'
  | 'Marines'
  | 'Cross Guild'
  | 'Whitebeard Pirates'
  | 'Roger Pirates'
  | 'Revolutionary Army'
  | 'World Government / CP0'
  | 'Heart Pirates'
  | 'Kid Pirates'
  | 'Big Mom Pirates'
  | 'Donquixote Family'
  | 'Golden Lion Pirates'
  | 'Thriller Bark'
  | 'Kozuki Family'
  | 'Impel Down'
  | 'Elbaf'
  | 'Beautiful Pirates'
  | 'World Government'
  | 'God of Skypiea'
  | 'Independent / Custom';

export type MilitaryRank = 
  | 'Pirate King'
  | 'Yonko (Four Emperors)'
  | 'Fleet Admiral'
  | 'Admiral'
  | 'Former Warlord (Shichibukai)'
  | 'First Mate / Commander'
  | 'Vice Admiral'
  | 'Worst Generation'
  | 'Cipher Pol Aegis'
  | 'Warden'
  | 'Supreme Commander'
  | 'Prince'
  | 'Supreme Ruler'
  | 'Chief of Staff'
  | 'Grand Line Legend'
  | 'Rookie Pirate';

export type FightingStyle = 
  | 'Santoryu (Three-Sword Style)'
  | 'Advanced Ryuo Brawler'
  | 'Black Leg Style / Ifrit'
  | 'Supreme Conqueror Swordsman'
  | 'Rokushiki Master'
  | 'Fish-Man Karate'
  | 'Thunder Club Supreme'
  | 'Dual Devil Fruit Mastery'
  | 'Light Speed Brawler'
  | 'Magma Annihilation'
  | 'Ope Ope Spatial Surgery'
  | 'Electromagnetic Punk'
  | 'Special Mochi Mastery'
  | 'String Puppet Manipulation'
  | 'Chop-Chop Chaos Master'
  | 'Fist of Love (Galaxy Impact)'
  | 'Desert King Sand Mastery'
  | 'Mera Mera Pyrokinesis'
  | 'Godly Goro Goro Thunder'
  | 'Shadow Mastery'
  | 'Oden-style Nitoryu'
  | 'Lion\'s Float Gravity'
  | 'Ice Age Logia Mastery'
  | 'Primordial Darkness & Uranus'
  | 'Imperial Flame Pteranodon'
  | 'Soru Soru Soul Queen'
  | 'Venom Demon Warden'
  | 'Revolutionary Wind Master'
  | 'Legendary Elbaf Warrior'
  | 'Hakuba\'s Cruel Slicing'
  | 'White Smoke Logia Mastery'
  | 'Paw-Paw Compression'
  | 'Magnetic Scrap Manipulation'
  | 'Massacre Soldier Scythes'
  | 'Blue Phoenix Rebirth'
  | 'Custom Combat Discipline';

export type MoveType = 'basic' | 'special' | 'command' | 'ex' | 'super' | 'awakening' | 'finisher';

export type CombatArchetype =
  | 'Berserker'
  | 'Tank'
  | 'Speedster'
  | 'Technician'
  | 'Specialist'
  | 'Trickster';

export type CombatStance = 'offensive' | 'defensive' | 'balanced';

export interface Move {
  id: string;
  name: string;
  nameJP: string;
  type: MoveType;
  baseDamage: number;
  missRate: number; // 0 to 100%
  critBonus: number; // additional %
  meterCost: number; // in Super Stocks (0, 1, 2, 3) or MAX points
  meterGain: number; // super meter generated on hit (0 to 40)
  guardDamage: number; // damage to opponent's guard gauge
  cooldown: number; // turns
  description: string;
  element?: string;
  hakiInfused?: boolean;
  cutinEffect?: string;
  animationColor?: string;
  hitCount?: number;
}

export interface HakiStats {
  conqueror: number; // 0 - 100 (Haoshoku / Infusion)
  armament: number;  // 0 - 100 (Busoshoku / Ryuo internal destruction)
  observation: number; // 0 - 100 (Kenbunshoku / Future Sight)
}

export interface DevilFruitInfo {
  name: string;
  japaneseName: string;
  type: FruitType;
  awakening: AwakeningState;
  primaryElement?: string;
  passivePerk: string;
}

export interface AwakeningStatBuffs {
  attackMultiplier: number; // e.g. 1.35 (+35% extra damage)
  defenseMultiplier: number; // e.g. 1.25 (+25% damage reduction)
  speedMultiplier: number; // e.g. 1.30 (faster cooldown recovery and actions)
  critBonus: number; // e.g. +25% crit chance
  staminaRegenMultiplier: number; // e.g. 2.0x stamina recovery rate
}

export type AwakeningAuraStyle =
  | 'sun_god' // Glowing divine white-gold, drums of liberation smoke ribbons
  | 'hellfire' // Emerald demonic flames, three-sword King of Hell lightning
  | 'conqueror_red' // Deep crimson Haoshoku rifts, red lightning storms
  | 'flaming_dragon' // Molten orange-black magma dragon scales & blazing inferno
  | 'quake_shatter' // White seismic shockwave cracks splitting the air
  | 'dark_vortex' // Swirling violet-black gravity vortex & void clouds
  | 'magma_hell' // Scorching volcanic eruption & lava surges
  | 'ice_absolute' // Frost crystallizing sub-zero glacial rifts
  | 'lightning_god' // 200 Million Volts divine thunder plasma
  | 'radiant_gold' // Blinding light-speed golden prism & lasers
  | 'cyan_room' // Geometric cyan spatial surgical grid & blue plasma sparks
  | 'mochi_divine' // White-hot armored mochi spikes & predictive ripples
  | 'string_puppet' // Silver-white razor string realm & heavenly plumage
  | 'galaxy_impact' // Heavy conqueror black-crimson impact spheres
  | 'phoenix_rebirth' // Azure-cyan immortal regenerative phoenix flames
  | 'stealth_black' // Black fire Germa exoskeleton & invisibility distortions
  | 'awakened_leopard' // Black smoke ring ribbon Rokushiki predator form
  | 'venom_hell' // Crimson Hell's Judgement corrosive venom aura
  | 'wind_storm' // Gale hurricane emerald whirlwind dragon vortex
  | 'elbaf_divine' // Norse thunder giant golden warrior aura
  | 'magnetic_colossus' // Punk Rotten electromagnetic scrap hyper-flux
  | 'primordial_void' // Ancient shadowy eldritch abyss & red eclipse runes
  | 'custom_awakening'; // Dynamic customized aura

export interface AwakeningProfile {
  id: string;
  formName: string; // Display name e.g. "Gear 5: Sun God Nika"
  formNameJP: string; // e.g. "ギア5：太陽の神ニカ"
  epithetTitle: string; // e.g. "THE WARRIOR OF LIBERATION"
  subtitle: string; // e.g. "Drums of Liberation resonate across the battlefield!"
  auraColor: string; // Hex color for base glow
  secondaryAuraColor: string;
  auraStyle: AwakeningAuraStyle;
  statBuffs: AwakeningStatBuffs;
  transformationQuote: string;
  transformationQuoteJP: string;
  uniqueMoves: Move[]; // Unique moves unlocked exclusively in Awakening mode
  durationTurns?: number; // Duration or active until match ends
}

export type HakiSparkEffect = 
  | 'None' 
  | 'Lightning' 
  | 'Fire' 
  | 'Stars' 
  | 'Particles' 
  | 'Conqueror_Rift' 
  | 'Ghost_Embers' 
  | 'Ryuo_Petals';

export interface HakiAuraConfig {
  color: string;
  secondaryColor?: string;
  sparkEffect: HakiSparkEffect;
  particleIntensity?: number; // 0 - 100
  particleSpeed?: number; // 0.5 - 2.5
  auraRadius?: number; // 50 - 150
  auraOpacity?: number; // 0.2 - 1.0
  pulseSpeed?: number; // 0.5 - 2.0
  conquerorLightningColor?: string;
  armamentArmorTexture?: 'ryuo_glow' | 'obsidian_black' | 'emission_aura' | 'coating';
  observationPulseStyle?: 'future_sight_red' | 'mind_eye_cyan' | 'sensory_waves' | 'spatial_distortion' | 'none';
  specialEdgeFlashColor?: string;
  visualStyle?: 'modern_glow' | 'retro_8bit';
}

export interface FighterSkin {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  themeColor?: string;
  secondaryColor?: string;
  badgeText?: string;
}


export type TriggerConditionType = 'HP_BELOW' | 'TURN_COUNT' | 'OPPONENT_FIGHTER_ID' | 'OPPONENT_HAS_OBSERVATION';

export interface TriggerCondition {
  type: TriggerConditionType;
  value: number | string | boolean;
}

export interface Transformation {
  id: string; // e.g., 'gear_4_boundman'
  name: string;
  japaneseName?: string;
  description?: string;
  staminaCost?: number;
  meterCost?: number;
  auraColor?: string;
  quote?: string;
  triggerConditions?: TriggerCondition[];
  visuals?: {
    avatarUrl: string;
    themeColor: string;
    auraEffect?: 'haki_flame' | 'lightning' | 'smoke' | 'void' | 'conqueror';
    portraitOffset?: string;
  };
  statModifiers?: {
    attackMultiplier: number; // 1.0 = normal
    speedMultiplier: number;
    defenseMultiplier: number;
    hpHealPercentage?: number; // 0 to 1
  };
  statMultipliers?: {
    attack?: number;
    defense?: number;
    speed?: number;
  };
  moveSetOverrides?: Move[];
  overrideMoves?: Move[];
  moves?: Move[];
  avatarUrl?: string;
}

export type FighterTransformation = Transformation;

export interface Fighter {
  id: string;
  name: string;
  epithet: string;
  japaneseName: string;
  affiliation: Affiliation;
  rank: MilitaryRank;
  role: string;
  fightingStyle: FightingStyle;
  archetype?: CombatArchetype;
  age: number;
  experienceYears: number;
  bounty: number; // in Berries
  winRecord: {
    wins: number;
    losses: number;
    draws: number;
  };
  stats: {
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number; // Base % (e.g. 15%)
  };
  haki: HakiStats;
  devilFruit: DevilFruitInfo | null;
  moves: Move[];
  transformations?: Transformation[];
  awakeningProfile?: AwakeningProfile;
  clashQuote: string;
  winQuote: string;
  loseQuote: string;
  themeColor: string;
  secondaryColor: string;
  avatarIcon: string;
  avatarUrl?: string;
  shortName?: string;
  
  // Costume / Skin system
  skins?: FighterSkin[];
  activeSkinId?: string;
  
  // Haki Aura customization
  hakiAura?: HakiAuraConfig;

  // Voice & Language Customization
  voiceProfile?: {
    language: 'ja' | 'en' | 'pt';
    pitch: number; // 0.5 to 2.0
    rate: number; // 0.5 to 2.0
    isSynthesized: boolean;
    customClips?: Record<string, string>; // Mapping move IDs to audio URLs
  };
  
  japaneseVoiceName?: string;
  tauntQuote?: string;
  tauntQuoteJP?: string;
  tauntQuotePT?: string;
  victoryQuips?: string[];
  isCustom?: boolean;
}

export interface Team {
  id: string;
  name: string;
  fighters: Fighter[]; // 3 fighters in order [Point, Middle, Anchor]
  bannerColor?: string;
  crestEmoji?: string;
}

export interface BattleFighterState {
  fighter: Fighter;
  currentHp: number;
  maxHp: number;
  currentStance: CombatStance;
  momentum: number; // -10 to +10
  recentMoves: string[]; // for pattern detection
  tauntVulnerable: boolean; // exposed to extra damage if hit while taunting
  counterReady: boolean; // true after dodging/miss to enable counter-attack
  superMeter: number; // 0 to 300 (100 = 1 stock, up to 3 stocks)
  maxModeMeter: number; // 0 to 100 (when activated, drains over time for EX moves)
  isMaxModeActive: boolean;
  guardGauge: number; // 0 to 100 (if reaches 0, guard crush happens)
  moveCooldowns: Record<string, number>;
  statusEffects: {
    isGuarding?: boolean;
    isFutureSightActive?: boolean;
    isHakiBurstActive?: boolean;
    isBurned?: number; // turns
    isPoisoned?: number; // turns
    isStunned?: number;
    atkBuff?: number; // % multiplier
    defBuff?: number;
  };
  totalDamageDealt: number;
  hitsTaken: number;
  highestCombo: number;
  isDefeated: boolean;
  focusMeter: number; // 0 to 100 (reduced by opponent taunts, low focus reduces defense and accuracy)
  staminaMeter: number; // 0 to 100 (depletes on dashes and special moves, recovers during tactical downtime)
  maxStamina: number; // 100 base max
  currentFormId?: string;
  lastTransformationTurn?: number;
  isExhausted?: boolean; // true when stamina reaches 0, causing tactical vulnerability
  hakiMeter: number; // 0 to 300 (three 100-point segments)
  isHakiAwakened: boolean; // true when Haki Awakening is active
  hakiAwakeningTurnsLeft: number; // turns remaining in Haki Awakening state
  isAwakened?: boolean; // true when character HP <= 25% unlocking temporary stat boost and unique moves
  awakeningHasTriggered?: boolean; // ensures transformation sequence triggers once per character
  awakeningTurnsLeft?: number; // turns remaining in awakened state
  awakeningProfile?: AwakeningProfile; // active awakening configuration & unique moves
  unlockedAwakeningMoves?: Move[]; // moves available during awakening
  actionReady: boolean;
  actionCooldown: number;
  actionDuration: number;
}

export type MatchFormat = '3v3_kof' | '1v1_duel' | 'arcade_ladder' | 'custom_sandbox';

export interface StageInfo {
  id: string;
  name: string;
  japaneseName: string;
  location: string;
  atmosphere: string;
  bgGradient: string;
  ambientEffect: 'snow' | 'fire' | 'lightning' | 'cherry_blossoms' | 'clouds' | 'cyber_grid' | 'ocean_waves';
  stagePerkDescription: string;
  accentColor: string;
  hazardName?: string;
  hazardEffect?: string;
  eventTitle?: string;
  eventModifiers?: string[];
}

export type HakiType = 'Armament' | 'Observation' | 'Conqueror' | 'None';

export interface ActionLog {
  id: string;
  roundNumber: number;
  actorSide: 'team1' | 'team2';
  actorName: string;
  actorShortName?: string;
  targetName: string;
  targetShortName?: string;
  moveName: string;
  moveNameJP?: string;
  moveType: MoveType;
  damage: number;
  isCrit: boolean;
  isDodged: boolean;
  isFutureSightDodge?: boolean;
  isMiss?: boolean;
  isBlocked: boolean;
  isGuardCrush: boolean;
  isHakiClash: boolean;
  isCounter?: boolean;
  isTaunt?: boolean;
  isJustGuard?: boolean;
  stance?: CombatStance;
  comboCount: number;
  commentaryText?: string;
  timestamp: number;
  hakiMultiplier?: number;
  hakiType?: HakiType;
}

export interface RoundStat {
  roundNumber: number;
  winnerSide: 'team1' | 'team2' | 'draw';
  winnerName: string;
  t1FighterName: string;
  t2FighterName: string;
  t1Damage: number;
  t2Damage: number;
  maxCombo: number;
  supersLanded: number;
  decisiveMove?: string;
  durationSeconds?: number;
}

export interface MatchResult {
  id: string;
  date: string;
  matchFormat: MatchFormat;
  team1: {
    name: string;
    fighters: string[];
    isWinner: boolean;
    score?: number;
  };
  team2: {
    name: string;
    fighters: string[];
    isWinner: boolean;
    score?: number;
  };
  team1Score?: number;
  team2Score?: number;
  winnerName: string;
  isDraw?: boolean;
  totalRounds: number;
  roundHistory?: Array<'team1' | 'team2' | 'draw'>;
  roundStats?: RoundStat[];
  mvpFighter: string;
  bountyEarned: number;
  combatLogs: ActionLog[];
  aiRecap?: {
    recapText: string;
    tacticalDecidingFactor: string;
  };
  eventInfo?: {
    eventId: string;
    eventTitle: string;
    modifiers: string[];
    rewardClaimed?: boolean;
  };
}

export interface SavedCombo {
  id: string;
  name: string;
  inputSequence: string[]; // e.g., ["↓", "↘", "→", "LP"]
  damageEstimate: number;
  meterCost: number;
  timestamp: number;
}

export interface GamepadMapping {
  guardButton: number;       // e.g. 0 (A/Cross)
  dodgeButton: number;       // e.g. 1 (B/Circle)
  tauntButton: number;       // e.g. 2 (X/Square)
  exMoveButton: number;      // e.g. 3 (Y/Triangle)
  superMoveButton: number;   // e.g. 4 (LB/L1)
  finisherButton: number;    // e.g. 5 (RB/R1)
  maxModeButton: number;     // e.g. 9 (Start/Options)
  menuConfirmButton: number; // e.g. 0 (A/Cross)
  menuBackButton: number;    // e.g. 1 (B/Circle)
}

export interface KeyboardMapping {
  move1Key: string;      // Light Attack 1 (Default: 'KeyJ')
  move2Key: string;      // Medium Attack 2 (Default: 'KeyK')
  exMoveKey: string;     // EX / Special Move (Default: 'KeyU')
  superMoveKey: string;  // Super Move (Default: 'KeyI')
  guardKey: string;      // Guard / Block (Default: 'KeyL')
  dodgeKey: string;      // Future Sight Dodge (Default: 'Space')
  tauntKey: string;      // Taunt (Default: 'KeyT')
  finisherKey: string;   // Combo Finisher (Default: 'KeyO')
  maxModeKey: string;    // MAX Mode Toggle (Default: 'KeyM')
  pauseKey: string;      // Pause / Battle Menu (Default: 'KeyP')
}

export interface UserProfile {
  id: string;
  username: string;
  crewName: string;
  title: string;
  flagIcon: string;
  flagColor: string;
  bounty: number;
  tierRank: 'Rookie' | 'Supernova' | 'Warlord' | 'Admiral' | 'Yonko' | 'Pirate King';
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    totalKOs: number;
    highestDamageCombo: number;
    perfectRounds: number;
    hakiClashesWon: number;
  };
  savedTeams: Team[];
  customFighters: Fighter[];
  matchHistory: MatchResult[];
  unlockedAchievements: string[];
  unlockedGalleryItems?: string[];
  gamepadMapping?: GamepadMapping;
  gamepadPresets: Record<string, GamepadMapping>;
  activeGamepadPreset: string;
  keyboardMapping?: KeyboardMapping;
  p2KeyboardMapping?: KeyboardMapping;
  savedCombos: SavedCombo[];
  vibrationIntensity?: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  crewName: string;
  bounty: number;
  tier: string;
  winRate: number;
  matchesPlayed: number;
  signatureFighter: string;
  isUser?: boolean;
}

export interface CustomFighterDraft {
  name: string;
  epithet: string;
  affiliation: string;
  rank: string;
  role: string;
  fightingStyle: string;
  bounty: number;
  age: number;
  experienceYears: number;
  avatarIcon: string;
  themeColor: string;
  quote: string;
  voiceLang: 'ja' | 'en' | 'pt';
  voicePitch: number;
  voiceRate: number;
  customClips: Record<string, string>;
  tauntPT: string;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  conqueror: number;
  armament: number;
  observation: number;
  hakiAura: HakiAuraConfig;
  hasFruit: boolean;
  fruitName: string;
  fruitType: 'Paramecia' | 'Logia' | 'Zoan' | 'Ancient Zoan' | 'Mythical Zoan';
  fruitAwakening: 'None' | 'Partial' | 'Awakened';
  fruitPerk: string;
  moves: Move[];
  lastSavedAt?: number;
}

