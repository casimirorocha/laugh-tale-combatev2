import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Zap,
  Flame,
  Swords,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Radio,
  Tv,
  Eye,
  Smile,
  Activity,
  Compass,
  Volume2,
  VolumeX,
  Trophy,
  Skull,
  Biohazard,
  Mic,
  MicOff,
  Gamepad2,
  Clock,
  MapPin,
  LogOut,
  BookOpen,
} from 'lucide-react';
import {
  Team,
  Fighter,
  BattleFighterState,
  ActionLog,
  StageInfo,
  Move,
  MatchFormat,
  MatchResult,
  CombatStance,
  AwakeningProfile,
  RoundStat,
} from '../types/fighter';
import {
  createBattleFighterState,
  executeMoveAction,
  executeGuardAction,
  executeFutureSightDodge,
  executeTauntAction,
  executeActivateMaxMode,
  getSmartAiMoveChoice,
  getComboMultiplier,
  getFighterArchetype,
  getBattlePhase,
  getRandomizedTurnInterval,
  regenerateFighterMeters,
  checkAwakeningTrigger,
  executeHakiAwakeningAction,
  getMoveShortName,
  MIN_OBSERVATION_FOCUS_THRESHOLD,
  calculateObservationHakiCost,
  canUseObservationHaki,
} from '../utils/combatEngine';
import { getCharacterAwakeningProfile } from '../data/awakeningProfiles';
import { soundManager, battleAnnouncer } from '../utils/soundEffects';
import { characterVoiceManager } from '../utils/audioAssetLibrary';
import { battleBgmEngine } from '../utils/bgmSynthesizer';
import { audioManager } from '../utils/AudioManager';
import { getFighterLaughText } from '../utils/customAudio';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import stageBgImage from '../assets/images/arcade_stage_bg_1788695120255.jpg';
import luffyImg from '../assets/images/luffy_portrait_1788261829349.jpg';
import luffyGear4Img from '../assets/images/luffy_gear4_art_1789039484416.jpg';

const getLuffyGearAvatar = (state: BattleFighterState) => {
  if (state.fighter.id.includes('luffy')) {
    if (state.isAwakened) {
      return luffyImg; // Gear 5 Sun God Nika
    }
    if (state.fighter.id === 'luffy') {
      return luffyGear4Img; // Gear 4 Boundman
    }
  }
  return state.fighter.avatarUrl;
};
import { MatchAchievement } from '../types/achievements';
import {
  AchievementTrackerState,
  createInitialTrackerState,
  evaluateCombatAchievements,
} from '../utils/achievementTracker';
import { AchievementBanner } from './AchievementBanner';
import { VictoryCelebrationSequence } from './VictoryCelebrationSequence';
import { KOFVictoryAnnouncement } from './KOFVictoryAnnouncement';
import { AICommentaryBox } from './AICommentaryBox';
import { RealTimeComboOverlay, ActiveComboState } from './RealTimeComboOverlay';
import { FloatingComboCounter } from './FloatingComboCounter';
import { ArcadeComboCounter } from './ArcadeComboCounter';
import { FighterFinisherCinematic } from './FighterFinisherCinematic';
import { AwakeningTransformationCinematic } from './AwakeningTransformationCinematic';
import { AwakenedAuraVisualizer } from './AwakenedAuraVisualizer';
import { checkTransformations, applyTransformation, getTransformationTelemetry } from '../utils/transformationEngine';
import { TransformationTrackerOverlay } from './TransformationTrackerOverlay';
import { TransformationCinematic } from './TransformationCinematic';
import { Transformation } from '../types/fighter';
import { HakiAwakeningEmbers } from './HakiAwakeningEmbers';
import { HakiIdleAura } from './HakiIdleAura';
import { FighterAvatar } from './FighterAvatar';
import { HakiParticleEngine, ParticleBurst } from './HakiParticleEngine';
import { HakiEnergyFieldD3 } from './HakiEnergyFieldD3';
import { RoundTransitionD3 } from './RoundTransitionD3';
import { HakiClashQteD3 } from './HakiClashQteD3';
import { ConquerorHakiWaveD3 } from './ConquerorHakiWaveD3';
import { FloatingDamageText, FloatingDamageItem, DamageType } from './FloatingDamageText';
import { vibrationService } from '../utils/vibrationService';
import { getUserProfile, saveUserProfile, DEFAULT_GAMEPAD_MAPPING, DEFAULT_KEYBOARD_MAPPING, DEFAULT_P2_KEYBOARD_MAPPING, formatKeyLabel } from '../utils/storage';
import { SettingsModal } from './SettingsModal';
import { GamepadMapping, KeyboardMapping } from '../types/fighter';
import { WeatherOverlay } from './WeatherOverlay';
import { BackgroundCrowdSystem } from './BackgroundCrowdSystem';
import { useMatchIntensity } from '../hooks/useMatchIntensity';
import { useTransformation } from '../hooks/useTransformation';
import { useArcTheme } from '../utils/arcTheme';
import { GamepadVisualizer } from './GamepadVisualizer';
import { GamepadPresetSelector } from './GamepadPresetSelector';
import { BattleTauntAnimation, ActiveTauntState } from '../types/battleTaunts';
import { getFighterTaunts, getDefaultTauntForFighter } from '../data/battleTaunts';
import { BattleTauntFX } from './BattleTauntFX';
import { TauntLibraryModal } from './TauntLibraryModal';
import { TournamentBracketState } from '../types/tournament';
import {
  generateTournamentBracket,
  advanceTournamentWithResult,
  simulateCpuMatch,
  saveTournamentState,
  loadTournamentState,
  clearTournamentState,
  resetAndReseedTournament,
} from '../utils/tournamentManager';
import { TournamentBracketModal } from './TournamentBracketModal';
import { GameDocumentationModal, DocSection } from './GameDocumentationModal';
import { useBattleArenaCleanup } from '../hooks/useBattleArenaCleanup';

interface ArcadeBattleArenaProps {
  team1: Team;
  team2: Team;
  stage: StageInfo;
  matchFormat: MatchFormat;
  weatherOverride?: string;
  initialRound?: number;
  initialRoundHistory?: Array<'team1' | 'team2' | 'draw'>;
  initialRoundStats?: RoundStat[];
  onMatchComplete: (result: MatchResult) => void;
  onExitToMenu: () => void;
}

export type BattlePacingMode = 'dynamic' | 'auto_spectate' | 'classic_turn';

export interface EnvDebrisParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

export interface D3ArenaParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor?: string;
  alpha: number;
  initialAlpha: number;
  life: number;
  maxLife: number;
  decay: number;
  isPersistent?: boolean;
  type: 'stage_ambient' | 'debris' | 'clash_spark' | 'haki_ember';
  rotation?: number;
  rotationSpeed?: number;
  shape?: 'circle' | 'rect' | 'triangle' | 'spark';
}

export interface DestructibleEnvProp {
  id: string;
  type: 'barrel' | 'crate' | 'chest';
  xPct: number;
  yPct: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  debris: EnvDebrisParticle[];
  color: string;
  label: string;
}

