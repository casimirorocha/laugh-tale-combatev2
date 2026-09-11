// World Map & Global Events Data
import { GlobalEvent, StageModifier, EventCompletionRecord } from '../types/worldEvents';
import { CHARACTERS } from './characters';
import { Team } from '../types/fighter';

export const STAGE_MODIFIERS: Record<string, StageModifier> = {
  buster_artillery: {
    id: 'buster_artillery',
    name: 'Buster Call Artillery',
    nameJP: '国家消滅級砲撃陣',
    description: 'Marine warship cannonades rain continuously. Attack damage increased by +15%, while block/guard efficiency is reduced by 25%.',
    icon: 'Crosshair',
    color: '#ef4444',
    badgeBg: 'bg-red-950/60',
    badgeBorder: 'border-red-500/50',
    badgeText: 'text-red-300',
    mechanic: 'fire_artillery',
    valueMultiplier: 1.15,
  },
  conqueror_summit: {
    id: 'conqueror_summit',
    name: "Emperor's Coalescence",
    nameJP: '覇王色の共鳴暴風',
    description: "Yonko-level Conqueror's Haki saturates the arena. Super Meter charges 35% faster and Haki Clash triggers at double frequency.",
    icon: 'Crown',
    color: '#a855f7',
    badgeBg: 'bg-purple-950/60',
    badgeBorder: 'border-purple-500/50',
    badgeText: 'text-purple-300',
    mechanic: 'super_charge',
    valueMultiplier: 1.35,
  },
  cross_guild_bounties: {
    id: 'cross_guild_bounties',
    name: 'Cross Guild Triple Bounty',
    nameJP: '三大幹部・特別賞金首条約',
    description: 'Marine hunts are rewarded with triple bounty payouts. Critical strikes deal 1.85x damage, but guard crush drains 40% more gauge.',
    icon: 'Coins',
    color: '#eab308',
    badgeBg: 'bg-amber-950/60',
    badgeBorder: 'border-amber-500/50',
    badgeText: 'text-amber-300',
    mechanic: 'bounty_boost',
    valueMultiplier: 3.0,
  },
  holy_land_gravity: {
    id: 'holy_land_gravity',
    name: "God's Knights Suppression",
    nameJP: '神々の騎士団・絶対戒厳',
    description: 'Celestial authority dampens speed by 10%, but Desperation and EX moves gain +30% critical impact multiplier.',
    icon: 'ShieldAlert',
    color: '#f97316',
    badgeBg: 'bg-orange-950/60',
    badgeBorder: 'border-orange-500/50',
    badgeText: 'text-orange-300',
    mechanic: 'low_hp_desperation',
    valueMultiplier: 1.3,
  },
  darkness_nullification: {
    id: 'darkness_nullification',
    name: 'Yami Yami Gravitational Well',
    nameJP: '闇の引力・能力減衰磁場',
    description: 'Devil Fruit damage is dampened by 20%, while raw Physical and Armament Haki strikes deal +25% crushing damage.',
    icon: 'EyeOff',
    color: '#6366f1',
    badgeBg: 'bg-indigo-950/60',
    badgeBorder: 'border-indigo-500/50',
    badgeText: 'text-indigo-300',
    mechanic: 'devil_fruit_dampener',
    valueMultiplier: 1.25,
  },
  skypiea_altitude: {
    id: 'skypiea_altitude',
    name: 'Upper Yard High Altitude',
    nameJP: '白々海・超希薄大気機動',
    description: 'Low air resistance enables lightning-speed maneuverability. Movement speed and combo window increased by +20%.',
    icon: 'Wind',
    color: '#06b6d4',
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-500/50',
    badgeText: 'text-cyan-300',
    mechanic: 'speed_overdrive',
    valueMultiplier: 1.2,
  },
};

const EVENT_STORAGE_KEY = 'op_world_event_completions_v1';
const EVENT_TIMERS_KEY = 'op_world_event_timer_offsets_v1';

