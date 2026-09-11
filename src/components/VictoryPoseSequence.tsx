import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Crown,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Globe,
  Flame,
  Zap,
  Award,
  Swords,
  ChevronRight,
} from 'lucide-react';
import { Fighter } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';
import { getFighterVictoryPose, VictoryPoseInfo } from '../utils/victoryPoses';
import { PoseAnimationEffect } from '../types/victoryPoses';
import { victoryPoseStore } from '../utils/victoryPoseStore';
import { entranceAudio } from '../utils/entranceAudio';
import { soundManager } from '../utils/soundEffects';

const renderVictorySVGOverlay = (effect: PoseAnimationEffect, auraColor: string) => {
  switch (effect) {
    case 'joyboy_bounce':
      // Whimsical clouds & sun god rays
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Sun Halo */}
          <circle cx="50" cy="50" r="35" fill="url(#sun-glow)" className="animate-pulse" />
          {/* Whimsical Bouncing Clouds */}
          <path d="M10,85 C20,80 30,88 40,82 C50,88 60,80 70,85 C80,80 90,85 100,80 L100,100 L0,100 Z" fill="#ffffff" opacity="0.22" className="animate-bounce" style={{ animationDuration: '3s' }} />
          <path d="M0,90 C15,85 25,92 45,86 C60,92 70,84 85,89 C95,85 100,88 100,90 L100,100 L0,100 Z" fill="#ffffff" opacity="0.35" className="animate-bounce" style={{ animationDuration: '2.2s' }} />
          {/* Spiraling Drum Beats of Liberation */}
          <path d="M35,25 Q50,15 65,25 T95,25" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '12s' }} />
        </svg>
      );
    case 'blade_sheathe':
    case 'blade_salute':
      // Slicing wind cuts & katana shine sparks
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="slash-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor={auraColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="slash-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="50%" stopColor={auraColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Green/Purple Sword Slash lines */}
          <path d="M-10,20 L110,65" stroke="url(#slash-grad-1)" strokeWidth="3" fill="none" style={{ animation: 'bladeGlintSweep 1.8s infinite' }} />
          <path d="M110,30 L-10,75" stroke="url(#slash-grad-2)" strokeWidth="1.5" fill="none" className="animate-pulse" style={{ animation: 'bladeGlintSweep 2.4s infinite' }} />
          {/* Sparkles */}
          <polygon points="50,15 53,23 61,20 55,26 58,34 50,28 42,34 45,26 39,20 47,23" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
        </svg>
      );
    case 'conqueror_aura':
    case 'void_domination':
      // Crackling black/red lightning of supreme Haki
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="haki-center" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={auraColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill="url(#haki-center)" className="animate-pulse" />
          {/* Black/Red lightning paths */}
          <path d="M50,10 L48,25 L55,35 L45,55 L52,70 L48,90" stroke={auraColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDuration: '0.12s' }} />
          <path d="M15,50 L35,48 L45,55 L65,45 L72,52 L90,48" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDuration: '0.18s' }} />
          <path d="M25,25 L38,38 L45,55 L58,68 L75,75" stroke={auraColor} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDuration: '0.15s' }} />
        </svg>
      );
    case 'club_slam':
    case 'fist_crack':
      // Impact debris and radial shockwaves
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          {/* Shockwave expanding circles */}
          <circle cx="50" cy="50" r="10" stroke={auraColor} strokeWidth="2" fill="none" className="animate-ping" style={{ animationDuration: '1.2s' }} />
          <circle cx="50" cy="50" r="25" stroke={auraColor} strokeWidth="1" strokeDasharray="4,4" fill="none" className="animate-ping" style={{ animationDuration: '2s' }} />
          {/* Shattered rock particles */}
          <polygon points="12,78 18,72 22,78 16,84" fill="#3f3f46" opacity="0.8" className="animate-bounce" />
          <polygon points="82,82 88,78 90,84 84,88" fill="#52525b" opacity="0.9" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
          <polygon points="45,12 52,8 55,14 48,16" fill="#27272a" opacity="0.7" className="animate-bounce" style={{ animationDelay: '0.4s' }} />
        </svg>
      );
    case 'world_quake':
      // Shattered atmosphere cracking lines
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <g stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M50,50 L20,30 L5,25" />
            <path d="M50,50 L80,25 L95,15" />
            <path d="M50,50 L15,65 L5,80" />
            <path d="M50,50 L85,75 L95,90" />
            <path d="M50,50 L50,10" />
            <path d="M50,50 L50,90" />
            {/* Cross connectors */}
            <path d="M35,40 L30,48 L35,58" strokeWidth="1" opacity="0.6" />
            <path d="M65,37 L70,48 L65,60" strokeWidth="1" opacity="0.6" />
          </g>
          {/* Cyan ripple glow rings */}
          <circle cx="50" cy="50" r="48" stroke="#22d3ee" strokeWidth="2.5" fill="none" opacity="0.4" className="animate-ping" style={{ animationDuration: '1.4s' }} />
        </svg>
      );
    case 'dark_vortex':
      // Swirling gravity pull vectors & purple-black nebula
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="blackhole" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="30%" stopColor="#1e1b4b" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#581c87" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#blackhole)" className="animate-pulse" />
          {/* Swirling arms */}
          <path d="M50,50 Q40,20 15,30 Q40,40 50,50 Q60,80 85,70 Q60,60 50,50" fill="none" stroke="#a855f7" strokeWidth="2" opacity="0.75" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '4s' }} />
          <path d="M50,50 Q80,40 70,15 Q60,40 50,50 Q20,60 30,85 Q40,60 50,50" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.6" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '6s' }} />
        </svg>
      );
    case 'magma_eruption':
      // Bubbling vertical lava blobs and orange ember cinders
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="lava-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="60" width="100" height="40" fill="url(#lava-grad)" opacity="0.7" className="animate-pulse" />
          {/* Lava bubbles */}
          <circle cx="20" cy="75" r="5" fill="#f97316" className="animate-bounce" style={{ animationDuration: '1.2s' }} />
          <circle cx="50" cy="80" r="7" fill="#ef4444" className="animate-bounce" style={{ animationDuration: '1.8s' }} />
          <circle cx="80" cy="70" r="4" fill="#facc15" className="animate-bounce" style={{ animationDuration: '1.4s' }} />
          {/* Embers floating up */}
          <circle cx="35" cy="40" r="1.5" fill="#f97316" className="animate-ping" style={{ animationDuration: '0.8s' }} />
          <circle cx="65" cy="25" r="2" fill="#facc15" className="animate-ping" style={{ animationDuration: '1.1s' }} />
          <circle cx="15" cy="30" r="1" fill="#ef4444" className="animate-ping" style={{ animationDuration: '0.6s' }} />
        </svg>
      );
    case 'room_snap':
      // High tech circular cyan surgical grid lines
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 animate-spin" style={{ animationDuration: '16s', transformOrigin: 'center' }} viewBox="0 0 100 100">
          {/* ROOM Dome Ring */}
          <circle cx="50" cy="50" r="44" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3,3" fill="none" opacity="0.65" />
          <circle cx="50" cy="50" r="30" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.4" />
          {/* Scalpel scan axes */}
          <line x1="50" y1="6" x2="50" y2="94" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
          <line x1="6" y1="50" x2="94" y2="50" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
          {/* Coordinate tick marks */}
          <rect x="48" y="20" width="4" height="1" fill="#22d3ee" opacity="0.8" />
          <rect x="48" y="80" width="4" height="1" fill="#22d3ee" opacity="0.8" />
          <rect x="20" y="48" width="1" height="4" fill="#22d3ee" opacity="0.8" />
          <rect x="80" y="48" width="1" height="4" fill="#22d3ee" opacity="0.8" />
        </svg>
      );
    case 'future_sight':
    case 'light_glint':
      // Concentric cyan rings and glowing warning grid vectors
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="8" fill="none" stroke="#06b6d4" strokeWidth="2" className="animate-ping" style={{ animationDuration: '1.8s' }} />
          <circle cx="50" cy="50" r="22" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="animate-ping" style={{ animationDuration: '2.5s' }} />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#0891b2" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3.2s' }} />
          {/* Foresight glow sparkles */}
          <circle cx="20" cy="20" r="2" fill="#22d3ee" className="animate-pulse" />
          <circle cx="80" cy="25" r="3" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="30" cy="75" r="1.5" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
          <circle cx="75" cy="80" r="2.5" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
        </svg>
      );
    case 'ice_sculpture':
      // Frosted geometric ice shards
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          {/* Frosted frame border */}
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="#93c5fd" strokeWidth="3.5" strokeDasharray="6,12" opacity="0.75" />
          {/* Ice crystalline shards */}
          <polygon points="5,5 25,5 15,25" fill="#bfdbfe" opacity="0.4" />
          <polygon points="95,5 95,25 75,15" fill="#93c5fd" opacity="0.5" />
          <polygon points="5,95 25,85 10,75" fill="#e0f2fe" opacity="0.45" />
          <polygon points="95,95 75,95 85,75" fill="#bae6fd" opacity="0.5" />
          {/* Glancing cold sparkles */}
          <path d="M30,30 L34,34 M34,30 L30,34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
          <path d="M70,65 L74,69 M74,65 L70,69" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </svg>
      );
    case 'thunder_god':
      // Thunder sparks and yellow-white electric arcs
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          {/* Golden storm clouds at the top */}
          <path d="M10,12 C20,8 30,15 45,10 C60,15 75,8 85,12 C95,15 100,20 100,20 L0,20 Z" fill="#eab308" opacity="0.35" />
          {/* Cracking gold/white electric bolts */}
          <path d="M50,15 L35,45 L65,55 L40,92" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDuration: '0.1s' }} />
          <path d="M20,10 L30,30 L15,45 L35,68" stroke="#fef08a" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDuration: '0.15s' }} />
          <path d="M80,12 L70,35 L85,50 L75,78" stroke="#eab308" strokeWidth="2.0" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" style={{ animationDuration: '0.12s' }} />
        </svg>
      );
    case 'flame_pillar':
      // Swirling fiery column
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="fire-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#ef4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="15" y="0" width="70" height="100" fill="url(#fire-grad)" className="animate-pulse" />
          <path d="M20,100 Q40,40 50,0 Q60,40 80,100" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.6" className="animate-bounce" />
        </svg>
      );
    case 'dragon_wind':
      // Swirling green/black wind gust vectors
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <path d="M10,80 Q30,20 50,80 T90,80" fill="none" stroke="#10b981" strokeWidth="3" opacity="0.6" strokeDasharray="5,5" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '8s' }} />
          <path d="M20,90 Q40,30 60,90 T80,90" fill="none" stroke="#059669" strokeWidth="1.5" opacity="0.4" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '12s' }} />
        </svg>
      );
    case 'phoenix_wings':
      // Elegant blue and yellow flaming feathers
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <path d="M5,50 Q25,10 50,50 Q75,10 95,50" fill="none" stroke="#3b82f6" strokeWidth="3" opacity="0.75" className="animate-pulse" />
          <path d="M15,60 Q35,30 50,60 Q65,30 85,60" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.5" className="animate-pulse" />
          <circle cx="20" cy="40" r="3" fill="#60a5fa" className="animate-ping" />
          <circle cx="80" cy="40" r="3" fill="#fde047" className="animate-ping" style={{ animationDelay: '0.5s' }} />
        </svg>
      );
    default:
      // Subtle sparkle background for any default poses
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" stroke={auraColor} strokeWidth="1" strokeDasharray="3,6" fill="none" opacity="0.3" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '24s' }} />
          <circle cx="50" cy="50" r="32" stroke={auraColor} strokeWidth="0.5" strokeDasharray="2,4" fill="none" opacity="0.2" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '16s' }} />
        </svg>
      );
  }
};