export const ArcadeBattleArena: React.FC<ArcadeBattleArenaProps> = ({
  team1,
  team2,
  stage,
  matchFormat,
  weatherOverride,
  initialRound = 1,
  initialRoundHistory = [],
  initialRoundStats = [],
  onMatchComplete,
  onExitToMenu,
}) => {
  const { theme } = useArcTheme();

  // Active opponent crew and battle stage (allows seamless tournament progression without main menu exit)
  const [activeTeam2, setActiveTeam2] = useState<Team>(team2);
  const [activeStage, setActiveStage] = useState<StageInfo>(stage);
  const currentTeam2 = activeTeam2 || team2;
  const currentStage = activeStage || stage;

  // Tournament Bracket State
  const [tournamentBracket, setTournamentBracket] = useState<TournamentBracketState | null>(() => {
    return loadTournamentState() || generateTournamentBracket(team1, team2);
  });
  const [showTournamentModal, setShowTournamentModal] = useState<boolean>(false);

  // Fighter queue states for 3v3 KOF or 1v1
  const [t1Index, setT1Index] = useState<number>(0);
  const [t2Index, setT2Index] = useState<number>(0);

  const [t1FighterStates, setT1FighterStates] = useState<BattleFighterState[]>(() => {
    const list = Array.isArray(team1) ? team1 : team1?.fighters || [];
    return list.map((f: any) => createBattleFighterState(f.fighter || f));
  });
  const [t2FighterStates, setT2FighterStates] = useState<BattleFighterState[]>(() => {
    const list = Array.isArray(team2) ? team2 : team2?.fighters || [];
    return list.map((f: any) => createBattleFighterState(f.fighter || f));
  });

  const t1StatesRef = useRef<BattleFighterState[]>(t1FighterStates);
  const t2StatesRef = useRef<BattleFighterState[]>(t2FighterStates);
  const t1IdxRef = useRef<number>(0);
  const t2IdxRef = useRef<number>(0);

  t1StatesRef.current = t1FighterStates;
  t2StatesRef.current = t2FighterStates;
  t1IdxRef.current = t1Index;
  t2IdxRef.current = t2Index;

  const guardActivatedAtRef = useRef<{ team1: number; team2: number }>({ team1: 0, team2: 0 });

  const [currentRound, setCurrentRound] = useState<number>(initialRound);
  const [isD3RoundTransitioning, setIsD3RoundTransitioning] = useState<boolean>(false);
  const [isHakiClashQteActive, setIsHakiClashQteActive] = useState<boolean>(false);
  const [isHakiShockwaveActive, setIsHakiShockwaveActive] = useState<boolean>(false);
  const [hakiWaveWinner, setHakiWaveWinner] = useState<'team1' | 'team2' | undefined>(undefined);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [battleSpeed, setBattleSpeed] = useState<number>(1); // Default to fast 1.5x to prevent delay, up to 3.5x
  const [battleMode, setBattleMode] = useState<BattlePacingMode>(() => {
    try {
      const saved = localStorage.getItem('op_kof_battle_mode_v1');
      if (saved === 'dynamic' || saved === 'auto_spectate' || saved === 'classic_turn') {
        return saved as BattlePacingMode;
      }
    } catch {}
    return 'dynamic';
  }); // Default to Real-Time Dynamic Mode!
  const [isT1InRecovery, setIsT1InRecovery] = useState<boolean>(false);
  const isAutoPlay = battleMode === 'auto_spectate';
  const [showScanlines, setShowScanlines] = useState<boolean>(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState<boolean>(true);
  const [isTtsAnnouncerEnabled, setIsTtsAnnouncerEnabled] = useState<boolean>(true);
  const [showInputVisualizer, setShowInputVisualizer] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [docInitialTab, setDocInitialTab] = useState<DocSection>('transformations');
  const [userProfile, setUserProfile] = useState(() => getUserProfile());

  // Critical hit temporary Haki glow states
  const [t1CritActive, setT1CritActive] = useState<boolean>(false);
  const [t2CritActive, setT2CritActive] = useState<boolean>(false);

  // Stats tracked for CombatMomentumD3 visualization
  const [t1CritCount, setT1CritCount] = useState<number>(0);
  const [t2CritCount, setT2CritCount] = useState<number>(0);
  const [t1HakiCount, setT1HakiCount] = useState<number>(0);
  const [t2HakiCount, setT2HakiCount] = useState<number>(0);
  const [t1DamageDealt, setT1DamageDealt] = useState<number>(0);
  const [t2DamageDealt, setT2DamageDealt] = useState<number>(0);

  // Dynamic Particle Engine Burst pool
  const [particleBursts, setParticleBursts] = useState<ParticleBurst[]>([]);

  const triggerParticleBurst = useCallback((
    x: number,
    y: number,
    color: 'red' | 'purple' | 'amber' | 'cyan' | 'gray',
    type: 'clash' | 'critical' | 'haki'
  ) => {
    const burstId = `burst-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newBurst: ParticleBurst = {
      id: burstId,
      x,
      y,
      color,
      type,
    };
    setParticleBursts((prev) => [...prev, newBurst]);

    // Seed active D3 particles into Map for high-performance direct rendering & O(1) removal
    const width = window.innerWidth;
    const height = window.innerHeight;
    const px = (x / 100) * width;
    const py = (y / 100) * height;
    const sparkCount = type === 'clash' ? 16 : type === 'critical' ? 12 : 8;
    const colorHexMap: Record<string, string> = {
      red: '#ef4444',
      purple: '#a855f7',
      amber: '#f59e0b',
      cyan: '#06b6d4',
      gray: '#94a3b8',
    };
    const mainColor = colorHexMap[color] || '#f59e0b';
    const angleScale = d3.scaleLinear().domain([0, sparkCount]).range([0, Math.PI * 2]);

    for (let i = 0; i < sparkCount; i++) {
      const pid = `spark_${burstId}_${i}`;
      const angle = angleScale(i) + (Math.random() - 0.5) * 0.4;
      const speed = (type === 'clash' ? 8 : type === 'critical' ? 6 : 4) * (Math.random() * 0.8 + 0.6);
      activeD3ParticlesRef.current.set(pid, {
        id: pid,
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color: mainColor,
        glowColor: mainColor,
        alpha: 1.0,
        initialAlpha: 1.0,
        life: 1.0,
        maxLife: 1.0,
        decay: 0.025,
        isPersistent: false,
        type: 'clash_spark',
        shape: 'spark',
      });
    }
  }, []);

  const handleBurstComplete = useCallback((id: string) => {
    setParticleBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Visual Animation & Feedback states
  const [actorInMotion, setActorInMotion] = useState<'team1' | 'team2' | null>(null);
  const [targetHitFlinch, setTargetHitFlinch] = useState<'team1' | 'team2' | null>(null);
  const [targetDodgeEffect, setTargetDodgeEffect] = useState<'team1' | 'team2' | null>(null);
  const [targetBlockedEffect, setTargetBlockedEffect] = useState<'team1' | 'team2' | null>(null);
  const [cameraShake, setCameraShake] = useState<'light' | 'medium' | 'heavy' | null>(null);
  const [isImpactZooming, setIsImpactZooming] = useState<boolean>(false);
  const [isHitStopActive, setIsHitStopActive] = useState<boolean>(false);
  const [activeSuperCutin, setActiveSuperCutin] = useState<{
    fighterName: string;
    moveName: string;
    moveNameJP: string;
    color: string;
  } | null>(null);
  const [conquerorFlash, setConquerorFlash] = useState<boolean>(false);
  const [futureSightRipple, setFutureSightRipple] = useState<'team1' | 'team2' | null>(null);

  // Active Timeouts Cleanup Registry
  const activeTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const safeTimeout = useCallback((fn: () => void, delay: number) => {
    const timer = setTimeout(() => {
      activeTimeoutsRef.current.delete(timer);
      fn();
    }, delay);
    activeTimeoutsRef.current.add(timer);
    return timer;
  }, []);

  useEffect(() => {
    return () => {
      activeTimeoutsRef.current.forEach((t) => clearTimeout(t));
      activeTimeoutsRef.current.clear();
    };
  }, []);

  // Screen Edge Flash state for Special Move (faint red) and Ultimate (faint gold)
  const [screenEdgeFlash, setScreenEdgeFlash] = useState<{
    type: 'special' | 'ultimate';
    colorClass: string;
    id: number;
  } | null>(null);

  const triggerScreenEdgeFlash = useCallback((type: 'special' | 'ultimate', color?: 'gold' | 'red' | 'purple') => {
    const colorClass = color === 'gold' || type === 'ultimate'
      ? 'screen-edge-flash-gold'
      : color === 'purple'
      ? 'screen-edge-flash-purple'
      : 'screen-edge-flash-red';

    setScreenEdgeFlash({
      type,
      colorClass,
      id: Date.now() + Math.random(),
    });

    safeTimeout(() => {
      setScreenEdgeFlash(null);
    }, 850);
  }, [safeTimeout]);
  
  // Floating Damage Text queue color-coded by damage type:
  // White: Normal | Red: Armament Crit | Purple: Conqueror's Burst
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamageItem[]>([]);
  const crowdRecordHitRef = useRef<((hit: any) => void) | null>(null);

  const triggerFloatingDamage = (
    side: 'team1' | 'team2',
    damage: number,
    damageType: DamageType,
    displayText?: string,
    hakiMultiplier?: number,
    comboCount?: number
  ) => {
    const newItem: FloatingDamageItem = {
      id: `dmg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      side,
      damage,
      displayText,
      damageType,
      hakiMultiplier,
      comboCount,
      xOffset: (Math.random() - 0.5) * 44,
      createdAt: Date.now(),
    };

    setFloatingDamages((prev) => [...prev.slice(-8), newItem]);

    if (damage > 0 && crowdRecordHitRef.current) {
      crowdRecordHitRef.current({
        timestamp: Date.now(),
        damage,
        isCrit: damageType === 'haki' || displayText?.includes('CRIT') || displayText?.includes('COUNTER'),
        isClash: damageType === 'conqueror_burst' || displayText?.includes('CLASH'),
        comboCount,
        side,
      });
    }

    safeTimeout(() => {
      setFloatingDamages((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 1450);
  };

  const [activeDamagePopup, setActiveDamagePopup] = useState<{
    side: 'team1' | 'team2';
    text: string;
    isCrit: boolean;
    isDodged: boolean;
    isMiss: boolean;
    isBlocked: boolean;
    isGuardCrush: boolean;
    isCounter: boolean;
    hakiMultiplier?: number;
  } | null>(null);
  const [roundAnnouncement, setRoundAnnouncement] = useState<string | null>(
    `ROUND ${currentRound} - READY... FIGHT!`
  );
  const [showFightBanner, setShowFightBanner] = useState<boolean>(true);
  const [activeCombo, setActiveCombo] = useState<ActiveComboState | null>(null);
  const [t1SpeechBubble, setT1SpeechBubble] = useState<React.ReactNode | null>(null);
  const [t2SpeechBubble, setT2SpeechBubble] = useState<React.ReactNode | null>(null);

  // Cinematic Finisher State
  const [finisherActive, setFinisherActive] = useState<boolean>(false);
  const [finisherFighter, setFinisherFighter] = useState<BattleFighterState | null>(null);

  // Awakening Transformation Cinematic State
  
  // Dynamic Transformation State and Hook
  const {
    dynamicTransformation,
    isTransformingRef,
    triggerTransformation,
    revertTransformationForm,
    checkAndTrigger,
    clearTransformation,
  } = useTransformation();

  const [awakeningCinematic, setAwakeningCinematic] = useState<{
    isActive: boolean;
    fighterState: BattleFighterState | null;
    profile: AwakeningProfile | null;
  }>({
    isActive: false,
    fighterState: null,
    profile: null,
  });
  const comboDecayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hakiClashActive, setHakiClashActive] = useState<boolean>(false);

  // Round history win/loss tracker
  const [roundHistory, setRoundHistory] = useState<Array<'team1' | 'team2' | 'draw'>>(() => initialRoundHistory || []);
  const [roundStats, setRoundStats] = useState<RoundStat[]>(() => initialRoundStats || []);

  // Character-Specific Taunt Animations & Expandable Library State
  const [activeTauntAnimation, setActiveTauntAnimation] = useState<ActiveTauntState | null>(null);
  const [isTauntLibraryOpen, setIsTauntLibraryOpen] = useState<boolean>(false);
  const [selectedPlayerTaunt, setSelectedPlayerTaunt] = useState<BattleTauntAnimation | null>(null);
  const selectedPlayerTauntRef = useRef<BattleTauntAnimation | null>(null);

  // Match Achievements Engine State
  const [unlockedAchievements, setUnlockedAchievements] = useState<MatchAchievement[]>([]);
  const [latestAchievement, setLatestAchievement] = useState<MatchAchievement | null>(null);
  const achievementTrackerRef = useRef<AchievementTrackerState>(createInitialTrackerState());
  const handleDismissAchievement = useCallback(() => {
    setLatestAchievement(null);
  }, []);

  // Victory Celebration Sequence State
  const [celebrationData, setCelebrationData] = useState<{
    winnerFighter: any;
    winningTeamName: string;
    isTeam1Winner: boolean;
    isDraw?: boolean;
    totalRounds: number;
    matchResult: MatchResult;
  } | null>(null);

  // Dynamic KOF 2002 Victory Announcement Sequence State
  const [koVictoryData, setKoVictoryData] = useState<{
    winnerFighter: Fighter;
    winningTeamName: string;
    roundNumber: number;
    isMatchPoint?: boolean;
    isDraw?: boolean;
  } | null>(null);

  // Logs & History
  const [combatLogs, setCombatLogs] = useState<ActionLog[]>([]);
  const [liveCommentaryText, setLiveCommentaryText] = useState<string | null>(null);
  const [liveCommentaryTag, setLiveCommentaryTag] = useState<string>('BIG NEWS');
  const lastAiCommentaryTimeRef = useRef<number>(0);

  const getShortFighterName = (name?: string): string => {
    if (!name) return 'Fighter';
    const clean = name.trim();
    const mapping: Record<string, string> = {
      'Monkey D. Luffy': 'Luffy',
      'Roronoa Zoro': 'Zoro',
      'Vinsmoke Sanji': 'Sanji',
      'Trafalgar D. Water Law': 'Law',
      'Marshall D. Teach': 'Blackbeard',
      'Edward Newgate': 'Whitebeard',
      'Charlotte Katakuri': 'Katakuri',
      'Portgas D. Ace': 'Ace',
      'Donquixote Doflamingo': 'Doflamingo',
      'Bartholomew Kuma': 'Kuma',
      'Dracule Mihawk': 'Mihawk',
      'Rob Lucci': 'Lucci',
      'Boa Hancock': 'Hancock',
      'Sakazuki (Akainu)': 'Akainu',
      'Kuzan (Aokiji)': 'Aokiji',
      'Borsalino (Kizaru)': 'Kizaru',
      'Eustass Kid': 'Kid',
      'Gol D. Roger': 'Roger',
      'Silvers Rayleigh': 'Rayleigh',
      'Kozuki Oden': 'Oden',
      'Tony Tony Chopper': 'Chopper',
      'Marco the Phoenix': 'Marco',
      'Buggy the Clown': 'Buggy',
      'Akainu': 'Akainu',
      'Aokiji': 'Aokiji',
      'Kizaru': 'Kizaru',
      'Blackbeard': 'Blackbeard',
      'Whitebeard': 'Whitebeard',
    };
    if (mapping[clean]) return mapping[clean];
    if (clean.includes('(')) {
      const match = clean.match(/\(([^)]+)\)/);
      if (match && match[1]) return match[1];
    }
    const parts = clean.split(' ');
    return parts[parts.length - 1] || clean;
  };

  const getSimplifiedMoveName = (move?: string): string => {
    if (!move) return 'Strike';
    let clean = move
      .replace(/^Gomu Gomu no\s+/i, '')
      .replace(/^Santoryu Ogi:\s+/i, '')
      .replace(/^Santoryu:\s+/i, '')
      .replace(/^Nitoryu:\s+/i, '')
      .replace(/^Ittoryu:\s+/i, '')
      .replace(/^Diable Jambe:\s+/i, '')
      .replace(/^Ifrit Jambe:\s+/i, '')
      .replace(/^Mochi Mochi:\s+/i, '')
      .replace(/^Ogi:\s+/i, '')
      .replace(/^Special:\s+/i, '')
      .replace(/^Ultimate:\s+/i, '')
      .replace(/^Haki:\s+/i, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/["'「」]/g, '')
      .trim();
    
    const words = clean.split(/\s+/);
    if (words.length > 3) {
      clean = words.slice(0, 2).join(' ');
    }
    return clean || 'Strike';
  };

  const triggerAiPlayByPlayCommentary = async (log: ActionLog, eventType: string, force: boolean = false) => {
    if (!isTtsAnnouncerEnabledRef.current) return;
    const now = Date.now();
    // Throttle commentary: minimum 6.5 seconds between commentary callouts to keep pacing natural and unhurried
    if (!force && now - lastAiCommentaryTimeRef.current < 6500) {
      return;
    }
    lastAiCommentaryTimeRef.current = now;

    const actorShort = log.actorShortName || getShortFighterName(log.actorName);
    const targetShort = log.targetShortName || getShortFighterName(log.targetName);
    const shortMove = getSimplifiedMoveName(log.moveName);

    try {
      const res = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          lastAction: {
            ...log,
            actorName: actorShort,
            targetName: targetShort,
            actorShortName: actorShort,
            targetShortName: targetShort,
            moveName: shortMove
          },
          actorShort,
          targetShort,
          shortMove,
          comboHits: log.comboCount || 1,
          damageDealt: log.damage || 50,
          roundNumber: log.roundNumber
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.commentary) {
          setLiveCommentaryText(data.commentary);
          if (data.highlightTag) setLiveCommentaryTag(data.highlightTag);
          characterVoiceManager.speakAnnouncerGemini(data.commentary, data.excitement > 90 ? 'aggressive' : 'normal');
          setTimeout(() => {
            setLiveCommentaryText((current) => (current === data.commentary ? null : current));
          }, 4500);
        }
      }
    } catch (e) {
      console.warn("Live play-by-play commentary error:", e);
    }
  };
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [showSideLog, setShowSideLog] = useState<boolean>(false);
  const [showAchievementsDrawer, setShowAchievementsDrawer] = useState<boolean>(false);
  const [isMatchOver, setIsMatchOver] = useState<boolean>(false);

  // Stage Hazards Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active D3 Particle references managed in a Map for O(1) removal and minimal memory pressure
  const activeD3ParticlesRef = useRef<Map<string, D3ArenaParticle>>(new Map());

  // Destructible environmental props reference managed by centralized animation loop
  const destructiblePropsRef = useRef<DestructibleEnvProp[]>([
    {
      id: 'prop-barrel-1',
      type: 'barrel',
      xPct: 0.20,
      yPct: 0.76,
      width: 32,
      height: 42,
      health: 100,
      maxHealth: 100,
      isDestroyed: false,
      debris: [],
      color: '#b45309',
      label: 'SAKE BARREL',
    },
    {
      id: 'prop-crate-1',
      type: 'crate',
      xPct: 0.50,
      yPct: 0.81,
      width: 36,
      height: 36,
      health: 100,
      maxHealth: 100,
      isDestroyed: false,
      debris: [],
      color: '#d97706',
      label: 'CARGO CRATE',
    },
    {
      id: 'prop-chest-1',
      type: 'chest',
      xPct: 0.80,
      yPct: 0.76,
      width: 42,
      height: 32,
      health: 100,
      maxHealth: 100,
      isDestroyed: false,
      debris: [],
      color: '#f59e0b',
      label: 'TREASURE CHEST',
    },
  ]);

  const resetDestructibleProps = useCallback(() => {
    destructiblePropsRef.current = [
      {
        id: 'prop-barrel-1',
        type: 'barrel',
        xPct: 0.20,
        yPct: 0.76,
        width: 32,
        height: 42,
        health: 100,
        maxHealth: 100,
        isDestroyed: false,
        debris: [],
        color: '#b45309',
        label: 'SAKE BARREL',
      },
      {
        id: 'prop-crate-1',
        type: 'crate',
        xPct: 0.50,
        yPct: 0.81,
        width: 36,
        height: 36,
        health: 100,
        maxHealth: 100,
        isDestroyed: false,
        debris: [],
        color: '#d97706',
        label: 'CARGO CRATE',
      },
      {
        id: 'prop-chest-1',
        type: 'chest',
        xPct: 0.80,
        yPct: 0.76,
        width: 42,
        height: 32,
        health: 100,
        maxHealth: 100,
        isDestroyed: false,
        debris: [],
        color: '#f59e0b',
        label: 'TREASURE CHEST',
      },
    ];
  }, []);

  const triggerEnvironmentalImpact = useCallback((damageAmount: number) => {
    const targetProp = destructiblePropsRef.current.find(p => !p.isDestroyed);
    if (!targetProp) return;

    targetProp.health = Math.max(0, targetProp.health - damageAmount);

    const px = targetProp.xPct * window.innerWidth;
    const py = targetProp.yPct * window.innerHeight;
    
    const chipsCount = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < chipsCount; i++) {
      const chipId = `chip_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      activeD3ParticlesRef.current.set(chipId, {
        id: chipId,
        x: px + (Math.random() - 0.5) * 15,
        y: py + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 6 - 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 4 + 2,
        color: targetProp.color,
        alpha: 0.85,
        initialAlpha: 0.85,
        life: 1.0,
        maxLife: 1.0,
        decay: 0.012,
        isPersistent: false,
        type: 'debris',
        shape: i % 2 === 0 ? 'rect' : 'triangle',
      });
    }

    if (targetProp.health <= 0) {
      targetProp.isDestroyed = true;
      
      const debrisCount = 25 + Math.floor(Math.random() * 10);
      const colors = targetProp.type === 'chest' 
        ? [targetProp.color, '#fbbf24', '#f59e0b', '#d97706', '#94a3b8']
        : [targetProp.color, '#78350f', '#451a03', '#92400e', '#f59e0b'];
      
      const colorScale = d3.scaleOrdinal<number, string>()
        .domain(d3.range(colors.length))
        .range(colors);

      for (let i = 0; i < debrisCount; i++) {
        const debrisId = `debris_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
        activeD3ParticlesRef.current.set(debrisId, {
          id: debrisId,
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 16 - 4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 8 + 3,
          color: colorScale(i % colors.length),
          alpha: 0.95,
          initialAlpha: 0.95,
          life: 1.0 + Math.random() * 0.3,
          maxLife: 1.3,
          decay: 0.012,
          isPersistent: false,
          type: 'debris',
          shape: i % 2 === 0 ? 'rect' : 'triangle',
        });
      }

      setCombatLogs((prev) => [
        {
          id: `log_env_${Date.now()}_${Math.random()}`,
          side: 'team1',
          type: 'haki',
          text: `💥 PROP SHATTERED: The intense shockwave obliterated the ${targetProp.label}!`,
          timestamp: Date.now(),
        },
        ...prev,
      ].slice(0, 40));

      try {
        soundManager.playHakiThunder();
        vibrationService.vibrate('heavy');
      } catch (e) {}
    }
  }, []);

  const battleModeRef = useRef<BattlePacingMode>(battleMode);
  const isAutoPlayRef = useRef<boolean>(isAutoPlay);
  const isPausedRef = useRef<boolean>(isPaused);
  const isMatchOverRef = useRef<boolean>(isMatchOver);
  const roundAnnouncementRef = useRef<string | null>(roundAnnouncement);
  const battleSpeedRef = useRef<number>(battleSpeed);
  const isTtsAnnouncerEnabledRef = useRef<boolean>(isTtsAnnouncerEnabled);
  const t1ActingRef = useRef<boolean>(false);
  const t2ActingRef = useRef<boolean>(false);
  const isRoundTransitioningRef = useRef<boolean>(false);
  const isD3RoundTransitioningRef = useRef<boolean>(false);

  battleModeRef.current = battleMode;
  isAutoPlayRef.current = isAutoPlay;
  isPausedRef.current = isPaused;
  isMatchOverRef.current = isMatchOver;
  roundAnnouncementRef.current = roundAnnouncement;
  battleSpeedRef.current = battleSpeed;
  isTtsAnnouncerEnabledRef.current = isTtsAnnouncerEnabled;
  isD3RoundTransitioningRef.current = isD3RoundTransitioning;

  // Clear residual transient UI state (floating popups, speech bubbles, active combos)
  const handleClearResidualUI = useCallback(() => {
    setFloatingDamages([]);
    setActiveDamagePopup(null);
    setT1SpeechBubble(null);
    setT2SpeechBubble(null);
    setActiveCombo(null);
    setScreenEdgeFlash(null);
    setFinisherActive(false);
    setFinisherFighter(null);
  }, []);

  // Centralized Battle Arena Lifecycle & Context Cleanup Hook
  const { clearCanvasContext, cleanupResidualCombatState } = useBattleArenaCleanup({
    canvasRef,
    activeD3ParticlesRef,
    activeTimeoutsRef,
    isMatchOverRef,
    isRoundTransitioningRef,
    isD3RoundTransitioningRef,
    isD3RoundTransitioning,
    currentRound,
    stageId: currentStage.id,
    onClearResidualUI: handleClearResidualUI,
    resetDestructibleProps,
  });

  const roundAnnouncementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setRoundAnnouncementSafe = useCallback((text: string | null, autoClearMs = 2800) => {
    if (roundAnnouncementTimeoutRef.current) {
      clearTimeout(roundAnnouncementTimeoutRef.current);
      roundAnnouncementTimeoutRef.current = null;
    }
    setRoundAnnouncement(text);
    roundAnnouncementRef.current = text;
    if (text) {
      roundAnnouncementTimeoutRef.current = setTimeout(() => {
        setRoundAnnouncement(null);
        roundAnnouncementRef.current = null;
        roundAnnouncementTimeoutRef.current = null;
      }, autoClearMs);
    }
  }, []);

  const speakAnnouncer = useCallback((text: string, intensity: 'aggressive' | 'calm' | 'normal' = 'normal') => {
    if (isTtsAnnouncerEnabledRef.current) {
      characterVoiceManager.speakAnnouncerGemini(text, intensity);
    }
  }, []);

  const executeActionTurnRef = useRef<any>(null);
  const switchStanceRef = useRef<any>(null);
  const handleFighterKORef = useRef<any>(null);
  const handleDoubleKORef = useRef<any>(null);

  // Haki Aura Activation Sound Effects Tracker
  const [t1AuraTriggered, setT1AuraTriggered] = useState(false);
  const [t2AuraTriggered, setT2AuraTriggered] = useState(false);

  const activeT1State = t1FighterStates[t1Index];
  const activeT2State = t2FighterStates[t2Index];

  // Sync selected player taunt when active fighter changes
  useEffect(() => {
    if (activeT1State?.fighter?.id) {
      const defaultTaunt = getDefaultTauntForFighter(
        activeT1State.fighter.id,
        activeT1State.fighter.name
      );
      setSelectedPlayerTaunt(defaultTaunt);
      selectedPlayerTauntRef.current = defaultTaunt;
    }
  }, [activeT1State?.fighter?.id, activeT1State?.fighter?.name]);

  // Dynamic Background Crowd Intensity & Excitement Tracking
  const isMatchDesperate = useMemo(() => {
    const t1Low = activeT1State ? activeT1State.currentHp / activeT1State.maxHp <= 0.28 : false;
    const t2Low = activeT2State ? activeT2State.currentHp / activeT2State.maxHp <= 0.28 : false;
    return t1Low || t2Low;
  }, [activeT1State?.currentHp, activeT1State?.maxHp, activeT2State?.currentHp, activeT2State?.maxHp]);

  const crowdState = useMatchIntensity({
    isPaused,
    isGameOver: isMatchOver,
    isClashActive: hakiClashActive,
    isDesperate: isMatchDesperate,
    activeComboHits: activeCombo?.hits ?? 0,
    comboMultiplier: activeCombo?.multiplier ?? 1,
    soundEnabled: isBgmEnabled,
  });

  crowdRecordHitRef.current = crowdState.recordHit;

  // Haki Aura Sound Effects - Triggered at 30% HP threshold
  useEffect(() => {
    if (!activeT1State) return;
    const isLowHp = activeT1State.currentHp / activeT1State.maxHp <= 0.3;
    if (isLowHp && !t1AuraTriggered) {
      const h1 = activeT1State.fighter.haki;
      let type: 'conqueror' | 'armament' | 'observation' = 'armament';
      
      if (activeT1State.fighter.id === 'imu_sama') {
        type = 'conqueror'; // Void Haki uses Conqueror sound profile
      } else if (h1.conqueror >= 60 && h1.conqueror >= h1.armament && h1.conqueror >= h1.observation) {
        type = 'conqueror';
      } else if (h1.observation >= 60 && h1.observation > h1.armament) {
        type = 'observation';
      }
      
      soundManager.playHakiAura(type);
      setT1AuraTriggered(true);
    } else if (!isLowHp && t1AuraTriggered) {
      setT1AuraTriggered(false); // Reset if healed (e.g. training mode)
    }
  }, [activeT1State?.currentHp, activeT1State?.fighter?.id, t1AuraTriggered]);

  useEffect(() => {
    if (!activeT2State) return;
    const isLowHp = activeT2State.currentHp / activeT2State.maxHp <= 0.3;
    if (isLowHp && !t2AuraTriggered) {
      const h2 = activeT2State.fighter.haki;
      let type: 'conqueror' | 'armament' | 'observation' = 'armament';
      
      if (activeT2State.fighter.id === 'imu_sama') {
        type = 'conqueror';
      } else if (h2.conqueror >= 60 && h2.conqueror >= h2.armament && h2.conqueror >= h2.observation) {
        type = 'conqueror';
      } else if (h2.observation >= 60 && h2.observation > h2.armament) {
        type = 'observation';
      }
      
      soundManager.playHakiAura(type);
      setT2AuraTriggered(true);
    } else if (!isLowHp && t2AuraTriggered) {
      setT2AuraTriggered(false);
    }
  }, [activeT2State?.currentHp, activeT2State?.fighter?.id, t2AuraTriggered]);

  // Robust null guard for safety during transitions or state synchronization
  if (!activeT1State || !activeT2State) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-amber-500 font-mono text-xs">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="animate-pulse tracking-widest uppercase">Initializing Battle Sequence...</p>
        </div>
      </div>
    );
  }

  // Pre-cache all Haki sound effects into memory buffers before battle animations start
  useEffect(() => {
    const t1Fighters = Array.isArray(team1) ? team1 : team1?.fighters;
    const t2Fighters = Array.isArray(team2) ? team2 : team2?.fighters;
    if (!t1Fighters || !t2Fighters) return;
    const t1Ids = t1Fighters.map((f: any) => f.id || f.fighter?.id).filter(Boolean);
    const t2Ids = t2Fighters.map((f: any) => f.id || f.fighter?.id).filter(Boolean);
    audioManager.preloadHakiAudio([...t1Ids, ...t2Ids]);
  }, [team1, team2]);

  // Initialize Dynamic BGM & Audio
  useEffect(() => {
    // Note: synthesized BGM disabled in favor of AudioManager tracks as per user request
    /*
    if (isBgmEnabled && !isPaused && !isMatchOver) {
      battleBgmEngine.start();
      battleBgmEngine.setPhase('Opening');
    } else if (isMatchOver || isPaused) {
      battleBgmEngine.stop();
    }
    */

    if (isBgmEnabled) {
      if (isPaused || isMatchOver) {
        audioManager.pauseBattleMusic();
      } else {
        audioManager.resumeBattleMusic();
      }
    }
    
    return () => {
      // battleBgmEngine.stop();
      audioManager.stopBattleMusic();
      battleAnnouncer.resetQueue();
      characterVoiceManager.stopAll();
      soundManager.stopAll();
    };
  }, [isMatchOver, isPaused, isBgmEnabled]);

  // Sync BGM with Active Battle Phase
  useEffect(() => {
    if (!activeT1State || !activeT2State || isMatchOver) return;
    
    const hpRatio1 = activeT1State.currentHp / activeT1State.maxHp;
    const hpRatio2 = activeT2State.currentHp / activeT2State.maxHp;
    
    // Only when BOTH combatants are low HP (<= 30%), we trigger the high tension "Desperate" phase.
    const bothLowHp = hpRatio1 <= 0.30 && hpRatio2 <= 0.30;
    
    const overallPhase = bothLowHp 
      ? 'Desperate' 
      : (hpRatio1 > 0.75 && hpRatio2 > 0.75 ? 'Opening' : 'Mid');
      
    battleBgmEngine.setPhase(overallPhase);
  }, [activeT1State?.currentHp, activeT2State?.currentHp, isMatchOver]);

  // Handle BGM Toggle
  const toggleBgm = () => {
    const nextState = !isBgmEnabled;
    setIsBgmEnabled(nextState);
    if (nextState) {
      battleBgmEngine.start();
    } else {
      battleBgmEngine.stop();
    }
  };

  // Trigger camera shake effect
  const triggerCameraShake = (intensity: 'light' | 'medium' | 'heavy') => {
    setCameraShake(intensity);
    if (intensity === 'heavy') vibrationService.vibrate('heavy');
    else if (intensity === 'medium') vibrationService.vibrate('super');
    else vibrationService.vibrate('light');

    const duration = intensity === 'heavy' ? 450 : intensity === 'medium' ? 350 : 250;
    safeTimeout(() => setCameraShake(null), duration);
  };

  // Trigger slow-motion impact zoom effect
  const triggerImpactZoom = () => {
    setIsImpactZooming(true);
    safeTimeout(() => setIsImpactZooming(false), 500);
  };

  // Trigger KOF-style 0.05s (50ms) hit-stop pause in game engine loop on ultimate move connection
  const triggerHitStop = async (durationMs: number = 50) => {
    setIsHitStopActive(true);
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    setIsHitStopActive(false);
  };

  // Initialize Round announcement sound
  useEffect(() => {
    soundManager.playRoundStart();
    characterVoiceManager.playRoundStart(currentRound);
    setShowFightBanner(true);

    // Dynamic arcade announcer TTS for round starts
    const isT1Last = t1Index === (team1.fighters?.length || 1) - 1;
    const isT2Last = t2Index === (currentTeam2.fighters?.length || 1) - 1;

    let announceText = `Round ${currentRound}`;
    if (isT1Last && isT2Last) {
      announceText = "Final Round";
    }
    speakAnnouncer(`${announceText}! Ready... Fight!`);

    const t = setTimeout(() => {
      setRoundAnnouncementSafe(null);
      setShowFightBanner(false);
    }, 2400);
    return () => clearTimeout(t);
  }, [currentRound, t1Index, t2Index, team1.fighters?.length, currentTeam2.fighters?.length, speakAnnouncer, setRoundAnnouncementSafe]);

  // Dynamic Animated Canvas for Stage-Specific Environmental Atmosphere & Active D3 Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particlesMap = activeD3ParticlesRef.current;

    // Prune existing ambient stage particles before re-populating for new stage
    for (const [id, p] of particlesMap.entries()) {
      if (p.type === 'stage_ambient') {
        particlesMap.delete(id);
      }
    }

    // D3 Scale for particle distribution across stage
    const numParticles = currentStage.id === 'stage_marineford' ? 45 : currentStage.id === 'stage_onigashima' ? 50 : 35;
    
    // D3 color palettes based on active stage
    const stageColors =
      currentStage.id === 'stage_marineford'
        ? ['#93c5fd', '#60a5fa', '#ef4444', '#f87171'] // Ice & Magma
        : currentStage.id === 'stage_onigashima'
        ? ['#f97316', '#dc2626', '#ea580c', '#fbbf24'] // Embers & Flames
        : currentStage.id === 'stage_egghead'
        ? ['#06b6d4', '#22d3ee', '#38bdf8', '#a855f7'] // Cyber Photons
        : currentStage.id === 'stage_laugh_tale'
        ? ['#fbbf24', '#f59e0b', '#fef08a', '#e0e7ff'] // Celestial Gold
        : ['#ec4899', '#f472b6', '#fb7185', '#fda4af']; // Whole Cake Candy

    const colorScale = d3.scaleOrdinal<number, string>()
      .domain(d3.range(stageColors.length))
      .range(stageColors);

    // Populate Map with active D3 stage ambient particles using D3 range
    d3.range(numParticles).forEach((i) => {
      const pid = `stage_ambient_${currentStage.id}_${i}`;
      particlesMap.set(pid, {
        id: pid,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: currentStage.id === 'stage_marineford' ? Math.random() * 1.5 + 0.5 : -Math.random() * 1.5 - 0.5,
        size: Math.random() * 3 + 1,
        color: colorScale(i % stageColors.length),
        alpha: Math.random() * 0.6 + 0.2,
        initialAlpha: Math.random() * 0.6 + 0.2,
        life: 1.0,
        maxLife: 1.0,
        decay: 0,
        isPersistent: true,
        type: 'stage_ambient',
        shape: 'circle',
      });
    });

    let animFrameId: number;

    const render = () => {
      // If match is over or component unmounted, stop immediately and clear
      if (isMatchOverRef.current) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      // During active round transitions, keep the background canvas clear to prevent ghost/residual artifacts
      if (isD3RoundTransitioningRef.current) {
        ctx.clearRect(0, 0, width, height);
        animFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const speedFactor = battleSpeed * 0.8;

      // 1. UPDATE & RENDER ALL ACTIVE D3 PARTICLES VIA MAP ITERATION
      // Enables O(1) removal on cleanup via particlesMap.delete(id)
      for (const [id, p] of particlesMap.entries()) {
        if (p.type === 'stage_ambient') {
          // Persistent ambient floating particle physics
          p.x += p.vx * speedFactor;
          p.y += p.vy * speedFactor;

          // Wrap-around boundaries
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        } else if (p.type === 'debris') {
          // Physics step for debris chips
          p.x += p.vx * (battleSpeed * 0.85);
          p.y += p.vy * (battleSpeed * 0.85);
          p.vy += 0.32 * (battleSpeed * 0.85); // gravity pull
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed * (battleSpeed * 0.85);
          }
          p.life -= p.decay * (battleSpeed * 0.85);

          // Floor bounce constraint
          const floorY = height * 0.82;
          if (p.y > floorY) {
            p.y = floorY;
            p.vy = -p.vy * 0.5; // bounce energy loss
            p.vx *= 0.7; // friction slide deceleration
          }

          // Check for dead debris: O(1) cleanup via Map.delete!
          if (p.life <= 0) {
            particlesMap.delete(id);
            continue;
          }

          // Render debris block
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) {
            ctx.rotate(p.rotation);
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life * p.alpha);

          ctx.beginPath();
          if (p.shape === 'triangle') {
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
          } else {
            ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
          ctx.fill();
          ctx.restore();
        } else if (p.type === 'clash_spark') {
          // Dynamic clash / hit spark particle
          p.x += p.vx * (battleSpeed * 0.9);
          p.y += p.vy * (battleSpeed * 0.9);
          p.vx *= 0.94; // air drag
          p.vy *= 0.94;
          p.life -= p.decay * (battleSpeed * 0.9);

          // O(1) deletion when faded
          if (p.life <= 0) {
            particlesMap.delete(id);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life * p.alpha);
          if (p.glowColor) {
            ctx.shadowColor = p.glowColor;
            ctx.shadowBlur = 8;
          }
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * p.life), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 2. RENDER DESTRUCTIBLE ENVIRONMENTAL PROPS
      const props = destructiblePropsRef.current;
      props.forEach((prop) => {
        const px = prop.xPct * width;
        const py = prop.yPct * height;

        if (!prop.isDestroyed) {
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = prop.color + '44';

          if (prop.type === 'barrel') {
            ctx.fillStyle = prop.color;
            ctx.strokeStyle = '#1e1b4b';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(px - prop.width / 2, py - prop.height / 2, prop.width, prop.height, 4);
            } else {
              ctx.rect(px - prop.width / 2, py - prop.height / 2, prop.width, prop.height);
            }
            ctx.fill();
            ctx.stroke();

            // Iron bands around barrel
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px - prop.width / 2, py - prop.height / 3, prop.width, 3);
            ctx.fillRect(px - prop.width / 2, py + prop.height / 6, prop.width, 3);

            // Wood vertical planks lines
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px - prop.width / 4, py - prop.height / 2);
            ctx.lineTo(px - prop.width / 4, py + prop.height / 2);
            ctx.moveTo(px, py - prop.height / 2);
            ctx.lineTo(px, py + prop.height / 2);
            ctx.moveTo(px + prop.width / 4, py - prop.height / 2);
            ctx.lineTo(px + prop.width / 4, py + prop.height / 2);
            ctx.stroke();
          } else if (prop.type === 'crate') {
            ctx.fillStyle = prop.color;
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.rect(px - prop.width / 2, py - prop.height / 2, prop.width, prop.height);
            ctx.fill();
            ctx.stroke();

            // Diagonal bracing cross
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px - prop.width / 2 + 3, py - prop.height / 2 + 3);
            ctx.lineTo(px + prop.width / 2 - 3, py + prop.height / 2 - 3);
            ctx.moveTo(px + prop.width / 2 - 3, py - prop.height / 2 + 3);
            ctx.lineTo(px - prop.width / 2 + 3, py + prop.height / 2 - 3);
            ctx.stroke();
          } else if (prop.type === 'chest') {
            ctx.fillStyle = prop.color;
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;

            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(px - prop.width / 2, py - prop.height / 2, prop.width, prop.height, [6, 6, 2, 2]);
            } else {
              ctx.rect(px - prop.width / 2, py - prop.height / 2, prop.width, prop.height);
            }
            ctx.fill();
            ctx.stroke();

            // Steel/iron trim
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(px - prop.width / 2, py - prop.height / 2, 4, prop.height);
            ctx.fillRect(px + prop.width / 2 - 4, py - prop.height / 2, 4, prop.height);
            ctx.fillRect(px - prop.width / 2, py - prop.height / 2, prop.width, 4);

            // Glowing lock
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12;
            ctx.fillRect(px - 4, py, 8, 8);
          }

          ctx.restore();

          // Draw floating label & health status bar
          ctx.fillStyle = 'rgba(9, 9, 11, 0.75)';
          ctx.fillRect(px - 28, py - prop.height / 2 - 14, 56, 11);
          
          ctx.font = 'bold 7px sans-serif';
          ctx.fillStyle = '#e4e4e7';
          ctx.textAlign = 'center';
          ctx.fillText(prop.label, px, py - prop.height / 2 - 6);

          // Health bar
          const hWidth = 40;
          const hHeight = 3;
          const hRatio = prop.health / prop.maxHealth;
          ctx.fillStyle = '#18181b';
          ctx.fillRect(px - hWidth / 2, py + prop.height / 2 + 5, hWidth, hHeight);
          ctx.fillStyle = hRatio > 0.5 ? '#10b981' : hRatio > 0.25 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(px - hWidth / 2, py + prop.height / 2 + 5, hWidth * hRatio, hHeight);
        }
      });

      ctx.globalAlpha = 1.0;
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      if (canvas && ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.restore();
      }
    };
  }, [currentStage.id, battleSpeed]);

  const isExecutingTurn = useRef(false);

  // Dynamic Real-Time Arcade AI & Autonomous Combat Heartbeat
  // Runs continuous real-time combat: AI makes decisions, reacts, strikes, blocks, and counters independently!
  useEffect(() => {
    let loopTimer: NodeJS.Timeout | null = null;

    if (
      isPaused ||
      isMatchOver ||
      roundAnnouncement ||
      isD3RoundTransitioning
    ) {
      // Clean pause/transition suspension: do not trigger recursive ticks or multiple setTimeout chains.
      // The useEffect dependencies will restart the loop when these conditions resolve.
      return;
    }

    const runCombatLoop = () => {
      const currentSpeed = battleSpeedRef.current;
      const currentMode = battleModeRef.current;

      // Comfortable, normal cadence:
      // In classic mode, uses realistic initiative pacing (~2.2s - 3.4s)
      // In dynamic and spectate modes, provides natural breathing room between actions (2.2s - 3.2s at 1.0x normal speed)
      const intervalMs = currentMode === 'classic_turn'
        ? getRandomizedTurnInterval(currentSpeed)
        : currentMode === 'auto_spectate'
        ? Math.round((2100 + Math.random() * 800) / currentSpeed)
        : Math.round((2400 + Math.random() * 1000) / currentSpeed);

      loopTimer = setTimeout(async () => {
        if (
          isPausedRef.current ||
          isMatchOverRef.current ||
          roundAnnouncementRef.current ||
          isRoundTransitioningRef.current ||
          isD3RoundTransitioningRef.current
        ) {
          return;
        }

        const curT1 = t1StatesRef.current[t1IdxRef.current];
        const curT2 = t2StatesRef.current[t2IdxRef.current];

        if (!curT1 || !curT2 || curT1.currentHp <= 0 || curT2.currentHp <= 0) {
          // Heartbeat fail-safe: if any fighter reaches 0 HP and KO wasn't triggered, resolve it immediately!
          if (!isMatchOverRef.current && !isRoundTransitioningRef.current && !roundAnnouncementRef.current) {
            if (curT1?.currentHp <= 0 && curT2?.currentHp <= 0) {
              handleDoubleKORef.current?.();
            } else if (curT2?.currentHp <= 0) {
              handleFighterKORef.current?.('team2');
            } else if (curT1?.currentHp <= 0) {
              handleFighterKORef.current?.('team1');
            }
          }
          return;
        }

        // Check if a transformation is currently happening
        if (isTransformingRef.current) {
          return;
        }

        // Evaluate Dynamic Transformations using useTransformation hook
        const transformed = checkAndTrigger(
          curT1,
          curT2,
          currentRound,
          combatLogs.filter((log) => log.roundNumber === currentRound).length,
          t1IdxRef.current,
          t2IdxRef.current,
          setT1FighterStates,
          setT2FighterStates,
          t1StatesRef,
          t2StatesRef,
          (paused) => {
            setIsPaused(paused);
            isPausedRef.current = paused;
          }
        );

        if (transformed) {
          return;
        }

        // --- 1. DYNAMIC REAL-TIME MODE (Player vs AI: deliberate arcade cadence, no chaotic spam!) ---
        if (currentMode === 'dynamic') {
          try {
            // Team 2 Autonomous AI Action / Stun Recovery
            const t2StunTurns = curT2.statusEffects?.isStunned || 0;
            if (t2StunTurns > 0) {
              setT2FighterStates((prev) => {
                const next = [...prev];
                const f = next[t2IdxRef.current];
                if (!f) return prev;
                const remStun = t2StunTurns - 1;
                next[t2IdxRef.current] = {
                  ...f,
                  statusEffects: {
                    ...f.statusEffects,
                    isStunned: remStun > 0 ? remStun : undefined,
                  },
                };
                return next;
              });
              triggerFloatingDamage('team2', 0, 'miss', 'STUNNED! (Recovering...)');
              soundManager.playMiss();
            } else if (!t2ActingRef.current) {
              const playerIsAttacking = t1ActingRef.current;
              let aiAction: 'move' | 'guard' | 'dodge' | 'max_mode' | 'taunt' | 'finisher' = 'move';
              let chosenMove: Move | undefined = undefined;

              // Observation reaction: 30% chance to block or dodge if player is attacking
              if (playerIsAttacking && Math.random() < 0.30) {
                const canDodge = (curT2.moveCooldowns?.['dodge_action'] || 0) === 0;
                aiAction = canDodge && Math.random() < 0.5 ? 'dodge' : 'guard';
              } else {
                const choice = getSmartAiMoveChoice(curT2, curT1, 'hard');
                if (choice.desiredStance && choice.desiredStance !== curT2.currentStance) {
                  if (switchStanceRef.current) {
                    switchStanceRef.current('team2', choice.desiredStance);
                  }
                }
                aiAction = choice.action;
                chosenMove = choice.selectedMove;
              }

              if (executeActionTurnRef.current) {
                // Await action turn so animations, quotes, and impact settle before next cadence check
                await executeActionTurnRef.current('team2', aiAction, chosenMove);
              }
            }

            // Also check and decrement Team 1 (Player) stun duration if stunned
            const t1StunTurns = curT1.statusEffects?.isStunned || 0;
            if (t1StunTurns > 0) {
              setT1FighterStates((prev) => {
                const next = [...prev];
                const f = next[t1IdxRef.current];
                if (!f) return prev;
                const remStun = t1StunTurns - 1;
                next[t1IdxRef.current] = {
                  ...f,
                  statusEffects: {
                    ...f.statusEffects,
                    isStunned: remStun > 0 ? remStun : undefined,
                  },
                };
                return next;
              });
              triggerFloatingDamage('team1', 0, 'miss', 'STUNNED! (Recovering...)');
            }
          } catch (err) {
            console.error('Error during dynamic combat tick:', err);
          } finally {
            runCombatLoop();
          }
          return;
        }

        // --- 2. AUTO-SPECTATE MODE (Alternating rhythmic strikes between fighters) ---
        if (currentMode === 'auto_spectate') {
          try {
            const t1Turn = Math.random() < 0.5;
            const activeSide = t1Turn ? 'team1' : 'team2';
            const attacker = t1Turn ? curT1 : curT2;
            const defender = t1Turn ? curT2 : curT1;

            const stunTurns = attacker.statusEffects?.isStunned || 0;
            if (stunTurns > 0) {
              const setFn = activeSide === 'team1' ? setT1FighterStates : setT2FighterStates;
              const idxRef = activeSide === 'team1' ? t1IdxRef : t2IdxRef;
              setFn((prev) => {
                const next = [...prev];
                const f = next[idxRef.current];
                if (!f) return prev;
                const remStun = stunTurns - 1;
                next[idxRef.current] = {
                  ...f,
                  statusEffects: {
                    ...f.statusEffects,
                    isStunned: remStun > 0 ? remStun : undefined,
                  },
                };
                return next;
              });
              triggerFloatingDamage(activeSide, 0, 'miss', 'STUNNED! (Recovering...)');
              soundManager.playMiss();
            } else {
              const choice = getSmartAiMoveChoice(attacker, defender, 'hard');
              if (choice.desiredStance && choice.desiredStance !== attacker.currentStance) {
                if (switchStanceRef.current) {
                  switchStanceRef.current(activeSide, choice.desiredStance);
                }
              }
              if (executeActionTurnRef.current) {
                await executeActionTurnRef.current(activeSide, choice.action, choice.selectedMove);
              }
            }
          } catch (err) {
            console.error('Error during auto-spectate tick:', err);
          } finally {
            runCombatLoop();
          }
          return;
        }

        // --- 3. CLASSIC TURN-BASED MODE (Sequential auto-simulation if auto is on) ---
        if (currentMode === 'classic_turn' && isAutoPlayRef.current) {
          if (isExecutingTurn.current) {
            runCombatLoop();
            return;
          }
          isExecutingTurn.current = true;

          try {
            const t1Initiative =
              curT1.fighter.stats.speed +
              curT1.fighter.haki.observation * 0.25 +
              curT1.momentum * 2 +
              Math.random() * 30;
            const t2Initiative =
              curT2.fighter.stats.speed +
              curT2.fighter.haki.observation * 0.25 +
              curT2.momentum * 2 +
              Math.random() * 30;

            const firstSide = t1Initiative >= t2Initiative ? 'team1' : 'team2';
            const secondSide = firstSide === 'team1' ? 'team2' : 'team1';

            const firstFighter = firstSide === 'team1' ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];
            const opponentFighter = firstSide === 'team1' ? t2StatesRef.current[t2IdxRef.current] : t1StatesRef.current[t1IdxRef.current];

            const firstStun = firstFighter.statusEffects?.isStunned || 0;
            if (firstStun > 0) {
              const setFn = firstSide === 'team1' ? setT1FighterStates : setT2FighterStates;
              const idxRef = firstSide === 'team1' ? t1IdxRef : t2IdxRef;
              setFn((prev) => {
                const next = [...prev];
                const f = next[idxRef.current];
                if (!f) return prev;
                const remStun = firstStun - 1;
                next[idxRef.current] = {
                  ...f,
                  statusEffects: {
                    ...f.statusEffects,
                    isStunned: remStun > 0 ? remStun : undefined,
                  },
                };
                return next;
              });
              triggerFloatingDamage(firstSide, 0, 'miss', 'STUNNED! (Recovering...)');
              soundManager.playMiss();
            } else {
              const choice1 = getSmartAiMoveChoice(firstFighter, opponentFighter, 'hard');
              if (choice1.desiredStance && choice1.desiredStance !== firstFighter.currentStance) {
                if (switchStanceRef.current) {
                  switchStanceRef.current(firstSide, choice1.desiredStance);
                }
              }
              if (executeActionTurnRef.current) {
                await executeActionTurnRef.current(firstSide, choice1.action, choice1.selectedMove);
              }
            }

            const updatedSecondFighter = secondSide === 'team1' ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];
            const updatedFirstFighter = secondSide === 'team1' ? t2StatesRef.current[t2IdxRef.current] : t1StatesRef.current[t1IdxRef.current];

            if (updatedSecondFighter && updatedSecondFighter.currentHp > 0 && !isMatchOverRef.current) {
              await new Promise((r) => setTimeout(r, Math.round(1800 / currentSpeed)));
              const secondStun = updatedSecondFighter.statusEffects?.isStunned || 0;
              if (secondStun > 0) {
                const setFn = secondSide === 'team1' ? setT1FighterStates : setT2FighterStates;
                const idxRef = secondSide === 'team1' ? t1IdxRef : t2IdxRef;
                setFn((prev) => {
                  const next = [...prev];
                  const f = next[idxRef.current];
                  if (!f) return prev;
                  const remStun = secondStun - 1;
                  next[idxRef.current] = {
                    ...f,
                    statusEffects: {
                      ...f.statusEffects,
                      isStunned: remStun > 0 ? remStun : undefined,
                    },
                  };
                  return next;
                });
                triggerFloatingDamage(secondSide, 0, 'miss', 'STUNNED! (Recovering...)');
                soundManager.playMiss();
              } else {
                const choice2 = getSmartAiMoveChoice(updatedSecondFighter, updatedFirstFighter, 'hard');
                if (choice2.desiredStance && choice2.desiredStance !== updatedSecondFighter.currentStance) {
                  if (switchStanceRef.current) {
                    switchStanceRef.current(secondSide, choice2.desiredStance);
                  }
                }
                if (executeActionTurnRef.current) {
                  await executeActionTurnRef.current(secondSide, choice2.action, choice2.selectedMove);
                }
              }
            }
          } catch (err) {
            console.error('Error during classic combat simulation:', err);
          } finally {
            isExecutingTurn.current = false;
            runCombatLoop();
          }
        } else {
          runCombatLoop();
        }
      }, intervalMs);
    };

    runCombatLoop();

    return () => {
      if (loopTimer) clearTimeout(loopTimer);
      destructiblePropsRef.current = [];
      activeTimeoutsRef.current.forEach(clearTimeout);
      activeTimeoutsRef.current.clear();
    };
  }, [
    isPaused,
    isMatchOver,
    roundAnnouncement,
    isD3RoundTransitioning,
    battleSpeed,
    battleMode,
    t1Index,
    t2Index,
    isAutoPlay
  ]);

  // Stance Switch Handler
  const switchStance = useCallback((side: 'team1' | 'team2', newStance: CombatStance) => {
    soundManager.playStanceSwitch();
    if (side === 'team1') {
      setT1FighterStates((prev) => {
        const next = [...prev];
        next[t1IdxRef.current] = { ...next[t1IdxRef.current], currentStance: newStance };
        return next;
      });
    } else {
      setT2FighterStates((prev) => {
        const next = [...prev];
        next[t2IdxRef.current] = { ...next[t2IdxRef.current], currentStance: newStance };
        return next;
      });
    }
  }, []);

  // Tactical Downtime: Passive Stamina Regeneration Loop
  // Regenerates stamina during moments of non-combat downtime, boosted in Defensive Stance
  useEffect(() => {
    const staminaRegenInterval = setInterval(() => {
      if (
        isPausedRef.current ||
        isMatchOverRef.current ||
        roundAnnouncementRef.current ||
        isRoundTransitioningRef.current ||
        isD3RoundTransitioningRef.current
      ) {
        return;
      }

      // Regenerate Team 1 if not currently acting
      if (!t1ActingRef.current) {
        setT1FighterStates((prev) => {
          const idx = t1IdxRef.current;
          if (!prev[idx] || prev[idx].currentHp <= 0) return prev;
          const current = prev[idx].staminaMeter ?? 100;
          const currentHaki = prev[idx].superMeter ?? 0;
          if (current >= 100 && !prev[idx].isExhausted && currentHaki >= 300) return prev;
          const updated = regenerateFighterMeters(prev[idx], 5);
          const next = [...prev];
          next[idx] = updated;
          return next;
        });
      }

      // Regenerate Team 2 if not currently acting
      if (!t2ActingRef.current) {
        setT2FighterStates((prev) => {
          const idx = t2IdxRef.current;
          if (!prev[idx] || prev[idx].currentHp <= 0) return prev;
          const current = prev[idx].staminaMeter ?? 100;
          const currentHaki = prev[idx].superMeter ?? 0;
          if (current >= 100 && !prev[idx].isExhausted && currentHaki >= 300) return prev;
          const updated = regenerateFighterMeters(prev[idx], 5);
          const next = [...prev];
          next[idx] = updated;
          return next;
        });
      }
    }, 1200);

    return () => clearInterval(staminaRegenInterval);
  }, []);

  // Turn Execution Logic with Strict Sequential Narration & Action Flow
  const getMoveShout = (moveName: string): string => {
    let shout = moveName
      .replace(/^Gomu Gomu no\s+/i, '')
      .replace(/^Santoryu:\s+/i, '')
      .replace(/^Mochi\s+/i, '')
      .replace(/^Black\s+/i, '')
      .replace(/^It刀流:\s+/i, '')
      .toUpperCase();
    return `💥 ${shout}! 💥`;
  };

  const triggerCinematicFinisher = async (side: 'team1' | 'team2', move: Move) => {
    try {
      vibrationService.vibrate('super');
      const actor = side === 'team1' ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];
      setFinisherActive(true);
      setFinisherFighter(actor);
      setIsPaused(true);
      isPausedRef.current = true;
      
      // Stop BGM to build tension
      battleBgmEngine.stop();
      crowdState.setIntensity((prev) => Math.min(100, prev + 35));
      
      // Play dramatic start sound
      soundManager.playSuperCharge();
      triggerCameraShake('heavy');
      setConquerorFlash(true);
      triggerScreenEdgeFlash('ultimate', 'gold');
      setTimeout(() => setConquerorFlash(false), 400);

      // Announce the finisher
      battleAnnouncer.announceAction(actor.fighter.name, move.name, move.nameJP, 'super');
      
      if (actor.fighter.id === 'luffy') {
        setTimeout(() => {
          setT1SpeechBubble("This is my peak! HAHAHA! 🥁");
          characterVoiceManager.playDynamicCommentary({
            eventType: 'SUPER',
            lastAction: { actorName: actor.fighter.name } as any,
            roundNumber: currentRound
          });
        }, 1000);
      }

      // Dramatic pause for the "cinematic"
      await new Promise(r => setTimeout(r, 3500));
    } catch (err) {
      console.error('Error during cinematic finisher sequence:', err);
    } finally {
      setIsPaused(false);
      isPausedRef.current = false;
      setFinisherActive(false);
      setFinisherFighter(null);
    }
    
    // Execute the actual damage hit
    await executeActionTurn(side, 'move', move);
  };

  const triggerAwakeningSequence = (side: 'team1' | 'team2', state: BattleFighterState, profile: AwakeningProfile) => {
    vibrationService.vibrate('super');
    soundManager.playSuperCharge();
    soundManager.playHakiThunder();
    triggerCameraShake('heavy');
    setConquerorFlash(true);
    triggerScreenEdgeFlash('ultimate', 'gold');
    setTimeout(() => setConquerorFlash(false), 450);

    // Announce transformation
    battleAnnouncer.announceAction(state.fighter.name, profile.formName, profile.formNameJP, 'clash');
    speakAnnouncer(`Awakening! ${profile.formName}!`);
    crowdState.setIntensity((prev) => Math.min(100, prev + 30));

    const quote = profile.transformationQuote;
    if (side === 'team1') {
      setT1SpeechBubble(quote);
    } else {
      setT2SpeechBubble(quote);
    }

    characterVoiceManager.speakAwakeningQuote(quote, profile.transformationQuoteJP, state.fighter.name);

    setAwakeningCinematic({
      isActive: true,
      fighterState: state,
      profile,
    });

    triggerFloatingDamage(side, 0, 'conqueror_burst', `★ AWAKENING UNLOCKED ★`);

    setTimeout(() => {
      setAwakeningCinematic({ isActive: false, fighterState: null, profile: null });
      setT1SpeechBubble(null);
      setT2SpeechBubble(null);
    }, 2200);
  };

  const executeActionTurn = async (
    actorSide: 'team1' | 'team2',
    actionType: 'move' | 'guard' | 'dodge' | 'max_mode' | 'taunt' | 'finisher' | 'haki_awakening',
    move?: Move,
    customTaunt?: BattleTauntAnimation
  ) => {
    const isT1 = actorSide === 'team1';
    if (isT1) {
      if (t1ActingRef.current) return;
      t1ActingRef.current = true;
      setIsT1InRecovery(true);
    } else {
      if (t2ActingRef.current) return;
      t2ActingRef.current = true;
    }

    const isDyn = battleModeRef.current !== 'classic_turn';
    const attacker = isT1 ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];
    const defender = isT1 ? t2StatesRef.current[t2IdxRef.current] : t1StatesRef.current[t1IdxRef.current];

    if (!attacker || !defender || attacker.currentHp <= 0 || defender.currentHp <= 0) {
      if (isT1) {
        t1ActingRef.current = false;
        setIsT1InRecovery(false);
      } else {
        t2ActingRef.current = false;
      }
      return;
    }

    try {
      setActorInMotion(actorSide);

      if (actionType === 'max_mode') {
        soundManager.playSuperCharge();
        soundManager.playHakiThunder();
        triggerScreenEdgeFlash('ultimate', 'gold');
        const res = executeActivateMaxMode(attacker, actorSide, currentRound);
        if (res) {
          updateFighterState(actorSide, res.updatedFighter);
          setCombatLogs((prev) => [res.log, ...prev].slice(0, 40));
        }
        
        const maxQuotes = ["HAKI DO CONQUISTADOR ATIVADO!", "PODER TOTAL MÁXIMO!", "PREPARE-SE PARA A DERROTA!"];
        const maxQ = maxQuotes[Math.floor(Math.random() * maxQuotes.length)];
        if (isT1) {
          setT1SpeechBubble(maxQ);
        } else {
          setT2SpeechBubble(maxQ);
        }

        battleAnnouncer.announceAction(attacker.fighter.name, 'Conqueror Surge', '覇王色の覚醒', 'clash');
        await new Promise((r) => setTimeout(r, Math.round(1400 / battleSpeed)));
        setT1SpeechBubble(null);
        setT2SpeechBubble(null);
        setActorInMotion(null);
        return;
      }

    if (actionType === 'haki_awakening') {
      const res = executeHakiAwakeningAction(attacker, actorSide, currentRound);
      updateFighterState(actorSide, res.updatedFighter);
      setCombatLogs((prev) => [res.log, ...prev].slice(0, 40));

      audioManager.playCustomHakiSfx(attacker.fighter.id, 'conquerors', 0.95, () => soundManager.playHakiThunder());
      vibrationService.vibrateHakiClash('conqueror', 220);
      triggerParticleBurst(isT1 ? 25 : 75, 45, 'purple', 'haki');
      triggerScreenEdgeFlash('ultimate', 'purple');

      const hakiQuotes = ["ESTE É O PODER DO HAKI DO REI!", "SENTIU A PRESSÃO DO MEU HAKI?!", "AWAKENED SUPREME HAKI!"];
      const hakiQ = hakiQuotes[Math.floor(Math.random() * hakiQuotes.length)];
      if (isT1) {
        setT1SpeechBubble(hakiQ);
      } else {
        setT2SpeechBubble(hakiQ);
      }

      battleAnnouncer.announceAction(attacker.fighter.name, 'Haki Awakening', '覇気覚醒', 'super');
      await new Promise((r) => setTimeout(r, Math.round(1500 / battleSpeed)));
      setT1SpeechBubble(null);
      setT2SpeechBubble(null);
      setActorInMotion(null);
      return;
    }

    if (actionType === 'taunt') {
      // Determine character-specific taunt animation from the expandable library
      const tauntToExecute =
        customTaunt ||
        (isT1 ? selectedPlayerTauntRef.current : null) ||
        getDefaultTauntForFighter(attacker.fighter.id, attacker.fighter.name);

      // 1. Play procedural motion choreography sound effect
      soundManager.playTauntMotionSfx(tauntToExecute.motion);

      // 2. Play distinct procedural crowd reaction sound effect mid-battle
      const currentCrowdIntensity = crowdState?.intensity ?? 75;
      soundManager.playCrowdReaction(tauntToExecute.crowdReaction, Math.round(currentCrowdIntensity));

      // 3. Trigger full-stage visual taunt choreography & Japanese calligraphy banner
      setActiveTauntAnimation({
        side: actorSide,
        fighterId: attacker.fighter.id,
        fighterName: attacker.fighter.name,
        taunt: tauntToExecute,
        startTime: Date.now(),
        durationMs: 2400,
      });

      // 4. Boost crowd excitement & record impact for crowd flashpoints
      if (crowdRecordHitRef.current) {
        crowdRecordHitRef.current({
          timestamp: Date.now(),
          damage: 0,
          isCrit: true,
          isClash: true,
          comboCount: 0,
          side: actorSide,
        });
      }
      crowdState.setIntensity((prev) => Math.min(100, prev + tauntToExecute.crowdExcitementBoost));

      // 5. Execute combat engine taunt update with customized meter gain & log
      const res = executeTauntAction(attacker, actorSide, currentRound, tauntToExecute);
      updateFighterState(actorSide, res.updatedFighter);

      // 6. Impact opponent's focus meter by character-specific focusDrain
      const defenderSide = isT1 ? 'team2' : 'team1';
      const nextDefender = {
        ...defender,
        focusMeter: Math.max(0, (defender.focusMeter ?? 100) - tauntToExecute.focusDrain),
      };
      updateFighterState(defenderSide, nextDefender);

      // 7. Visual floating effect on opponent side indicating focus loss
      triggerFloatingDamage(defenderSide, 0, 'conqueror_burst', `FOCUS LOST -${tauntToExecute.focusDrain}%`);
      triggerCameraShake('light');

      setCombatLogs((prev) => [res.log, ...prev].slice(0, 40));
      setActiveDamagePopup({
        side: actorSide,
        text: `PROVOCATION! +${tauntToExecute.meterGain} METER`,
        isCrit: false,
        isDodged: false,
        isMiss: false,
        isBlocked: false,
        isGuardCrush: false,
        isCounter: false,
      });

      // 8. Speech bubble with authentic Japanese / English quote
      const tauntQ = tauntToExecute.quoteEN || tauntToExecute.quoteJP;
      if (isT1) {
        setT1SpeechBubble(tauntQ);
      } else {
        setT2SpeechBubble(tauntQ);
      }

      // 9. Play custom MP3 taunt audio or AI character voice for specific taunts
      const playedCustomTaunt = audioManager.playCustomTauntSfx(attacker.fighter.id, attacker.fighter.name);
      if (!playedCustomTaunt) {
        characterVoiceManager.playTaunt(attacker.fighter.name, tauntQ);
      }

      // 10. Arcade Announcer Callout
      battleAnnouncer.announceAction(attacker.fighter.name, tauntToExecute.name, tauntToExecute.nameJP, 'taunt');

      // Hold taunt duration respecting battle speed
      await new Promise((r) => setTimeout(r, Math.round(1800 / battleSpeed)));
      setT1SpeechBubble(null);
      setT2SpeechBubble(null);
      setActiveDamagePopup(null);
      setActiveTauntAnimation(null);
      setActorInMotion(null);
      return;
    }

    if (actionType === 'guard') {
      guardActivatedAtRef.current[actorSide] = Date.now();
      const res = executeGuardAction(attacker, actorSide, currentRound);
      updateFighterState(actorSide, res.updatedFighter);
      setCombatLogs((prev) => [res.log, ...prev].slice(0, 40));

      // Synchronize Armament Guard audio and visual effect simultaneously
      audioManager.playCustomHakiSfx(attacker.fighter.id, 'armament', 0.85, () => soundManager.playGuardBlock());
      setTargetBlockedEffect(actorSide);
      vibrationService.vibrateHakiClash('armament', 70);
      triggerParticleBurst(isT1 ? 25 : 75, 45, 'blue', 'haki');

      const guardQuotes = ["GUARDA ABSOLUTA DE ARMAMENTO!", "NÃO VAI PASSAR!", "DURÃO COMO FERRO!"];
      const guardQ = guardQuotes[Math.floor(Math.random() * guardQuotes.length)];
      if (isT1) {
        setT1SpeechBubble(guardQ);
      } else {
        setT2SpeechBubble(guardQ);
      }

      battleAnnouncer.announceAction(attacker.fighter.name, 'Armament Guard', '武装色ガード', 'guard');
      await new Promise((r) => setTimeout(r, Math.round(1350 / battleSpeed)));
      setT1SpeechBubble(null);
      setT2SpeechBubble(null);
      setTargetBlockedEffect(null);
      setActorInMotion(null);
      return;
    }

    if (actionType === 'dodge') {
      const res = executeFutureSightDodge(attacker, actorSide, currentRound);
      updateFighterState(actorSide, res.updatedFighter);
      setCombatLogs((prev) => [res.log, ...prev].slice(0, 40));

      if (res.success) {
        // Synchronize Future Sight Dodge audio and visual effect simultaneously
        audioManager.playCustomHakiSfx(attacker.fighter.id, 'observation', 0.85, () => soundManager.playFutureSight());
        setTargetDodgeEffect(actorSide);
        vibrationService.vibrateHakiClash('observation', 40);
        triggerParticleBurst(isT1 ? 25 : 75, 45, 'red', 'haki');

        const dodgeQuotes = ["EU CONSIGO VER SEUS PASSOS!", "KENBUNSHOKU HAKI ATIVO!", "PREVI COMPLETAMENTE!"];
        const dodgeQ = dodgeQuotes[Math.floor(Math.random() * dodgeQuotes.length)];
        if (isT1) {
          setT1SpeechBubble(dodgeQ);
        } else {
          setT2SpeechBubble(dodgeQ);
        }

        battleAnnouncer.announceAction(attacker.fighter.name, 'Future Sight', '未来視', 'dodge');
        await new Promise((r) => setTimeout(r, Math.round(2500 / battleSpeed)));
      } else {
        // Failed due to Low Focus (< 25%) or Insufficient Haki
        soundManager.playMiss();
        triggerFloatingDamage(actorSide, 0, 'miss', res.reason === 'LOW_FOCUS' ? 'FOCO QUEBRADO!' : 'SEM HAKI!');
        const failQuotes = [
          "MINHA CONCENTRAÇÃO... FALHOU!",
          "PERDI O FOCO! KENBUNSHOKU DESMORONOU!",
          "NÃO CONSIGO ENXERGAR O FUTURO!",
        ];
        const failQ = failQuotes[Math.floor(Math.random() * failQuotes.length)];
        if (isT1) {
          setT1SpeechBubble(failQ);
        } else {
          setT2SpeechBubble(failQ);
        }

        battleAnnouncer.announceAction(attacker.fighter.name, 'Kenbunshoku Falhou', '見聞色無効', 'dodge');
        await new Promise((r) => setTimeout(r, Math.round(1500 / battleSpeed)));
      }

      setT1SpeechBubble(null);
      setT2SpeechBubble(null);
      setTargetDodgeEffect(null);
      setActorInMotion(null);
      return;
    }

    if (actionType === 'move' && move) {
      // Introduce a 150ms visual reaction windup window before damage resolution
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Fetch the latest state of defender after the windup delay
      const defenderSide = actorSide === 'team1' ? 'team2' : 'team1';
      const latestDefender = defenderSide === 'team1' ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];

      // Retrieve when the defender activated guard
      const guardTime = guardActivatedAtRef.current[defenderSide] || 0;
      const isJustGuard = latestDefender.statusEffects.isGuarding && (Date.now() - guardTime <= 100);

      // Trigger screen edge flash for Special Moves and Ultimates using custom Haki style color if configured
      if (move.type === 'super' || move.type === 'finisher' || move.type === 'awakening') {
        const customFlash = (attacker.fighter.hakiAura?.specialEdgeFlashColor as any) || 'gold';
        triggerScreenEdgeFlash('ultimate', customFlash);
      } else if (move.type === 'special' || move.type === 'ex' || move.type === 'command') {
        const customFlash = (attacker.fighter.hakiAura?.specialEdgeFlashColor as any) || (move.type === 'ex' ? 'purple' : 'red');
        triggerScreenEdgeFlash('special', customFlash);
      }

      // Trigger character move MP3 audio if available
      audioManager.playCustomMoveSfx(
        attacker.fighter.id,
        move.id,
        move.name,
        move.type
      );

      // Pre-calculate combo for executeMoveAction early
      const isContinuingCombo =
        activeCombo &&
        activeCombo.activeSide === actorSide &&
        !activeCombo.isEnding &&
        Date.now() - activeCombo.lastHitTime < 3200 / battleSpeed;

      const currentMultiplier = isContinuingCombo ? activeCombo.multiplier : 1.0;
      const currentHits = isContinuingCombo ? activeCombo.hits : 0;

      const result = executeMoveAction(
        attacker,
        latestDefender,
        move,
        currentRound,
        actorSide,
        stage,
        currentMultiplier,
        false,
        currentHits,
        isJustGuard
      );

      // Trigger move shouting bubbles or Katakuri/Enel prediction
      const defenderNameLower = (defender?.fighter?.name || '').toLowerCase();
      const isDefenderKatakuri = defenderNameLower.includes('katakuri');
      const isDefenderEnel = defenderNameLower.includes('enel');
      let predictionTriggered = false;

      if (result.log.isFutureSightDodge && (isDefenderKatakuri || isDefenderEnel)) {
        predictionTriggered = true;
        
        // Extract a shorter name for the move if it contains descriptive parentheses or quotes
        const shortMoveName = move.name.split(' (')[0].split(' "')[0];
        
        const predictMsgNode = isDefenderEnel ? (
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] text-yellow-600 font-bold uppercase tracking-wider mb-0.5 animate-pulse">
              ⚡ MANTRA
            </span>
            <span className="text-zinc-900 font-black leading-tight text-center">
              {`MANTRA: Você pretende me atacar com ${shortMoveName}!`}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] text-red-600 font-bold uppercase tracking-wider mb-0.5 animate-pulse">
              👁️ Predicted Move
            </span>
            <span className="text-zinc-900 font-black leading-tight">
              {`Você vai lançar o ${shortMoveName}... eu já previ.`}
            </span>
          </div>
        );
        
        try {
          // Request AI-generated TTS from the server or use cache via the centralized manager
          if (isDefenderEnel) {
            characterVoiceManager.playEnelPrediction(shortMoveName);
          } else {
            characterVoiceManager.playKatakuriPrediction(shortMoveName, move.nameJP);
          }
        } catch (e) {
          console.warn("TTS unavailable", e);
        }

        if (isT1) {
          setT2SpeechBubble(predictMsgNode);
          setT1SpeechBubble(null);
        } else {
          setT1SpeechBubble(predictMsgNode);
          setT2SpeechBubble(null);
        }
        
        // Pause combat execution for prediction before the hit resolves
        await new Promise((r) => setTimeout(r, Math.round(2500 / battleSpeed)));
      } else {
        const moveShout = getMoveShout(move.name);
        if (isT1) {
          setT1SpeechBubble(moveShout);
        } else {
          setT2SpeechBubble(moveShout);
        }
      }

      // Check Super Move Cut-in (Minimalist Transparent Glow Presentation)
      if (move.type === 'super' || move.type === 'ex') {
        soundManager.playSuperCharge();
        vibrationService.vibrateUltimateMove('charge', move.name);
        setActiveSuperCutin({
          fighterName: attacker.fighter.name,
          moveName: move.name,
          moveNameJP: move.nameJP,
          color: attacker.fighter.themeColor,
        });
        await new Promise((r) => setTimeout(r, Math.round(1800 / battleSpeed)));
        setActiveSuperCutin(null);
      }

      // Detect if Conqueror's Haki is activated by the move or clash
      const moveNameLower = (move?.name || '').toLowerCase();
      const moveDescLower = (move?.description || '').toLowerCase();
      const isConquerorHakiMove = 
        result.log.isHakiClash || 
        ((move?.hakiInfused || 
          moveNameLower.includes('conqueror') || 
          moveNameLower.includes('haoshoku') || 
          moveDescLower.includes('conqueror') || 
          moveDescLower.includes('haoshoku')) && 
         (attacker?.fighter?.haki?.conqueror || 0) >= 60);

      if (isConquerorHakiMove) {
        setConquerorFlash(true);
        setTimeout(() => setConquerorFlash(false), 300);
      }

      // Calculate coordinates and context for Particle Impacts
      const impactX = isT1 ? 72 : 28;
      const impactY = 45;
      const targetSide = isT1 ? 'team2' : 'team1';

      // Event-driven sound AND visual effects triggers synchronized at impact moment
      const actorShort = attacker.fighter.shortName || attacker.fighter.name.split(' ')[0];
      const targetShort = defender.fighter.shortName || defender.fighter.name.split(' ')[0];
      const moveShort = getMoveShortName(move.name);

      let intensity: 'aggressive' | 'calm' | 'normal' = 'normal';
      if (move.baseDamage >= 50 || move.type === 'super' || move.type === 'finisher' || result.log.isHakiClash || result.log.isGuardCrush || result.isGameOver) {
        intensity = 'aggressive';
      } else if (result.log.isDodged || result.log.isBlocked || result.log.isMiss) {
        intensity = 'calm';
      }

      if (result.log.isHakiClash) {
        setHakiClashActive(true);
        crowdState.setIntensity(100);
        audioManager.playCustomHakiSfx(attacker.fighter.id, 'clash', 0.85, () => soundManager.playHakiThunder());
        triggerCameraShake('heavy');
        vibrationService.vibrateHakiClash(attacker.fighter.haki.conqueror >= 60 ? 'conqueror' : 'armament', result.log.damage);
        setTimeout(() => setHakiClashActive(false), 900);
        triggerParticleBurst(50, 45, 'purple', 'clash');
        triggerParticleBurst(50, 45, 'red', 'clash');
        speakAnnouncer(`${actorShort} and ${targetShort} clash Haki!`, intensity);
        
        // Pause battle and trigger D3 tension bar QTE
        setIsPaused(true);
        setIsHakiClashQteActive(true);
      } else if (result.log.isCounter) {
        setTargetHitFlinch(targetSide);
        const isHeavyHakiCounter = move.hakiInfused && (move.baseDamage >= 25 || move.type === 'special' || move.type === 'super' || move.type === 'ex');
        
        if (isHeavyHakiCounter) {
          audioManager.playCustomHakiSfx(attacker.fighter.id, 'armament', 1.0, () => soundManager.playHeavyCounterClash(1.0));
          triggerCameraShake('heavy');
          vibrationService.vibrateHakiClash('armament', result.log.damage);
        } else {
          audioManager.playCustomHakiSfx(attacker.fighter.id, 'armament', 0.85, () => soundManager.playCounterAttack());
          triggerCameraShake('light');
          vibrationService.vibrate('medium');
        }
        
        triggerParticleBurst(impactX, impactY, 'amber', 'haki');
        if (result.log.isCrit) {
          speakAnnouncer(`${actorShort} critical counterattacks ${moveShort}!`, intensity);
        } else {
          speakAnnouncer(`${actorShort} counterattacks ${moveShort}!`, intensity);
        }
      } else if (result.log.isGuardCrush) {
        setTargetHitFlinch(targetSide);
        soundManager.playGuardCrush();
        triggerCameraShake('heavy');
        triggerParticleBurst(impactX, impactY, 'amber', 'critical');
        vibrationService.vibrate('guardCrush');
        speakAnnouncer(`${actorShort} guard crushes with ${moveShort}!`, intensity);
      } else if (result.log.isJustGuard) {
        setTargetBlockedEffect(targetSide);
        setTargetHitFlinch(targetSide);
        soundManager.playParry();
        setTargetHitFlinch(actorSide);
        triggerCameraShake('medium');
        triggerParticleBurst(impactX, impactY, 'cyan', 'critical');
        triggerParticleBurst(impactX, impactY, 'amber', 'critical');
        vibrationService.vibrate('medium');
        triggerFloatingDamage(targetSide, 0, 'conqueror_burst', '★ PERFECT PARRY ★');
        triggerFloatingDamage(actorSide, 0, 'miss', '⚡ STUNNED! ⚡');
        speakAnnouncer(`${targetShort} flawlessly parries ${actorShort}!`, intensity);

        const parryQuotes = ["Just Guard! ⚡", "Flawless parry!", "Perfect timing!"];
        const attackerQuotes = ["Gah! My posture is broken!", "Ugh, what reflexes!", "No way! Flawlessly parried!"];
        const pQuote = parryQuotes[Math.floor(Math.random() * parryQuotes.length)];
        const aQuote = attackerQuotes[Math.floor(Math.random() * attackerQuotes.length)];
        
        if (isT1) {
          setT2SpeechBubble(pQuote);
          setT1SpeechBubble(aQuote);
        } else {
          setT1SpeechBubble(pQuote);
          setT2SpeechBubble(aQuote);
        }
        
        setTimeout(() => {
          setT1SpeechBubble(null);
          setT2SpeechBubble(null);
        }, 1800);
      } else if (result.log.isBlocked) {
        setTargetBlockedEffect(targetSide);
        setTargetHitFlinch(targetSide);
        audioManager.playCustomHakiSfx(defender.fighter.id, 'armament', 0.85, () => soundManager.playGuardBlock());
        triggerParticleBurst(impactX, impactY, 'blue', 'haki');
        vibrationService.vibrate('light');
        if (!result.log.damage || result.log.damage === 0) {
          speakAnnouncer(`${targetShort} perfect guards ${moveShort}!`, intensity);
        } else {
          speakAnnouncer(`${targetShort} guards ${moveShort}!`, intensity);
        }
      } else if (result.log.isDodged) {
        // Frame-perfect synchronized Observation Haki Dodge sound and eye aura visual or rapid evasion whoosh
        setTargetDodgeEffect(targetSide);
        if (result.log.isFutureSightDodge) {
          setFutureSightRipple(targetSide);
          setTimeout(() => setFutureSightRipple(null), Math.round(3200 / battleSpeed));
          audioManager.playCustomHakiSfx(defender.fighter.id, 'observation', 0.85, () => soundManager.playFutureSight());
          triggerParticleBurst(impactX, impactY, 'red', 'haki');
        } else {
          soundManager.playDodge();
          triggerParticleBurst(impactX, impactY, 'gray', 'haki');
        }
        
        // Prevent too many repetitions of FUTURE DODGE in TTS
        const shouldAnnounceFutureSight = Math.random() < 0.20;
        if (shouldAnnounceFutureSight && result.log.isFutureSightDodge) {
          speakAnnouncer("Future Sight Dodge!", intensity);
        } else {
          speakAnnouncer(`${targetShort} dodges ${moveShort}!`, intensity);
        }
      } else if (result.log.isMiss) {
        setTargetDodgeEffect(targetSide);
        soundManager.playDodge();
        speakAnnouncer(`${actorShort} whiffs ${moveShort}!`, intensity);
      } else if (result.log.isCrit) {
        setTargetHitFlinch(targetSide);
        soundManager.playCriticalStrike();
        const critShake = result.log.damage >= 140 ? 'heavy' : 'medium';
        triggerCameraShake(critShake);
        vibrationService.vibrate(result.isGameOver ? 'ko' : 'crit');
        if (isT1) {
          setT1CritActive(true);
          setTimeout(() => setT1CritActive(false), Math.max(800, 2000 / battleSpeedRef.current));
        } else {
          setT2CritActive(true);
          setTimeout(() => setT2CritActive(false), Math.max(800, 2000 / battleSpeedRef.current));
        }
        const hasConqueror = attacker.fighter.haki.conqueror >= 60;
        triggerParticleBurst(impactX, impactY, hasConqueror ? 'purple' : 'red', 'critical');
        speakAnnouncer(`${actorShort} critical strikes with ${moveShort}!`, intensity);
      } else if (move.type === 'super' && result.isGameOver) {
        setTargetHitFlinch(targetSide);
        soundManager.playUltimateFinisher();
        triggerCameraShake('heavy');
        triggerImpactZoom();
        triggerParticleBurst(impactX, impactY, 'purple', 'clash');
        triggerParticleBurst(impactX, impactY, 'red', 'clash');
        vibrationService.vibrateUltimateMove('finisher', move.name);
      } else if (move?.element?.toLowerCase().includes('slash')) {
        setTargetHitFlinch(targetSide);
        soundManager.playSlash();
        const slashShake = result.log.damage >= 150 ? 'heavy' : result.log.damage >= 80 ? 'medium' : 'light';
        triggerCameraShake(slashShake);
        triggerParticleBurst(impactX, impactY, 'amber', 'haki');
        vibrationService.vibrate(result.log.damage >= 120 ? 'heavy' : 'medium');
      } else {
        setTargetHitFlinch(targetSide);
        soundManager.playHit(move.type === 'special' ? 'heavy' : 'medium');
        if (move.type === 'super') {
          vibrationService.vibrateUltimateMove('impact', move.name);
        } else {
          vibrationService.vibrate(move.type === 'special' ? 'super' : (move.type === 'command' ? 'heavy' : 'light'));
        }
        
        const impactShake = result.log.damage >= 150 || move.type === 'super'
          ? 'heavy'
          : move.type === 'special' || move.type === 'command' || result.log.damage >= 75
          ? 'medium'
          : 'light';
        triggerCameraShake(impactShake);

        if (move.type === 'super') {
          triggerParticleBurst(impactX, impactY, 'purple', 'haki');
        } else {
          // Standard move hit
          const attackerHasArmament = attacker.fighter.haki.armament >= 40;
          triggerParticleBurst(impactX, impactY, attackerHasArmament ? 'red' : 'gray', 'haki');
        }
      }

      // KOF-Style Hit-Stop: 0.05-second (50ms) pause in the engine loop on successful connection of high-damage Ultimate Move
      const isUltimateMove = move.type === 'super' || move.type === 'finisher' || move.baseDamage >= 50 || result.log.damage >= 100;
      const isHitConnected = !result.log.isDodged && !result.log.isMiss;
      if (isUltimateMove && isHitConnected) {
        await triggerHitStop(50);
      }

      // Check for low HP impact zoom (< 25% HP threshold)
      const prevDefenderHp = defender.currentHp;
      const newDefenderHp = result.updatedDefender.currentHp;
      if (prevDefenderHp > defender.maxHp * 0.25 && newDefenderHp <= defender.maxHp * 0.25 && newDefenderHp > 0) {
        triggerImpactZoom();
      }

      // Dynamic Speech Bubble Responses based on Outcome
      if (result.log.isDodged || result.log.isMiss) {
        if (!predictionTriggered) {
          const defenderDodgeQuotes = ["Previsível! 👁️", "Muito lento!", "Previ seu movimento!", "Fácil demais!"];
          const attackerFrustratedQuotes = ["Impossível!", "Rápido demais!", "Maldito!", "Como ele previu?!", "Tsc... esquivou!"];
          
          const defQ = defenderDodgeQuotes[Math.floor(Math.random() * defenderDodgeQuotes.length)];
          const atkQ = attackerFrustratedQuotes[Math.floor(Math.random() * attackerFrustratedQuotes.length)];
          
          if (isT1) {
            setT2SpeechBubble(defQ);
            setT1SpeechBubble(atkQ);
          } else {
            setT1SpeechBubble(defQ);
            setT2SpeechBubble(atkQ);
          }
        }
      } else if (result.log.isGuardCrush) {
        const crusherQuotes = ["Sua defesa é inútil!", "Esboroe-se!", "Quebra de guarda total!"];
        const crushQ = crusherQuotes[Math.floor(Math.random() * crusherQuotes.length)];
        
        if (isT1) {
          setT1SpeechBubble(crushQ);
          setT2SpeechBubble("Minha guarda... Gah!");
        } else {
          setT2SpeechBubble(crushQ);
          setT1SpeechBubble("Minha guarda... Gah!");
        }
      } else if (result.log.isBlocked) {
        const defenderBlockQuotes = ["Firme como ferro! 🛡️", "Não vai passar!", "Bloqueio absoluto!"];
        const attackerRespectQuotes = ["Que defesa!", "Bela guarda!", "Maldito bloqueio!"];
        
        const defQ = defenderBlockQuotes[Math.floor(Math.random() * defenderBlockQuotes.length)];
        const atkQ = attackerRespectQuotes[Math.floor(Math.random() * attackerRespectQuotes.length)];
        
        if (isT1) {
          setT2SpeechBubble(defQ);
          setT1SpeechBubble(atkQ);
        } else {
          setT1SpeechBubble(defQ);
          setT2SpeechBubble(atkQ);
        }
      } else {
        // Direct Hit! Defender shouts in pain.
        const painQuotes = ["Argh!", "Gah!", "Que força incrível!", "Maldito...", "Tsc... belo golpe!"];
        const painQ = painQuotes[Math.floor(Math.random() * painQuotes.length)];
        
        if (isT1) {
          setT2SpeechBubble(painQ);
        } else {
          setT1SpeechBubble(painQ);
        }

        // Occasional background character laughter/taunt trigger during battle (10% probability)
        const shouldTriggerTauntLaugh = Math.random() < 0.70;
        if (shouldTriggerTauntLaugh) {
          setTimeout(() => {
            const playedTaunt = audioManager.playBackgroundTauntSfx(attacker.fighter.id, attacker.fighter.name, 0.65);
            if (playedTaunt) {
              const laughText = getFighterLaughText(attacker.fighter.id);
              if (isT1) {
                setT1SpeechBubble(laughText);
              } else {
                setT2SpeechBubble(laughText);
              }
            }
          }, 450);
        }
      }

      // Combo Tracking & Sound Effects
      if (result.log.isDodged || result.log.isMiss) {
        if (activeCombo) {
          setActiveCombo((prev) => (prev ? { ...prev, isEnding: true } : null));
          if (comboDecayTimeoutRef.current) clearTimeout(comboDecayTimeoutRef.current);
          comboDecayTimeoutRef.current = setTimeout(() => setActiveCombo(null), 600);
        }
      } else {
        const addedHits = result.log.comboCount;
        const newTotalHits = isContinuingCombo ? activeCombo.hits + addedHits : addedHits;
        const newTotalDamage = isContinuingCombo
          ? activeCombo.accumulatedDamage + result.log.damage
          : result.log.damage;
        const nextMultiplier = getComboMultiplier(newTotalHits);

        const defenderMaxHp = defender.maxHp || 1000;
        const totalDamagePct = Math.min(100, Math.round(((newTotalDamage / defenderMaxHp) * 100) * 10) / 10);

        const updatedCombo: ActiveComboState = {
          activeSide: actorSide,
          hits: newTotalHits,
          accumulatedDamage: newTotalDamage,
          multiplier: nextMultiplier,
          lastHitTime: Date.now(),
          recentHitIncrement: addedHits,
          isEnding: false,
          actorName: attacker.fighter.name,
          hakiMultiplier: result.log.hakiMultiplier,
          targetMaxHp: defenderMaxHp,
          damagePercentage: totalDamagePct,
        };

        setActiveCombo(updatedCombo);

        // Sound trigger for combo streaks
        if (newTotalHits === 2 || newTotalHits === 3) {
          soundManager.playDoubleHit();
        } else if (newTotalHits >= 4 && newTotalHits <= 7) {
          soundManager.playTripleHit();
        }

        if (newTotalHits === 5 || newTotalHits === 10 || newTotalHits === 20) {
          characterVoiceManager.playComboMilestoneVoice(newTotalHits);
        } else if (newTotalHits >= 8 && newTotalHits !== 10 && newTotalHits !== 20) {
          soundManager.playComboMilestone(newTotalHits);
        } else if (newTotalHits < 5) {
          soundManager.playComboHit(newTotalHits);
        }

        // Reset decay timeout
        if (comboDecayTimeoutRef.current) clearTimeout(comboDecayTimeoutRef.current);
        comboDecayTimeoutRef.current = setTimeout(() => {
          setActiveCombo((prev) => (prev ? { ...prev, isEnding: true } : null));
          setTimeout(() => setActiveCombo(null), 700);
        }, 2800 / battleSpeed);

        // Update stats for CombatMomentumD3 panel
        if (isT1) {
          if (result.log.isCrit) setT1CritCount((prev) => prev + 1);
          if (move.hakiInfused || attacker.isHakiAwakened || result.log.isHakiClash) {
            setT1HakiCount((prev) => prev + 1);
          }
          if (result.log.damage > 0) {
            setT1DamageDealt((prev) => prev + result.log.damage);
          }
        } else {
          if (result.log.isCrit) setT2CritCount((prev) => prev + 1);
          if (move.hakiInfused || attacker.isHakiAwakened || result.log.isHakiClash) {
            setT2HakiCount((prev) => prev + 1);
          }
          if (result.log.damage > 0) {
            setT2DamageDealt((prev) => prev + result.log.damage);
          }
        }
      }

      // Show sleek floating damage popup (framer-motion) rising from target's position
      if (!result.log.isDodged) {
        let dmgType: DamageType = 'physical';

        if (result.log.isHakiClash || isConquerorHakiMove || attacker.fighter.haki.conqueror >= 60) {
          dmgType = 'conqueror_burst'; // Purple for Conqueror
        } else if (
          attacker.isHakiAwakened ||
          move.hakiInfused ||
          attacker.fighter.haki.armament >= 50 ||
          result.log.isCrit
        ) {
          dmgType = 'haki'; // Red for Armament
        } else if (
          move.element ||
          move.type === 'special' ||
          move.type === 'super' ||
          move.type === 'ex' ||
          move.type === 'finisher' ||
          attacker.fighter.devilFruit
        ) {
          dmgType = 'devil_fruit'; // Gold for Devil Fruit
        } else if (result.log.isBlocked) {
          dmgType = 'guarded';
        } else if (result.log.isMiss) {
          dmgType = 'miss';
        } else {
          dmgType = 'physical'; // White for physical
        }

        const customText = result.log.isMiss
          ? 'WHIFF / 空振り'
          : result.log.isCounter
          ? `COUNTER! -${result.log.damage}`
          : result.log.isGuardCrush
          ? `GUARD CRUSH! -${result.log.damage}`
          : result.log.isBlocked
          ? `GUARDED -${result.log.damage}`
          : `-${result.log.damage}`;

        triggerFloatingDamage(
          targetSide,
          result.log.damage,
          dmgType,
          customText,
          result.log.hakiMultiplier,
          result.log.comboCount
        );
      }

      // Check Awakening Triggers (HP <= 25%) for defender & attacker
      const defAwakening = checkAwakeningTrigger(result.updatedDefender);
      if (defAwakening.didTrigger && defAwakening.awakeningProfile) {
        result.updatedDefender = defAwakening.updatedState;
        triggerAwakeningSequence(targetSide, defAwakening.updatedState, defAwakening.awakeningProfile);
      }

      const atkAwakening = checkAwakeningTrigger(result.updatedAttacker);
      if (atkAwakening.didTrigger && atkAwakening.awakeningProfile) {
        result.updatedAttacker = atkAwakening.updatedState;
        triggerAwakeningSequence(actorSide, atkAwakening.updatedState, atkAwakening.awakeningProfile);
      }

      // Update fighter state & combat logs
      updateFighterState(actorSide, result.updatedAttacker);
      updateFighterState(targetSide, result.updatedDefender);
      setCombatLogs((prev) => [result.log, ...prev].slice(0, 40));

      // Trigger contextual play-by-play commentary ONLY on key highlight moments
      if (result.log.isHakiClash) {
        triggerAiPlayByPlayCommentary(result.log, 'HAKI_CLASH', true);
      } else if (result.log.isDodged || result.log.isFutureSightDodge) {
        triggerAiPlayByPlayCommentary(result.log, 'DODGE');
      } else if (result.log.isGuardCrush) {
        triggerAiPlayByPlayCommentary(result.log, 'GUARD_CRUSH');
      } else if (result.updatedAttacker.currentHp <= 250 && result.log.damage >= 70) {
        triggerAiPlayByPlayCommentary(result.log, 'CLUTCH_COMEBACK');
      } else if (result.log.damage >= 80 || result.log.isCrit || (result.log.moveType === 'super' && result.log.damage >= 45)) {
        triggerAiPlayByPlayCommentary(result.log, 'SUPER_HIT');
      }

      // Trigger destructible environmental prop physical impact
      if (result.log.damage > 0) {
        triggerEnvironmentalImpact(result.log.damage);
      }

      // Real-time Match Achievement Evaluation
      const { newAchievements: newlyUnlocked, updatedTracker } = evaluateCombatAchievements(
        result.log,
        result.updatedAttacker,
        result.updatedDefender,
        achievementTrackerRef.current,
        result.updatedAttacker.currentHp <= 0 || result.updatedDefender.currentHp <= 0
      );
      
      achievementTrackerRef.current = updatedTracker;

      if (newlyUnlocked?.length > 0) {
        setUnlockedAchievements((prev) => [...prev, ...newlyUnlocked]);
        setLatestAchievement(newlyUnlocked[newlyUnlocked?.length - 1]);
        soundManager.playAchievementUnlock();
      }

      // Determine category for strictly formatted sequential narration
      let actionCat:
        | 'attack'
        | 'crit'
        | 'super'
        | 'dodge'
        | 'guard'
        | 'miss'
        | 'counter'
        | 'taunt'
        | 'ko'
        | 'clash'
        | 'guard_crush' = 'attack';

      if (result.isGameOver) {
        actionCat = 'ko';
      } else if (result.log.isHakiClash) {
        actionCat = 'clash';
      } else if (result.log.isCounter) {
        const isHeavyHakiCounter = move.hakiInfused && (move.baseDamage >= 25 || move.type === 'special' || move.type === 'super' || move.type === 'ex');
        if (isHeavyHakiCounter) {
          soundManager.playHeavyCounterClash(1.0);
        } else {
          soundManager.playCounterAttack();
        }
        actionCat = 'counter';
      } else if (result.log.isGuardCrush) {
        actionCat = 'guard_crush';
      } else if (result.log.isDodged) {
        actionCat = 'dodge';
      } else if (result.log.isMiss) {
        actionCat = 'miss';
      } else if (result.log.isBlocked) {
        actionCat = 'guard';
      } else if (move.type === 'super') {
        actionCat = 'super';
      } else if (result.log.isCrit) {
        actionCat = 'crit';
      }

      // Sequential narration promise - execution is non-blocking so game continues smoothly!
      battleAnnouncer.announceAction(
        attacker.fighter.name,
        move.name,
        move.nameJP,
        actionCat
      );

      // AI Commentary Trigger for significant events
      if (
        actionCat === 'super' || 
        actionCat === 'ko' || 
        actionCat === 'clash' || 
        actionCat === 'guard_crush' ||
        (activeCombo?.totalHits || 0) >= 5
      ) {
        characterVoiceManager.playDynamicCommentary({
          eventType: actionCat.toUpperCase(),
          lastAction: result.log,
          comboHits: activeCombo?.totalHits,
          damageDealt: result.log.damage,
          roundNumber: currentRound
        });
      }

      // Animation delay - normal comfortable cadence so moves, hits, damage popups and quotes can be fully enjoyed
      const animDelay = move.type === 'super' || move.type === 'awakening' || move.type === 'finisher'
        ? Math.round(1800 / battleSpeed)
        : Math.round(1250 / battleSpeed);
      await new Promise((r) => setTimeout(r, animDelay));
      setActorInMotion(null);
      setTargetHitFlinch(null);
      setTargetDodgeEffect(null);
      setTargetBlockedEffect(null);
      setActiveDamagePopup(null);
      setT1SpeechBubble(null);
      setT2SpeechBubble(null);

      // Check if fighter was defeated (K.O.)
      const defHp = result.updatedDefender.currentHp;
      const attHp = result.updatedAttacker.currentHp;
      if (result.isGameOver || defHp <= 0 || attHp <= 0) {
        if (comboDecayTimeoutRef.current) clearTimeout(comboDecayTimeoutRef.current);
        setActiveCombo((prev) => (prev ? { ...prev, isEnding: true } : null));
        setTimeout(() => setActiveCombo(null), 800);
        if (defHp <= 0 && attHp <= 0) {
          handleDoubleKORef.current?.(result.log);
        } else if (defHp <= 0) {
          handleFighterKORef.current?.(targetSide, result.log);
        } else {
          handleFighterKORef.current?.(actorSide, result.log);
        }
      }
    }
  } finally {
    if (isT1) {
      t1ActingRef.current = false;
      setIsT1InRecovery(false);
    } else {
      t2ActingRef.current = false;
    }
  }
  };

  // Rate-limiting refs to prevent rapid multi-click request spam
  const lastManualActionTimeRef = useRef<number>(0);
  const isManualActionPendingRef = useRef<boolean>(false);

  // Assign current function refs
  executeActionTurnRef.current = executeActionTurn;
  switchStanceRef.current = switchStance;

  const handleStanceChange = useCallback((newStance: CombatStance) => {
    if (isPaused || isMatchOverRef.current) return;
    vibrationService.vibrate('light');
    setT1FighterStates(prev => {
      const idx = t1IdxRef.current;
      const next = [...prev];
      next[idx] = { ...next[idx], currentStance: newStance };
      return next;
    });
    // Visual feedback for stance change
    const emoji = newStance === 'offensive' ? '🔥' : newStance === 'defensive' ? '🛡️' : '⚖️';
    triggerParticleBurst(25, 45, newStance === 'offensive' ? 'red' : newStance === 'defensive' ? 'blue' : 'amber', 'haki');
    soundManager.playPowerUp();
  }, [isPaused]);

  // Player Manual Form Shift Handler
  const handlePlayerInitiateShift = useCallback((transformation: Transformation) => {
    if (isTransformingRef.current || isMatchOverRef.current) return;
    const currentRoundTurnCount = combatLogs.filter((log) => log.roundNumber === currentRound).length;
    triggerTransformation(
      'team1',
      transformation,
      setT1FighterStates,
      t1IdxRef.current,
      t1StatesRef,
      (paused) => {
        setIsPaused(paused);
        isPausedRef.current = paused;
      },
      currentRoundTurnCount
    );
  }, [combatLogs, currentRound, triggerTransformation]);

  // Player Manual Form Revert Handler
  const handlePlayerRevertShift = useCallback(() => {
    if (isTransformingRef.current || isMatchOverRef.current) return;
    const currentRoundTurnCount = combatLogs.filter((log) => log.roundNumber === currentRound).length;
    revertTransformationForm(
      'team1',
      setT1FighterStates,
      t1IdxRef.current,
      t1StatesRef,
      currentRoundTurnCount
    );
  }, [combatLogs, currentRound, revertTransformationForm]);

  const handleManualPlayerAction = useCallback((
    actionType: 'move' | 'guard' | 'dodge' | 'max_mode' | 'taunt' | 'finisher' | 'haki_awakening',
    move?: Move,
    customTaunt?: BattleTauntAnimation
  ) => {
    const now = Date.now();
    const isDyn = battleModeRef.current !== 'classic_turn';

    const currentT1 = t1StatesRef.current[t1IdxRef.current];
    if ((currentT1?.statusEffects?.isStunned || 0) > 0) {
      triggerFloatingDamage('team1', 0, 'miss', 'STUNNED! CANNOT ACT!');
      soundManager.playStunSound();
      return;
    }

    // In Dynamic Mode: players move and attack freely without waiting for turns!
    if (isDyn) {
      if (t1ActingRef.current || isMatchOverRef.current) {
        return;
      }
      // Deliberate command threshold (450ms) - ensures deliberate pacing and stops frantic input spam
      if (now - lastManualActionTimeRef.current < 450) {
        return;
      }

      lastManualActionTimeRef.current = now;

      (async () => {
        t1ActingRef.current = true;
        try {
          if (actionType === 'finisher' && move) {
            await triggerCinematicFinisher('team1', move);
          } else {
            await executeActionTurn(
              'team1',
              actionType,
              move,
              customTaunt || selectedPlayerTauntRef.current || undefined
            );
          }
        } catch (err) {
          console.error('Error during dynamic player action:', err);
        } finally {
          t1ActingRef.current = false;
          setIsT1InRecovery(false);
        }
      })();
      return;
    }

    // Classic Turn-Based Mode: wait for player turn, then opponent responds
    if (isExecutingTurn.current || isManualActionPendingRef.current || isMatchOverRef.current) {
      return;
    }
    if (now - lastManualActionTimeRef.current < 400) {
      return;
    }

    lastManualActionTimeRef.current = now;
    isManualActionPendingRef.current = true;
    isExecutingTurn.current = true;

    (async () => {
      try {
        if (actionType === 'finisher' && move) {
          await triggerCinematicFinisher('team1', move);
        } else {
          await executeActionTurn(
            'team1',
            actionType,
            move,
            customTaunt || selectedPlayerTauntRef.current || undefined
          );
        }

        const curT2 = t2StatesRef.current[t2IdxRef.current];
        const curT1 = t1StatesRef.current[t1IdxRef.current];

        if (curT2 && curT2.currentHp > 0 && !isMatchOverRef.current) {
          await new Promise((r) => setTimeout(r, Math.round(1800 / battleSpeed)));
          
          const choice = getSmartAiMoveChoice(curT2, curT1, 'hard');
          if (choice.desiredStance && choice.desiredStance !== curT2.currentStance) {
            switchStance('team2', choice.desiredStance);
          }
          await executeActionTurn('team2', choice.action, choice.selectedMove);
        }
      } catch (err) {
        console.error('Error during manual player action:', err);
      } finally {
        isExecutingTurn.current = false;
        isManualActionPendingRef.current = false;
      }
    })();
  }, [battleSpeed, activeT1State]);

  // Gamepad & Keyboard Controller References & Listeners
  const prevGamepadButtonsRef = useRef<boolean[]>([]);
  const gamepadMappingRef = useRef<GamepadMapping>(DEFAULT_GAMEPAD_MAPPING);
  const keyboardMappingRef = useRef<KeyboardMapping>(DEFAULT_KEYBOARD_MAPPING);
  const p2KeyboardMappingRef = useRef<KeyboardMapping>(DEFAULT_P2_KEYBOARD_MAPPING);

  const lastManualP2ActionTimeRef = useRef<number>(0);

  // Load Mapping from Profile
  useEffect(() => {
    const prof = getUserProfile();
    if (prof.gamepadMapping) {
      gamepadMappingRef.current = prof.gamepadMapping;
    }
    if (prof.keyboardMapping) {
      keyboardMappingRef.current = prof.keyboardMapping;
    }
    if (prof.p2KeyboardMapping) {
      p2KeyboardMappingRef.current = prof.p2KeyboardMapping;
    }
  }, [showSettingsModal]);

  // Synchronized continuous Audio Feedback for Stunned State
  useEffect(() => {
    const t1Stunned = (activeT1State?.statusEffects?.isStunned || 0) > 0;
    const t2Stunned = (activeT2State?.statusEffects?.isStunned || 0) > 0;

    if (!t1Stunned && !t2Stunned) return;

    // Trigger synchronized dizzy stun resonance immediately upon entering stun
    soundManager.playStunSound();

    // Pulse synchronized audio tone periodically until stun ends
    const interval = setInterval(() => {
      soundManager.playStunSound();
    }, 1800);

    return () => clearInterval(interval);
  }, [activeT1State?.statusEffects?.isStunned, activeT2State?.statusEffects?.isStunned]);

  const handleManualPlayer2Action = useCallback((
    actionType: 'move' | 'guard' | 'dodge' | 'max_mode' | 'taunt' | 'finisher' | 'haki_awakening',
    move?: Move,
    customTaunt?: BattleTauntAnimation
  ) => {
    const now = Date.now();
    const isDyn = battleModeRef.current !== 'classic_turn';

    const currentT2 = t2StatesRef.current[t2IdxRef.current];
    if ((currentT2?.statusEffects?.isStunned || 0) > 0) {
      triggerFloatingDamage('team2', 0, 'miss', 'STUNNED! CANNOT ACT!');
      soundManager.playStunSound();
      return;
    }

    if (isDyn) {
      if (t2ActingRef.current || isMatchOverRef.current) return;
      if (now - lastManualP2ActionTimeRef.current < 450) return;
      lastManualP2ActionTimeRef.current = now;

      (async () => {
        t2ActingRef.current = true;
        try {
          if (actionType === 'finisher' && move) {
            await triggerCinematicFinisher('team2', move);
          } else {
            await executeActionTurn('team2', actionType, move, customTaunt);
          }
        } catch (err) {
          console.error('Error during P2 action:', err);
        } finally {
          t2ActingRef.current = false;
        }
      })();
      return;
    }

    if (isExecutingTurn.current || isMatchOverRef.current) return;
    if (now - lastManualP2ActionTimeRef.current < 400) return;

    lastManualP2ActionTimeRef.current = now;
    isExecutingTurn.current = true;

    (async () => {
      try {
        if (actionType === 'finisher' && move) {
          await triggerCinematicFinisher('team2', move);
        } else {
          await executeActionTurn('team2', actionType, move, customTaunt);
        }
      } catch (err) {
        console.error('Error during P2 action:', err);
      } finally {
        isExecutingTurn.current = false;
      }
    })();
  }, [battleSpeed, executeActionTurn, triggerCinematicFinisher]);

  // Keyboard Battle Shortcuts Event Listener (Dual Player Local Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in text inputs or textareas
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const code = e.code || e.key;
      const kMapping = keyboardMappingRef.current;
      const p2Mapping = p2KeyboardMappingRef.current;

      // Toggle Pause (P1 or P2 pause key)
      if (code === kMapping.pauseKey || code === p2Mapping.pauseKey) {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isAutoPlayRef.current || isMatchOverRef.current || isPaused) return;

      // Handle interactive Haki Clash rapid-tap if active
      const hakiClashOpen = document.getElementById('haki-clash-rapid-tap-btn') !== null;
      if (hakiClashOpen) {
        return; // Haki clash handles its own space keydown listener
      }

      // ────────────────── PLAYER 1 INPUTS ──────────────────
      if (code === kMapping.guardKey) {
        handleManualPlayerAction('guard');
      } else if (code === kMapping.dodgeKey) {
        handleManualPlayerAction('dodge');
      } else if (code === kMapping.tauntKey) {
        handleManualPlayerAction('taunt');
      } else if (code === kMapping.maxModeKey) {
        handleManualPlayerAction('max_mode');
      } else if (code === kMapping.finisherKey) {
        const finisher = activeT1State?.fighter?.moves?.find((m) => m.type === 'finisher');
        if (finisher && activeT1State && activeT1State.superMeter >= 300) {
          handleManualPlayerAction('finisher', finisher);
        }
      } else if (code === kMapping.superMoveKey) {
        const superMove = activeT1State?.fighter?.moves?.find((m) => m.type === 'super');
        const isDesperate = activeT1State ? activeT1State.currentHp / activeT1State.maxHp <= 0.3 : false;
        const superCost = isDesperate ? 150 : 200;
        if (superMove && activeT1State && activeT1State.superMeter >= superCost) {
          handleManualPlayerAction('move', superMove);
        } else {
          const normalMoves = activeT1State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
          if (normalMoves.length > 0) {
            handleManualPlayerAction('move', normalMoves[0]);
          }
        }
      } else if (code === kMapping.exMoveKey) {
        const exMove = activeT1State?.fighter?.moves?.find((m) => m.type === 'ex');
        const hasMeter = activeT1State ? activeT1State.superMeter >= 100 || activeT1State.isMaxModeActive : false;
        if (exMove && hasMeter) {
          handleManualPlayerAction('move', exMove);
        } else {
          const normalMoves = activeT1State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
          if (normalMoves.length > 1) {
            handleManualPlayerAction('move', normalMoves[1]);
          } else if (normalMoves.length > 0) {
            handleManualPlayerAction('move', normalMoves[0]);
          }
        }
      } else if (code === kMapping.move1Key) {
        const normalMoves = activeT1State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
        if (normalMoves.length > 0) {
          handleManualPlayerAction('move', normalMoves[0]);
        }
      } else if (code === kMapping.move2Key) {
        const normalMoves = activeT1State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
        if (normalMoves.length > 1) {
          handleManualPlayerAction('move', normalMoves[1]);
        } else if (normalMoves.length > 0) {
          handleManualPlayerAction('move', normalMoves[0]);
        }
      }

      // ────────────────── PLAYER 2 INPUTS (LOCAL 2P) ──────────────────
      if (code === p2Mapping.guardKey) {
        handleManualPlayer2Action('guard');
      } else if (code === p2Mapping.dodgeKey) {
        handleManualPlayer2Action('dodge');
      } else if (code === p2Mapping.tauntKey) {
        handleManualPlayer2Action('taunt');
      } else if (code === p2Mapping.maxModeKey) {
        handleManualPlayer2Action('max_mode');
      } else if (code === p2Mapping.finisherKey) {
        const finisher = activeT2State?.fighter?.moves?.find((m) => m.type === 'finisher');
        if (finisher && activeT2State && activeT2State.superMeter >= 300) {
          handleManualPlayer2Action('finisher', finisher);
        }
      } else if (code === p2Mapping.superMoveKey) {
        const superMove = activeT2State?.fighter?.moves?.find((m) => m.type === 'super');
        const isDesperate = activeT2State ? activeT2State.currentHp / activeT2State.maxHp <= 0.3 : false;
        const superCost = isDesperate ? 150 : 200;
        if (superMove && activeT2State && activeT2State.superMeter >= superCost) {
          handleManualPlayer2Action('move', superMove);
        } else {
          const normalMoves = activeT2State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
          if (normalMoves.length > 0) {
            handleManualPlayer2Action('move', normalMoves[0]);
          }
        }
      } else if (code === p2Mapping.exMoveKey) {
        const exMove = activeT2State?.fighter?.moves?.find((m) => m.type === 'ex');
        const hasMeter = activeT2State ? activeT2State.superMeter >= 100 || activeT2State.isMaxModeActive : false;
        if (exMove && hasMeter) {
          handleManualPlayer2Action('move', exMove);
        } else {
          const normalMoves = activeT2State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
          if (normalMoves.length > 1) {
            handleManualPlayer2Action('move', normalMoves[1]);
          } else if (normalMoves.length > 0) {
            handleManualPlayer2Action('move', normalMoves[0]);
          }
        }
      } else if (code === p2Mapping.move1Key) {
        const normalMoves = activeT2State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
        if (normalMoves.length > 0) {
          handleManualPlayer2Action('move', normalMoves[0]);
        }
      } else if (code === p2Mapping.move2Key) {
        const normalMoves = activeT2State?.fighter?.moves?.filter((m) => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
        if (normalMoves.length > 1) {
          handleManualPlayer2Action('move', normalMoves[1]);
        } else if (normalMoves.length > 0) {
          handleManualPlayer2Action('move', normalMoves[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeT1State, activeT2State, handleManualPlayerAction, handleManualPlayer2Action, isPaused]);

  const handleGamepadButtonPress = useCallback((buttonIndex: number) => {
    const mapping = gamepadMappingRef.current;

    // Handle interactive Haki Clash rapid-tap if active
    const hakiClashOpen = document.getElementById('haki-clash-rapid-tap-btn') !== null;
    if (hakiClashOpen) {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
      return;
    }

    // Handle open overlays first
    if (showAchievementsDrawer) {
      if (buttonIndex === mapping.menuConfirmButton || buttonIndex === mapping.menuBackButton) {
        setShowAchievementsDrawer(false);
        return;
      }
    }

    if (celebrationData) {
      if (buttonIndex === mapping.menuConfirmButton) {
        onMatchComplete(celebrationData.matchResult);
        return;
      }
      if (buttonIndex === mapping.menuBackButton) {
        onExitToMenu();
        return;
      }
    }

    // Menu back
    if (buttonIndex === mapping.menuBackButton) {
      onExitToMenu();
      return;
    }

    // Combat moves
    if (isAutoPlayRef.current || isMatchOverRef.current) return;

    if (buttonIndex === mapping.guardButton) {
      handleManualPlayerAction('guard');
    } else if (buttonIndex === mapping.dodgeButton) {
      handleManualPlayerAction('dodge');
    } else if (buttonIndex === mapping.tauntButton) {
      handleManualPlayerAction('taunt');
    } else if (buttonIndex === mapping.maxModeButton) {
      handleManualPlayerAction('max_mode');
    } else if (buttonIndex === mapping.finisherButton) {
      const finisher = activeT1State?.fighter?.moves?.find(m => m.type === 'finisher');
      if (finisher && activeT1State?.superMeter >= 300) {
        handleManualPlayerAction('finisher', finisher);
      }
    } else if (buttonIndex === mapping.superMoveButton) {
      const superMove = activeT1State?.fighter?.moves?.find(m => m.type === 'super');
      const isDesperate = activeT1State ? (activeT1State.currentHp / activeT1State.maxHp) <= 0.3 : false;
      const superCost = isDesperate ? 150 : 200;
      if (superMove && activeT1State && activeT1State.superMeter >= superCost) {
        handleManualPlayerAction('move', superMove);
      } else {
        // Fallback to first normal move
        const normalMoves = activeT1State?.fighter?.moves?.filter(m => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
        if (normalMoves.length > 0) {
          handleManualPlayerAction('move', normalMoves[0]);
        }
      }
    } else if (buttonIndex === mapping.exMoveButton) {
      const exMove = activeT1State?.fighter?.moves?.find(m => m.type === 'ex');
      const hasMeter = activeT1State ? (activeT1State.superMeter >= 100 || activeT1State.isMaxModeActive) : false;
      if (exMove && hasMeter) {
        handleManualPlayerAction('move', exMove);
      } else {
        // Fallback to second normal move
        const normalMoves = activeT1State?.fighter?.moves?.filter(m => m.type !== 'super' && m.type !== 'ex' && m.type !== 'finisher') || [];
        if (normalMoves.length > 1) {
          handleManualPlayerAction('move', normalMoves[1]);
        } else if (normalMoves.length > 0) {
          handleManualPlayerAction('move', normalMoves[0]);
        }
      }
    }
  }, [
    showAchievementsDrawer,
    celebrationData,
    activeT1State,
    onMatchComplete,
    onExitToMenu,
    handleManualPlayerAction,
  ]);

  // Poll Gamepad inputs on animation frame loop
  useEffect(() => {
    let animFrameId: number;

    const pollGamepad = () => {
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
      const gps = navigator.getGamepads();
      const activeGp = Array.from(gps).find(g => g !== null);

      if (activeGp) {
        activeGp.buttons.forEach((btn, index) => {
          const wasPressed = prevGamepadButtonsRef.current[index];
          const isPressed = btn.pressed;
          if (isPressed && !wasPressed) {
            handleGamepadButtonPress(index);
          }
        });
        prevGamepadButtonsRef.current = activeGp.buttons.map(b => b.pressed);
      } else {
        prevGamepadButtonsRef.current = [];
      }

      animFrameId = requestAnimationFrame(pollGamepad);
    };

    animFrameId = requestAnimationFrame(pollGamepad);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [handleGamepadButtonPress]);

  const updateFighterState = (side: 'team1' | 'team2', updated: BattleFighterState) => {
    if (side === 'team1') {
      setT1FighterStates((prev) => {
        const next = [...prev];
        next[t1IdxRef.current] = updated;
        return next;
      });
    } else {
      setT2FighterStates((prev) => {
        const next = [...prev];
        next[t2IdxRef.current] = updated;
        return next;
      });
    }
  };

  const handleDoubleKO = (finalLog?: ActionLog) => {
    if (isMatchOverRef.current || isRoundTransitioningRef.current) return;
    isRoundTransitioningRef.current = true;
    resetDestructibleProps();

    setKoVictoryData({
      winnerFighter: team1.fighters[t1IdxRef.current] || currentTeam2.fighters[t2IdxRef.current] || team1.fighters[0],
      winningTeamName: 'DRAW',
      roundNumber: currentRound,
      isDraw: true,
    });

    setRoundHistory((prev) => [...prev, 'draw']);

    // Record round statistics for this double KO round
    const t1Fighter = team1.fighters[t1IdxRef.current]?.name || 'Fighter 1';
    const t2Fighter = currentTeam2.fighters[t2IdxRef.current]?.name || 'Fighter 2';

    // Trigger transformation exhaust audio if either fighter was transformed
    const t1DefeatedState = t1StatesRef.current[t1IdxRef.current];
    const t2DefeatedState = t2StatesRef.current[t2IdxRef.current];
    if (t1DefeatedState?.currentFormId) {
      const form = t1DefeatedState.fighter.transformations?.find(t => t.id === t1DefeatedState.currentFormId)?.name || 'Awakened Form';
      audioManager.playTransformationExit(t1DefeatedState.fighter, form, 'team1');
    }
    if (t2DefeatedState?.currentFormId) {
      const form = t2DefeatedState.fighter.transformations?.find(t => t.id === t2DefeatedState.currentFormId)?.name || 'Awakened Form';
      audioManager.playTransformationExit(t2DefeatedState.fighter, form, 'team2');
    }

    const roundLogs = combatLogs.filter((log) => log.roundNumber === currentRound);
    let t1Dmg = 0;
    let t2Dmg = 0;
    let maxCombo = 0;
    let supers = 0;
    roundLogs.forEach((log) => {
      if (log.actorSide === 'team1') {
        if (log.damage) t1Dmg += log.damage;
      } else {
        if (log.damage) t2Dmg += log.damage;
      }
      if (log.comboHits && log.comboHits > maxCombo) maxCombo = log.comboHits;
      if (log.moveType === 'super' || log.moveType === 'ex' || log.isHakiClash) supers++;
    });

    const newStat: RoundStat = {
      roundNumber: currentRound,
      winnerSide: 'draw',
      winnerName: 'DRAW',
      t1FighterName: t1Fighter,
      t2FighterName: t2Fighter,
      t1Damage: t1Dmg || 100,
      t2Damage: t2Dmg || 100,
      maxCombo: maxCombo || 1,
      supersLanded: supers,
      decisiveMove: finalLog?.moveName || 'Mutual Double KO Clash',
    };
    setRoundStats((prev) => [...prev, newStat]);

    const transitionDelay = Math.max(3400, Math.round(3800 / battleSpeedRef.current));

    setTimeout(() => {
      setKoVictoryData(null);
      const curT1Idx = t1IdxRef.current;
      const curT2Idx = t2IdxRef.current;
      const hasNextT1 = curT1Idx + 1 < (team1.fighters?.length || 0);
      const hasNextT2 = curT2Idx + 1 < (currentTeam2.fighters?.length || 0);

      if (hasNextT1 && hasNextT2) {
        // Both teams have another fighter
        setT1Index(curT1Idx + 1);
        setT2Index(curT2Idx + 1);
        setCurrentRound((prev) => prev + 1);
        const nextT1Name = team1.fighters?.[curT1Idx + 1]?.name || 'Fighter 1';
        const nextT2Name = currentTeam2.fighters?.[curT2Idx + 1]?.name || 'Fighter 2';
        setRoundAnnouncementSafe(`ROUND ${currentRound + 1} - DOUBLE SUB: ${nextT1Name} VS ${nextT2Name}!`, 3000);
        setIsD3RoundTransitioning(true);
      } else if (hasNextT1) {
        // Team 2 is out of fighters
        finishMatch('team1');
      } else if (hasNextT2) {
        // Team 1 is out of fighters
        finishMatch('team2');
      } else {
        // Both teams out of fighters: Match is a DRAW!
        finishMatch('draw');
      }
    }, transitionDelay);
  };

  const handleFighterKO = (defeatedSide: 'team1' | 'team2', finalLog?: ActionLog) => {
    if (isMatchOverRef.current || isRoundTransitioningRef.current) return;
    isRoundTransitioningRef.current = true;
    resetDestructibleProps();

    const winnerFighter = defeatedSide === 'team2' ? team1.fighters[t1IdxRef.current] : currentTeam2.fighters[t2IdxRef.current];
    const winningTeam = defeatedSide === 'team2' ? team1 : currentTeam2;

    // Trigger transformation exhaust audio if defeated fighter was in transformed or awakened form
    const defeatedState = defeatedSide === 'team1' ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];
    if (defeatedState?.currentFormId) {
      const formName = defeatedState.fighter.transformations?.find(t => t.id === defeatedState.currentFormId)?.name || 'Awakened Form';
      audioManager.playTransformationExit(defeatedState.fighter, formName, defeatedSide);
    } else if (defeatedState?.isAwakened) {
      audioManager.playAwakeningExit(defeatedState.fighter, defeatedState.awakeningProfile, defeatedSide);
    }

    // Trigger dynamic KOF 2002 Victory Announcement sequence
    setKoVictoryData({
      winnerFighter: winnerFighter || team1.fighters[0],
      winningTeamName: winningTeam?.name || 'Winner',
      roundNumber: currentRound,
    });

    // Track round history win/loss
    const roundWinner = defeatedSide === 'team2' ? 'team1' : 'team2';
    setRoundHistory((prev) => [...prev, roundWinner]);

    // Record round statistics for this round
    const roundWinnerName = roundWinner === 'team1' ? team1.name : currentTeam2.name;
    const t1Fighter = team1.fighters[t1IdxRef.current]?.name || 'Fighter 1';
    const t2Fighter = currentTeam2.fighters[t2IdxRef.current]?.name || 'Fighter 2';
    const roundLogs = combatLogs.filter((log) => log.roundNumber === currentRound);
    let t1Dmg = 0;
    let t2Dmg = 0;
    let maxCombo = 0;
    let supers = 0;
    roundLogs.forEach((log) => {
      if (log.actorSide === 'team1') {
        if (log.damage) t1Dmg += log.damage;
      } else {
        if (log.damage) t2Dmg += log.damage;
      }
      if (log.comboHits && log.comboHits > maxCombo) maxCombo = log.comboHits;
      if (log.moveType === 'super' || log.moveType === 'ex' || log.isHakiClash) supers++;
    });

    if (t1Dmg === 0 && t2Dmg === 0) {
      t1Dmg = roundWinner === 'team1' ? 120 : 45;
      t2Dmg = roundWinner === 'team2' ? 120 : 45;
    }

    const newStat: RoundStat = {
      roundNumber: currentRound,
      winnerSide: roundWinner,
      winnerName: roundWinnerName,
      t1FighterName: t1Fighter,
      t2FighterName: t2Fighter,
      t1Damage: t1Dmg,
      t2Damage: t2Dmg,
      maxCombo: maxCombo || 1,
      supersLanded: supers,
      decisiveMove: finalLog?.moveName || (roundWinner === 'team1' ? 'Gum-Gum Heavy Finisher' : 'Conqueror Surge'),
    };
    setRoundStats((prev) => [...prev, newStat]);

    const transitionDelay = Math.max(3400, Math.round(3800 / battleSpeedRef.current));

    setTimeout(() => {
      setKoVictoryData(null);
      const curT1Idx = t1IdxRef.current;
      const curT2Idx = t2IdxRef.current;

      if (defeatedSide === 'team2') {
        if (curT2Idx + 1 < (currentTeam2.fighters?.length || 0)) {
          const nextIndex = curT2Idx + 1;
          setT2Index(nextIndex);
          setCurrentRound((prev) => prev + 1);
          setRoundAnnouncementSafe(`ROUND ${currentRound + 1} - NEXT: ${currentTeam2.fighters[nextIndex].name}!`, 3000);
          setT1FighterStates((prev) => {
            const next = [...prev];
            const survivor = next[curT1Idx];
            if (!survivor) return prev;
            const healedHp = Math.min(survivor.maxHp, survivor.currentHp + Math.round(survivor.maxHp * 0.15));
            next[curT1Idx] = {
              ...survivor,
              currentHp: healedHp,
              statusEffects: {
                ...survivor.statusEffects,
                isStunned: undefined,
                isGuardCrushed: undefined,
              },
            };
            return next;
          });
          setIsD3RoundTransitioning(true);
        } else {
          finishMatch('team1');
        }
      } else {
        if (curT1Idx + 1 < (team1.fighters?.length || 0)) {
          const nextIndex = curT1Idx + 1;
          setT1Index(nextIndex);
          setCurrentRound((prev) => prev + 1);
          setRoundAnnouncementSafe(`ROUND ${currentRound + 1} - NEXT: ${team1.fighters[nextIndex].name}!`, 3000);
          setT2FighterStates((prev) => {
            const next = [...prev];
            const survivor = next[curT2Idx];
            if (!survivor) return prev;
            const healedHp = Math.min(survivor.maxHp, survivor.currentHp + Math.round(survivor.maxHp * 0.15));
            next[curT2Idx] = {
              ...survivor,
              currentHp: healedHp,
              statusEffects: {
                ...survivor.statusEffects,
                isStunned: undefined,
                isGuardCrushed: undefined,
              },
            };
            return next;
          });
          setIsD3RoundTransitioning(true);
        } else {
          finishMatch('team2');
        }
      }
    }, transitionDelay);
  };

  handleFighterKORef.current = handleFighterKO;
  handleDoubleKORef.current = handleDoubleKO;

  const finishMatch = (winnerSide: 'team1' | 'team2' | 'draw') => {
    setIsMatchOver(true);
    isMatchOverRef.current = true;
    isRoundTransitioningRef.current = false;
    battleBgmEngine.stop();
    battleAnnouncer.resetQueue();
    characterVoiceManager.stopAll();
    
    soundManager.playVictoryFanfare();

    const isDraw = winnerSide === 'draw';
    const isT1Winner = winnerSide === 'team1';
    const winningTeam = isDraw ? team1 : (isT1Winner ? team1 : currentTeam2);

    if (isDraw) {
      speakAnnouncer(`MUTUAL KNOCKOUT! The match ends in a historic draw!`);
    } else {
      // Check for comeback
      const winnerFinalState = isT1Winner ? t1StatesRef.current[t1IdxRef.current] : t2StatesRef.current[t2IdxRef.current];
      const loserFinalState = isT1Winner ? t2StatesRef.current[t2IdxRef.current] : t1StatesRef.current[t1IdxRef.current];

      const winnerRatio = (winnerFinalState?.currentHp || 0) / Math.max(1, winnerFinalState?.maxHp || 100);
      const loserFinalRatio = (loserFinalState?.currentHp || 0) / Math.max(1, loserFinalState?.maxHp || 100);

      if (winnerRatio < 0.25 && loserFinalRatio > 0.5) {
        speakAnnouncer(`UNBELIEVABLE COMEBACK! ${winningTeam.name} pulls a miracle victory!`);
      } else {
        speakAnnouncer(`Victory for ${winningTeam.name}! Game Set!`);
      }
    }

    const allStates = [...t1FighterStates, ...t2FighterStates];
    const winningStates = isDraw ? allStates : (isT1Winner ? t1FighterStates : t2FighterStates);
    const mvpState = winningStates.reduce((prev, curr) =>
      (curr?.totalDamageDealt || 0) > (prev?.totalDamageDealt || 0) ? curr : prev,
      winningStates[0] || t1FighterStates[0]
    );

    let calculatedBounty = 180000000 + Math.round((mvpState?.totalDamageDealt || 0) * 100000);
    if (currentStage?.eventModifiers?.some((m) => (m || '').toLowerCase().includes('bounty'))) {
      calculatedBounty = Math.round(calculatedBounty * 2.5);
    }

    const t1Wins = (roundHistory || []).filter((r) => r === 'team1').length;
    const t2Wins = (roundHistory || []).filter((r) => r === 'team2').length;

    const matchResult: MatchResult = {
      id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toLocaleDateString(),
      matchFormat,
      team1: {
        name: team1.name,
        fighters: team1.fighters?.map((f) => f.name),
        isWinner: isT1Winner,
        score: t1Wins,
      },
      team2: {
        name: currentTeam2.name,
        fighters: currentTeam2.fighters?.map((f) => f.name),
        isWinner: !isT1Winner && !isDraw,
        score: t2Wins,
      },
      team1Score: t1Wins,
      team2Score: t2Wins,
      roundHistory,
      roundStats,
      isDraw,
      winnerName: isDraw ? 'DRAW (Both Defeated)' : winningTeam.name,
      totalRounds: currentRound,
      mvpFighter: mvpState?.fighter?.name || team1.fighters[0]?.name || 'Unknown',
      bountyEarned: calculatedBounty,
      combatLogs,
      eventInfo: currentStage.eventTitle
        ? {
            eventId: (currentStage as any).eventId || 'global_event',
            eventTitle: currentStage.eventTitle,
            modifiers: currentStage.eventModifiers || [],
            rewardClaimed: isT1Winner,
          }
        : undefined,
    };

    // Update Tournament Bracket progression if active
    if (tournamentBracket && !tournamentBracket.isCompleted) {
      const t1RoundsWon = roundHistory.filter((r) => r === 'team1').length + (isT1Winner ? 1 : 0);
      const t2RoundsWon = roundHistory.filter((r) => r === 'team2').length + (!isT1Winner && !isDraw ? 1 : 0);
      const updatedBracket = advanceTournamentWithResult(
        tournamentBracket,
        isT1Winner,
        Math.max(1, t1RoundsWon),
        Math.max(0, t2RoundsWon)
      );
      setTournamentBracket(updatedBracket);
    }

    // Trigger Victory Celebration sequence modal with taunt & pose
    setTimeout(() => {
      setCelebrationData({
        winnerFighter: mvpState?.fighter || team1.fighters[0],
        winningTeamName: isDraw ? 'DRAW' : winningTeam.name,
        isTeam1Winner: isT1Winner,
        isDraw,
        totalRounds: currentRound,
        matchResult,
      });
    }, 1200);
  };

  const handleStartNextTournamentMatch = (nextOpponent: Team, nextStage: StageInfo) => {
    // 1. Reset sound, voices, announcer
    battleAnnouncer.resetQueue();
    characterVoiceManager.stopAll();

    // 2. Set new active opponent team & stage
    setActiveTeam2(nextOpponent);
    setActiveStage(nextStage);

    // 3. Reset index states and refs
    setT1Index(0);
    setT2Index(0);
    t1IdxRef.current = 0;
    t2IdxRef.current = 0;

    // 4. Re-initialize fighter states (restore full HP, 0 meters, clear stuns)
    const newT1States = (team1.fighters || []).map((f: any) => createBattleFighterState(f.fighter || f));
    const newT2States = (nextOpponent.fighters || []).map((f: any) => createBattleFighterState(f.fighter || f));
    setT1FighterStates(newT1States);
    setT2FighterStates(newT2States);
    t1StatesRef.current = newT1States;
    t2StatesRef.current = newT2States;

    // 5. Reset match flow states
    setCurrentRound(1);
    setRoundHistory([]);
    setIsMatchOver(false);
    isMatchOverRef.current = false;
    setCelebrationData(null);
    setFinisherActive(false);
    setFinisherFighter(null);
    setAwakeningCinematic({ isActive: false, fighterState: null, profile: null });
    setActiveCombo(null);
    resetDestructibleProps();

    // 6. Reset combat execution refs
    isExecutingTurn.current = false;
    t1ActingRef.current = false;
    t2ActingRef.current = false;
    isRoundTransitioningRef.current = false;

    // 7. Update combat logs
    const initialT1Name = team1.fighters?.[0]?.name || team1.name;
    const initialT2Name = nextOpponent.fighters?.[0]?.name || nextOpponent.name;
    setCombatLogs([
      {
        id: `log_tourney_init_${Date.now()}`,
        round: 1,
        message: `🏆 TOURNAMENT ADVANCEMENT: ${team1.name} VS ${nextOpponent.name} at ${nextStage.name}!`,
        type: 'special',
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: `log_tourney_r1_${Date.now()}`,
        round: 1,
        message: `Round 1 Duel: ${initialT1Name} VS ${initialT2Name}!`,
        type: 'basic',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    // 8. Close tournament bracket modal
    setShowTournamentModal(false);

    // 9. Sound and audio feedback
    soundManager.playPowerUp();
    setRoundAnnouncementSafe(`ROUND 1 - FIGHT!`, 2500);

    // 10. Start stage BGM
    setTimeout(() => {
      if (isBgmEnabled) {
        battleBgmEngine.start();
        battleBgmEngine.setPhase('Opening');
      }
    }, 400);
  };

  const handleResetTournament = () => {
    const newBracket = resetAndReseedTournament(team1);
    saveTournamentState(newBracket);
    setTournamentBracket(newBracket);
    // Also update active opponent to first match rival
    const firstMatch = newBracket.matches[0];
    if (firstMatch && firstMatch.team2) {
      setActiveTeam2(firstMatch.team2);
      if (firstMatch.stage) {
        setActiveStage(firstMatch.stage);
      }
    }
  };

  const handleSimulateRemainingMatches = () => {
    if (!tournamentBracket) return;
    const currentRound = tournamentBracket.matches.find((m) => m.id === tournamentBracket.currentMatchId)?.round;
    const updatedMatches = tournamentBracket.matches.map((m) => {
      if (m.round === currentRound && !m.isUserMatch && m.status !== 'completed') {
        return simulateCpuMatch(m);
      }
      return m;
    });
    const updated = {
      ...tournamentBracket,
      matches: updatedMatches,
    };
    saveTournamentState(updated);
    setTournamentBracket(updated);
  };

  const renderStatusEffects = (state: BattleFighterState, alignment: 'start' | 'end') => {
    const effects = [];
    if (state.statusEffects.isStunned) {
      effects.push(
        <div key={`stun-${alignment}`} title="Stunned (Cannot Act)" className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-yellow-400 font-bold bg-yellow-950/80 px-1.5 py-0.5 rounded border border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse">
          <Zap className="w-3 h-3" /> <span className="hidden sm:inline">STUN</span>
          <span className="text-yellow-200">({state.statusEffects.isStunned})</span>
        </div>
      );
    }
    if (state.statusEffects.isBurned) {
      effects.push(
        <div key={`burn-${alignment}`} title="Burned (DoT Damage)" className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-orange-400 font-bold bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.4)]">
          <Flame className="w-3 h-3 animate-bounce" /> <span className="hidden sm:inline">BURN</span>
          <span className="text-orange-200">({state.statusEffects.isBurned})</span>
        </div>
      );
    }
    if (state.statusEffects.isPoisoned) {
      effects.push(
        <div key={`poison-${alignment}`} title="Poisoned (DoT Damage & Stat Debuff)" className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-purple-400 font-bold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]">
          <Skull className="w-3 h-3 animate-pulse" /> <span className="hidden sm:inline">POISON</span>
          <span className="text-purple-200">({state.statusEffects.isPoisoned})</span>
        </div>
      );
    }
    
    if (effects.length === 0) return null;
    return <div className={`flex items-center justify-${alignment} gap-1 mt-1 min-h-[20px]`}>{effects}</div>;
  };

  const t1HpPercent = useMemo(() => {
    return ((activeT1State?.currentHp || 0) / (activeT1State?.maxHp || 1)) * 100;
  }, [activeT1State?.currentHp, activeT1State?.maxHp]);

  const t2HpPercent = useMemo(() => {
    return ((activeT2State?.currentHp || 0) / (activeT2State?.maxHp || 1)) * 100;
  }, [activeT2State?.currentHp, activeT2State?.maxHp]);

  const [ghostT1Hp, setGhostT1Hp] = useState<number>(t1HpPercent);
  const [ghostT2Hp, setGhostT2Hp] = useState<number>(t2HpPercent);

  useEffect(() => {
    if (t1HpPercent < ghostT1Hp) {
      const timer = setTimeout(() => {
        setGhostT1Hp(t1HpPercent);
      }, 350);
      return () => clearTimeout(timer);
    } else if (t1HpPercent > ghostT1Hp) {
      setGhostT1Hp(t1HpPercent);
    }
  }, [t1HpPercent, ghostT1Hp]);

  useEffect(() => {
    if (t2HpPercent < ghostT2Hp) {
      const timer = setTimeout(() => {
        setGhostT2Hp(t2HpPercent);
      }, 350);
      return () => clearTimeout(timer);
    } else if (t2HpPercent > ghostT2Hp) {
      setGhostT2Hp(t2HpPercent);
    }
  }, [t2HpPercent, ghostT2Hp]);

  const t1Archetype = useMemo(() => {
    return activeT1State?.fighter ? getFighterArchetype(activeT1State.fighter) : 'Brawler';
  }, [activeT1State?.fighter]);

  const t2Archetype = useMemo(() => {
    return activeT2State?.fighter ? getFighterArchetype(activeT2State.fighter) : 'Brawler';
  }, [activeT2State?.fighter]);

  const t1Phase = useMemo(() => {
    return activeT1State ? getBattlePhase(activeT1State.currentHp, activeT1State.maxHp) : 'Opening';
  }, [activeT1State?.currentHp, activeT1State?.maxHp]);

  const t2Phase = useMemo(() => {
    return activeT2State ? getBattlePhase(activeT2State.currentHp, activeT2State.maxHp) : 'Opening';
  }, [activeT2State?.currentHp, activeT2State?.maxHp]);

  const t1HakiDetails = useMemo(() => {
    if (!activeT1State) return { isHakiGlowActive: false, hakiType: 'armament' };
    const t1Max = activeT1State.maxHp || 1;
    const t1Curr = activeT1State.currentHp || 0;
    const isT1LowHp = (t1Curr / t1Max) <= 0.30;
    const isHakiGlowActive = isT1LowHp || t1CritActive;
    
    const h1 = activeT1State.fighter.haki;
    const vStyle = activeT1State.fighter.hakiAura?.visualStyle || 'modern_glow';
    let hakiType: 'conqueror' | 'armament' | 'observation' | 'void' = 'armament';
    
    if (activeT1State.fighter.id === 'imu_sama') {
      hakiType = 'void';
    } else if (h1.conqueror >= 60 && h1.conqueror >= h1.armament && h1.conqueror >= h1.observation) {
      hakiType = 'conqueror';
    } else if (h1.observation >= 60 && h1.observation > h1.armament) {
      hakiType = 'observation';
    }
    return { isHakiGlowActive, hakiType, visualStyle: vStyle };
  }, [activeT1State?.currentHp, activeT1State?.maxHp, activeT1State?.fighter, t1CritActive]);

  const t2HakiDetails = useMemo(() => {
    if (!activeT2State) return { isHakiGlowActive: false, hakiType: 'armament', visualStyle: 'modern_glow' };
    const t2Max = activeT2State.maxHp || 1;
    const t2Curr = activeT2State.currentHp || 0;
    const isT2LowHp = (t2Curr / t2Max) <= 0.30;
    const isHakiGlowActive = isT2LowHp || t2CritActive;
    
    const h2 = activeT2State.fighter.haki;
    const vStyle = activeT2State.fighter.hakiAura?.visualStyle || 'modern_glow';
    let hakiType: 'conqueror' | 'armament' | 'observation' | 'void' = 'armament';
    
    if (activeT2State.fighter.id === 'imu_sama') {
      hakiType = 'void';
    } else if (h2.conqueror >= 60 && h2.conqueror >= h2.armament && h2.conqueror >= h2.observation) {
      hakiType = 'conqueror';
    } else if (h2.observation >= 60 && h2.observation > h2.armament) {
      hakiType = 'observation';
    }
    return { isHakiGlowActive, hakiType, visualStyle: vStyle };
  }, [activeT2State?.currentHp, activeT2State?.maxHp, activeT2State?.fighter, t2CritActive]);

  // Subtle Motion Blur dynamic state for high-speed dashes, lunges, and ultra move surges
  const motionBlurState = useMemo<'none' | 'subtle' | 'dash-t1' | 'dash-t2' | 'ultra'>(() => {
    if (activeSuperCutin || finisherActive || awakeningCinematic.isActive || hakiClashActive) {
      return 'ultra';
    }
    if (screenEdgeFlash?.type === 'ultimate' || isImpactZooming) {
      return 'ultra';
    }
    if (actorInMotion === 'team1') {
      return 'dash-t1';
    }
    if (actorInMotion === 'team2') {
      return 'dash-t2';
    }
    if (targetDodgeEffect === 'team1') {
      return 'dash-t2';
    }
    if (targetDodgeEffect === 'team2') {
      return 'dash-t1';
    }
    if (screenEdgeFlash?.type === 'special') {
      return 'subtle';
    }
    return 'none';
  }, [
    activeSuperCutin,
    finisherActive,
    awakeningCinematic.isActive,
    hakiClashActive,
    screenEdgeFlash,
    isImpactZooming,
    actorInMotion,
    targetDodgeEffect,
  ]);

  return (
    <div className="relative flex flex-col h-full w-full bg-black text-zinc-100 overflow-hidden font-sans select-none">
      {/* Dynamic Animated Canvas for Stage Particles & Environmental Ambience */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 opacity-60" />

      {/* Background Stage & Crowd Layer with Subtle Motion Blur Effect */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-all duration-200 transform-gpu ${
          motionBlurState === 'ultra'
            ? 'motion-blur-ultra'
            : motionBlurState === 'dash-t1'
            ? 'motion-blur-dash-left'
            : motionBlurState === 'dash-t2'
            ? 'motion-blur-dash-right'
            : motionBlurState === 'subtle'
            ? 'motion-blur-subtle'
            : ''
        }`}
      >
        {/* Dark tint overlay for crisp lens focus without expensive fullscreen backdrop-blur */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none z-0" />

        {/* Stage Backdrop with visual ambiance */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentStage.bgGradient} opacity-45 z-0 pointer-events-none`} />

        {/* Dynamic Weather Overlays (e.g., snow, rain, cyber, gold, cherry blossoms) */}
        <WeatherOverlay effect={weatherOverride && weatherOverride !== 'auto' ? weatherOverride : (theme.weatherEffectOverride || currentStage.ambientEffect)} />

        {/* Dynamic Background Crowd System with Intensity & Cheering Silhouettes */}
        <BackgroundCrowdSystem
          intensity={crowdState.intensity}
          tier={crowdState.tier}
          tierLabel={crowdState.tierLabel}
          tierColor={crowdState.tierColor}
          damageFrequency={crowdState.damageFrequency}
          recentDamageVelocity={crowdState.recentDamageVelocity}
          recentHitCount={crowdState.recentHitCount}
          isJoltActive={crowdState.isJoltActive}
          flashPoints={crowdState.flashPoints}
          shoutBubbles={crowdState.shoutBubbles}
          stage={currentStage}
          isClashActive={hakiClashActive}
          activeComboHits={activeCombo?.hits ?? 0}
          onCheerTap={() => {
            crowdState.setIntensity((prev) => Math.min(100, prev + 25));
            soundManager.playCrowdCheer(crowdState.intensity + 20);
          }}
        />
      </div>

      {/* Subtle Directional Speed Streaks Overlay during Motion Blur */}
      <AnimatePresence>
        {motionBlurState !== 'none' && (
          <motion.div
            key={`motion-blur-${motionBlurState}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: motionBlurState === 'ultra' ? 0.35 : 0.22 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${
              motionBlurState === 'ultra'
                ? 'arena-motion-blur-radial'
                : motionBlurState === 'dash-t1'
                ? 'arena-motion-blur-right'
                : 'arena-motion-blur-left'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Haki Clash Screen Black Lightning & Cracking Space Effect */}
      {hakiClashActive && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center overflow-hidden anim-black-lightning">
          
          {/* Shattering Reality Overlay */}
          <div className="absolute inset-0 bg-red-950/80 anim-reality-crack mix-blend-color-burn" />

          {/* Crack lines branching out from the center */}
          <div className="absolute inset-0 anim-space-shatter mix-blend-screen">
            {/* Center impact point */}
            <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full blur-2xl opacity-80" />
            
            {/* Fractal cracking lines */}
            <div className="absolute top-1/2 left-1/2" style={{ transform: 'rotate(15deg)' }}>
              <div className="space-crack-line anim-crack-line-shoot w-[150vw] h-1" />
            </div>
            <div className="absolute top-1/2 left-1/2" style={{ transform: 'rotate(-35deg)' }}>
              <div className="space-crack-line anim-crack-line-shoot w-[180vw] h-1.5" />
            </div>
            <div className="absolute top-1/2 left-1/2" style={{ transform: 'rotate(75deg)' }}>
              <div className="space-crack-line anim-crack-line-shoot w-[120vw] h-[2px]" />
            </div>
            <div className="absolute top-1/2 left-1/2" style={{ transform: 'rotate(-80deg)' }}>
              <div className="space-crack-line anim-crack-line-shoot w-[130vw] h-[3px]" />
            </div>
            <div className="absolute top-1/2 left-1/2" style={{ transform: 'rotate(140deg)' }}>
              <div className="space-crack-line anim-crack-line-shoot w-[160vw] h-1" />
            </div>
            <div className="absolute top-1/2 left-1/2" style={{ transform: 'rotate(-160deg)' }}>
              <div className="space-crack-line anim-crack-line-shoot w-[170vw] h-[2px]" />
            </div>
          </div>

          <div className="font-['Cinzel'] text-4xl sm:text-7xl font-black text-white drop-shadow-[0_0_40px_rgba(220,38,38,1)] tracking-widest text-center z-10 animate-pulse relative">
            ⚡ HAKI CLASH ⚡
          </div>
        </div>
      )}

      {/* Screen Edge Flash Overlay for Special Move (faint red) & Ultimate (faint gold) */}
      {screenEdgeFlash && (
        <div
          key={screenEdgeFlash.id}
          className={`fixed inset-0 z-50 pointer-events-none ${screenEdgeFlash.colorClass}`}
        />
      )}

      {/* High-intensity Conqueror's Haki Activation Screen Flash Overlay */}
      {conquerorFlash && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 z-50 bg-gradient-to-br from-white via-purple-50 to-white pointer-events-none"
        />
      )}

      {/* Real-time Combo Counter Overlay */}
      <RealTimeComboOverlay
        combo={activeCombo}
        team1Name={team1.name}
        team2Name={currentTeam2.name}
      />

      <FloatingComboCounter combo={activeCombo} />

      {/* Arcade Combo Counter (Hits and Total Damage Percentage) */}
      <ArcadeComboCounter
        combo={activeCombo}
        targetMaxHp={activeCombo?.activeSide === 'team1' ? activeT2State?.fighter?.maxHp : activeT1State?.fighter?.maxHp}
      />

      <FighterFinisherCinematic 
        isActive={finisherActive} 
        fighter={finisherFighter} 
      />

      
      {/* Dynamic Transformation Cinematic */}
      <TransformationCinematic
        isActive={dynamicTransformation.isActive}
        transformation={dynamicTransformation.transformation}
        side={dynamicTransformation.side}
        onComplete={() => {
          clearTransformation(() => {
            setIsPaused(false);
            isPausedRef.current = false;
          });
        }}
      />

      {/* Awakening Transformation Cinematic */}
      <AwakeningTransformationCinematic
        isActive={awakeningCinematic.isActive}
        fighterState={awakeningCinematic.fighterState}
        awakeningProfile={awakeningCinematic.profile}
      />

      {/* Mid-Battle Character Taunt Animation & Crowd Reaction FX */}
      <BattleTauntFX activeTaunt={activeTauntAnimation} />

      {/* Expandable Character Taunt Library Modal */}
      <TauntLibraryModal
        isOpen={isTauntLibraryOpen}
        onClose={() => setIsTauntLibraryOpen(false)}
        activeFighterId={activeT1State?.fighter?.id}
        activeFighterName={activeT1State?.fighter?.name}
        selectedTauntId={selectedPlayerTaunt?.id}
        onSelectDefaultTaunt={(taunt) => {
          setSelectedPlayerTaunt(taunt);
          selectedPlayerTauntRef.current = taunt;
        }}
        onExecuteTaunt={(taunt) => {
          setSelectedPlayerTaunt(taunt);
          selectedPlayerTauntRef.current = taunt;
          handleManualPlayerAction('taunt', undefined, taunt);
        }}
        isMidBattle={!isMatchOver && !isT1InRecovery}
      />

      {/* TOP RETRO ARCADE MARQUEE BAR */}
      <header className="relative z-20 px-2.5 sm:px-4 py-1.5 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-b border-amber-500/40 shadow-xl select-none">
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
          
          {/* 1. BRAND & STAGE BADGE (LEFT) */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 rounded px-2 py-1 shadow-sm">
              <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-amber-400 tracking-wider whitespace-nowrap">
                ★ GRAND LINE KOF ★
              </span>
            </div>

            {/* Stage indicator pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-300 max-w-[200px] lg:max-w-[300px] truncate shadow-inner">
              <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate font-semibold text-zinc-200">
                {currentStage.name}
              </span>
              {currentStage.hazardName && (
                <span className="text-zinc-400 hidden lg:inline truncate">
                  • {currentStage.hazardName}
                </span>
              )}
            </div>

            {/* Event pill */}
            {currentStage.eventTitle && (
              <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-[10px] font-mono text-red-200 shadow-sm animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold text-amber-300 uppercase text-[9px]">EVENT:</span>
                <span className="truncate max-w-[130px]">{currentStage.eventTitle}</span>
              </div>
            )}
          </div>

          {/* 2. DENSE TOOLBAR CLUSTERS (RIGHT) */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs font-mono">
            
            {/* Cluster A: Audio & HUD Experience Bar */}
            <div className="flex items-center bg-zinc-950/85 border border-zinc-800 rounded-lg p-0.5 shadow-sm">
              {/* BGM Button */}
              <button
                onClick={toggleBgm}
                title={isBgmEnabled ? 'Mute Battle BGM' : 'Unmute Battle BGM'}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded font-bold text-[10px] transition ${
                  isBgmEnabled
                    ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isBgmEnabled ? <Volume2 className="h-3.5 w-3.5 text-indigo-400" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span className="hidden xl:inline">{isBgmEnabled ? 'BGM' : 'MUTE'}</span>
              </button>

              {/* Announcer Button */}
              <button
                onClick={() => setIsTtsAnnouncerEnabled(!isTtsAnnouncerEnabled)}
                title={isTtsAnnouncerEnabled ? 'Disable TTS Announcer' : 'Enable TTS Announcer'}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded font-bold text-[10px] transition ${
                  isTtsAnnouncerEnabled
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isTtsAnnouncerEnabled ? (
                  <Mic className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <MicOff className="h-3.5 w-3.5 text-zinc-500" />
                )}
                <span className="hidden xl:inline">ANN</span>
              </button>

              <div className="w-px h-3.5 bg-zinc-800 mx-0.5" />

              {/* Feats Button */}
              <button
                onClick={() => setShowAchievementsDrawer(!showAchievementsDrawer)}
                title="View Match Feats & Achievements"
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded font-bold text-[10px] transition ${
                  unlockedAchievements?.length > 0
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                <span>{unlockedAchievements?.length} <span className="hidden sm:inline">FEATS</span></span>
              </button>

              {/* Side Log Toggle */}
              <button
                onClick={() => setShowSideLog(!showSideLog)}
                title="Toggle Side Combat Log"
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded font-bold text-[10px] transition ${
                  showSideLog
                    ? 'bg-teal-950/80 text-teal-300 border border-teal-500/50 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">LOG</span>
              </button>

              {/* CRT Scanlines Toggle */}
              <button
                onClick={() => setShowScanlines(!showScanlines)}
                title="Toggle CRT Retro Filter"
                className={`p-1 rounded transition ${
                  showScanlines ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Tv className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Cluster B: Combat Engine & Input Bar */}
            <div className="flex items-center bg-zinc-950/85 border border-zinc-800 rounded-lg p-0.5 shadow-sm gap-0.5">
              {/* Gamepad preset */}
              <GamepadPresetSelector profile={userProfile} onChange={setUserProfile} />

              {/* Input Overlay Visualizer */}
              <button
                onClick={() => setShowInputVisualizer(!showInputVisualizer)}
                title="Toggle On-Screen Input Visualizer"
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded font-bold text-[10px] transition ${
                  showInputVisualizer
                    ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{showInputVisualizer ? 'ON' : 'OFF'}</span>
              </button>

              <div className="w-px h-3.5 bg-zinc-800 mx-0.5" />

              {/* Battle Mode Toggle */}
              <button
                onClick={() => {
                  setBattleMode((prev) => {
                    const next = prev === 'dynamic' ? 'auto_spectate' : prev === 'auto_spectate' ? 'classic_turn' : 'dynamic';
                    try {
                      localStorage.setItem('op_kof_battle_mode_v1', next);
                    } catch {}
                    return next;
                  });
                }}
                title="Switch Battle Mode: Dynamic Real-Time / Auto Fight / Classic Turn"
                className={`flex items-center gap-1 px-2 py-1 rounded border font-black text-[10px] transition shadow-sm ${
                  battleMode === 'dynamic'
                    ? 'border-emerald-500/80 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/50'
                    : battleMode === 'auto_spectate'
                    ? 'border-amber-500 bg-amber-500 text-black'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {battleMode === 'dynamic' ? (
                  <Zap className="h-3 w-3 text-amber-300 animate-bounce" />
                ) : battleMode === 'auto_spectate' ? (
                  <Radio className="h-3 w-3 animate-pulse" />
                ) : (
                  <Clock className="h-3 w-3 text-zinc-400" />
                )}
                <span>
                  {battleMode === 'dynamic' ? 'REAL-TIME' : battleMode === 'auto_spectate' ? 'AUTO' : 'CLASSIC'}
                </span>
              </button>

              {/* Speed Controller */}
              <button
                onClick={() => setBattleSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : prev === 1.5 ? 2 : 1))}
                title="Cycle Battle Speed: 1.0x / 1.25x / 1.5x / 2.0x"
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-400 font-bold text-[10px] transition shadow-sm"
              >
                <FastForward className="h-3 w-3" />
                <span>{battleSpeed === 1 ? '1.0x' : `${battleSpeed}x`}</span>
              </button>

              {/* Force Strike Props */}
              <button
                onClick={() => triggerEnvironmentalImpact(30)}
                title="Force a physical shockwave strike on active environmental props"
                className="flex items-center gap-1 px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold text-[10px] transition shadow-sm animate-pulse"
              >
                <span>💥 STRIKE ENV</span>
              </button>
            </div>

            {/* Cluster C: Tournament & Exit Actions */}
            <div className="flex items-center gap-1">
              {/* TOURNAMENT BRACKET BUTTON */}
              <button
                onClick={() => setShowTournamentModal(true)}
                title="Open 3v3 Tournament Bracket & Match Progression"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-yellow-500/80 bg-gradient-to-r from-amber-600/40 via-yellow-600/30 to-amber-700/40 hover:from-amber-500/50 hover:to-yellow-500/40 text-amber-300 font-black text-[10px] sm:text-xs transition shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40"
              >
                <Trophy className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                <span className="tracking-wide">
                  {tournamentBracket
                    ? `BRACKET (${tournamentBracket.currentRoundIndex === 0 ? 'QF' : tournamentBracket.currentRoundIndex === 1 ? 'SF' : 'FINALS'})`
                    : 'BRACKET'}
                </span>
              </button>

              {/* EXIT BUTTON */}
              <button
                onClick={onExitToMenu}
                title="Exit Battle to Main Menu"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-800/80 bg-red-950/70 text-red-300 hover:bg-red-900 hover:text-white font-bold text-[10px] sm:text-xs transition shadow-sm"
              >
                <LogOut className="h-3 w-3" />
                <span>EXIT</span>
              </button>
            </div>

          </div>
        </div>

        <GamepadVisualizer
          active={showInputVisualizer}
          mapping={userProfile.gamepadMapping || DEFAULT_GAMEPAD_MAPPING}
          keyboardMapping={keyboardMappingRef.current}
        />
      </header>

      {/* HEALTH BARS, TIMER & SUPER METER HUD */}
      <div className="relative z-20 px-3 sm:px-8 pt-3 pb-1 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* TEAM 1 HUD (LEFT) */}
          <div className="col-span-5 flex flex-col">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-['Bebas_Neue'] text-base sm:text-xl text-amber-400 tracking-wider">
                  {activeT1State?.fighter?.shortName || activeT1State?.fighter?.name || 'Fighter'}
                </span>
                <span className="rounded bg-zinc-800 px-1 py-0.2 text-[8px] font-mono text-zinc-300 border border-zinc-700">
                  {t1Archetype}
                </span>
                {activeT1State?.isAwakened && (
                  <span className="rounded bg-gradient-to-r from-amber-400 via-red-500 to-purple-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse flex items-center gap-0.5">
                    ★ AWAKENED ({activeT1State?.awakeningProfile?.formName || 'FORM'})
                  </span>
                )}
                {activeT1State?.isMaxModeActive && (
                  <span className="rounded bg-gradient-to-r from-red-600 to-amber-500 px-1.5 py-0.2 text-[8px] font-black text-black animate-pulse">
                    MAX MODE
                  </span>
                )}
                {t1Phase === 'Desperate' && (
                  <span className="rounded bg-red-700 px-1 py-0.2 text-[8px] font-black text-white animate-pulse">
                    DESPERATION
                  </span>
                )}
              </div>
              <span className="font-mono text-xs text-amber-300 font-bold">
                {activeT1State?.currentHp || 0} / {activeT1State?.maxHp || 1} HP
              </span>
            </div>

            {/* Health Bar with Ghost Bar */}
            <div className="w-full h-5 sm:h-6 bg-zinc-950 rounded border-2 border-amber-500/80 overflow-hidden shadow-inner relative flex flex-row-reverse p-0.5">
              <div
                className="absolute top-0.5 bottom-0.5 right-0.5 bg-amber-200/85 transition-all duration-700 ease-out rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                style={{ width: `${Math.max(0, ghostT1Hp)}%` }}
              />
              <div
                className="h-full bg-gradient-to-l from-emerald-400 via-amber-400 to-red-500 transition-all duration-200 rounded-sm relative z-10"
                style={{ width: `${Math.max(0, t1HpPercent)}%` }}
              />
            </div>

            {/* Stamina Bar (Depletes on Dashes/Specials, Recovers on Defensive Downtime) */}
            <div className="mt-1 flex items-center gap-1.5 flex-row-reverse">
              <span className={`font-['Bebas_Neue'] text-xs tracking-wider transition-colors duration-300 ${
                (activeT1State?.staminaMeter ?? 100) <= 20 || activeT1State?.isExhausted
                  ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : (activeT1State?.staminaMeter ?? 100) < 50
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {activeT1State?.isExhausted || (activeT1State?.staminaMeter ?? 100) <= 0 ? '⚠️ EXHAUSTED' : 'STAMINA'}:
              </span>
              <div className={`flex-1 h-2 bg-zinc-950 rounded border transition-all duration-300 overflow-hidden flex flex-row-reverse p-0.5 ${
                activeT1State?.isExhausted || (activeT1State?.staminaMeter ?? 100) <= 20
                  ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : (activeT1State?.staminaMeter ?? 100) < 50
                  ? 'border-amber-500/60'
                  : 'border-emerald-500/60'
              }`}>
                <div
                  className={`h-full transition-all duration-200 rounded-sm ${
                    activeT1State?.isExhausted || (activeT1State?.staminaMeter ?? 100) <= 20
                      ? 'bg-gradient-to-l from-red-600 via-orange-600 to-red-500 animate-pulse'
                      : (activeT1State?.staminaMeter ?? 100) < 50
                      ? 'bg-gradient-to-l from-amber-500 via-yellow-400 to-orange-500'
                      : 'bg-gradient-to-l from-emerald-400 via-teal-300 to-cyan-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, activeT1State?.staminaMeter ?? 100))}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] font-bold ${
                activeT1State?.isExhausted || (activeT1State?.staminaMeter ?? 100) <= 20
                  ? 'text-red-400 animate-pulse'
                  : (activeT1State?.staminaMeter ?? 100) < 50
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {activeT1State?.isExhausted ? 'FATIGUE (0/100)' : `${activeT1State?.staminaMeter ?? 100}/100`}
              </span>
            </div>
            
            {renderStatusEffects(activeT1State, 'start')}

            {/* Guard Gauge, Stance Selector & Reserves */}
            <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
              {/* Interactive Stance Switcher for Team 1 */}
              <div className="flex items-center gap-1 bg-zinc-950/80 rounded border border-zinc-800 p-0.5">
                <button
                  onClick={() => switchStance('team1', 'offensive')}
                  title="Offensive Stance (+25% DMG, +15% Crit, -20% DEF)"
                  className={`px-1.5 py-0.5 rounded text-[8px] transition font-bold ${
                    activeT1State?.currentStance === 'offensive'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⚔️ 攻撃
                </button>
                <button
                  onClick={() => switchStance('team1', 'defensive')}
                  title="Defensive Stance (+35% Guard DR, +25% Block, -25% DMG)"
                  className={`px-1.5 py-0.5 rounded text-[8px] transition font-bold ${
                    activeT1State?.currentStance === 'defensive'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🛡️ 防御
                </button>
                <button
                  onClick={() => switchStance('team1', 'balanced')}
                  title="Balanced Stance (+10% Speed/Evasion)"
                  className={`px-1.5 py-0.5 rounded text-[8px] transition font-bold ${
                    activeT1State?.currentStance === 'balanced'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⚖️ 均整
                </button>
              </div>

              {/* Guard Gauge */}
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">GUARD:</span>
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (activeT1State?.guardGauge || 0) < 30 ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${activeT1State?.guardGauge || 0}%` }}
                  />
                </div>
              </div>
              
              {/* Focus Gauge */}
              <div className="flex items-center gap-1" title="Focus: reduced by enemy taunts. Low focus decreases accuracy and defense.">
                <span className="text-zinc-400">FOCUS:</span>
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (activeT1State?.focusMeter ?? 100) < 40 ? 'bg-orange-500 animate-pulse' : 'bg-amber-400'
                    }`}
                    style={{ width: `${activeT1State?.focusMeter ?? 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400">{activeT1State?.focusMeter ?? 100}%</span>
              </div>

              {/* Reserve Fighter Icons */}
              <div className="flex items-center gap-1">
                {team1.fighters?.map((f, i) => (
                  <div
                    key={`t1_reserve_${f.id}_${i}`}
                    className={`w-5 h-5 rounded border overflow-hidden ${
                      i === t1Index
                        ? 'border-amber-400 ring-1 ring-amber-400 scale-105'
                        : i < t1Index
                        ? 'border-zinc-800 opacity-30 grayscale'
                        : 'border-zinc-700 opacity-80'
                    }`}
                  >
                    <FighterAvatar avatarUrl={f.avatarUrl} avatarIcon={f.avatarIcon} name={f.name} size="xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* Super Meter Gauge (3 Stocks Max: 0-300) */}
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`font-['Bebas_Neue'] text-xs transition-colors duration-300 ${activeT1State.superMeter >= 300 ? 'text-white drop-shadow-[0_0_8px_white]' : 'text-amber-400'}`}>
                {activeT1State.superMeter >= 300 ? 'MAX' : 'SUPER'}:
              </span>
              <div className={`flex-1 h-2 bg-zinc-950 rounded border transition-all duration-300 overflow-hidden p-0.5 ${activeT1State.superMeter >= 300 ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'border-amber-500/50'}`}>
                <div
                  className={`h-full transition-all duration-200 rounded-sm ${activeT1State.superMeter >= 300 ? 'bg-white animate-pulse' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'}`}
                  style={{ width: `${((activeT1State?.superMeter || 0) / 300) * 100}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] font-bold transition-all duration-300 ${activeT1State.superMeter >= 300 ? 'text-white scale-110' : 'text-amber-400'}`}>
                {activeT1State.superMeter >= 300 ? 'MAX READY' : `${Math.floor((activeT1State?.superMeter || 0) / 100)} LVL (${activeT1State?.superMeter || 0})`}
              </span>
            </div>

            {/* Three-Segment Haki Meter (0-300: 3 segments of 100) */}
            <div className="mt-1 flex items-center gap-1.5">
              <span className="font-['Bebas_Neue'] text-xs text-purple-400 flex items-center gap-0.5">
                <Zap className="h-3 w-3 animate-bounce" /> HAKI:
              </span>
              <div className="flex-1 flex gap-1 h-2 bg-zinc-950 rounded p-0.5 border border-purple-500/40">
                <div className={`flex-1 h-full rounded-sm transition-all duration-300 ${activeT1State.hakiMeter >= 100 ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-zinc-800'}`} />
                <div className={`flex-1 h-full rounded-sm transition-all duration-300 ${activeT1State.hakiMeter >= 200 ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-zinc-800'}`} />
                <div className={`flex-1 h-full rounded-sm transition-all duration-300 ${activeT1State.hakiMeter >= 300 ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'bg-zinc-800'}`} />
              </div>
              <span className="font-mono text-[10px] font-bold text-purple-300">
                {activeT1State.isHakiAwakened ? `AWAKENED (${activeT1State.hakiAwakeningTurnsLeft}T)` : `${Math.floor((activeT1State.hakiMeter || 0) / 100)}/3 SEG`}
              </span>
            </div>
          </div>

          {/* CENTER ROUND TIMELESS CLASH EMBLEM */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-zinc-950 border-2 border-amber-500 shadow-2xl overflow-hidden relative group">
              <span className={`font-['Press_Start_2P'] text-[8px] tracking-wider transition ${
                ((activeT1State?.currentHp || 0) / (activeT1State?.maxHp || 1) <= 0.30 && (activeT2State?.currentHp || 0) / (activeT2State?.maxHp || 1) <= 0.30)
                  ? 'text-red-500 animate-pulse font-bold'
                  : 'text-zinc-400'
              }`}>
                {((activeT1State?.currentHp || 0) / (activeT1State?.maxHp || 1) <= 0.30 && (activeT2State?.currentHp || 0) / (activeT2State?.maxHp || 1) <= 0.30) ? 'CRITICAL' : 'FIGHT'}
              </span>
              <span
                className={`font-['Press_Start_2P'] text-xl sm:text-2xl font-black tracking-normal transition ${
                  ((activeT1State?.currentHp || 0) / (activeT1State?.maxHp || 1) <= 0.30 && (activeT2State?.currentHp || 0) / (activeT2State?.maxHp || 1) <= 0.30)
                    ? 'text-red-500 animate-pulse font-black'
                    : 'text-amber-400'
                }`}
              >
                ∞
              </span>
            </div>
            <span className="font-['Bebas_Neue'] text-xs text-zinc-400 tracking-wider mt-0.5">
              ROUND {currentRound}
            </span>
            
            {/* WIN/LOSS ROUND SCORECARD */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 3 }).map((_, idx) => {
                const roundIdx = idx;
                const isConcluded = roundIdx < (roundHistory?.length || 0);
                const winner = isConcluded ? roundHistory[roundIdx] : null;

                return (
                  <div
                    key={roundIdx}
                    className={`w-4 h-4 rounded-full flex items-center justify-center border text-[8px] transition-all duration-300 ${
                      winner === 'team1'
                        ? 'bg-amber-500 border-amber-300 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110'
                        : winner === 'team2'
                        ? 'bg-purple-600 border-purple-400 text-white font-extrabold scale-110'
                        : winner === 'draw'
                        ? 'bg-zinc-600 border-zinc-400 text-zinc-200 font-extrabold scale-110'
                        : 'bg-zinc-950/80 border-zinc-700 text-zinc-500'
                    }`}
                    title={
                      isConcluded
                        ? `Round ${roundIdx + 1}: ${winner === 'team1' ? 'You Won' : winner === 'team2' ? 'Opponent Won' : 'Draw'}`
                        : `Round ${roundIdx + 1}`
                    }
                  >
                    {winner === 'team1' ? '👊' : winner === 'team2' ? '💀' : winner === 'draw' ? '⚖️' : roundIdx + 1}
                  </div>
                );
              })}
            </div>

            {/* WINS PLACAR: e.g. 02 - 01 */}
            <div className="flex items-center gap-1 mt-1">
              <span className={`font-['Press_Start_2P'] text-[10px] font-black tabular-nums transition-all duration-300 ${
                roundHistory.filter((r) => r === 'team1').length > roundHistory.filter((r) => r === 'team2').length
                  ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  : 'text-zinc-400'
              }`}>
                {String(roundHistory.filter((r) => r === 'team1').length).padStart(2, '0')}
              </span>
              <span className="font-['Press_Start_2P'] text-[8px] text-zinc-500">-</span>
              <span className={`font-['Press_Start_2P'] text-[10px] font-black tabular-nums transition-all duration-300 ${
                roundHistory.filter((r) => r === 'team2').length > roundHistory.filter((r) => r === 'team1').length
                  ? 'text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]'
                  : 'text-zinc-400'
              }`}>
                {String(roundHistory.filter((r) => r === 'team2').length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* TEAM 2 HUD (RIGHT) */}
          <div className="col-span-5 flex flex-col">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono text-xs text-purple-300 font-bold">
                {activeT2State?.currentHp || 0} / {activeT2State?.maxHp || 1} HP
              </span>
              <div className="flex items-center gap-1.5">
                {activeT2State?.isAwakened && (
                  <span className="rounded bg-gradient-to-r from-purple-600 via-red-500 to-amber-400 px-1.5 py-0.2 text-[8px] font-black text-white shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse flex items-center gap-0.5">
                    ★ AWAKENED ({activeT2State?.awakeningProfile?.formName || 'FORM'})
                  </span>
                )}
                {t2Phase === 'Desperate' && (
                  <span className="rounded bg-red-700 px-1 py-0.2 text-[8px] font-black text-white animate-pulse">
                    DESPERATION
                  </span>
                )}
                {activeT2State?.isMaxModeActive && (
                  <span className="rounded bg-gradient-to-r from-red-600 to-purple-500 px-1.5 py-0.2 text-[8px] font-black text-black animate-pulse">
                    MAX MODE
                  </span>
                )}
                <span className="rounded bg-zinc-800 px-1 py-0.2 text-[8px] font-mono text-zinc-300 border border-zinc-700">
                  {t2Archetype}
                </span>
                <span className="font-['Bebas_Neue'] text-base sm:text-xl text-purple-400 tracking-wider">
                  {activeT2State?.fighter?.shortName || activeT2State?.fighter?.name || 'Fighter'}
                </span>
              </div>
            </div>

            {/* Health Bar with Ghost Bar */}
            <div className="w-full h-5 sm:h-6 bg-zinc-950 rounded border-2 border-purple-500/80 overflow-hidden shadow-inner relative p-0.5">
              <div
                className="absolute top-0.5 bottom-0.5 left-0.5 bg-amber-200/85 transition-all duration-700 ease-out rounded-sm shadow-[0_0_10px_rgba(251,191,36,0.9)]"
                style={{ width: `${Math.max(0, ghostT2Hp)}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-purple-400 to-red-500 transition-all duration-200 rounded-sm relative z-10"
                style={{ width: `${Math.max(0, t2HpPercent)}%` }}
              />
            </div>

            {/* Stamina Bar (Depletes on Dashes/Specials, Recovers on Defensive Downtime) */}
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`font-['Bebas_Neue'] text-xs tracking-wider transition-colors duration-300 ${
                (activeT2State?.staminaMeter ?? 100) <= 20 || activeT2State?.isExhausted
                  ? 'text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                  : (activeT2State?.staminaMeter ?? 100) < 50
                  ? 'text-amber-400'
                  : 'text-purple-300'
              }`}>
                {activeT2State?.isExhausted || (activeT2State?.staminaMeter ?? 100) <= 0 ? '⚠️ EXHAUSTED' : 'STAMINA'}:
              </span>
              <div className={`flex-1 h-2 bg-zinc-950 rounded border transition-all duration-300 overflow-hidden p-0.5 ${
                activeT2State?.isExhausted || (activeT2State?.staminaMeter ?? 100) <= 20
                  ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : (activeT2State?.staminaMeter ?? 100) < 50
                  ? 'border-amber-500/60'
                  : 'border-purple-500/60'
              }`}>
                <div
                  className={`h-full transition-all duration-200 rounded-sm ${
                    activeT2State?.isExhausted || (activeT2State?.staminaMeter ?? 100) <= 20
                      ? 'bg-gradient-to-r from-red-600 via-orange-600 to-red-500 animate-pulse'
                      : (activeT2State?.staminaMeter ?? 100) < 50
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500'
                      : 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, activeT2State?.staminaMeter ?? 100))}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] font-bold ${
                activeT2State?.isExhausted || (activeT2State?.staminaMeter ?? 100) <= 20
                  ? 'text-red-400 animate-pulse'
                  : (activeT2State?.staminaMeter ?? 100) < 50
                  ? 'text-amber-400'
                  : 'text-purple-300'
              }`}>
                {activeT2State?.isExhausted ? 'FATIGUE (0/100)' : `${activeT2State?.staminaMeter ?? 100}/100`}
              </span>
            </div>
            
            {renderStatusEffects(activeT2State, 'end')}

            {/* Guard Gauge, Stance Selector & Reserves */}
            <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                {currentTeam2.fighters?.map((f, i) => (
                  <div
                    key={`t2_reserve_${f.id}_${i}`}
                    className={`w-5 h-5 rounded border overflow-hidden ${
                      i === t2Index
                        ? 'border-purple-400 ring-1 ring-purple-400 scale-105'
                        : i < t2Index
                        ? 'border-zinc-800 opacity-30 grayscale'
                        : 'border-zinc-700 opacity-80'
                    }`}
                  >
                    <FighterAvatar avatarUrl={f.avatarUrl} avatarIcon={f.avatarIcon} name={f.name} size="xs" />
                  </div>
                ))}
              </div>

              {/* Guard Gauge */}
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">GUARD:</span>
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (activeT2State?.guardGauge || 0) < 30 ? 'bg-red-500 animate-pulse' : 'bg-purple-400'
                    }`}
                    style={{ width: `${activeT2State?.guardGauge || 0}%` }}
                  />
                </div>
              </div>

              {/* Focus Gauge */}
              <div className="flex items-center gap-1" title="Focus: reduced by enemy taunts. Low focus decreases accuracy and defense.">
                <span className="text-zinc-400">FOCUS:</span>
                <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (activeT2State?.focusMeter ?? 100) < 40 ? 'bg-orange-500 animate-pulse' : 'bg-purple-400'
                    }`}
                    style={{ width: `${activeT2State?.focusMeter ?? 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400">{activeT2State?.focusMeter ?? 100}%</span>
              </div>

              {/* Interactive Stance Switcher for Team 2 */}
              <div className="flex items-center gap-1 bg-zinc-950/80 rounded border border-zinc-800 p-0.5">
                <button
                  onClick={() => switchStance('team2', 'offensive')}
                  title="Offensive Stance (+25% DMG, +15% Crit, -20% DEF)"
                  className={`px-1.5 py-0.5 rounded text-[8px] transition font-bold ${
                    activeT2State?.currentStance === 'offensive'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⚔️ 攻撃
                </button>
                <button
                  onClick={() => switchStance('team2', 'defensive')}
                  title="Defensive Stance (+35% Guard DR, +25% Block, -25% DMG)"
                  className={`px-1.5 py-0.5 rounded text-[8px] transition font-bold ${
                    activeT2State?.currentStance === 'defensive'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🛡️ 防御
                </button>
                <button
                  onClick={() => switchStance('team2', 'balanced')}
                  title="Balanced Stance (+10% Speed/Evasion)"
                  className={`px-1.5 py-0.5 rounded text-[8px] transition font-bold ${
                    activeT2State?.currentStance === 'balanced'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⚖️ 均整
                </button>
              </div>
            </div>

            {/* Super Meter Gauge */}
            <div className="mt-1 flex items-center gap-1.5 flex-row-reverse">
              <span className={`font-['Bebas_Neue'] text-xs transition-colors duration-300 ${activeT2State.superMeter >= 300 ? 'text-white drop-shadow-[0_0_8px_white]' : 'text-purple-400'}`}>
                {activeT2State.superMeter >= 300 ? 'MAX' : 'SUPER'}:
              </span>
              <div className={`flex-1 h-2 bg-zinc-950 rounded border transition-all duration-300 overflow-hidden p-0.5 flex flex-row-reverse ${activeT2State.superMeter >= 300 ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'border-purple-500/50'}`}>
                <div
                  className={`h-full transition-all duration-200 rounded-sm ${activeT2State.superMeter >= 300 ? 'bg-white animate-pulse' : 'bg-gradient-to-l from-purple-500 via-pink-500 to-red-500'}`}
                  style={{ width: `${((activeT2State?.superMeter || 0) / 300) * 100}%` }}
                />
              </div>
              <span className={`font-mono text-[10px] font-bold transition-all duration-300 ${activeT2State.superMeter >= 300 ? 'text-white scale-110' : 'text-purple-400'}`}>
                {activeT2State.superMeter >= 300 ? 'MAX READY' : `${Math.floor((activeT2State?.superMeter || 0) / 100)} LVL (${activeT2State?.superMeter || 0})`}
              </span>
            </div>

            {/* Three-Segment Haki Meter */}
            <div className="mt-1 flex items-center gap-1.5 flex-row-reverse">
              <span className="font-['Bebas_Neue'] text-xs text-purple-400 flex items-center gap-0.5">
                HAKI <Zap className="h-3 w-3 animate-bounce" />
              </span>
              <div className="flex-1 flex gap-1 h-2 bg-zinc-950 rounded p-0.5 border border-purple-500/40 flex-row-reverse">
                <div className={`flex-1 h-full rounded-sm transition-all duration-300 ${activeT2State.hakiMeter >= 100 ? 'bg-gradient-to-l from-purple-500 to-indigo-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-zinc-800'}`} />
                <div className={`flex-1 h-full rounded-sm transition-all duration-300 ${activeT2State.hakiMeter >= 200 ? 'bg-gradient-to-l from-purple-500 to-indigo-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-zinc-800'}`} />
                <div className={`flex-1 h-full rounded-sm transition-all duration-300 ${activeT2State.hakiMeter >= 300 ? 'bg-gradient-to-l from-purple-400 via-pink-400 to-yellow-300 animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'bg-zinc-800'}`} />
              </div>
              <span className="font-mono text-[10px] font-bold text-purple-300">
                {activeT2State.isHakiAwakened ? `AWAKENED (${activeT2State.hakiAwakeningTurnsLeft}T)` : `${Math.floor((activeT2State.hakiMeter || 0) / 100)}/3 SEG`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME AI PLAY-BY-PLAY ANNOUNCER COMMENTARY TICKER */}
      <AnimatePresence>
        {liveCommentaryText && (
          <div className="relative z-20 max-w-3xl mx-auto px-4 mt-1 mb-2">
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="rounded-2xl border border-amber-500/70 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-2.5 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center gap-3 backdrop-blur-md"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 animate-pulse text-base">
                🎙️
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-amber-500 text-black font-black uppercase tracking-wider">
                    {liveCommentaryTag}
                  </span>
                  <span className="font-['Cinzel'] text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                    AI Play-by-Play Announcer
                  </span>
                </div>
                <p className="font-['Cinzel'] text-xs sm:text-sm font-black text-white mt-0.5 truncate">
                  "{liveCommentaryText}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN BATTLE ARENA STAGE (FIGHTER CLASH VIEW) */}
      <main
        className={`relative flex-1 flex flex-col justify-between items-center px-4 max-w-6xl mx-auto w-full z-10 transition-transform duration-200 ${
          isHitStopActive ? 'hit-stop-active' : ''
        } ${
          cameraShake === 'heavy'
            ? 'camera-shake-heavy'
            : cameraShake === 'medium'
            ? 'camera-shake-medium'
            : cameraShake === 'light'
            ? 'camera-shake-light'
            : ''
        } ${isImpactZooming ? 'impact-zoom-active' : ''}`}
      >
        {/* DYNAMIC KOF 2002 VICTORY ANNOUNCEMENT OVERLAY */}
        <AnimatePresence>
          {koVictoryData && (
            <KOFVictoryAnnouncement
              key={`kof-ko-round-${koVictoryData.roundNumber}`}
              winnerFighter={koVictoryData.winnerFighter}
              winningTeamName={koVictoryData.winningTeamName}
              roundNumber={koVictoryData.roundNumber}
              isDraw={koVictoryData.isDraw}
            />
          )}
        </AnimatePresence>

        {/* ROUND ANNOUNCEMENT OVERLAY */}
        {roundAnnouncement && !showFightBanner && !koVictoryData && (
          <div className="absolute top-1/3 -translate-y-1/2 z-50 pointer-events-none animate-bounce text-center">
            <div className="font-['Cinzel'] text-3xl sm:text-6xl font-black text-amber-300 drop-shadow-[0_0_30px_rgba(245,158,11,1)] tracking-wider">
              {roundAnnouncement}
            </div>
          </div>
        )}

        {/* RETRO-ARCADE "READY... FIGHT!" CTA BANNER */}
        <AnimatePresence>
          {showFightBanner && (
            <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center justify-center overflow-visible">
              {/* Full-width dramatic ribbon background */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.95 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-x-0 h-20 sm:h-24 bg-gradient-to-r from-red-600/95 via-black/95 to-red-600/95 border-y-2 border-amber-500 shadow-[0_0_40px_rgba(220,38,38,0.7)] origin-center"
              />

              {/* Ready... text sliding from left */}
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.35, type: 'spring', stiffness: 100 }}
                className="relative z-10 font-['Cinzel'] text-xl sm:text-2xl font-black text-amber-300 tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                READY...
              </motion.div>

              {/* FIGHT! stamp dropping with explosive impact */}
              <motion.div
                initial={{ scale: 3.5, opacity: 0, rotate: -5 }}
                animate={{ scale: [3.5, 0.9, 1.15, 1], opacity: 1, rotate: 0 }}
                exit={{ scale: 1.8, opacity: 0, filter: 'blur(5px)' }}
                transition={{ delay: 0.4, duration: 0.45, ease: 'easeOut' }}
                className="relative z-10 font-['Press_Start_2P'] text-3xl sm:text-6xl font-black text-red-500 tracking-wider text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] select-none mt-1 sm:mt-2"
                style={{
                  WebkitTextStroke: '2px #f59e0b',
                }}
              >
                FIGHT!
                {/* Secondary Japanese text below for arcade style */}
                <span className="block font-sans text-[10px] sm:text-xs text-amber-400 font-bold tracking-widest mt-1 opacity-90 drop-shadow-md">
                  勝負 (SHOUBU)!
                </span>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MINIMALIST TRANSPARENT SPECIAL MOVE GLOW OVERLAY */}
        <AnimatePresence>
          {activeSuperCutin && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.15, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none p-4"
            >
              <span className="font-['Press_Start_2P'] text-[10px] sm:text-xs text-amber-300 uppercase tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-pulse">
                ★ SPECIAL DESPERATION MOVE ★
              </span>
              <h2
                className="font-['Cinzel'] text-4xl sm:text-7xl font-black text-center tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-400 drop-shadow-[0_0_35px_rgba(255,255,255,0.9)]"
              >
                {activeSuperCutin.moveName}
              </h2>
              <p className="font-['Montserrat'] text-base sm:text-2xl font-bold text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] tracking-widest mt-1">
                {activeSuperCutin.moveNameJP}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIGHTERS CLASH STAGE (HERO PORTRAITS & HAKI AURAS) */}
        <div className="w-full flex-1 flex items-center justify-between px-2 sm:px-12 my-auto relative">
          
          {/* Real-Time D3.js Hardware-Accelerated Haki Energy Field */}
          <HakiEnergyFieldD3
            team1HealthPct={activeT1State ? (activeT1State.currentHp / activeT1State.maxHp) * 100 : 100}
            team2HealthPct={activeT2State ? (activeT2State.currentHp / activeT2State.maxHp) * 100 : 100}
            team1MaxMode={activeT1State?.isMaxMode}
            team2MaxMode={activeT2State?.isMaxMode}
            hakiClashActive={hakiClashActive}
            conquerorFlash={conquerorFlash}
          />

          <HakiParticleEngine
            bursts={particleBursts}
            onBurstComplete={handleBurstComplete}
          />
          {/* FIGHTER 1 (LEFT) */}
          <motion.div
            animate={{
              x: actorInMotion === 'team1' ? 90 : (targetDodgeEffect === 'team1' ? -50 : 0),
              opacity: targetDodgeEffect === 'team1' ? 0.35 : 1,
              scale: targetHitFlinch === 'team1' ? 0.9 : (targetDodgeEffect === 'team1' ? 0.82 : 1),
              filter: targetHitFlinch === 'team1' ? 'brightness(1.8) contrast(1.4)' : (targetDodgeEffect === 'team1' ? 'blur(0.5px)' : 'none'),
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex flex-col items-center text-center relative"
          >
            {/* Fighter AI Hero Avatar */}
            <div className="relative group">
              {/* Fighter 1 Speech Bubble */}
              <AnimatePresence>
                {t1SpeechBubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 15, x: '-50%' }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.8, y: -10, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="absolute -top-20 left-1/2 z-50 bg-white text-zinc-950 font-sans text-xs sm:text-sm font-black px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(251,191,36,0.35)] border-2 border-amber-500 w-48 text-center pointer-events-none"
                  >
                    {t1SpeechBubble}
                    {/* Bubble Tail */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
                    <div className="absolute -bottom-[12.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[11px] border-t-amber-500 -z-10" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Haki Idle / Combat Stance Aura */}
              {activeT1State.fighter.hakiAura && (
                <HakiIdleAura
                  auraConfig={activeT1State.fighter.hakiAura}
                  size="arena"
                  stanceState={activeT1State.isAwakened ? 'awakened' : 'combat'}
                  showGroundRing={true}
                  showLightning={true}
                />
              )}

              <FighterAvatar
                avatarUrl={getLuffyGearAvatar(activeT1State)}
                avatarIcon={activeT1State.fighter.avatarIcon}
                name={activeT1State.fighter.name}
                size="hero"
                currentHp={activeT1State.currentHp}
                maxHp={activeT1State.maxHp}
                borderColor={activeT1State.fighter.themeColor}
                showScanlines={showScanlines}
                glowEffect={activeT1State.isMaxModeActive}
                className={`shadow-2xl ${
                  t1HakiDetails.isHakiGlowActive
                    ? t1HakiDetails.visualStyle === 'retro_8bit'
                      ? 'haki-retro-8bit-glow'
                      : t1HakiDetails.hakiType === 'conqueror'
                      ? 'haki-conqueror-glow'
                      : t1HakiDetails.hakiType === 'observation'
                      ? 'haki-observation-glow'
                      : t1HakiDetails.hakiType === 'void'
                      ? 'haki-void-glow'
                      : 'haki-armament-glow'
                    : ''
                }`}
              />

              {/* Haki Awakening Glowing Embers Particle System */}
              <HakiAwakeningEmbers isActive={activeT1State.isHakiAwakened ?? false} />

              {/* Awakened Dynamic Aura Visualizer */}
              <AwakenedAuraVisualizer
                side="team1"
                isAwakened={activeT1State.isAwakened ?? false}
                awakeningProfile={activeT1State.awakeningProfile}
                visualStyle={t1HakiDetails.visualStyle}
              />

              {/* Dynamic Haki lightning crackle overlays */}
              {t1HakiDetails.isHakiGlowActive && (
                <div 
                  className={t1HakiDetails.visualStyle === 'retro_8bit' ? 'haki-retro-8bit-lightning' : 'haki-lightning-overlay'}
                  style={{
                    borderColor: t1HakiDetails.hakiType === 'void' ? '#000000' : t1HakiDetails.hakiType === 'conqueror' ? '#a855f7' : t1HakiDetails.hakiType === 'observation' ? '#ef4444' : '#dc2626',
                    color: t1HakiDetails.hakiType === 'void' ? '#000000' : t1HakiDetails.hakiType === 'conqueror' ? '#a855f7' : t1HakiDetails.hakiType === 'observation' ? '#ef4444' : '#dc2626'
                  }}
                />
              )}

              {/* Active Haki Badge Overlay */}
              {t1HakiDetails.isHakiGlowActive && (
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1 bg-zinc-950/90 border px-2 py-0.5 rounded-full shadow-lg text-[7px] sm:text-[8px] font-black tracking-wider uppercase animate-pulse select-none ${
                  t1HakiDetails.hakiType === 'void' ? 'border-zinc-900 shadow-zinc-950' : t1HakiDetails.hakiType === 'conqueror' ? 'border-purple-500/80 shadow-purple-500/40' : t1HakiDetails.hakiType === 'observation' ? 'border-red-500/80 shadow-red-500/40' : 'border-red-500/80 shadow-red-500/40'
                }`}>
                  <span className={t1HakiDetails.hakiType === 'void' ? 'text-zinc-400' : t1HakiDetails.hakiType === 'conqueror' ? 'text-purple-400' : t1HakiDetails.hakiType === 'observation' ? 'text-red-400' : 'text-red-500'}>
                    ⚡ {t1HakiDetails.hakiType === 'void' ? 'EMPTY THRONE WILL' : t1HakiDetails.hakiType === 'conqueror' ? 'HAOSHOKU' : t1HakiDetails.hakiType === 'observation' ? 'KENBUNSHOKU' : 'BUSOSHOKU'}
                  </span>
                </div>
              )}

              {/* Kenbunshoku Eye Dodge Aura overlay - Red Kenbunshoku Haki + 2s Duration */}
              <AnimatePresence>
                {targetDodgeEffect === 'team1' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1.1, 1.3], opacity: [0, 1, 0.85, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.6, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-4 border-red-500 bg-red-600/30 shadow-[0_0_50px_rgba(239,68,68,1),inset_0_0_25px_rgba(220,38,38,0.85)] flex flex-col items-center justify-center z-40 pointer-events-none"
                  >
                    <Eye className="h-14 w-14 text-red-100 animate-pulse drop-shadow-[0_0_16px_rgba(239,68,68,1)]" />
                    <span className="text-[9px] font-black text-red-200 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,1)] mt-1 uppercase">
                      FUTURE SIGHT
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exhaustion / Fatigue Indicator Badge */}
              <AnimatePresence>
                {(activeT1State.isExhausted || (activeT1State.staminaMeter ?? 100) <= 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: [0.95, 1.05, 0.95] }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 bg-red-950/95 border-2 border-red-500 text-red-300 font-mono text-[8px] font-black px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center gap-1 uppercase tracking-wider select-none whitespace-nowrap"
                  >
                    <span>⚠️ FATIGUED (GUARD TO RECOVER) ⚠️</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Armament Shield Block bubble overlay - Same visual logic as Observation Haki in Blue with Shield Icon */}
              <AnimatePresence>
                {targetBlockedEffect === 'team1' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1.1, 1.3], opacity: [0, 1, 0.85, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-4 border-blue-500 bg-blue-600/30 shadow-[0_0_50px_rgba(59,130,246,1),inset_0_0_25px_rgba(37,99,235,0.85)] flex flex-col items-center justify-center z-40 pointer-events-none"
                  >
                    <Shield className="h-14 w-14 text-blue-100 animate-pulse drop-shadow-[0_0_16px_rgba(59,130,246,1)]" />
                    <span className="text-[9px] font-black text-blue-200 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(59,130,246,1)] mt-1 uppercase">
                      ARMAMENT GUARD
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stunned / Vulnerable Overlay - Yellow scheme with rotating dizzy elements and continuous pulsing */}
              <AnimatePresence>
                {((activeT1State?.statusEffects?.isStunned || 0) > 0) && (
                  <motion.div
                    key="stun-t1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-full bg-black/60 shadow-[0_0_55px_rgba(234,179,8,0.3),inset_0_0_30px_rgba(202,138,4,0.5)] border-2 border-yellow-500/50 flex flex-col items-center justify-center z-40 pointer-events-none"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="flex flex-col items-center justify-center"
                    >
                      <motion.img
                        src="https://em-content.zobj.net/source/microsoft-teams/400/face-with-spiral-eyes_1f635-200d-1f4ab.png"
                        alt="Stunned Emoji"
                        className="w-16 h-16 drop-shadow-[0_0_12px_rgba(234,179,8,1)] object-contain mb-1"
                        animate={{ rotate: 360, y: [0, -3, 0] }}
                        transition={{ 
                          rotate: { repeat: Infinity, duration: 3, ease: 'linear' },
                          y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
                        }}
                      />
                      <span className="text-[10px] font-black text-yellow-100 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,1)] uppercase bg-black/50 px-2 py-0.5 rounded border border-yellow-500/50 backdrop-blur-sm">
                        STUNNED ({activeT1State.statusEffects?.isStunned || 1})
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conqueror Aura Glow */}
              <div
                className="absolute -inset-2 rounded-3xl opacity-40 blur-lg -z-10 animate-pulse pointer-events-none"
                style={{ backgroundColor: activeT1State.fighter.themeColor }}
              />

              {/* Floating Damage Text (framer-motion) rising from target's position upon impact */}
              <FloatingDamageText items={floatingDamages.filter((d) => d.side === 'team1')} />
            </div>

            <div className="mt-3">
              <h3 className="font-['Cinzel'] text-lg sm:text-2xl font-bold text-white tracking-wide">
                {activeT1State?.fighter?.name || 'Loading...'}
              </h3>
              <p className="font-mono text-xs text-amber-400">{activeT1State?.fighter?.epithet || 'Searching for opponent'}</p>
            </div>
          </motion.div>

          {/* CENTER CLASH EMBLEM */}
          <div className="flex flex-col items-center justify-center mx-2 z-10">
            <div className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 font-['Cinzel'] text-xl sm:text-2xl font-black text-black shadow-2xl border-2 border-zinc-950">
              VS
            </div>
          </div>

          {/* FIGHTER 2 (RIGHT) */}
          <motion.div
            animate={{
              x: actorInMotion === 'team2' ? -90 : (targetDodgeEffect === 'team2' ? 50 : 0),
              opacity: targetDodgeEffect === 'team2' ? 0.35 : 1,
              scale: targetHitFlinch === 'team2' ? 0.9 : (targetDodgeEffect === 'team2' ? 0.82 : 1),
              filter: targetHitFlinch === 'team2' ? 'brightness(1.8) contrast(1.4)' : (targetDodgeEffect === 'team2' ? 'blur(0.5px)' : 'none'),
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex flex-col items-center text-center relative"
          >
            {/* Fighter AI Hero Avatar */}
            <div className="relative group">
              {/* Fighter 2 Speech Bubble */}
              <AnimatePresence>
                {t2SpeechBubble && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 15, x: '-50%' }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.8, y: -10, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="absolute -top-20 left-1/2 z-50 bg-white text-zinc-950 font-sans text-xs sm:text-sm font-black px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.35)] border-2 border-purple-500 w-48 text-center pointer-events-none"
                  >
                    {t2SpeechBubble}
                    {/* Bubble Tail */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white" />
                    <div className="absolute -bottom-[12.5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[11px] border-t-purple-500 -z-10" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Custom Haki Idle / Combat Stance Aura */}
              {activeT2State.fighter.hakiAura && (
                <HakiIdleAura
                  auraConfig={activeT2State.fighter.hakiAura}
                  size="arena"
                  stanceState={activeT2State.isAwakened ? 'awakened' : 'combat'}
                  showGroundRing={true}
                  showLightning={true}
                />
              )}

              <FighterAvatar
                avatarUrl={getLuffyGearAvatar(activeT2State)}
                avatarIcon={activeT2State.fighter.avatarIcon}
                name={activeT2State.fighter.name}
                size="hero"
                currentHp={activeT2State.currentHp}
                maxHp={activeT2State.maxHp}
                borderColor={activeT2State.fighter.themeColor}
                showScanlines={showScanlines}
                glowEffect={activeT2State.isMaxModeActive}
                className={`shadow-2xl ${
                  t2HakiDetails.isHakiGlowActive
                    ? t2HakiDetails.visualStyle === 'retro_8bit'
                      ? 'haki-retro-8bit-glow'
                      : t2HakiDetails.hakiType === 'conqueror'
                      ? 'haki-conqueror-glow'
                      : t2HakiDetails.hakiType === 'observation'
                      ? 'haki-observation-glow'
                      : t2HakiDetails.hakiType === 'void'
                      ? 'haki-void-glow'
                      : 'haki-armament-glow'
                    : ''
                }`}
              />

              {/* Haki Awakening Glowing Embers Particle System */}
              <HakiAwakeningEmbers isActive={activeT2State.isHakiAwakened ?? false} />

              {/* Awakened Dynamic Aura Visualizer */}
              <AwakenedAuraVisualizer
                side="team2"
                isAwakened={activeT2State.isAwakened ?? false}
                awakeningProfile={activeT2State.awakeningProfile}
                visualStyle={t2HakiDetails.visualStyle}
              />

              {/* Dynamic Haki lightning crackle overlays */}
              {t2HakiDetails.isHakiGlowActive && (
                <div 
                  className={t2HakiDetails.visualStyle === 'retro_8bit' ? 'haki-retro-8bit-lightning' : 'haki-lightning-overlay'}
                  style={{
                    borderColor: t2HakiDetails.hakiType === 'void' ? '#000000' : t2HakiDetails.hakiType === 'conqueror' ? '#a855f7' : t2HakiDetails.hakiType === 'observation' ? '#ef4444' : '#dc2626',
                    color: t2HakiDetails.hakiType === 'void' ? '#000000' : t2HakiDetails.hakiType === 'conqueror' ? '#a855f7' : t2HakiDetails.hakiType === 'observation' ? '#ef4444' : '#dc2626'
                  }}
                />
              )}

              {/* Active Haki Badge Overlay */}
              {t2HakiDetails.isHakiGlowActive && (
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1 bg-zinc-950/90 border px-2 py-0.5 rounded-full shadow-lg text-[7px] sm:text-[8px] font-black tracking-wider uppercase animate-pulse select-none ${
                  t2HakiDetails.hakiType === 'void' ? 'border-zinc-900 shadow-zinc-950' : t2HakiDetails.hakiType === 'conqueror' ? 'border-purple-500/80 shadow-purple-500/40' : t2HakiDetails.hakiType === 'observation' ? 'border-red-500/80 shadow-red-500/40' : 'border-red-500/80 shadow-red-500/40'
                }`}>
                  <span className={t2HakiDetails.hakiType === 'void' ? 'text-zinc-400' : t2HakiDetails.hakiType === 'conqueror' ? 'text-purple-400' : t2HakiDetails.hakiType === 'observation' ? 'text-red-400' : 'text-red-500'}>
                    ⚡ {t2HakiDetails.hakiType === 'void' ? 'EMPTY THRONE WILL' : t2HakiDetails.hakiType === 'conqueror' ? 'HAOSHOKU' : t2HakiDetails.hakiType === 'observation' ? 'KENBUNSHOKU' : 'BUSOSHOKU'}
                  </span>
                </div>
              )}

              {/* Kenbunshoku Eye Dodge Aura overlay - Red Kenbunshoku Haki + 2s Duration */}
              <AnimatePresence>
                {targetDodgeEffect === 'team2' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1.1, 1.3], opacity: [0, 1, 0.85, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.6, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-4 border-red-500 bg-red-600/30 shadow-[0_0_50px_rgba(239,68,68,1),inset_0_0_25px_rgba(220,38,38,0.85)] flex flex-col items-center justify-center z-40 pointer-events-none"
                  >
                    <Eye className="h-14 w-14 text-red-100 animate-pulse drop-shadow-[0_0_16px_rgba(239,68,68,1)]" />
                    <span className="text-[9px] font-black text-red-200 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,1)] mt-1 uppercase">
                      FUTURE SIGHT
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Exhaustion / Fatigue Indicator Badge */}
              <AnimatePresence>
                {(activeT2State.isExhausted || (activeT2State.staminaMeter ?? 100) <= 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: [0.95, 1.05, 0.95] }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 bg-red-950/95 border-2 border-red-500 text-red-300 font-mono text-[8px] font-black px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center gap-1 uppercase tracking-wider select-none whitespace-nowrap"
                  >
                    <span>⚠️ FATIGUED (GUARD TO RECOVER) ⚠️</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Armament Shield Block bubble overlay - Same visual logic as Observation Haki in Blue with Shield Icon */}
              <AnimatePresence>
                {targetBlockedEffect === 'team2' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1.1, 1.3], opacity: [0, 1, 0.85, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full border-4 border-blue-500 bg-blue-600/30 shadow-[0_0_50px_rgba(59,130,246,1),inset_0_0_25px_rgba(37,99,235,0.85)] flex flex-col items-center justify-center z-40 pointer-events-none"
                  >
                    <Shield className="h-14 w-14 text-blue-100 animate-pulse drop-shadow-[0_0_16px_rgba(59,130,246,1)]" />
                    <span className="text-[9px] font-black text-blue-200 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(59,130,246,1)] mt-1 uppercase">
                      ARMAMENT GUARD
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stunned / Vulnerable Overlay - Yellow scheme with rotating dizzy elements and continuous pulsing */}
              <AnimatePresence>
                {((activeT2State?.statusEffects?.isStunned || 0) > 0) && (
                  <motion.div
                    key="stun-t2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-full bg-black/60 shadow-[0_0_55px_rgba(234,179,8,0.3),inset_0_0_30px_rgba(202,138,4,0.5)] border-2 border-yellow-500/50 flex flex-col items-center justify-center z-40 pointer-events-none"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="flex flex-col items-center justify-center"
                    >
                      <motion.img
                        src="https://em-content.zobj.net/source/microsoft-teams/400/face-with-spiral-eyes_1f635-200d-1f4ab.png"
                        alt="Stunned Emoji"
                        className="w-16 h-16 drop-shadow-[0_0_12px_rgba(234,179,8,1)] object-contain mb-1"
                        animate={{ rotate: 360, y: [0, -3, 0] }}
                        transition={{ 
                          rotate: { repeat: Infinity, duration: 3, ease: 'linear' },
                          y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
                        }}
                      />
                      <span className="text-[10px] font-black text-yellow-100 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,1)] uppercase bg-black/50 px-2 py-0.5 rounded border border-yellow-500/50 backdrop-blur-sm">
                        STUNNED ({activeT2State.statusEffects?.isStunned || 1})
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Conqueror Aura Glow */}
              <div
                className="absolute -inset-2 rounded-3xl opacity-40 blur-lg -z-10 animate-pulse pointer-events-none"
                style={{ backgroundColor: activeT2State.fighter.themeColor }}
              />

              {/* Floating Damage Text (framer-motion) rising from target's position upon impact */}
              <FloatingDamageText items={floatingDamages.filter((d) => d.side === 'team2')} />
            </div>

            <div className="mt-3">
              <h3 className="font-['Cinzel'] text-lg sm:text-2xl font-bold text-white tracking-wide">
                {activeT2State?.fighter?.name || 'Loading...'}
              </h3>
              <p className="font-mono text-xs text-purple-400">{activeT2State?.fighter?.epithet || 'Searching for opponent'}</p>
            </div>
          </motion.div>
        </div>

        {/* PLAYER TRANSFORMATION COOLDOWN & FORM DURATION OVERLAY */}
        {activeT1State && (
          <div className="w-full mb-2">
            <TransformationTrackerOverlay
              fighterState={activeT1State}
              opponentState={activeT2State}
              currentTurnCount={combatLogs.filter((log) => log.roundNumber === currentRound).length}
              currentRound={currentRound}
              onInitiateShift={handlePlayerInitiateShift}
              onRevertForm={handlePlayerRevertShift}
              onOpenGuide={() => {
                setDocInitialTab('transformations');
                setShowDocModal(true);
              }}
              isBusy={battleMode === 'classic_turn' ? isExecutingTurn.current : isT1InRecovery}
            />
          </div>
        )}

        {/* MANUAL INTERACTIVE ACTION COMMAND BAR (When Auto-Fight is off or in Dynamic mode) */}
        {!isAutoPlay && (
          <div className="w-full mb-2 bg-zinc-950/95 border border-amber-500/50 rounded-xl p-2.5 flex flex-wrap items-center justify-center gap-1.5 z-20 shadow-xl backdrop-blur-sm">
            {battleMode === 'dynamic' ? (
              <div className="w-full flex items-center justify-between px-2 py-1 mb-1 rounded bg-zinc-900/90 border border-emerald-500/40 text-[9px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Zap className="h-3 w-3 text-amber-300 animate-pulse" />
                  <span>DYNAMIC REAL-TIME COMBAT</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300 font-normal">No turn waiting • Strike & Combo at will!</span>
                </div>
                {isT1InRecovery ? (
                  <span className="text-amber-400 font-black animate-pulse bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/50">
                    ⚡ RECOVERY (ATTACKING...)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-black bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/50">
                    ✓ READY TO STRIKE
                  </span>
                )}
              </div>
            ) : (
              <span className="font-['Press_Start_2P'] text-[8px] text-amber-400 mr-2">COMMANDS:</span>
            )}

            {(() => {
              const isPlayerBusy = battleMode === 'classic_turn' ? isExecutingTurn.current : isT1InRecovery;
              const isExhausted = activeT1State.isExhausted || (activeT1State.staminaMeter ?? 100) <= 0;
              return (
                <>
                <div className="w-full flex items-center justify-center gap-2 mb-2 px-2 py-1.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold hidden sm:inline">STANCE:</span>
                  
                  <button 
                    onClick={() => handleStanceChange('offensive')}
                    className={`px-3 py-1 rounded text-xs font-black font-mono transition-all border ${activeT1State.currentStance === 'offensive' ? 'bg-red-950/80 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                  >
                    🔥 OFFENSIVE
                  </button>
                  
                  <button 
                    onClick={() => handleStanceChange('balanced')}
                    className={`px-3 py-1 rounded text-xs font-black font-mono transition-all border ${activeT1State.currentStance === 'balanced' ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                  >
                    ⚖️ BALANCED
                  </button>
                  
                  <button 
                    onClick={() => handleStanceChange('defensive')}
                    className={`px-3 py-1 rounded text-xs font-black font-mono transition-all border ${activeT1State.currentStance === 'defensive' ? 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                  >
                    🛡️ DEFENSIVE
                  </button>
                </div>

                  {((activeT1State.statusEffects?.isStunned || 0) > 0) && (
                    <div className="w-full text-center py-1 px-2 bg-yellow-950/90 border border-yellow-500 rounded text-[9px] font-mono text-yellow-200 font-bold animate-pulse mb-1 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
                      <span>⚡ STUNNED (ATORDISSO) — VULNERÁVEL: NÃO PODE ATACAR OU DEFENDER ({activeT1State.statusEffects?.isStunned})</span>
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-spin" />
                    </div>
                  )}

                  {isExhausted && (
                    <div className="w-full text-center py-0.5 px-2 bg-red-950/80 border border-red-500/60 rounded text-[9px] font-mono text-red-300 font-bold animate-pulse mb-1">
                      ⚠️ EXHAUSTION PENALTY ACTIVE: Attacks deal -25% DMG • Take +15% DMG • Use GUARD for tactical downtime recovery!
                    </div>
                  )}

                  {/* Unlocked Awakening Unique Moves (Active when HP <= 25%) */}
                  {activeT1State.isAwakened && (activeT1State.unlockedAwakeningMoves?.length || 0) > 0 && (
                    activeT1State.unlockedAwakeningMoves?.map((move) => {
                      const staminaCost = 15;
                      const isDisabled = isPlayerBusy;
                      return (
                        <button
                          key={`awakened_deck_${move.id}`}
                          disabled={isDisabled}
                          onClick={() => handleManualPlayerAction('move', move)}
                          className={`px-3 py-1 rounded text-xs font-mono font-black transition flex items-center gap-1.5 active:scale-95 border-2 ${
                            isDisabled
                              ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-800'
                              : 'bg-gradient-to-r from-amber-400 via-red-500 to-purple-600 text-white border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-pulse hover:brightness-125'
                          }`}
                        >
                          <span className="bg-black/60 border border-amber-300/40 px-1 rounded text-[8px] text-amber-200">★ AWAKENED</span>
                          <span>{move.name}</span>
                          <span className="text-[9px] opacity-90">({move.baseDamage} DMG)</span>
                          <span className="text-[8px] font-bold text-amber-200 bg-black/50 px-1 rounded">-{staminaCost}⚡</span>
                        </button>
                      );
                    })
                  )}
                  {activeT1State.fighter.moves?.map((move, idx) => {
                    const isDesperate = t1Phase === 'Desperate';
                    const superCost = isDesperate ? 150 : 200;
                    const hasMeter =
                      move.type === 'super'
                        ? activeT1State.superMeter >= superCost
                        : move.type === 'ex'
                        ? activeT1State.superMeter >= 100 || activeT1State.isMaxModeActive
                        : true;

                    const staminaCost = move.type === 'super' ? 38 : move.type === 'ex' ? 30 : move.type === 'special' ? 22 : 10;

                    const kMapping = keyboardMappingRef.current;
                    let hotkey = '';
                    if (move.type === 'super') hotkey = formatKeyLabel(kMapping.superMoveKey);
                    else if (move.type === 'ex') hotkey = formatKeyLabel(kMapping.exMoveKey);
                    else if (idx === 0) hotkey = formatKeyLabel(kMapping.move1Key);
                    else if (idx === 1) hotkey = formatKeyLabel(kMapping.move2Key);

                    const isDisabled = !hasMeter || isPlayerBusy;

                    return (
                      <button
                        key={move.id}
                        disabled={isDisabled}
                        onClick={() => handleManualPlayerAction('move', move)}
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1 active:scale-95 ${
                          isDisabled
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                            : move.type === 'super'
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-110 shadow-sm shadow-red-500/30'
                            : move.type === 'ex'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-sm shadow-purple-500/30'
                            : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700'
                        }`}
                      >
                        {hotkey && <span className="bg-black/50 border border-white/20 px-1 rounded text-[9px] text-amber-300 font-black">[{hotkey}]</span>}
                        <span>{move.name}</span>
                        <span className="text-[9px] opacity-75">({move.baseDamage} DMG)</span>
                        <span className="text-[8px] font-bold text-amber-300/80 bg-black/40 px-1 rounded">-{staminaCost}⚡</span>
                      </button>
                    );
                  })}

                  <button
                    disabled={isPlayerBusy}
                    onClick={() => handleManualPlayerAction('guard')}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1 border active:scale-95 ${
                      isPlayerBusy
                        ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                        : 'bg-blue-900/80 text-blue-200 hover:bg-blue-800 border-blue-700 shadow-sm'
                    }`}
                  >
                    <span className="bg-black/50 border border-white/20 px-1 rounded text-[9px] text-amber-300 font-black">
                      [{formatKeyLabel(keyboardMappingRef.current.guardKey)}]
                    </span>
                    <Shield className="h-3 w-3 text-blue-300" /> GUARD <span className="text-[8px] font-bold text-emerald-300 bg-emerald-950/80 px-1 rounded border border-emerald-500/40">+28⚡ RECOVER</span>
                  </button>

                  {(() => {
                    const dodgeCd = activeT1State?.moveCooldowns?.['dodge_action'] || 0;
                    const currentFocus = activeT1State?.focusMeter ?? 100;
                    const obsCheck = activeT1State ? canUseObservationHaki(activeT1State) : { canUse: false, hakiCost: 40 };
                    const isFocusLocked = currentFocus < MIN_OBSERVATION_FOCUS_THRESHOLD;
                    const isDisabled = dodgeCd > 0 || isPlayerBusy || !obsCheck.canUse;
                    return (
                      <button
                        disabled={isDisabled}
                        onClick={() => handleManualPlayerAction('dodge')}
                        title={
                          isFocusLocked
                            ? `KENBUNSHOKU BLOQUEADO! Foco atual (${Math.round(currentFocus)}%) está abaixo do mínimo de ${MIN_OBSERVATION_FOCUS_THRESHOLD}%. Recupere calma!`
                            : `Esquiva Kenbunshoku (Visão do Futuro). Custo dinâmico: ${obsCheck.hakiCost}⚡ Haki (Foco: ${Math.round(currentFocus)}%).`
                        }
                        className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1 border active:scale-95 ${
                          isFocusLocked
                            ? 'bg-red-950/40 text-red-400/60 border-red-900/40 cursor-not-allowed line-through opacity-70'
                            : isDisabled
                            ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-60'
                            : 'bg-red-950/80 text-red-200 hover:bg-red-900 border-red-700/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                        }`}
                      >
                        <span className="bg-black/50 border border-white/20 px-1 rounded text-[9px] text-amber-300 font-black">
                          [{formatKeyLabel(keyboardMappingRef.current.dodgeKey)}]
                        </span>
                        <Eye className="h-3 w-3 text-red-400" />
                        {dodgeCd > 0
                          ? `FUTURE SIGHT (${dodgeCd})`
                          : isFocusLocked
                          ? `FOCO < ${MIN_OBSERVATION_FOCUS_THRESHOLD}%`
                          : 'FUTURE SIGHT'}
                        <span className={`text-[8px] font-bold px-1 rounded ${isFocusLocked ? 'bg-red-900/60 text-red-300' : 'bg-black/50 text-amber-300'}`}>
                          -{obsCheck.hakiCost}⚡
                        </span>
                      </button>
                    );
                  })()}

                  <div className="flex items-center gap-1">
                    <button
                      disabled={isPlayerBusy}
                      onClick={() =>
                        handleManualPlayerAction(
                          'taunt',
                          undefined,
                          selectedPlayerTauntRef.current || undefined
                        )
                      }
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1 border active:scale-95 ${
                        isPlayerBusy
                          ? 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'
                          : 'bg-amber-900/80 text-amber-200 hover:bg-amber-800 border-amber-700 shadow-sm'
                      }`}
                      title={
                        selectedPlayerTaunt
                          ? `Trigger Taunt: "${selectedPlayerTaunt.name}" (${selectedPlayerTaunt.crowdReactionLabel})`
                          : 'Trigger Taunt (挑発)'
                      }
                    >
                      <span className="bg-black/50 border border-white/20 px-1 rounded text-[9px] text-amber-300 font-black">
                        [{formatKeyLabel(keyboardMappingRef.current.tauntKey)}]
                      </span>
                      <Smile className="h-3 w-3 text-amber-300" />
                      {selectedPlayerTaunt ? (
                        <span className="truncate max-w-[95px] sm:max-w-[130px]">
                          {selectedPlayerTaunt.visualProp} {selectedPlayerTaunt.badge}
                        </span>
                      ) : (
                        'TAUNT (挑発)'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTauntLibraryOpen(true)}
                      className="px-2 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1 border border-amber-500/50 bg-stone-950 text-amber-300 hover:bg-amber-950/70 hover:border-amber-400 active:scale-95 shadow-sm"
                      title="Open Expandable Character Taunts & Crowd Reactions Library"
                    >
                      <span>🎭</span>
                      <span className="text-[10px] hidden sm:inline font-bold">LIB</span>
                    </button>
                  </div>

                  {activeT1State.hakiMeter >= 100 && !activeT1State.isHakiAwakened && (
                    <button
                      disabled={isPlayerBusy}
                      onClick={() => handleManualPlayerAction('haki_awakening')}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-xs font-mono shadow-[0_0_15px_rgba(168,85,247,0.7)] animate-pulse flex items-center gap-1 active:scale-95 border border-purple-300 hover:brightness-110"
                    >
                      <Zap className="h-3.5 w-3.5 text-yellow-300 animate-bounce" />
                      <span>⚡ HAKI AWAKENING ({Math.floor(activeT1State.hakiMeter / 100)} SEG)</span>
                    </button>
                  )}

                  {/* Real-time Transformation Form Shift Action Button */}
                  {(() => {
                    const currentRoundTurnCount = combatLogs.filter((log) => log.roundNumber === currentRound).length;
                    const shiftTelemetry = getTransformationTelemetry(activeT1State, activeT2State, currentRoundTurnCount);
                    if (!shiftTelemetry.hasTransformations || !shiftTelemetry.nextTransformation) return null;
                    return (
                      <button
                        disabled={!shiftTelemetry.canShiftNow || isPlayerBusy}
                        onClick={() => handlePlayerInitiateShift(shiftTelemetry.nextTransformation!)}
                        title={shiftTelemetry.verdictMessage}
                        className={`px-3 py-1.5 rounded-lg font-black text-xs font-mono flex items-center gap-1.5 active:scale-95 transition-all border ${
                          shiftTelemetry.canShiftNow && !isPlayerBusy
                            ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 text-black border-2 border-white shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-pulse hover:brightness-110 cursor-pointer'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className={`h-3.5 w-3.5 ${shiftTelemetry.canShiftNow ? 'text-black' : 'text-zinc-600'}`} />
                        <span>SHIFT: {shiftTelemetry.nextTransformation.name.replace(/.*:\s*/, '')}</span>
                        {shiftTelemetry.canShiftNow ? (
                          <span className="bg-black text-amber-300 px-1 rounded text-[8px] font-black uppercase">
                            READY
                          </span>
                        ) : (
                          <span className="text-[9px] text-zinc-400">
                            {shiftTelemetry.isCooldownReady ? '(CONDITIONS)' : `(CD: ${shiftTelemetry.cooldownRemainingTurns})`}
                          </span>
                        )}
                      </button>
                    );
                  })()}

                  {activeT1State.superMeter >= 300 && (
                    (() => {
                      const finisher = activeT1State.fighter.moves?.find(m => m.type === 'finisher');
                      if (!finisher) return null;
                      return (
                        <button
                          disabled={isPlayerBusy}
                          onClick={() => handleManualPlayerAction('finisher', finisher)}
                          className="px-3 py-1.5 rounded bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 text-black font-black text-xs font-mono animate-bounce shadow-[0_0_20px_rgba(251,191,36,0.6)] border-2 border-white flex items-center gap-1 active:scale-95"
                        >
                          <span className="bg-black/80 text-amber-300 px-1 rounded text-[9px] font-black">
                            [{formatKeyLabel(keyboardMappingRef.current.finisherKey)}]
                          </span>
                          <span>🔥 COMBO FINISHER 🔥</span>
                        </button>
                      );
                    })()
                  )}

                  {activeT1State.superMeter >= 100 && !activeT1State.isMaxModeActive && (
                    <button
                      disabled={isPlayerBusy}
                      onClick={() => handleManualPlayerAction('max_mode')}
                      className="px-2.5 py-1 rounded bg-gradient-to-r from-red-600 to-amber-500 text-black font-black text-xs font-mono animate-pulse shadow-md flex items-center gap-1 active:scale-95"
                    >
                      <span className="bg-black/80 text-amber-300 px-1 rounded text-[9px] font-black">
                        [{formatKeyLabel(keyboardMappingRef.current.maxModeKey)}]
                      </span>
                      <span>MAX MODE</span>
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* AI COMMENTARY & LIVE ROUND BROADCAST */}
        <div className="w-full mb-2">
          <AICommentaryBox
            lastLog={combatLogs[0]}
            fighter1={activeT1State.fighter}
            fighter2={activeT2State.fighter}
            activeT1State={activeT1State}
            activeT2State={activeT2State}
            roundNumber={currentRound}
            isGameOver={isMatchOver}
          />
        </div>
      </main>

      {/* BOTTOM ACTION BAR / SCROLLABLE COMBAT FIGHT LOG DRAWER */}
      <footer className="relative z-20 bg-zinc-950 border-t border-zinc-800 p-2 sm:p-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition"
          >
            {showLogDrawer ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span>FIGHT LOG ({combatLogs?.length} ACTIONS)</span>
          </button>

          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              <span>
                PACING: <strong className="text-amber-400">0.58x CALIBRATED</strong>
              </span>
            </span>
            <span>
              CREDITS: <span className="text-amber-400 font-bold">04</span>
            </span>
          </div>
        </div>

        {/* Expandable Scrollable Combat Logs Drawer */}
        {showLogDrawer && (
          <div className="max-h-40 overflow-y-auto mt-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1 font-mono text-xs">
            {combatLogs?.map((log, index) => (
              <div
                key={`${log.id}-${index}`}
                className={`p-1.5 rounded flex items-center justify-between ${
                  log.actorSide === 'team1' ? 'bg-amber-950/30 text-amber-200' : 'bg-purple-950/30 text-purple-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">[R{log.roundNumber}]</span>
                  
                  {log.hakiType && log.hakiType !== 'None' && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.15, 1],
                        opacity: [0.7, 1, 0.7],
                        filter: log.hakiType === 'Conqueror' ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] : 'none'
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`flex items-center gap-0.5 px-1 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter ${
                        log.hakiType === 'Armament' ? 'border-red-900/60 text-red-500 bg-red-950/20' :
                        log.hakiType === 'Observation' ? 'border-red-900/60 text-red-400 bg-red-950/20 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                        'border-purple-900/60 text-purple-400 bg-purple-950/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                      }`}
                    >
                      {log.hakiType === 'Armament' && <Shield className="h-2.5 w-2.5" />}
                      {log.hakiType === 'Observation' && <Eye className="h-2.5 w-2.5" />}
                      {log.hakiType === 'Conqueror' && <Zap className="h-2.5 w-2.5 fill-purple-400/20" />}
                      <span className="hidden sm:inline ml-0.5">{log.hakiType}</span>
                    </motion.div>
                  )}

                  <span>
                    <strong>{log.commentaryText || `${log.actorShortName || log.actorName} uses ${getMoveShortName(log.moveName)}`}</strong> <span className="text-zinc-500 text-[10px]">({log.moveNameJP})</span>
                  </span>
                  {log.stance && (
                    <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400 uppercase">
                      {log.stance}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-bold">
                  {log.isDodged ? (
                    <span className="text-red-400 font-bold">DODGED</span>
                  ) : log.isMiss ? (
                    <span className="text-zinc-500">WHIFF / MISS</span>
                  ) : log.isCounter ? (
                    <span className="text-amber-300">COUNTER -{log.damage} DMG</span>
                  ) : log.isGuardCrush ? (
                    <span className="text-red-400">GUARD CRUSH! -{log.damage}</span>
                  ) : log.isBlocked ? (
                    <span className="text-blue-400">GUARDED -{log.damage}</span>
                  ) : (
                    <span>-{log.damage} DMG</span>
                  )}
                  {log.comboCount > 1 && <span className="text-amber-400">[{log.comboCount} HITS]</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </footer>

      {/* Floating Match Achievement Notification Banner */}
      <AchievementBanner
        achievement={latestAchievement}
        onDismiss={handleDismissAchievement}
      />

      {/* Match Achievements Drawer / Modal */}
      <AnimatePresence>
        {showAchievementsDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-zinc-950 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-400" />
                  <div>
                    <h3 className="font-['Press_Start_2P'] text-xs sm:text-sm text-amber-300">
                      MATCH ACHIEVEMENTS
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-400">
                      Unlocked {unlockedAchievements?.length} Combat Feats
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAchievementsDrawer(false)}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-mono text-xs"
                >
                  CLOSE
                </button>
              </div>

              {unlockedAchievements?.length === 0 ? (
                <div className="py-8 text-center font-mono text-xs text-zinc-500">
                  No feats unlocked yet in this match. Perform critical strikes, multi-hit combos, or clutch defenses to earn trophies!
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {unlockedAchievements?.map((ach) => (
                    <div
                      key={ach.id}
                      className="p-2.5 rounded-lg bg-zinc-900/80 border border-amber-500/30 flex items-start gap-3"
                    >
                      <div className="text-2xl mt-0.5">{ach.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-amber-300 font-mono">
                            {ach.title} ({ach.titleJP})
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
                            +{ach.xpReward} XP
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rapid-tap Haki Clash Mini-game Overlay */}
      <AnimatePresence>
        {showSideLog && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-20 right-4 w-72 bottom-32 bg-zinc-950/90 border-l-2 border-amber-500/50 backdrop-blur-md z-50 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] rounded-l-xl overflow-hidden"
          >
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-2 text-amber-400">
                <Activity className="h-4 w-4" />
                <span className="font-['Cinzel'] text-xs font-bold tracking-widest uppercase">Battle Chronicle</span>
              </div>
              <button 
                onClick={() => setShowSideLog(false)}
                className="text-zinc-500 hover:text-white transition p-1 hover:bg-zinc-800 rounded"
              >
                <ChevronDown className="h-5 w-5 rotate-90" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent">
              {combatLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-[10px] text-center px-4 gap-2">
                  <Swords className="h-8 w-8 opacity-20" />
                  <span>Awaiting first exchange of strikes...</span>
                </div>
              ) : (
                combatLogs.map((log, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    key={`${log.id}-${idx}`}
                    className={`p-2.5 rounded-lg border flex flex-col gap-1 shadow-sm ${
                      log.actorSide === 'team1' 
                        ? 'bg-amber-950/20 border-amber-500/20 text-amber-100' 
                        : 'bg-purple-950/20 border-purple-500/20 text-purple-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-black text-[9px] uppercase tracking-wider opacity-80">{log.actorShortName || log.actorName}</span>
                      <span className="text-[8px] opacity-50 font-mono">RD {log.roundNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="font-['Cinzel'] font-bold text-[11px] text-white tracking-tight">{log.moveName}</span>
                      {log.moveType === 'super' && <span className="bg-amber-500 text-black text-[7px] px-1 rounded font-black border border-amber-300">SUPER</span>}
                      {log.moveType === 'ex' && <span className="bg-cyan-500 text-black text-[7px] px-1 rounded font-black border border-cyan-300">EX</span>}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5">
                        {log.isDodged ? (
                          <span className="text-red-400 font-black italic text-[9px]">DODGED</span>
                        ) : log.isMiss ? (
                          <span className="text-zinc-500 font-bold text-[9px]">WHIFFED</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black ${log.isCrit ? 'text-amber-400 text-xs animate-pulse' : 'text-zinc-100 text-[10px]'}`}>
                              -{log.damage} <span className="text-[8px] font-normal opacity-70 tracking-tighter">DMG</span>
                            </span>
                            {log.isCrit && <Flame className="h-3 w-3 text-amber-500" />}
                            {log.isBlocked && <span className="text-blue-400 text-[8px] font-bold border border-blue-500/30 px-1 rounded">GUARDED</span>}
                          </div>
                        )}
                      </div>
                      
                      {log.hakiType && log.hakiType !== 'None' && (
                        <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-white/10 shadow-inner">
                          <span className={`text-[8px] font-black tracking-tighter ${
                            log.hakiType === 'Conqueror' ? 'text-purple-400' : 
                            log.hakiType === 'Observation' ? 'text-red-400' : 'text-zinc-400'
                          }`}>
                            {log.hakiType.toUpperCase()}
                          </span>
                          {log.hakiMultiplier && log.hakiMultiplier > 1 && (
                            <span className="text-emerald-400 text-[8px] font-mono font-bold">x{log.hakiMultiplier.toFixed(2)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-zinc-800 bg-zinc-950/80">
              <button 
                onClick={() => setCombatLogs([])}
                className="w-full py-1.5 rounded bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-500/30 text-[9px] font-mono text-zinc-500 hover:text-red-400 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                CLEAR BATTLE HISTORY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Celebration Taunt & Pose Sequence Overlay */}
      {celebrationData && (
        <VictoryCelebrationSequence
          winnerFighter={celebrationData.winnerFighter}
          winningTeamName={celebrationData.winningTeamName}
          isTeam1Winner={celebrationData.isTeam1Winner}
          totalRounds={celebrationData.totalRounds}
          achievements={unlockedAchievements}
          onProceed={() => {
            onMatchComplete(celebrationData.matchResult);
          }}
          onOpenTournament={() => {
            setShowTournamentModal(true);
          }}
        />
      )}

      {/* 3v3 Automated Tournament Bracket View & Progression */}
      {showTournamentModal && tournamentBracket && (
        <TournamentBracketModal
          bracket={tournamentBracket}
          onClose={() => setShowTournamentModal(false)}
          onStartNextMatch={handleStartNextTournamentMatch}
          onSimulateRemainingMatches={handleSimulateRemainingMatches}
          onResetTournament={handleResetTournament}
        />
      )}

      {/* PAUSE MENU OVERLAY */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-md bg-zinc-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-center space-y-5"
            >
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-xs font-bold uppercase tracking-widest inline-block">
                  BATTLE SUSPENDED
                </span>
                <h2 className="font-['Cinzel'] text-2xl font-black text-white tracking-wider">
                  MATCH PAUSED
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Press [P] or [ESC] to resume fighting
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  RESUME COMBAT
                </button>

                <button
                  onClick={() => {
                    setDocInitialTab('basics');
                    setShowDocModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-600/50 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  COMO JOGAR (MANUAL & GUIA)
                </button>

                <button
                  onClick={() => {
                    setDocInitialTab('transformations');
                    setShowDocModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-950/60 via-amber-950/60 to-purple-950/60 hover:brightness-125 text-amber-200 font-bold text-xs uppercase tracking-wider border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  COMO FUNCIONA: TRANSFORMAÇÕES (GUIA)
                </button>

                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                  }}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs uppercase tracking-wider border border-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  SETTINGS & REBIND CONTROLS
                </button>

                <button
                  onClick={onExitToMenu}
                  className="w-full py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs uppercase tracking-wider border border-rose-800/50 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  EXIT TO MAIN MENU
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SYSTEM SETTINGS & REBIND CONTROLS MODAL */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSaved={() => {
          const prof = getUserProfile();
          if (prof.keyboardMapping) keyboardMappingRef.current = prof.keyboardMapping;
          if (prof.p2KeyboardMapping) p2KeyboardMappingRef.current = prof.p2KeyboardMapping;
        }}
      />

      {/* GAME DOCUMENTATION & HOW TO PLAY MODAL */}
      <GameDocumentationModal
        isOpen={showDocModal}
        initialTab={docInitialTab}
        onClose={() => setShowDocModal(false)}
      />

      {/* Awakening Transformation Cinematic Overlay */}
      {awakeningCinematic.isActive && awakeningCinematic.fighterState && awakeningCinematic.profile && (
        <AwakeningTransformationCinematic
          isActive={awakeningCinematic.isActive}
          fighterState={awakeningCinematic.fighterState}
          awakeningProfile={awakeningCinematic.profile}
          onComplete={() => {
            setAwakeningCinematic({ isActive: false, fighterState: null, profile: null });
            setIsPaused(false);
            isPausedRef.current = false;
          }}
        />
      )}

      {/* Dynamic Transformation Cinematic Overlay */}
      <TransformationCinematic
        isActive={dynamicTransformation.isActive}
        transformation={dynamicTransformation.transformation}
        side={dynamicTransformation.side}
        fighter={dynamicTransformation.side === 'team1' ? activeT1State?.fighter : activeT2State?.fighter}
        onComplete={() => {
          clearTransformation(() => {
            setIsPaused(false);
            isPausedRef.current = false;
          });
        }}
      />

      {/* D3-driven Camera Pan Parallax Round Transition Overlay with Stylized Fighter Portraits */}
      <RoundTransitionD3
        currentRound={currentRound}
        totalRounds={matchFormat === '1v1_duel' ? 1 : Math.max(team1.fighters?.length || 3, currentTeam2.fighters?.length || 3)}
        isTransitioning={isD3RoundTransitioning}
        activeStage={activeStage}
        fighter1={activeT1State?.fighter || team1.fighters[t1Index] || team1.fighters[0]}
        fighter2={activeT2State?.fighter || currentTeam2.fighters[t2Index] || currentTeam2.fighters[0]}
        fighter1Role={
          matchFormat === '1v1_duel'
            ? 'SOLO DUEL (決闘)'
            : t1Index === 0
            ? 'POINT (先鋒)'
            : t1Index === 1
            ? 'MIDDLE (中堅)'
            : 'ANCHOR (大将)'
        }
        fighter2Role={
          matchFormat === '1v1_duel'
            ? 'SOLO DUEL (決闘)'
            : t2Index === 0
            ? 'POINT (先鋒)'
            : t2Index === 1
            ? 'MIDDLE (中堅)'
            : 'ANCHOR (大将)'
        }
        team1Name={team1.name}
        team2Name={currentTeam2.name}
        onTransitionComplete={() => {
          setIsD3RoundTransitioning(false);
          isD3RoundTransitioningRef.current = false;
          isRoundTransitioningRef.current = false;
        }}
      />

      {/* Conqueror's Haki QTE Tension Clash */}
      {isHakiClashQteActive && (
        <HakiClashQteD3
          player1Name={activeT1State?.fighter?.name || "Player 1"}
          player2Name={activeT2State?.fighter?.name || "Player 2"}
          p1MashKey="F"
          p2MashKey="J"
          isCpuVsCpu={isAutoPlay}
          onComplete={(winner) => {
            setIsHakiClashQteActive(false);
            setHakiWaveWinner(winner);
            setIsHakiShockwaveActive(true);

            // Reward the winner
            if (winner === 'team1') {
              setT1FighterStates((prev) => {
                const next = [...prev];
                const f = next[t1Index];
                if (f) {
                  next[t1Index] = {
                    ...f,
                    superMeter: Math.min(300, f.superMeter + 150),
                    hakiMeter: Math.min(300, f.hakiMeter + 100),
                  };
                }
                return next;
              });
              soundManager.playUltimateFinisher();
            } else {
              setT2FighterStates((prev) => {
                const next = [...prev];
                const f = next[t2Index];
                if (f) {
                  next[t2Index] = {
                    ...f,
                    superMeter: Math.min(300, f.superMeter + 150),
                    hakiMeter: Math.min(300, f.hakiMeter + 100),
                  };
                }
                return next;
              });
              soundManager.playUltimateFinisher();
            }
          }}
        />
      )}

      {/* Screen-Wide Conqueror's Haki Shockwave Overlay */}
      <ConquerorHakiWaveD3
        isActive={isHakiShockwaveActive}
        winnerSide={hakiWaveWinner}
        onComplete={() => {
          setIsHakiShockwaveActive(false);
          setIsPaused(false);
        }}
      />
    </div>
  );
};
