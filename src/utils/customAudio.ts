// Custom Fighter & Move & Taunt Audio Mapping for .mp3 sound effects
// Allows mapping character moves, basic hits, specials, supers, and custom character taunts to .mp3 audio files.

export interface CustomAudioConfig {
  /** Map of fighter ID or move ID to custom MP3 URLs or file paths */
  moveAudioMap: Record<string, string>;
  /** Map of fighter ID to custom taunt MP3 URLs or file paths */
  tauntAudioMap: Record<string, string>;
  /** Default directory for character move mp3s */
  baseDir: string;
}

/**
 * Mapping object for fighter-specific move sound effects.
 * Keys can be:
 * 1. Full move ID: e.g. "luffy_pistol", "zoro_sanzen_sekai", "kaido_thunder_bagua"
 * 2. Fighter ID + Move type: e.g. "luffy_special", "shanks_finisher"
 * 3. Direct trigger key: e.g. "luffy_hit", "zoro_slash", "kaido_roar"
 * 4. Move Name (lowercase): e.g. "gomu gomu no pistol", "sanzen sekai"
 * 
 * Supports both single string URLs and array of candidate URLs.
 */
export const CUSTOM_MOVE_AUDIO_MAP: Record<string, string | string[]> = {
  // Luffy (Gear 5 & Base)
  'luffy_pistol': ['/audio/characters/luffy_pistol.mp3', '/audio/sfx/luffy_pistol.mp3', '/audio/moves/luffy_pistol.mp3'],
  'luffy_jet_gatling': ['/audio/characters/luffy_jet_gatling.mp3', '/audio/sfx/luffy_jet_gatling.mp3'],
  'luffy_red_roc': ['/audio/characters/luffy_red_roc.mp3', '/audio/sfx/luffy_red_roc.mp3'],
  'luffy_bajrang_gun': ['/audio/characters/luffy_bajrang_gun.mp3', '/audio/sfx/luffy_bajrang_gun.mp3'],
  'luffy_awakening': ['/audio/characters/luffy_awakening.mp3', '/audio/sfx/luffy_awakening.mp3'],

  // Zoro
  'zoro_oni_giri': ['/audio/characters/zoro_oni_giri.mp3', '/audio/sfx/zoro_oni_giri.mp3'],
  'zoro_shishi_sonson': ['/audio/characters/zoro_shishi_sonson.mp3', '/audio/sfx/zoro_shishi_sonson.mp3'],
  'zoro_sanzen_sekai': ['/audio/characters/zoro_sanzen_sekai.mp3', '/audio/sfx/zoro_sanzen_sekai.mp3'],
  'zoro_king_of_hell': ['/audio/characters/zoro_king_of_hell.mp3', '/audio/sfx/zoro_king_of_hell.mp3'],

  // Shanks
  'shanks_sword_slash': ['/audio/characters/shanks_sword_slash.mp3', '/audio/sfx/shanks_sword_slash.mp3'],
  'shanks_divine_departure': ['/audio/characters/shanks_divine_departure.mp3', '/audio/sfx/shanks_divine_departure.mp3'],
  'shanks_conqueror_blast': ['/audio/characters/shanks_conqueror_blast.mp3', '/audio/sfx/shanks_conqueror_blast.mp3'],

  // Kaido
  'kaido_thunder_bagua': ['/audio/characters/kaido_thunder_bagua.mp3', '/audio/sfx/kaido_thunder_bagua.mp3'],
  'kaido_dragon_breath': ['/audio/characters/kaido_dragon_breath.mp3', '/audio/sfx/kaido_dragon_breath.mp3'],
  'kaido_conqueror_three_worlds': ['/audio/characters/kaido_conqueror_three_worlds.mp3', '/audio/sfx/kaido_conqueror_three_worlds.mp3'],

  // Whitebeard
  'whitebeard_sea_quake': ['/audio/characters/whitebeard_sea_quake.mp3', '/audio/sfx/whitebeard_sea_quake.mp3'],
  'whitebeard_heaven_splitter': ['/audio/characters/whitebeard_heaven_splitter.mp3', '/audio/sfx/whitebeard_heaven_splitter.mp3'],

  // Blackbeard
  'blackbeard_black_hole': ['/audio/characters/blackbeard_black_hole.mp3', '/audio/sfx/blackbeard_black_hole.mp3'],
  'blackbeard_quake_smash': ['/audio/characters/blackbeard_quake_smash.mp3', '/audio/sfx/blackbeard_quake_smash.mp3'],

  // Akainu
  'akainu_great_eruption': ['/audio/characters/akainu_great_eruption.mp3', '/audio/sfx/akainu_great_eruption.mp3'],
  'akainu_meigo': ['/audio/characters/akainu_meigo.mp3', '/audio/sfx/akainu_meigo.mp3'],

  // Law
  'law_room_takt': ['/audio/characters/law_room_takt.mp3', '/audio/sfx/law_room_takt.mp3'],
  'law_gamma_knife': ['/audio/characters/law_gamma_knife.mp3', '/audio/sfx/law_gamma_knife.mp3'],
  'law_puncture_wille': ['/audio/characters/law_puncture_wille.mp3', '/audio/sfx/law_puncture_wille.mp3'],

  // Sanji
  'sanji_flambe_strike': ['/audio/characters/sanji_flambe_strike.mp3', '/audio/sfx/sanji_flambe_strike.mp3'],
  'sanji_ifrit_jambe': ['/audio/characters/sanji_ifrit_jambe.mp3', '/audio/sfx/sanji_ifrit_jambe.mp3'],

  // Katakuri
  'katakuri_chikara_mochi': ['/audio/characters/katakuri_chikara_mochi.mp3', '/audio/sfx/katakuri_chikara_mochi.mp3'],
  'katakuri_unstoppable_donut': ['/audio/characters/katakuri_unstoppable_donut.mp3', '/audio/sfx/katakuri_unstoppable_donut.mp3'],

  // Generic fallback patterns by move type
  'generic_special': '/audio/sfx/clash.mp3',
  'generic_super': '/audio/sfx/lightning_strike.mp3',
  'generic_finisher': '/audio/sfx/ko.mp3',
};