interface VictoryPoseSequenceProps {
  winningTeamName: string;
  winningFighters: Fighter[];
  mvpFighterName: string;
  totalRounds: number;
  bountyEarned: number;
  matchFormat: string;
}

export const VictoryPoseSequence: React.FC<VictoryPoseSequenceProps> = ({
  winningTeamName,
  winningFighters,
  mvpFighterName,
  totalRounds,
  bountyEarned,
  matchFormat,
}) => {
  // Find index of MVP or default to 0
  const initialIndex = Math.max(
    0,
    winningFighters.findIndex(
      (f) => f.name.toLowerCase() === mvpFighterName.toLowerCase() || f.shortName?.toLowerCase() === mvpFighterName.toLowerCase()
    )
  );

  const [activeFighterIndex, setActiveFighterIndex] = useState<number>(initialIndex);
  const [selectedStanceIndex, setSelectedStanceIndex] = useState<number>(0);
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  const [isMuted, setIsMuted] = useState<boolean>(entranceAudio.isMuted);

  // Animation & celebration states
  const [isPlayingPoseAnim, setIsPlayingPoseAnim] = useState<boolean>(true);
  const [isTaunting, setIsTaunting] = useState<boolean>(false);
  const [isFinisherTriggered, setIsFinisherTriggered] = useState<boolean>(false);
  const [stampLanded, setStampLanded] = useState<boolean>(false);

  const activeFighter = winningFighters[activeFighterIndex] || winningFighters[0];
  const charVictoryPose: VictoryPoseInfo = getFighterVictoryPose(
    activeFighter?.id || 'luffy',
    activeFighter?.name || 'Grand Line Champion'
  );

  // Retrieve user-equipped custom pose
  const equippedCustomPose = victoryPoseStore.getEquippedPose(activeFighter?.id || '');
  const isCustomPose = equippedCustomPose && equippedCustomPose.id !== 'pose_default';

  // Merge: Use custom pose quote and animation if equipped, otherwise character default
  const victoryPose: VictoryPoseInfo = {
    ...charVictoryPose,
    quoteEN: isCustomPose ? equippedCustomPose.quote : charVictoryPose.quoteEN,
    quoteJP: isCustomPose ? equippedCustomPose.quoteJP : charVictoryPose.quoteJP,
    poseAnimation: (isCustomPose && equippedCustomPose.animationEffect
      ? equippedCustomPose.animationEffect
      : charVictoryPose.poseAnimation) as any,
  };

  const isMVP =
    activeFighter?.name.toLowerCase() === mvpFighterName.toLowerCase() ||
    activeFighter?.shortName?.toLowerCase() === mvpFighterName.toLowerCase();

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Launch victory celebration sequence for current fighter
  const playVictorySequence = (targetIndex = activeFighterIndex) => {
    clearTimers();
    setActiveFighterIndex(targetIndex);
    setSelectedStanceIndex(0);
    setIsPlayingPoseAnim(true);
    setStampLanded(false);
    setIsFinisherTriggered(false);

    // Step 1: Victory fanfare and crowd cheering
    entranceAudio.playVictoryCheer();
    soundManager.playVictoryFanfare();

    // Fire celebratory winner confetti burst
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#f59e0b', '#ef4444', '#eab308', '#a855f7'],
    });

    // Step 2: Kanji stamp slam after heroic entrance
    const stampTimer = setTimeout(() => {
      setStampLanded(true);
      entranceAudio.playKanjiStamp();
    }, 450);
    timeoutsRef.current.push(stampTimer);

    // Step 3: Trigger signature victory taunt voice line
    const tauntTimer = setTimeout(() => {
      const fighter = winningFighters[targetIndex] || activeFighter;
      triggerVoiceTaunt(fighter);
    }, 1100);
    timeoutsRef.current.push(tauntTimer);
  };

  // Trigger spoken victory taunt
  const triggerVoiceTaunt = (fighter = activeFighter) => {
    if (!fighter) return;
    setIsTaunting(true);
    entranceAudio.playSignatureSound(victoryPose.signatureSound);

    entranceAudio.playVoiceTaunt(fighter.id, fighter.name, lang, () => {
      setIsTaunting(false);
    });
  };

  // Trigger signature triumphant finisher move with FX & Screen Quake
  const handlePerformTriumphantMove = () => {
    if (isFinisherTriggered) return;
    setIsFinisherTriggered(true);

    // Finishing hit bass boom & shimmer
    entranceAudio.playPoseFinisherHit();
    entranceAudio.playSignatureSound(victoryPose.signatureSound);

    // Confetti cannon blast
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 },
      colors: [victoryPose.hakiAuraColor, '#fbbf24', '#ffffff', '#ef4444'],
    });

    const resetTimer = setTimeout(() => {
      setIsFinisherTriggered(false);
    }, 1400);
    timeoutsRef.current.push(resetTimer);
  };

  // Initial sequence mount
  useEffect(() => {
    playVictorySequence(initialIndex);
    return () => clearTimers();
  }, []);

  // Handle switching fighter in team
  const handleSelectFighter = (index: number) => {
    if (index === activeFighterIndex) return;
    playVictorySequence(index);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    entranceAudio.isMuted = next;
    soundManager.isMuted = next;
  };

  // Toggle Language
  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
  };

  return (
    <div
      id="victory-pose-animation-container"
      className="relative w-full rounded-2xl sm:rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] select-none"
    >
      {/* Background Rotating Spotlight */}
      <div className="absolute inset-0 victory-spotlight-rays opacity-40 pointer-events-none" />

      {/* TOP CHAMPIONSHIP ACCENT BAR */}
      <div className="relative z-10 w-full bg-zinc-950/80 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-black shadow-md">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Press_Start_2P'] text-[9px] text-amber-400 tracking-wider">
                ★ VICTORY POSE SHOWCASE ★
              </span>
              <span className="rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[9px] px-1.5 py-0.2">
                {matchFormat === '3v3_kof' ? '3V3 LINEUP TRIUMPH' : '1V1 SOLO CHAMPION'}
              </span>
            </div>
            <h3 className="font-['Cinzel'] text-sm sm:text-base font-black text-white leading-tight">
              {winningTeamName} • TRIUMPHANT ROSTER
            </h3>
          </div>
        </div>

        {/* Audio & Sequence Controls */}
        <div className="flex items-center gap-2">
          {/* Japanese / English Language Toggle */}
          <button
            id="victory-pose-lang-btn"
            onClick={handleToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-amber-400 text-xs font-mono text-zinc-200 transition"
            title="Toggle Voice Taunt Language"
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === 'ja' ? 'JA 🇯🇵' : 'EN 🇺🇸'}</span>
          </button>

          {/* Mute Toggle */}
          <button
            id="victory-pose-mute-btn"
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
          </button>

          {/* Replay Sequence Button */}
          <button
            id="victory-pose-replay-btn"
            onClick={() => playVictorySequence(activeFighterIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/60 hover:border-amber-400 text-xs font-mono text-amber-300 font-bold transition shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>REPLAY POSE</span>
          </button>
        </div>
      </div>

      {/* TEAM FIGHTER SELECTOR TABS (POINT, MIDDLE, ANCHOR) */}
      {winningFighters.length > 1 && (
        <div className="relative z-10 w-full bg-zinc-900/70 border-b border-zinc-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="font-['Press_Start_2P'] text-[8px] text-zinc-400 uppercase mr-1 shrink-0">
            TEAM ROSTER:
          </span>
          <div className="flex items-center gap-2">
            {winningFighters.map((f, i) => {
              const isSelected = activeFighterIndex === i;
              const mvpLower = (mvpFighterName || '').toLowerCase();
              const isThisMVP =
                mvpLower !== '' &&
                ((f?.name || '').toLowerCase() === mvpLower ||
                (f?.shortName || '').toLowerCase() === mvpLower);
              const roleLabel = i === 0 ? 'POINT (先鋒)' : i === 1 ? 'MIDDLE (中堅)' : 'ANCHOR (大将)';

              return (
                <button
                  key={`winner_tab_${f.id}_${i}`}
                  id={`victory-tab-fighter-${i}`}
                  onClick={() => handleSelectFighter(i)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="relative shrink-0">
                    <FighterAvatar
                      avatarUrl={f.avatarUrl}
                      avatarIcon={f.avatarIcon}
                      name={f.name}
                      size="sm"
                      borderColor={isSelected ? '#f59e0b' : '#3f3f46'}
                    />
                    {isThisMVP && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black text-[9px] font-black shadow-sm">
                        👑
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="font-['Bebas_Neue'] text-sm block leading-none text-white">
                      {f.shortName || f.name.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[9px] text-amber-400/80 block">
                      {roleLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MAIN VICTORY POSE STAGE */}
      <div
        className={`relative z-10 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center ${
          isFinisherTriggered ? 'anim-victory-quake' : ''
        }`}
      >
        {/* LEFT COLUMN: HERO CHARACTER PRESENTATION BOX */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero_pose_${activeFighter.id}`}
              initial={{ scale: 0.75, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.45, type: 'spring', bounce: 0.35 }}
              className="relative flex flex-col items-center"
            >
              {/* Pulsing Colored Haki Aura Shockwave */}
              <div
                className="absolute -inset-6 rounded-full opacity-60 blur-2xl animate-pulse pointer-events-none -z-10 transition-colors duration-500"
                style={{ backgroundColor: victoryPose.hakiAuraColor }}
              />

              {/* Character Avatar Box with Specific Pose Animation Class */}
              <div
                className={`relative rounded-3xl border-4 p-2 bg-gradient-to-b from-zinc-900 to-black shadow-2xl transition-all duration-300 overflow-hidden ${
                  victoryPose.poseAnimation === 'joyboy_bounce' ? 'anim-joyboy-bounce' :
                  victoryPose.poseAnimation === 'blade_sheathe' ? 'anim-blade-sheathe' :
                  victoryPose.poseAnimation === 'conqueror_aura' ? 'anim-conqueror-aura' :
                  victoryPose.poseAnimation === 'club_slam' ? 'anim-club-slam' :
                  victoryPose.poseAnimation === 'world_quake' ? 'anim-world-quake' :
                  victoryPose.poseAnimation === 'dark_vortex' ? 'anim-dark-vortex' :
                  victoryPose.poseAnimation === 'magma_eruption' ? 'anim-magma-eruption' :
                  victoryPose.poseAnimation === 'room_snap' ? 'anim-room-snap' :
                  victoryPose.poseAnimation === 'future_sight' ? 'anim-future-sight' :
                  victoryPose.poseAnimation === 'ice_sculpture' ? 'anim-ice-sculpture' :
                  victoryPose.poseAnimation === 'thunder_god' ? 'anim-thunder-god' :
                  victoryPose.poseAnimation === 'dragon_wind' ? 'anim-dragon-wind' :
                  victoryPose.poseAnimation === 'phoenix_wings' ? 'anim-phoenix-wings' :
                  victoryPose.poseAnimation === 'void_domination' ? 'anim-void-domination' :
                  victoryPose.poseAnimation === 'blade_salute' ? 'anim-blade-sheathe' :
                  victoryPose.poseAnimation === 'light_glint' ? 'anim-future-sight' :
                  victoryPose.poseAnimation === 'fist_crack' ? 'anim-club-slam' :
                  'hover:scale-105'
                }`}
                style={{ borderColor: victoryPose.hakiAuraColor }}
              >
                {/* Metallic Shine Sweep */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent anim-blade-glint" />
                </div>

                <FighterAvatar
                  avatarUrl={activeFighter.avatarUrl}
                  avatarIcon={activeFighter.avatarIcon}
                  name={activeFighter.name}
                  size="hero"
                  glowEffect={true}
                />

                {/* Character-Specific Animated SVG Overlays */}
                {renderVictorySVGOverlay(victoryPose.poseAnimation, victoryPose.hakiAuraColor)}

                {/* Champion Emblem Laurel Badge */}
                <div className="absolute -bottom-3 -right-3 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-2 border-black text-black font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  {victoryPose.badgeEmoji || '👑'}
                </div>

                {/* MVP Tag if applicable */}
                {isMVP && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border border-white/80 text-black font-['Press_Start_2P'] text-[8px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
                    <Crown className="h-3 w-3" />
                    <span>MATCH MVP</span>
                  </div>
                )}
              </div>

              {/* Japanese Calligraphy Victory Stamp ("SHOURI" / Hanko Seal) */}
              <AnimatePresence>
                {stampLanded && (
                  <motion.div
                    initial={{ scale: 3, opacity: 0, rotate: -20 }}
                    animate={{ scale: 1, opacity: 1, rotate: -6 }}
                    transition={{ duration: 0.25, type: 'spring', bounce: 0.5 }}
                    className="mt-4 px-4 py-1.5 rounded-xl border-2 border-red-600/90 bg-gradient-to-r from-red-950/90 to-red-900/90 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center gap-2"
                  >
                    <span className="font-['Cinzel'] font-black text-xs sm:text-sm text-red-200 tracking-wider">
                      ★ 完全勝利
                    </span>
                    <span className="text-[10px] font-mono text-red-300/80">
                      [{victoryPose.poseKanji}]
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: SIGNATURE TAUNTS, QUOTES & TRIUMPHANT MOVES */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          {/* Pose Header & Kanji Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-['Press_Start_2P'] text-[8px] sm:text-[9px] text-amber-400 uppercase tracking-widest">
                SIGNATURE VICTORY POSE
              </span>
              <span className="text-zinc-500">•</span>
              <span className="font-serif text-xs text-amber-300/90">
                {victoryPose.poseKanji}
              </span>
            </div>

            <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white leading-tight">
              {activeFighter.name}
            </h2>
            <p className="font-['Montserrat'] text-xs sm:text-sm font-bold text-amber-400 mt-0.5 tracking-wide">
              {victoryPose.poseTitle}
            </p>
          </div>

          {/* SIGNATURE TAUNT SPEECH BUBBLE WITH AUDIO EQUALIZER */}
          <div className="relative rounded-2xl border border-amber-500/40 bg-zinc-950/90 p-4 sm:p-5 shadow-lg backdrop-blur-md">
            {/* Visualizer Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-['Press_Start_2P'] text-[8px] text-zinc-300 uppercase">
                  VICTORY QUOTE & TAUNT
                </span>
              </div>

              {/* Animated Equalizer Wave Bars */}
              <div className="flex items-center gap-1 h-5">
                {[1, 2, 3, 4, 5, 6].map((bar) => (
                  <div
                    key={`voice_bar_${bar}`}
                    className={`w-1 rounded-full bg-amber-400 ${
                      isTaunting ? 'voice-wave-bar' : 'h-1.5 opacity-40'
                    }`}
                    style={{ '--anim-delay': `${bar * 0.08}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Victory Quote Text */}
            <p className="font-['Montserrat'] text-sm sm:text-base text-zinc-100 italic font-medium leading-relaxed">
              "{lang === 'ja' ? victoryPose.quoteJP : victoryPose.quoteEN}"
            </p>

            {/* Subtitle Translation */}
            <p className="font-mono text-[11px] text-zinc-400 mt-1.5 pt-1.5 border-t border-zinc-900">
              {lang === 'ja' ? `EN: "${victoryPose.quoteEN}"` : `JP: "${victoryPose.quoteJP}"`}
            </p>

            {/* Action Bar inside speech bubble */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/80">
              <button
                id="victory-play-taunt-btn"
                onClick={() => triggerVoiceTaunt(activeFighter)}
                disabled={isTaunting}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono transition active:scale-95 shadow-md"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{isTaunting ? 'SPEAKING TAUNT...' : 'PLAY VOICE TAUNT'}</span>
              </button>

              <span className="font-mono text-[10px] text-zinc-400">
                SOUND FX: <span className="text-amber-400 uppercase font-bold">{victoryPose.signatureSound}</span>
              </span>
            </div>
          </div>

          {/* TRIUMPHANT ACTION DESCRIPTION & SPECIAL MOVE TRIGGER */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-4 sm:p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-['Press_Start_2P'] text-[8px] text-orange-400 uppercase">
                TRIUMPHANT MOVE & CELEBRATION
              </span>
            </div>

            <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {victoryPose.triumphantAction}
            </p>

            {/* Stance Variant Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] text-zinc-400 uppercase mr-1">
                STANCES:
              </span>
              {victoryPose.victoryStanceVariants.map((stance, idx) => (
                <button
                  key={`stance_${idx}`}
                  id={`victory-stance-btn-${idx}`}
                  onClick={() => {
                    setSelectedStanceIndex(idx);
                    entranceAudio.playSignatureSound(victoryPose.signatureSound);
                    confetti({
                      particleCount: 40,
                      spread: 60,
                      origin: { y: 0.6 },
                    });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                    selectedStanceIndex === idx
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md'
                      : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800'
                  }`}
                >
                  {stance}
                </button>
              ))}
            </div>

            {/* Perform Signature Finishing Move Button */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-['Press_Start_2P'] text-[7px] text-zinc-400 uppercase block">
                  SPECIAL FINISHER
                </span>
                <span className="font-['Cinzel'] font-bold text-sm text-amber-300 truncate block">
                  {victoryPose.signatureMoveName}
                </span>
              </div>

              <button
                id="victory-perform-finisher-btn"
                onClick={handlePerformTriumphantMove}
                disabled={isFinisherTriggered}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:brightness-110 text-black font-black text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 transition"
              >
                <Zap className="h-4 w-4" />
                <span>{isFinisherTriggered ? 'KINETIC DETONATION!' : 'PERFORM FINISHER MOVE'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
