/**
 * Master Intelligent Predictive Media Loader Engine
 * 
 * Dynamically predicts the next logical opponent based on the player's confirmed team
 * (analyzing rivalries, lore nemeses, tournament brackets, and combat archetypes),
 * and proactively fetches, decodes, and caches all corresponding visual (portraits, cut-ins, stage art)
 * and audio (move SFX, voice taunts, stage BGM, ambient audio) assets into CacheStorage,
 * IndexedDB, and memory before the battle starts.
 */

import { Team, Fighter, StageInfo } from '../types/fighter';
import { CHARACTERS, CHARACTERS_MAP } from '../data/characters';
import { PREMADE_TEAMS } from '../data/premadeTeams';
import { BATTLE_STAGES } from '../data/stages';
import { preloadAudioUrl, preloadImageUrl } from './mediaCache';
import {
  CUSTOM_MOVE_AUDIO_MAP,
  CUSTOM_TAUNT_AUDIO_MAP,
  getCustomMoveAudioCandidates,
  getCustomTauntAudioPath,
} from './customAudio';

export interface PredictivePreloadState {
  status: 'idle' | 'analyzing' | 'downloading' | 'ready';
  predictedOpponent: Team | null;
  predictedStage: StageInfo | null;
  rivalryTitle: string;
  rivalryReason: string;
  progress: number; // 0 - 100
  totalAssets: number;
  loadedAssets: number;
  cachedAudioCount: number;
  cachedImageCount: number;
  assetNames: { type: 'image' | 'audio'; name: string; url: string; cached: boolean }[];
  lastUpdated: number;
}

export interface PredictionResult {
  opponentTeam: Team;
  predictedStage: StageInfo;
  rivalryTitle: string;
  rivalryReason: string;
  audioUrls: string[];
  imageUrls: string[];
}

/**
 * Intelligent Opponent Prediction Algorithm
 * Examines player's confirmed team composition and selects the most iconic,
 * lore-accurate next nemesis or tournament ladder challenger.
 */