/**
 * Mapping object for fighter-specific custom TAUNT sound effects (.mp3)
 * Keys are fighter IDs (or lowercase fighter names / nicknames)
 */
export const CUSTOM_TAUNT_AUDIO_MAP: Record<string, string | string[]> = {
  'luffy': ['/audio/taunts/luffy_taunt.mp3', '/audio/taunts/luffy.mp3'],
  'zoro': ['/audio/taunts/zoro_taunt.mp3', '/audio/taunts/zoro.mp3'],
  'shanks': ['/audio/taunts/shanks_taunt.mp3', '/audio/taunts/shanks.mp3'],
  'kaido': ['/audio/taunts/kaido_beast.mp3', '/audio/taunts/kaido_taunt.mp3', '/audio/taunts/kaido.mp3'],
  'kaido_beast': ['/audio/taunts/kaido_beast.mp3'],
  'whitebeard': ['/audio/taunts/whitebeard_taunt.mp3', '/audio/taunts/whitebeard.mp3'],
  'blackbeard': ['/audio/taunts/blackbeard_taunt.mp3', '/audio/taunts/blackbeard.mp3'],
  'akainu': ['/audio/taunts/akainu_taunt.mp3', '/audio/taunts/akainu.mp3'],
  'law': ['/audio/taunts/law_taunt.mp3', '/audio/taunts/law.mp3'],
  'sanji': ['/audio/taunts/sanji_taunt.mp3', '/audio/taunts/sanji.mp3'],
  'katakuri': ['/audio/taunts/katakuri_taunt.mp3', '/audio/taunts/katakuri.mp3'],
  'buggy': ['/audio/taunts/buggy_taunt.mp3', '/audio/taunts/buggy.mp3'],
  'mihawk': ['/audio/taunts/mihawk_taunt.mp3', '/audio/taunts/mihawk.mp3'],
  'garp': ['/audio/taunts/garp_taunt.mp3', '/audio/taunts/garp.mp3'],
  'roger': ['/audio/taunts/roger_taunt.mp3', '/audio/taunts/roger.mp3'],
  'kizaru': ['/audio/taunts/kizaru_taunt.mp3', '/audio/taunts/kizaru.mp3'],
  'big_mom': ['/audio/taunts/big_mom_taunt.mp3', '/audio/taunts/big_mom.mp3'],
  'doflamingo': ['/audio/taunts/doflamingo_joker.mp3', '/audio/taunts/doflamingo_taunt.mp3', '/audio/taunts/doflamingo.mp3'],
  'doflamingo_joker': ['/audio/taunts/doflamingo_joker.mp3'],
  'crocodile': ['/audio/taunts/crocodile_taunt.mp3', '/audio/taunts/crocodile.mp3'],
  'ace': ['/audio/taunts/ace_taunt.mp3', '/audio/taunts/ace.mp3'],
  'jinbe': ['/audio/taunts/jinbe_taunt.mp3', '/audio/taunts/jinbe.mp3'],
  'enel': ['/audio/taunts/enel_taunt.mp3', '/audio/taunts/enel.mp3'],
  'moria': ['/audio/taunts/moria_taunt.mp3', '/audio/taunts/moria.mp3'],
  'lucci': '/audio/taunts/lucci_taunt.mp3',
  'oden': '/audio/taunts/oden_taunt.mp3',
  'shiki': '/audio/taunts/shiki_taunt.mp3',
  'aokiji': '/audio/taunts/aokiji_taunt.mp3',
  'imu_sama': '/audio/taunts/imu_sama_taunt.mp3',
  'dragon': '/audio/taunts/dragon_taunt.mp3',
  'king': '/audio/taunts/king_taunt.mp3',
  'magellan': '/audio/taunts/magellan_taunt.mp3',
  'loki': '/audio/taunts/loki_taunt.mp3',
  'hakuba': '/audio/taunts/hakuba_taunt.mp3',
  'smoker': '/audio/taunts/smoker_taunt.mp3',
  'kuma': '/audio/taunts/kuma_taunt.mp3',
  'kid': '/audio/taunts/kid_taunt.mp3',
  'killer': '/audio/taunts/killer_taunt.mp3',
  'marco': '/audio/taunts/marco_taunt.mp3',

  // Compound fighter IDs (actual IDs used in characters.ts) — aliased to same taunt files
  'zoro_king_of_hell': ['/audio/taunts/zoro_taunt.mp3', '/audio/taunts/zoro.mp3'],
  'shanks_yonko': ['/audio/taunts/shanks_taunt.mp3', '/audio/taunts/shanks.mp3'],
  'roger_pirate_king': ['/audio/taunts/roger_taunt.mp3', '/audio/taunts/roger.mp3'],
  'whitebeard_legend': ['/audio/taunts/whitebeard_taunt.mp3', '/audio/taunts/whitebeard.mp3'],
  'blackbeard_teach': ['/audio/taunts/blackbeard_taunt.mp3', '/audio/taunts/blackbeard.mp3'],
  'akainu_sakazuki': ['/audio/taunts/akainu_taunt.mp3', '/audio/taunts/akainu.mp3'],
  'mihawk_dracule': ['/audio/taunts/mihawk_taunt.mp3', '/audio/taunts/mihawk.mp3'],
  'kizaru_borsalino': ['/audio/taunts/kizaru_taunt.mp3', '/audio/taunts/kizaru.mp3'],
  'garp_legend': ['/audio/taunts/garp_taunt.mp3', '/audio/taunts/garp.mp3'],
  'law_trafalgar': ['/audio/taunts/law_taunt.mp3', '/audio/taunts/law.mp3'],
  'buggy_emperor': ['/audio/taunts/buggy_taunt.mp3', '/audio/taunts/buggy.mp3'],
  'katakuri_charlotte': ['/audio/taunts/katakuri_taunt.mp3', '/audio/taunts/katakuri.mp3'],
  'crocodile_sir': ['/audio/taunts/crocodile_taunt.mp3', '/audio/taunts/crocodile.mp3'],
  'jinbe_knight': ['/audio/taunts/jinbe_taunt.mp3', '/audio/taunts/jinbe.mp3'],
  'ace_portgas': ['/audio/taunts/ace_taunt.mp3', '/audio/taunts/ace.mp3'],
  'sanji_vinsmoke': ['/audio/taunts/sanji_taunt.mp3', '/audio/taunts/sanji.mp3'],
  'lucci_rob': '/audio/taunts/lucci_taunt.mp3',
  'enel_god': ['/audio/taunts/enel_taunt.mp3', '/audio/taunts/enel.mp3'],
  'moria_gecko': ['/audio/taunts/moria_taunt.mp3', '/audio/taunts/moria.mp3'],
  'oden_kozuki': '/audio/taunts/oden_taunt.mp3',
  'shiki_lion': '/audio/taunts/shiki_taunt.mp3',
  'aokiji_kuzan': '/audio/taunts/aokiji_taunt.mp3',
  'big_mom_charlotte': ['/audio/taunts/big_mom_taunt.mp3', '/audio/taunts/big_mom.mp3'],
};

