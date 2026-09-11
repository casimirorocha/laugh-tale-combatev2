// Types for character-specific mid-battle taunt animations and crowd reactions

export type CrowdReactionType =
  | 'cheer_hype'      // Resounding stadium roar, whistles, and ovations
  | 'gasp_shock'      // Collective sharp gasp, vacuum drop, and low awe rumble
  | 'laughter_amused' // Bubbling spectator chuckles, banter, and amused laughter
  | 'whistle_boos'    // Piercing slide whistles, catcalls, and jeering boos
  | 'chants_stadium'; // Deep rhythmic bass stomps and synchronized chants

export type TauntMotionChoreography =
  | 'bounce_joy'       // Elastic jump, float, cartoon wiggle & laughing starbursts
  | 'sheath_stance'    // Low stance sword sheath click, bandana tighten, green slash spark
  | 'cigar_flame'      // Heel spin tap, spark flick, smoke ring puff & flaming aura
  | 'haki_flare'       // Hat adjust, dark red/black conqueror lightning radial waves
  | 'sake_gourd'       // Massive sake gourd swig, dragon breath flame puff, chest flex
  | 'tremor_ground'    // Ground tremor punch, air-crack spiderweb glass shatter effect
  | 'dark_vortex'      // Gravitational dark swirl rising from ground, evil laugh tilt
  | 'room_snap'        // Sword shoulder rest, blue translucent ROOM sphere expansion & snap
  | 'donut_snack'      // Arms folded, red observation glint eye flash, donut bite
  | 'puppet_dance'     // Head flung back laugh, twitching spectral strings shimmering
  | 'hawk_glance'      // Arms crossed, razor golden hawk-eye beam glint, cape billow
  | 'sand_whirl'       // Cigar flick, whirlwind sand vortex encircling body
  | 'god_throne'       // Floating lightning pose, gold ring aura, earlobe spark
  | 'fire_fingers'     // Hat brim salute, fingertip flame twirl, fiery sparks
  | 'water_focus'      // Fishman karate bow, orbiting water droplets & wave splash
  | 'flashy_split'     // Floating detached hands clapping/mocking, red nose squeak
  | 'fist_crack'       // Rice cracker crunch, boisterous gut laugh, iron fist smash
  | 'magma_fume'       // Molten magma drip from shoulders, volcanic smoke scowl
  | 'ice_chill'        // Frost breath sigh, chilling icy snowflake drift
  | 'light_teleport'   // Finger laser glow, slow mocking drawl, yellow sparkle
  | 'generic_flex';    // Universal martial arts pose with energy burst

export type TauntCategory =
  | 'signature'
  | 'provocation'
  | 'disrespect'
  | 'legendary'
  | 'humorous';

export interface BattleTauntAnimation {
  id: string;
  fighterId: string; // Specific fighter ID or '*' for generic/custom
  name: string;
  nameJP: string;
  category: TauntCategory;
  quoteEN: string;
  quoteJP: string;
  quotePT?: string;
  motion: TauntMotionChoreography;
  primaryColor: string;
  secondaryColor?: string;
  crowdReaction: CrowdReactionType;
  crowdShoutText: string;
  crowdReactionLabel: string;
  visualProp: string;
  badge: string;
  focusDrain: number; // e.g. 25-45 focus reduction on opponent
  meterGain: number; // e.g. 35-60 super meter gain
  crowdExcitementBoost: number; // 10-30 excitement boost
  customSfxFile?: string;
}

export interface ActiveTauntState {
  side: 'team1' | 'team2';
  fighterId: string;
  fighterName: string;
  taunt: BattleTauntAnimation;
  startTime: number;
  durationMs: number;
}