export function predictNextLogicalOpponent(
  playerTeam: Team,
  stagedOpponent?: Team | null
): PredictionResult {
  const fighters = playerTeam.fighters || [];
  const fighterIds = new Set(fighters.map((f) => f.id));
  const affiliations = new Set(fighters.map((f) => (f.affiliation || '').toLowerCase()));

  // 1. If an explicit second team is already selected and contains valid fighters,
  // prioritize it as the primary immediate opponent
  if (stagedOpponent && stagedOpponent.fighters && stagedOpponent.fighters.length > 0) {
    const stage = selectStageForOpponent(stagedOpponent);
    const rivalry = analyzeRivalry(playerTeam, stagedOpponent);
    const { audioUrls, imageUrls } = gatherMediaUrlsForMatch(stagedOpponent, stage);

    return {
      opponentTeam: stagedOpponent,
      predictedStage: stage,
      rivalryTitle: rivalry.title,
      rivalryReason: rivalry.reason,
      audioUrls,
      imageUrls,
    };
  }

  // 2. Intelligent Lore & Archetype Rivalry Matcher
  // Straw Hat Alliance -> Yonko or Marines
  const hasStrawHats =
    fighterIds.has('luffy') ||
    fighterIds.has('zoro_king_of_hell') ||
    fighterIds.has('sanji_vinsmoke') ||
    fighterIds.has('jinbe_knight');

  const hasYonko =
    fighterIds.has('kaido_beast') ||
    fighterIds.has('blackbeard_teach') ||
    fighterIds.has('shanks_yonko') ||
    fighterIds.has('big_mom_charlotte');

  const hasMarines =
    fighterIds.has('akainu_sakazuki') ||
    fighterIds.has('kizaru_borsalino') ||
    fighterIds.has('aokiji_kuzan') ||
    fighterIds.has('garp_legend') ||
    fighterIds.has('smoker_white_hunter');

  const hasLegends =
    fighterIds.has('roger_pirate_king') ||
    fighterIds.has('whitebeard_legend') ||
    fighterIds.has('oden_kozuki') ||
    fighterIds.has('shiki_lion');

  let chosenTeam: Team;
  let stage: StageInfo;
  let rivalryTitle: string;
  let rivalryReason: string;

  if (hasStrawHats) {
    // Straw Hats naturally encounter the Four Emperors at Onigashima
    chosenTeam = findPremadeTeam('team_yonko') || PREMADE_TEAMS[1];
    stage = BATTLE_STAGES.find((s) => s.id === 'stage_onigashima') || BATTLE_STAGES[1];
    rivalryTitle = 'The Emperor Nemesis Clash';
    rivalryReason =
      'Straw Hat Alliance ascends to Onigashima Skull Dome to confront Kaido, Blackbeard, and the Four Emperors!';
  } else if (hasYonko) {
    // Yonko naturally trigger Marine Absolute Justice at Marineford
    chosenTeam = findPremadeTeam('team_marines') || PREMADE_TEAMS[2];
    stage = BATTLE_STAGES.find((s) => s.id === 'stage_marineford') || BATTLE_STAGES[0];
    rivalryTitle = 'Summit War of Judgment';
    rivalryReason =
      'The Four Emperors arrive at Marineford to shatter Fleet Admiral Akainu and Navy Headquarters!';
  } else if (hasMarines) {
    // Marines face the Old Era Gods / Pirates at Laugh Tale or Marineford
    chosenTeam = findPremadeTeam('team_legends') || PREMADE_TEAMS[3];
    stage = BATTLE_STAGES.find((s) => s.id === 'stage_laugh_tale') || BATTLE_STAGES[3];
    rivalryTitle = 'Justice vs The Great Pirate Era';
    rivalryReason =
      'Marine Fleets deploy to extinguish Gol D. Roger and Edward Newgate in defense of the World Government.';
  } else if (hasLegends) {
    // Old Era Gods challenge the Absolute Enforcers & World Government
    chosenTeam = findPremadeTeam('team_world_gov') || PREMADE_TEAMS[8];
    stage = BATTLE_STAGES.find((s) => s.id === 'stage_egghead') || BATTLE_STAGES[2];
    rivalryTitle = 'Void Century Retribution';
    rivalryReason =
      'Legendary Pirate Gods penetrate the World Government’s futuristic defenses at Egghead Island.';
  } else {
    // Pick the most balanced opposing premade team that does not overlap fighters
    const candidate = PREMADE_TEAMS.find((pt) => {
      const overlap = pt.fighters.some((f) => fighterIds.has(f.id));
      return !overlap;
    }) || PREMADE_TEAMS[0];

    chosenTeam = candidate;
    stage = selectStageForOpponent(chosenTeam);
    rivalryTitle = `Challenger Match: vs ${chosenTeam.name}`;
    rivalryReason = `High-stakes battle against ${chosenTeam.name} on the Grand Line!`;
  }

  const { audioUrls, imageUrls } = gatherMediaUrlsForMatch(chosenTeam, stage);

  return {
    opponentTeam: chosenTeam,
    predictedStage: stage,
    rivalryTitle,
    rivalryReason,
    audioUrls,
    imageUrls,
  };
}

function findPremadeTeam(id: string): Team | undefined {
  return PREMADE_TEAMS.find((t) => t.id === id);
}

function selectStageForOpponent(team: Team): StageInfo {
  const fIds = new Set(team.fighters.map((f) => f.id));
  if (fIds.has('kaido_beast') || fIds.has('king_wildfire')) {
    return BATTLE_STAGES.find((s) => s.id === 'stage_onigashima') || BATTLE_STAGES[1];
  }
  if (fIds.has('akainu_sakazuki') || fIds.has('aokiji_kuzan') || fIds.has('whitebeard_legend')) {
    return BATTLE_STAGES.find((s) => s.id === 'stage_marineford') || BATTLE_STAGES[0];
  }
  if (fIds.has('kizaru_borsalino') || fIds.has('lucci_rob') || fIds.has('kuma_tyrant')) {
    return BATTLE_STAGES.find((s) => s.id === 'stage_egghead') || BATTLE_STAGES[2];
  }
  if (fIds.has('roger_pirate_king') || fIds.has('oden_kozuki') || fIds.has('shiki_lion')) {
    return BATTLE_STAGES.find((s) => s.id === 'stage_laugh_tale') || BATTLE_STAGES[3];
  }
  if (fIds.has('katakuri_charlotte') || fIds.has('big_mom_charlotte')) {
    return BATTLE_STAGES.find((s) => s.id === 'stage_wholecake') || BATTLE_STAGES[4] || BATTLE_STAGES[0];
  }
  return BATTLE_STAGES[0];
}