/**
 * Mapping object for Haki sound effects (.mp3)
 * Keys can be haki types ('conquerors', 'armament', 'observation', 'clash') or fighter-specific haki keys ('shanks_haki', 'luffy_haki', etc.)
 */
export const CUSTOM_HAKI_AUDIO_MAP: Record<string, string | string[]> = {
  'conquerors': ['/audio/haki/conquerors_haki.mp3', '/audio/sfx/conquerors_haki.mp3', '/audio/sfx/haki_burst.mp3'],
  'armament': ['/audio/haki/armament_haki.mp3', '/audio/sfx/armament_haki.mp3', '/audio/sfx/haki_harden.mp3'],
  'observation': ['/audio/haki/observation_haki.mp3', '/audio/sfx/observation_haki.mp3', '/audio/sfx/future_sight.mp3'],
  'clash': ['/audio/haki/haki_clash.mp3', '/audio/sfx/haki_clash.mp3', '/audio/sfx/clash.mp3'],

  // Fighter specific Haki sound effects
  'shanks_haki': ['/audio/characters/shanks_haki.mp3', '/audio/haki/shanks_haki.mp3', '/audio/haki/conquerors_haki.mp3'],
  'luffy_haki': ['/audio/characters/luffy_haki.mp3', '/audio/haki/luffy_haki.mp3', '/audio/haki/conquerors_haki.mp3'],
  'zoro_haki': ['/audio/characters/zoro_haki.mp3', '/audio/haki/zoro_haki.mp3', '/audio/haki/armament_haki.mp3'],
  'kaido_haki': ['/audio/characters/kaido_haki.mp3', '/audio/haki/kaido_haki.mp3', '/audio/haki/conquerors_haki.mp3'],
  'roger_haki': ['/audio/characters/roger_haki.mp3', '/audio/haki/roger_haki.mp3', '/audio/haki/conquerors_haki.mp3'],
  'whitebeard_haki': ['/audio/characters/whitebeard_haki.mp3', '/audio/haki/whitebeard_haki.mp3', '/audio/haki/conquerors_haki.mp3'],
  'katakuri_charlotte_haki': ['/audio/haki/katakuri_charlotte_observation_haki.mp3', '/audio/haki/katakuri_charlotte_observation_haki.mp3', '/audio/haki/katakuri_charlotte_observation_haki.mp3'],
};