// Stable cycle timestamp generator so timers are consistent across refreshes
function getEventExpiry(offsetHours: number): number {
  try {
    const raw = localStorage.getItem(EVENT_TIMERS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = `event_expiry_${offsetHours}`;
    const now = Date.now();
    
    if (map[key] && map[key] > now) {
      return map[key];
    }
    // Refresh cycle duration between 2 to 6 hours
    const freshExpiry = now + offsetHours * 3600 * 1000 + Math.floor(Math.random() * 1800 * 1000);
    map[key] = freshExpiry;
    localStorage.setItem(EVENT_TIMERS_KEY, JSON.stringify(map));
    return freshExpiry;
  } catch (e) {
    return Date.now() + offsetHours * 3600 * 1000;
  }
}

export const INITIAL_GLOBAL_EVENTS: GlobalEvent[] = [
  {
    id: 'evt_marine_invasion_egghead',
    title: 'Marine Invasion: Buster Call on Egghead',
    subtitle: 'Fleet Admiral Sakazuki Orders Level 5 Annihilation',
    japaneseTitle: '海軍超厳戒体制：バスターコール包囲網',
    type: 'marine_invasion',
    sector: 'new_world',
    sectorName: 'New World - Frontier Islands',
    locationName: 'Egghead: Future Island Labophase',
    stageId: 'stage_egghead',
    coordinates: { x: 74, y: 38 },
    threatLevel: 'Calamity',
    threatColor: '#ef4444',
    durationHours: 3.5,
    expiresAt: getEventExpiry(3.5),
    activeQueues: 184,
    briefing:
      'Over 100 Marine warships including nine Vice Admirals and Admiral Borsalino have encircled Future Island Egghead. The Buster Call orbital cannons are priming. Break the blockade before the Labophase is reduced to slag.',
    denDenMushiCall:
      'Puru-puru-puru... This is Marine HQ Flagship! All pirate vessels entering Egghead waters will be eliminated with extreme prejudice!',
    modifiers: [
      STAGE_MODIFIERS.buster_artillery,
      STAGE_MODIFIERS.cross_guild_bounties,
    ],
    rewards: [
      {
        id: 'rwd_buster_call_title',
        type: 'title',
        name: 'Buster Call Annihilator',
        value: 'Buster Call Annihilator',
        description: 'Exclusive title for smashing the Marine naval siege armada at Egghead.',
        icon: '⚓',
        rarity: 'mythic',
      },
      {
        id: 'rwd_buster_flag',
        type: 'flag',
        name: 'Vice Admiral Crossbones',
        value: '⚓',
        description: 'Captured ceremonial Marine Admiral battle banner.',
        icon: '⚓',
        rarity: 'legendary',
      },
      {
        id: 'rwd_buster_bounty',
        type: 'bounty',
        name: 'Government Emergency Bounty',
        value: 400000000,
        description: '+฿ 400,000,000 bounty awarded upon clearing the invasion.',
        icon: '💰',
        rarity: 'legendary',
      },
    ],
    hostileFactions: ['Marine Headquarters', 'Cipher Pol Aegis 0', 'Pacifista Fleet'],
    recommendedTCP: 30000,
    bannerGradient: 'from-red-950 via-slate-950 to-blue-950',
    accentColor: '#ef4444',
    iconEmoji: '⚓',
    opponentTeamPreset: {
      name: 'Marine Absolute Justice Taskforce',
      bannerColor: '#3b82f6',
      crestEmoji: '⚖️',
      fighterNames: ['Sakazuki (Akainu)', 'Borsalino (Kizaru)', 'Rob Lucci'],
      captainName: 'Fleet Admiral Sakazuki',
    },
  },
  {
    id: 'evt_pirate_summit_onigashima',
    title: 'Pirate Alliance Summit: Rooftop of Beasts',
    subtitle: 'The Emperors Clash for the Throne of the World',
    japaneseTitle: '四皇同盟会談：ドクロドーム覇王決戦',
    type: 'pirate_summit',
    sector: 'new_world',
    sectorName: 'New World - Wano Archipelago',
    locationName: 'Onigashima: Skull Dome Rooftop',
    stageId: 'stage_onigashima',
    coordinates: { x: 82, y: 22 },
    threatLevel: 'Yonko-Class',
    threatColor: '#a855f7',
    durationHours: 5.0,
    expiresAt: getEventExpiry(5.0),
    activeQueues: 247,
    briefing:
      'The ancient Yonko alliance has convened atop the Skull Dome under a blood-red full moon. Thunder Bagua and Ikoku Sovereignty shockwaves are cleaving the clouds in twain. Conquer the Summit to claim the ancient Poneglyph rubbings.',
    denDenMushiCall:
      'Worororo! Mamamama! Step forward if you dare dispute our rule over the four seas, little brats!',
    modifiers: [
      STAGE_MODIFIERS.conqueror_summit,
      STAGE_MODIFIERS.darkness_nullification,
    ],
    rewards: [
      {
        id: 'rwd_summit_title',
        type: 'title',
        name: 'Sovereign of the Four Emperors',
        value: 'Sovereign of the Four Emperors',
        description: 'Proof of victory over the unified Emperors of the Sea.',
        icon: '👑',
        rarity: 'mythic',
      },
      {
        id: 'rwd_summit_flag',
        type: 'flag',
        name: 'Dragon Horn Crest',
        value: '🐉',
        description: 'Gilded battle crest of the Beasts & Big Mom Alliance.',
        icon: '🐉',
        rarity: 'legendary',
      },
      {
        id: 'rwd_summit_bounty',
        type: 'bounty',
        name: 'Yonko War Chest Bounty',
        value: 550000000,
        description: '+฿ 550,000,000 supreme bounty cashout.',
        icon: '🪙',
        rarity: 'mythic',
      },
    ],
    hostileFactions: ['Beasts Pirates', 'Big Mom Pirates', 'Ancient Giants'],
    recommendedTCP: 32000,
    bannerGradient: 'from-purple-950 via-slate-950 to-amber-950',
    accentColor: '#a855f7',
    iconEmoji: '👑',
    opponentTeamPreset: {
      name: 'Twin Sovereigns of the New World',
      bannerColor: '#9333ea',
      crestEmoji: '🐉',
      fighterNames: ['Kaido', 'Charlotte Linlin (Big Mom)', 'King the Conflagration'],
      captainName: 'Governor-General Kaido',
    },
  },
  {
    id: 'evt_cross_guild_hunt_marineford',
    title: 'Cross Guild High-Value Bounty Hunt',
    subtitle: 'Reverse Bounties Issued on High-Ranking Admirals',
    japaneseTitle: 'クロスギルド：海軍本部特別懸賞金狩り',
    type: 'cross_guild_hunt',
    sector: 'paradise',
    sectorName: 'Paradise - Marine Headquarters Bay',
    locationName: 'Marineford: Frozen Bay of Judgment',
    stageId: 'stage_marineford',
    coordinates: { x: 44, y: 55 },
    threatLevel: 'SS',
    threatColor: '#eab308',
    durationHours: 2.2,
    expiresAt: getEventExpiry(2.2),
    activeQueues: 139,
    briefing:
      'Sir Crocodile and "Hawk Eyes" Mihawk have deployed their mercenary syndicates into the frozen bay of Marineford, hunting Admiralty targets. Claim their astronomical prize pools before rival bounty hunters intercept.',
    denDenMushiCall:
      'Gahahahaha! Listen well, fools! The era of the Marines hunting us is finished! Every Admiral head carries five stars in gold!',
    modifiers: [
      STAGE_MODIFIERS.cross_guild_bounties,
      STAGE_MODIFIERS.buster_artillery,
    ],
    rewards: [
      {
        id: 'rwd_cross_guild_title',
        type: 'title',
        name: 'Cross Guild High Executioner',
        value: 'Cross Guild High Executioner',
        description: 'Awarded for claiming the highest bounty contract in the Frozen Bay.',
        icon: '⚜️',
        rarity: 'legendary',
      },
      {
        id: 'rwd_cross_flag',
        type: 'flag',
        name: 'Guild Master Star',
        value: '⚜️',
        description: 'Official seal of Buggy, Crocodile, and Mihawk.',
        icon: '⚜️',
        rarity: 'epic',
      },
      {
        id: 'rwd_cross_bounty',
        type: 'bounty',
        name: 'Syndicate Gold Payout',
        value: 380000000,
        description: '+฿ 380,000,000 Cross Guild bounty payout.',
        icon: '💎',
        rarity: 'legendary',
      },
    ],
    hostileFactions: ['Cross Guild Fleet', 'Baroque Works Veterans', 'Mercenary Syndicate'],
    recommendedTCP: 28500,
    bannerGradient: 'from-amber-950 via-slate-950 to-yellow-950',
    accentColor: '#eab308',
    iconEmoji: '⚜️',
    opponentTeamPreset: {
      name: 'Cross Guild Trinity Syndicate',
      bannerColor: '#ca8a04',
      crestEmoji: '🤡',
      fighterNames: ['Dracule Mihawk', 'Crocodile', 'Buggy the Star Clown'],
      captainName: 'Chairman Buggy & Mihawk',
    },
  },
  {
    id: 'evt_celestial_siege_mary_geoise',
    title: 'Holy Land Infiltration: Red Line Citadel',
    subtitle: 'Revolutionary Army Assaults the Pangaea Castle Gates',
    japaneseTitle: '聖地マリージョア：神々の軍勢包囲網',
    type: 'celestial_siege',
    sector: 'red_line',
    sectorName: 'Red Line - Pangaea Plateau',
    locationName: 'Laugh Tale: Dawn of the Pirate King',
    stageId: 'stage_laugh_tale',
    coordinates: { x: 50, y: 15 },
    threatLevel: 'Yonko-Class',
    threatColor: '#f97316',
    durationHours: 4.2,
    expiresAt: getEventExpiry(4.2),
    activeQueues: 215,
    briefing:
      'The Revolutionary Army commanders under Monkey D. Dragon have breached the celestial lifts of the Red Line. The mysterious sovereigns of the Empty Throne have unleashed shadowy God’s Knights to crush the insurrection.',
    denDenMushiCall:
      'The winds of revolution are howling across the Red Line. Strike down the celestial shields and emancipate the world!',
    modifiers: [
      STAGE_MODIFIERS.holy_land_gravity,
      STAGE_MODIFIERS.conqueror_summit,
    ],
    rewards: [
      {
        id: 'rwd_celestial_title',
        type: 'title',
        name: 'Flame of Celestial Liberation',
        value: 'Flame of Celestial Liberation',
        description: 'Earned by dismantling the Holy Land defense vanguard.',
        icon: '🔥',
        rarity: 'mythic',
      },
      {
        id: 'rwd_celestial_flag',
        type: 'flag',
        name: 'Dragon Wing Standard',
        value: '🔥',
        description: 'Emblem of the Revolutionary Army command.',
        icon: '🔥',
        rarity: 'legendary',
      },
      {
        id: 'rwd_celestial_bounty',
        type: 'bounty',
        name: 'World Government Red Bounty',
        value: 480000000,
        description: '+฿ 480,000,000 for threatening the World Nobles.',
        icon: '🏆',
        rarity: 'mythic',
      },
    ],
    hostileFactions: ['God’s Knights', 'Cipher Pol Prime', 'Gorosei Guardians'],
    recommendedTCP: 31000,
    bannerGradient: 'from-orange-950 via-slate-950 to-red-950',
    accentColor: '#f97316',
    iconEmoji: '🔥',
    opponentTeamPreset: {
      name: 'Holy Land Divine Defense Legion',
      bannerColor: '#ea580c',
      crestEmoji: '👑',
      fighterNames: ['Imu-sama', 'Rob Lucci', 'Bartholomew Kuma'],
      captainName: 'Shadow of the Empty Throne',
    },
  },
  {
    id: 'evt_skypiea_clash_upper_yard',
    title: 'Skypiea Thundercloud Skirmish',
    subtitle: 'Golden Bell Chimes Above the Sea of Clouds',
    japaneseTitle: '神の島スカイピア：雷迎の激戦',
    type: 'skypiea_clash',
    sector: 'sky_island',
    sectorName: 'White-White Sea (10,000m Above Sea Level)',
    locationName: 'Whole Cake Island: Sweet Chateau Garden',
    stageId: 'stage_wholecake',
    coordinates: { x: 30, y: 30 },
    threatLevel: 'S',
    threatColor: '#06b6d4',
    durationHours: 1.8,
    expiresAt: getEventExpiry(1.8),
    activeQueues: 96,
    briefing:
      'God Enel has summoned the Raigo thunder storm across the Upper Yard ruins. The air is razor thin and static electricity crackles through every strike. Claim the Shandian golden relic before the sky island collapses.',
    denDenMushiCall:
      'Yahahahaha! Mortals dare venture into the realm of God? Face the divine judgment of 200 Million Volts!',
    modifiers: [
      STAGE_MODIFIERS.skypiea_altitude,
      STAGE_MODIFIERS.buster_artillery,
    ],
    rewards: [
      {
        id: 'rwd_skypiea_title',
        type: 'title',
        name: 'Bells of Shandora Echo',
        value: 'Bells of Shandora Echo',
        description: 'Proof of surviving the divine lightning of God Enel.',
        icon: '⚡',
        rarity: 'legendary',
      },
      {
        id: 'rwd_skypiea_flag',
        type: 'flag',
        name: 'Golden Cloud Wing',
        value: '⚡',
        description: 'Winged sigil of the Sky Island guardians.',
        icon: '⚡',
        rarity: 'epic',
      },
      {
        id: 'rwd_skypiea_bounty',
        type: 'bounty',
        name: 'Ancient Golden Bell Treasure',
        value: 320000000,
        description: '+฿ 320,000,000 ancient gold bounty valuation.',
        icon: '🪙',
        rarity: 'epic',
      },
    ],
    hostileFactions: ['God’s Army', 'Priests of Upper Yard', 'Shandian Warriors'],
    recommendedTCP: 27000,
    bannerGradient: 'from-cyan-950 via-slate-950 to-blue-950',
    accentColor: '#06b6d4',
    iconEmoji: '⚡',
    opponentTeamPreset: {
      name: 'God Enel Divine Retribution',
      bannerColor: '#0891b2',
      crestEmoji: '⚡',
      fighterNames: ['Enel', 'Portgas D. Ace', 'Marcos Fênix'],
      captainName: 'God Enel',
    },
  },
];

// Helper to retrieve saved event completion records from LocalStorage
export function getEventCompletions(): Record<string, EventCompletionRecord> {
  try {
    const raw = localStorage.getItem(EVENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveEventCompletion(eventId: string, score: number = 1000): void {
  try {
    const existing = getEventCompletions();
    const prev = existing[eventId] || {
      eventId,
      clearedAt: Date.now(),
      rewardsClaimed: false,
      clearCount: 0,
      highScore: 0,
    };
    existing[eventId] = {
      ...prev,
      clearedAt: Date.now(),
      rewardsClaimed: true,
      clearCount: prev.clearCount + 1,
      highScore: Math.max(prev.highScore, score),
    };
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save event completion', e);
  }
}

// Build a full Team object from the Event Opponent preset
export function createEventOpponentTeam(event: GlobalEvent): Team {
  const allKnown = [...CHARACTERS];
  const fighters = event.opponentTeamPreset.fighterNames
    .map((name) => allKnown.find((f) => f.name.toLowerCase() === name.toLowerCase() || f.shortName?.toLowerCase() === name.toLowerCase()))
    .filter(Boolean) as typeof CHARACTERS;

  // Fallback if any fighter name wasn't found directly
  while (fighters.length < 3) {
    fighters.push(allKnown[Math.floor(Math.random() * allKnown.length)]);
  }

  return {
    id: `event_rival_${event.id}`,
    name: event.opponentTeamPreset.name,
    bannerColor: event.opponentTeamPreset.bannerColor,
    crestEmoji: event.opponentTeamPreset.crestEmoji,
    fighters: fighters.slice(0, 3),
  };
}

// Format remaining duration into HH:MM:SS
export function formatTimeRemaining(expiresAt: number): { formatted: string; isExpired: boolean; secondsLeft: number } {
  const diffMs = Math.max(0, expiresAt - Date.now());
  const seconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    formatted: `${pad(hours)}:${pad(minutes)}:${pad(secs)}`,
    isExpired: diffMs <= 0,
    secondsLeft: seconds,
  };
}