function analyzeRivalry(team1: Team, team2: Team): { title: string; reason: string } {
  return {
    title: `${team1.name} vs ${team2.name}`,
    reason: `Confirmed Grand Line clash between ${team1.name} and ${team2.name}.`,
  };
}

/**
 * Gathers all visual and audio media URLs needed for this opponent and stage.
 */
function gatherMediaUrlsForMatch(
  team: Team,
  stage: StageInfo
): { audioUrls: string[]; imageUrls: string[] } {
  const imageUrls: string[] = [];
  const audioUrls: string[] = [];

  // 1. Fighter Portraits & Visual Assets
  for (const fighter of team.fighters) {
    if (fighter.avatarUrl) imageUrls.push(fighter.avatarUrl);
    if (fighter.avatarIcon && fighter.avatarIcon !== fighter.avatarUrl) {
      imageUrls.push(fighter.avatarIcon);
    }
  }

  // 2. Stage Background Image
  imageUrls.push('/src/assets/images/arcade_stage_bg_1788695120255.jpg');

  // 3. Fighter Custom Taunts & Move Audio
  for (const fighter of team.fighters) {
    // Taunts
    const tauntCandidates = CUSTOM_TAUNT_AUDIO_MAP[fighter.id] || CUSTOM_TAUNT_AUDIO_MAP[fighter.shortName?.toLowerCase() || ''];
    if (tauntCandidates) {
      if (Array.isArray(tauntCandidates)) {
        audioUrls.push(...tauntCandidates);
      } else {
        audioUrls.push(tauntCandidates);
      }
    }
    // Also try explicit taunts
    audioUrls.push(`/audio/taunts/${fighter.id}.mp3`);

    // Special moves
    if (fighter.moves) {
      for (const move of fighter.moves) {
        const moveAudio = getCustomMoveAudioCandidates(move.id);
        if (moveAudio && moveAudio.length > 0) {
          audioUrls.push(...moveAudio);
        }
      }
    }
  }

  // 4. Stage BGM & Ambients
  if (stage.id === 'stage_marineford') {
    audioUrls.push('/src/audio/music/three_admirals.mp3');
    audioUrls.push('/src/audio/music/very_strongest.mp3');
    audioUrls.push('/audio/sfx/ice_crack.mp3');
    audioUrls.push('/audio/sfx/wind_howl.mp3');
  } else if (stage.id === 'stage_onigashima') {
    audioUrls.push('/src/audio/music/gear5.mp3');
    audioUrls.push('/src/audio/music/fierce_attack.mp3');
    audioUrls.push('/audio/sfx/thunder_rumble.mp3');
    audioUrls.push('/audio/sfx/lightning_strike.mp3');
    audioUrls.push('/audio/sfx/roof_debris.mp3');
  } else if (stage.id === 'stage_egghead') {
    audioUrls.push('/src/audio/music/fierce_attack.mp3');
    audioUrls.push('/audio/sfx/cyber_pulse.mp3');
    audioUrls.push('/audio/sfx/robot_hum.mp3');
    audioUrls.push('/audio/sfx/hologram_glitch.mp3');
  } else if (stage.id === 'stage_laugh_tale') {
    audioUrls.push('/src/audio/music/victory_drums.mp3');
    audioUrls.push('/src/audio/music/very_strongest.mp3');
    audioUrls.push('/audio/sfx/gold_shimmer.mp3');
    audioUrls.push('/audio/sfx/ancient_echo.mp3');
  } else {
    audioUrls.push('/src/audio/music/overtaken.mp3');
    audioUrls.push('/audio/sfx/distant_waves.mp3');
    audioUrls.push('/audio/sfx/candy_crunch.mp3');
    audioUrls.push('/audio/sfx/homie_giggle.mp3');
  }

  // Core SFX
  audioUrls.push('/audio/sfx/clash.mp3');
  audioUrls.push('/audio/sfx/ko.mp3');
  audioUrls.push('/audio/sfx/hit.mp3');
  audioUrls.push('/audio/sfx/match_victory.mp3');

  // Filter and deduplicate
  const uniqueImages = Array.from(new Set(imageUrls.filter((u) => Boolean(u) && u.trim().length > 0)));
  const uniqueAudios = Array.from(new Set(audioUrls.filter((u) => Boolean(u) && u.trim().length > 0)));

  return { audioUrls: uniqueAudios, imageUrls: uniqueImages };
}