/** Iconic character laughs for background battle interactions and victory announcements */
export const FIGHTER_LAUGHTER_MAP: Record<string, string> = {
  'doflamingo': 'Fuffuffuffuffu!',
  'kaido': 'Wororororo!',
  'luffy': 'Shishishishi!',
  'blackbeard': 'Zehahahahaha!',
  'whitebeard': 'Gurararara!',
  'big_mom': 'Mamamamama!',
  'buggy': 'Gyahahahaha!',
  'moria': 'Kishishishi!',
  'brook': 'Yohohohoho!',
  'caesar': 'Shurorororo!',
  'hogback': 'Fosfosfosfos!',
  'perona': 'Horohorohoro!',
  'pica': 'Pikky-pikky-pikkyra!',
  'enel': 'Yahahahaha!',
  'law': 'Derisishishi...!',
  'zoro': 'Heh, sonna mono ka!',
  'shanks': 'Dahahahaha! Tente me acompanhar!',
  'akainu': 'Futilidade pura! Fugwah!',
  'garp': 'Bwahahahaha!',
  'roger': 'Gwahahahaha! Mada mada!',
  'jinbe': 'Wahahaha! Seigi wa katan!',
  'sanji': 'Heh... Diable Jambe!',
  'katakuri': 'Fum... Sore dake no chikara ka.',
  'mihawk': 'Fuu... Muda na agaite da.',
  'kizaru': 'Moshi mosh~ Kowai ne~',
  'aokiji': 'Arara... Tsuki ga nakatta na.',
  'lucci': 'Kukuku... Shi no kankaku o ajiwae.',
  'oden': 'Wahahahaha! Tenka muteki da!',
  'shiki': 'Jihahahaha! Tenka o toru!',
  'dragon': 'Fuu... Jidai ga ugoku.',
  'king': 'Kukuku... Zetsubou o shire.',
  'magellan': 'Doku doku... Jigoku o ajiwae!',
  'loki': 'Gwahahaha! Erubafu no chikara da!',
  'hakuba': 'Hyahahahaha! Kirikizande yaru!',
  'smoker': 'Hmph... Kemuri to kiero.',
  'kuma': 'Shukusei suru...',
  'kid': 'Gyahaha! Buttobashite yaru ze!',
  'killer': 'Fafafafa!',
  'marco': 'Yoi... Mada mada da na!',
  'imu_sama': '...... Mu.',
  'ace': 'Hahaha! Yaru ja nai ka!',
  'crocodile': 'Kuhaha... Kuhahahahaha!',
};

/**
 * Returns a custom laugh text or quote for iconic One Piece fighters during background battle taunts.
 */
export function getFighterLaughText(fighterId?: string): string {
  if (!fighterId) return "Hehehe!";
  const id = fighterId.toLowerCase();
  
  for (const [key, laugh] of Object.entries(FIGHTER_LAUGHTER_MAP)) {
    if (id.includes(key)) {
      return laugh;
    }
  }
  return "Hahaha!";
}

// Dynamic registries allowing runtime addition or overrides when user provides .mp3 files
const runtimeAudioRegistry = new Map<string, string>();
const runtimeTauntRegistry = new Map<string, string>();

/**
 * Register a custom MP3 audio URL for a specific fighter move trigger
 */
export function registerCustomMoveAudio(key: string, audioUrl: string): void {
  runtimeAudioRegistry.set(key.toLowerCase(), audioUrl);
}

/**
 * Register a custom MP3 audio URL for a specific fighter taunt trigger
 */
export function registerCustomTauntAudio(fighterId: string, audioUrl: string): void {
  runtimeTauntRegistry.set(fighterId.toLowerCase(), audioUrl);
}

/**
 * Retrieve an ordered array of candidate .mp3 audio paths for a given fighter ID and move ID/Name/Type.
 * Checks runtime registry, static map, and all common user path conventions.
 */
export function getCustomMoveAudioCandidates(
  fighterId?: string,
  moveId?: string,
  moveName?: string,
  moveType?: string
): string[] {
  const candidates: string[] = [];
  const addCandidate = (path?: string) => {
    if (path && !candidates.includes(path)) {
      candidates.push(path);
    }
  };

  const fId = fighterId ? fighterId.toLowerCase() : '';
  const shortFId = fId.replace(/_(gear\d+|v\d+|awakened|hybrid|base|young)$/g, '');
  const mId = moveId ? moveId.toLowerCase() : '';
  const mSlug = moveName ? moveName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') : '';
  const mType = moveType ? moveType.toLowerCase() : '';

  const keysToTest: string[] = [];
  if (fId && mId) keysToTest.push(`${fId}_${mId}`);
  if (shortFId && mId) keysToTest.push(`${shortFId}_${mId}`);
  if (mId) keysToTest.push(mId);
  if (fId && mSlug) keysToTest.push(`${fId}_${mSlug}`);
  if (shortFId && mSlug) keysToTest.push(`${shortFId}_${mSlug}`);
  if (mSlug) keysToTest.push(mSlug);
  if (fId && mType) keysToTest.push(`${fId}_${mType}`);
  if (shortFId && mType) keysToTest.push(`${shortFId}_${mType}`);

  // 1. Check runtime registered audio
  for (const key of keysToTest) {
    if (runtimeAudioRegistry.has(key)) {
      addCandidate(runtimeAudioRegistry.get(key));
    }
  }

  // 2. Check static map entries
  for (const key of keysToTest) {
    const val = CUSTOM_MOVE_AUDIO_MAP[key];
    if (val) {
      if (Array.isArray(val)) {
        val.forEach(addCandidate);
      } else {
        addCandidate(val);
      }
    }
  }

  // 3. Fallback conventional direct paths (e.g. /audio/characters/luffy_pistol.mp3)
  if (shortFId && mId) addCandidate(`/audio/characters/${shortFId}_${mId}.mp3`);
  if (fId && mId) addCandidate(`/audio/characters/${fId}_${mId}.mp3`);
  if (fId && mId) addCandidate(`/audio/characters/${fId}/${mId}.mp3`);
  if (shortFId && mId) addCandidate(`/audio/characters/${shortFId}/${mId}.mp3`);

  if (shortFId && mSlug) addCandidate(`/audio/characters/${shortFId}_${mSlug}.mp3`);
  if (fId && mSlug) addCandidate(`/audio/characters/${fId}_${mSlug}.mp3`);

  if (shortFId && mId) addCandidate(`/audio/sfx/${shortFId}_${mId}.mp3`);
  if (fId && mId) addCandidate(`/audio/sfx/${fId}_${mId}.mp3`);
  if (mId) addCandidate(`/audio/sfx/${mId}.mp3`);

  if (shortFId && mId) addCandidate(`/audio/moves/${shortFId}_${mId}.mp3`);
  if (mId) addCandidate(`/audio/moves/${mId}.mp3`);

  return candidates;
}