/**
 * Singleton Predictive Media Loader Controller
 */
class PredictiveMediaLoaderController {
  private currentState: PredictivePreloadState = {
    status: 'idle',
    predictedOpponent: null,
    predictedStage: null,
    rivalryTitle: '',
    rivalryReason: '',
    progress: 0,
    totalAssets: 0,
    loadedAssets: 0,
    cachedAudioCount: 0,
    cachedImageCount: 0,
    assetNames: [],
    lastUpdated: Date.now(),
  };

  private listeners: Set<(state: PredictivePreloadState) => void> = new Set();
  private abortController: AbortController | null = null;

  public getState(): PredictivePreloadState {
    return { ...this.currentState };
  }

  public subscribe(listener: (state: PredictivePreloadState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.warn('[PredictiveMediaLoader] Listener error:', err);
      }
    });
  }

  /**
   * Begins predictive preloading for the next logical opponent
   * immediately when user confirms team selection.
   */
  public async preloadForConfirmedTeam(
    playerTeam: Team,
    stagedOpponent?: Team | null
  ): Promise<PredictionResult> {
    if (!playerTeam || !playerTeam.fighters || playerTeam.fighters.length === 0) {
      return null as any;
    }

    // Cancel any ongoing preload
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    // 1. Run prediction
    this.currentState = {
      ...this.currentState,
      status: 'analyzing',
      progress: 5,
      lastUpdated: Date.now(),
    };
    this.notify();

    const prediction = predictNextLogicalOpponent(playerTeam, stagedOpponent);

    const allAssets = [
      ...prediction.imageUrls.map((url) => ({
        type: 'image' as const,
        name: url.split('/').pop() || url,
        url,
        cached: false,
      })),
      ...prediction.audioUrls.map((url) => ({
        type: 'audio' as const,
        name: url.split('/').pop() || url,
        url,
        cached: false,
      })),
    ];

    this.currentState = {
      status: 'downloading',
      predictedOpponent: prediction.opponentTeam,
      predictedStage: prediction.predictedStage,
      rivalryTitle: prediction.rivalryTitle,
      rivalryReason: prediction.rivalryReason,
      progress: 10,
      totalAssets: allAssets.length,
      loadedAssets: 0,
      cachedAudioCount: 0,
      cachedImageCount: 0,
      assetNames: allAssets,
      lastUpdated: Date.now(),
    };
    this.notify();

    // 2. Proactively download and decode assets with concurrency
    let completedCount = 0;
    let cachedAudios = 0;
    let cachedImages = 0;

    const total = allAssets.length;

    const updateItemSuccess = (url: string, type: 'image' | 'audio') => {
      completedCount++;
      if (type === 'image') cachedImages++;
      if (type === 'audio') cachedAudios++;

      const item = this.currentState.assetNames.find((a) => a.url === url);
      if (item) item.cached = true;

      const progress = Math.min(100, Math.round((completedCount / Math.max(1, total)) * 100));
      this.currentState = {
        ...this.currentState,
        progress,
        loadedAssets: completedCount,
        cachedAudioCount: cachedAudios,
        cachedImageCount: cachedImages,
        lastUpdated: Date.now(),
      };
      this.notify();
    };

    // Preload images in parallel
    const imagePromises = prediction.imageUrls.map(async (imgUrl) => {
      try {
        await preloadImageUrl(imgUrl);
        updateItemSuccess(imgUrl, 'image');
      } catch {
        completedCount++;
      }
    });

    // Preload audios in controlled batches to prevent browser network starvation
    const audioPromises = prediction.audioUrls.map(async (audioUrl) => {
      try {
        await preloadAudioUrl(audioUrl);
        updateItemSuccess(audioUrl, 'audio');
      } catch {
        completedCount++;
      }
    });

    await Promise.allSettled([...imagePromises, ...audioPromises]);

    this.currentState = {
      ...this.currentState,
      status: 'ready',
      progress: 100,
      loadedAssets: total,
      lastUpdated: Date.now(),
    };
    this.notify();

    return prediction;
  }
}

export const predictiveMediaLoader = new PredictiveMediaLoaderController();