export function getCustomMoveAudioPath(
  fighterId?: string,
  moveId?: string,
  moveName?: string,
  moveType?: string
): string | null {
  const candidates = getCustomMoveAudioCandidates(fighterId, moveId, moveName, moveType);
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Retrieve the custom .mp3 audio path for a fighter's taunt.
 * Checks runtime registry, static taunt map (handling single paths or candidate arrays), and conventional fallback paths.
 */
export function getCustomTauntAudioPath(
  fighterId?: string,
  fighterName?: string
): string | null {
  const keysToTest: string[] = [];
  if (fighterId) keysToTest.push(fighterId.toLowerCase());
  if (fighterName) keysToTest.push(fighterName.toLowerCase().replace(/\s+/g, '_'));

  // 1. Check runtime registered taunt audio
  for (const key of keysToTest) {
    if (runtimeTauntRegistry.has(key)) {
      return runtimeTauntRegistry.get(key)!;
    }
  }

  // 2. Check static taunt mapping
  for (const key of keysToTest) {
    const val = CUSTOM_TAUNT_AUDIO_MAP[key];
    if (val) {
      if (Array.isArray(val)) {
        return val[0]; // Primary candidate
      }
      return val;
    }
  }

  // 3. Fallback conventional paths
  if (fighterId) {
    const id = fighterId.toLowerCase();
    return `/audio/taunts/${id}.mp3`;
  }

  return null;
}

/**
 * Retrieve an ordered array of candidate .mp3 audio paths for a given fighter ID and Haki type.
 */
export function getCustomHakiAudioCandidates(
  fighterId?: string,
  hakiType?: string
): string[] {
  const candidates: string[] = [];
  const addCandidate = (path?: string) => {
    if (path && !candidates.includes(path)) {
      candidates.push(path);
    }
  };

  const fId = fighterId ? fighterId.toLowerCase() : '';
  const shortFId = fId.replace(/_(gear\d+|v\d+|awakened|hybrid|base|young)$/g, '');
  const hType = hakiType ? hakiType.toLowerCase() : 'conquerors';

  const keysToTest: string[] = [];
  if (fId) keysToTest.push(`${fId}_haki`);
  if (shortFId) keysToTest.push(`${shortFId}_haki`);
  if (hType) keysToTest.push(hType);

  for (const key of keysToTest) {
    const val = CUSTOM_HAKI_AUDIO_MAP[key];
    if (val) {
      if (Array.isArray(val)) {
        val.forEach(addCandidate);
      } else {
        addCandidate(val);
      }
    }
  }

  if (fId) addCandidate(`/audio/characters/${fId}_haki.mp3`);
  if (shortFId) addCandidate(`/audio/characters/${shortFId}_haki.mp3`);
  if (hType) addCandidate(`/audio/haki/${hType}_haki.mp3`);
  if (hType) addCandidate(`/audio/haki/${hType}.mp3`);
  addCandidate('/audio/sfx/haki_burst.mp3');

  return candidates;
}

export function getCustomHakiAudioPath(fighterId?: string, hakiType?: string): string | null {
  const candidates = getCustomHakiAudioCandidates(fighterId, hakiType);
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Character transformation voice lines (Japanese battle cry and English translation).
 * Used when a character enters or exits a transformed state in the arcade arena.
 */
export interface TransformationVoiceLine {
  enterVoiceJP: string;
  enterVoiceEN: string;
  exitVoiceJP: string;
  exitVoiceEN: string;
  customClip?: string;
  customExitClip?: string;
}

export const TRANSFORMATION_VOICE_LINES: Record<string, TransformationVoiceLine> = {
  luffy: {
    enterVoiceJP: "アッヒャッヒャッヒャ！これが俺の最高地点だ！ギア…フィフス！",
    enterVoiceEN: "Hahaha! This is my peak! Gear... 5th!",
    exitVoiceJP: "プシュー… ハァ… ハァ… 体が縮んで動かねェ… 限界だ…",
    exitVoiceEN: "Pshuuu... Ha... ha... I shrank... reached my limit...",
    customClip: "/audio/taunts/luffy_gear5.mp3",
  },
  luffy_gear5: {
    enterVoiceJP: "アッヒャッヒャッヒャ！解放のドラムが聞こえるか！？太陽の神ニカ！",
    enterVoiceEN: "Hahaha! Can you hear the drums of liberation?! Sun God Nika!",
    exitVoiceJP: "プシュー… ガタガタだ… 腹減ったァ… 肉をくれ…",
    exitVoiceEN: "Pshuuu... Completely drained... so hungry... need meat...",
    customClip: "/audio/taunts/luffy_gear5.mp3",
  },
  zoro: {
    enterVoiceJP: "地獄の王にでもなるか…！閻魔、全てを斬り裂け！",
    enterVoiceEN: "I'll become the King of Hell! Enma, slice through everything!",
    exitVoiceJP: "くっ… 閻魔の覇気が… 骨まで軋みやがる… 解除だ…",
    exitVoiceEN: "Kuh... Enma's Haki is rattling my bones... Disengaging...",
  },
  kaido: {
    enterVoiceJP: "ウォロロロ！天地を揺るがす我が力を見よ！雷龍の咆哮！",
    enterVoiceEN: "Worororo! Behold the power that shakes heaven and earth!",
    exitVoiceJP: "ぬぅ… 面白い闘いだったが、酒が抜けてきたか…",
    exitVoiceEN: "Nuuu... An amusing clash, but the sake is wearing off...",
    customClip: "/audio/taunts/kaido_beast.mp3",
  },
  shanks: {
    enterVoiceJP: "ここから先へは行かせん！新時代への道を拓く！",
    enterVoiceEN: "I won't let you pass beyond this point! Paving the path to the New Era!",
    exitVoiceJP: "ふぅ… 覇気を鎮めるか… 無駄な争いは終わりだ。",
    exitVoiceEN: "Phew... calming the Haki... senseless fighting ends here.",
  },
  whitebeard: {
    enterVoiceJP: "グララララ！世界を揺らす男の力、とくと味わえ！",
    enterVoiceEN: "Gurararara! Taste the power of the man who shakes the world!",
    exitVoiceJP: "ゴホッ… 俺も年をとったな… だが海賊の誇りは不滅だ！",
    exitVoiceEN: "Cough... I've grown old... but a pirate's pride is immortal!",
  },
  blackbeard: {
    enterVoiceJP: "ゼハハハ！闇と地震、全て俺の掌の上だ！無敵の力！",
    enterVoiceEN: "Zehahaha! Darkness and tremors, everything is in my grasp!",
    exitVoiceJP: "痛ェッ！倍の痛みが押し寄せてきやがった！",
    exitVoiceEN: "Ouch! Double the pain is flooding in!",
  },
  sanji: {
    enterVoiceJP: "魔神風脚！燃え上がれ、地獄の業火！",
    enterVoiceEN: "Ifrit Jambe! Blaze ablaze, hellish inferno!",
    exitVoiceJP: "フゥ… 足の熱が冷めちまったか… 一服吸わせてもらうぜ。",
    exitVoiceEN: "Phew... my leg's flames cooled down... time for a smoke.",
  },
  law: {
    enterVoiceJP: "ROOM…覚醒！K・ROOM！麻酔！",
    enterVoiceEN: "ROOM... Awakening! K-ROOM! Anesthesia!",
    exitVoiceJP: "ハァ… ハァ… 命が削られるほどのスタミナ消費だ… 解除する！",
    exitVoiceEN: "Ha... ha... this stamina drain shaves away my lifespan... Disengaging!",
  },
  kid: {
    enterVoiceJP: "電磁砲！ぶっ壊してやるよ、四皇だろうが神だろうが！",
    enterVoiceEN: "Damned Punk! I'll blast you to pieces, whether Emperor or God!",
    exitVoiceJP: "クソが… 磁力の限界か… 腕が崩れやがった！",
    exitVoiceEN: "Damn it... hit my magnetic limit... arms falling apart!",
  },
  katakuri: {
    enterVoiceJP: "餅の覚醒…お前の行動はすべて見えている！逃げ場はない！",
    enterVoiceEN: "Awakened Mochi... I foresee every single move you make!",
    exitVoiceJP: "くっ… 見聞色の集中が… 一瞬乱れたか。",
    exitVoiceEN: "Kuh... my Observation Haki focus slipped for a moment.",
  },
  yamato: {
    enterVoiceJP: "大口真神の力！ワノ国を守る盾となる！氷牙！",
    enterVoiceEN: "Power of Okuchi no Makami! I shall be the shield of Wano!",
    exitVoiceJP: "ハァ… ハァ… 神獣の息吹が静まっていく…",
    exitVoiceEN: "Ha... ha... the divine beast's breath is quieting down...",
  },
  doflamingo: {
    enterVoiceJP: "フッフッフッフッ！街も大地も全て白糸に染まれ！",
    enterVoiceEN: "Fuffuffuffu! Let everything be dyed in pure white string!",
    exitVoiceJP: "チッ… 糸の操り人形が解けちまったか…",
    exitVoiceEN: "Tch... the string puppets unraveled...",
    customClip: "/audio/taunts/doflamingo_joker.mp3",
  },
  enel: {
    enterVoiceJP: "ヤハハハ！我こそが神なり！2億ボルト・雷神！",
    enterVoiceEN: "Yahahahaha! I am God! 200 Million Volts: Amaru!",
    exitVoiceJP: "ぬう… 放電のしすぎで神の雷が弱まったか…",
    exitVoiceEN: "Nuu... excessive discharge weakened God's lightning...",
  },
};

/**
 * Mapping of transformation enter audio files.
 */
export const CUSTOM_TRANSFORMATION_ENTER_MAP: Record<string, string | string[]> = {
  'luffy_gear5': ['/audio/taunts/luffy_gear5.mp3', '/audio/characters/luffy_haki.mp3', '/audio/sfx/haki_burst.mp3'],
  'luffy_transform': ['/audio/taunts/luffy_gear5.mp3', '/audio/characters/luffy_haki.mp3'],
  'kaido_beast': ['/audio/taunts/kaido_beast.mp3', '/audio/characters/kaido_haki.mp3'],
  'kaido_transform': ['/audio/taunts/kaido_beast.mp3', '/audio/characters/kaido_haki.mp3'],
  'doflamingo_transform': ['/audio/taunts/doflamingo_joker.mp3'],
  'zoro_transform': ['/audio/characters/zoro_haki.mp3', '/audio/haki/zoro_haki.mp3'],
  'shanks_transform': ['/audio/characters/shanks_haki.mp3', '/audio/haki/shanks_haki.mp3'],
  'whitebeard_transform': ['/audio/characters/whitebeard_haki.mp3', '/audio/haki/whitebeard_haki.mp3'],
  'roger_transform': ['/audio/characters/roger_haki.mp3', '/audio/haki/roger_haki.mp3'],
};

/**
 * Mapping of transformation exit / power-down audio files.
 */
export const CUSTOM_TRANSFORMATION_EXIT_MAP: Record<string, string | string[]> = {
  'luffy_exit': ['/audio/sfx/cyber_pulse.mp3', '/audio/sfx/distant_waves.mp3'],
  'general_exit': ['/audio/sfx/cyber_pulse.mp3', '/audio/sfx/ice_crack.mp3'],
};

/**
 * Resolves candidate audio URLs for entering a transformation.
 */
export function getCustomTransformationEnterCandidates(
  fighterId?: string,
  transformationId?: string,
  transformationName?: string
): string[] {
  const candidates: string[] = [];
  const add = (p?: string) => {
    if (p && !candidates.includes(p)) candidates.push(p);
  };

  const fId = (fighterId || '').toLowerCase();
  const tId = (transformationId || '').toLowerCase();
  const tName = (transformationName || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');

  const keys = [
    `${fId}_${tId}`,
    tId,
    `${fId}_transform`,
    `${fId}_awakening`,
    tName,
    `${fId}_haki`,
  ];

  for (const k of keys) {
    const val = CUSTOM_TRANSFORMATION_ENTER_MAP[k];
    if (val) {
      if (Array.isArray(val)) val.forEach(add);
      else add(val);
    }
  }

  // Fallbacks
  if (fId) {
    add(`/audio/transformations/${fId}_transform.mp3`);
    add(`/audio/transformations/${fId}.mp3`);
    add(`/audio/characters/${fId}_haki.mp3`);
    add(`/audio/haki/${fId}_haki.mp3`);
  }
  if (tId) {
    add(`/audio/transformations/${tId}.mp3`);
  }
  add('/audio/sfx/haki_burst.mp3');
  add('/audio/sfx/lightning_strike.mp3');

  return candidates;
}

/**
 * Resolves candidate audio URLs for exiting a transformation.
 */
export function getCustomTransformationExitCandidates(
  fighterId?: string,
  transformationId?: string,
  formName?: string
): string[] {
  const candidates: string[] = [];
  const add = (p?: string) => {
    if (p && !candidates.includes(p)) candidates.push(p);
  };

  const fId = (fighterId || '').toLowerCase();
  const tId = (transformationId || '').toLowerCase();

  const keys = [
    `${fId}_exit`,
    `${fId}_revert`,
    `${tId}_exit`,
    'general_exit',
  ];

  for (const k of keys) {
    const val = CUSTOM_TRANSFORMATION_EXIT_MAP[k];
    if (val) {
      if (Array.isArray(val)) val.forEach(add);
      else add(val);
    }
  }

  if (fId) {
    add(`/audio/transformations/${fId}_revert.mp3`);
    add(`/audio/transformations/${fId}_exit.mp3`);
  }
  add('/audio/sfx/cyber_pulse.mp3');
  add('/audio/sfx/distant_waves.mp3');
  add('/audio/sfx/ice_crack.mp3');

  return candidates;
}

/**
 * Resolves character transformation voice line (quotes in JP and EN).
 */
export function getTransformationVoiceLine(
  fighterId?: string,
  transformationId?: string,
  transformationName?: string
): TransformationVoiceLine {
  const fId = (fighterId || '').toLowerCase().replace(/_(gear\d+|v\d+|awakened|hybrid|base|young)$/g, '');
  const tId = (transformationId || '').toLowerCase();

  // Try direct match on fighter_transId or transId
  if (TRANSFORMATION_VOICE_LINES[`${fId}_${tId}`]) {
    return TRANSFORMATION_VOICE_LINES[`${fId}_${tId}`];
  }
  if (TRANSFORMATION_VOICE_LINES[tId]) {
    return TRANSFORMATION_VOICE_LINES[tId];
  }
  if (TRANSFORMATION_VOICE_LINES[fId]) {
    return TRANSFORMATION_VOICE_LINES[fId];
  }

  // Fallback generic voice line
  const name = transformationName || 'Form Shift';
  return {
    enterVoiceJP: `${name}！覚醒の力、解放！`,
    enterVoiceEN: `${name}! True awakened power unleashed!`,
    exitVoiceJP: 'ハァ… ハァ… 限界だ… フォームを解除する！',
    exitVoiceEN: 'Ha... ha... reached my limit... disengaging form!',
  };
}


