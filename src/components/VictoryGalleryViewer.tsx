import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Languages,
  Flame,
  Zap,
  Eye,
  Camera,
  Layers,
  Award,
  Shield,
  Coins,
  Crown,
} from 'lucide-react';
import { Fighter } from '../types/fighter';
import { VictoryPose, PoseAnimationEffect } from '../types/victoryPoses';
import { victoryPoseStore } from '../utils/victoryPoseStore';
import { FighterAvatar } from './FighterAvatar';
import { soundManager } from '../utils/soundEffects';
import { entranceAudio } from '../utils/entranceAudio';
import { getUserProfile, saveUserProfile } from '../utils/storage';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

interface VictoryGalleryViewerProps {
  fighter: Fighter;
  onEquipChange?: (pose: VictoryPose) => void;
}

export const VictoryGalleryViewer: React.FC<VictoryGalleryViewerProps> = ({
  fighter,
  onEquipChange,
}) => {
  const poses = victoryPoseStore.getPosesForFighter(fighter.id);
  const [selectedPose, setSelectedPose] = useState<VictoryPose>(poses[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [clipProgress, setClipProgress] = useState<number>(0);
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  const [cameraMode, setCameraMode] = useState<'cinematic_zoom' | 'wide_stage' | 'anime_split'>('cinematic_zoom');
  const [isStampLanded, setIsStampLanded] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [equippedPoseId, setEquippedPoseId] = useState<string>(
    () => victoryPoseStore.getEquippedPose(fighter.id).id
  );
  const [userProfile, setUserProfile] = useState(() => getUserProfile());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalWins = victoryPoseStore.getTotalWins();
  const fighterWins = victoryPoseStore.getFighterWins(fighter.id);

  const isUnlocked = victoryPoseStore.isPoseUnlocked(selectedPose, fighter.id);
  const isEquipped = equippedPoseId === selectedPose.id;

  // Sync poses list when fighter changes
  useEffect(() => {
    const updatedPoses = victoryPoseStore.getPosesForFighter(fighter.id);
    const equipped = victoryPoseStore.getEquippedPose(fighter.id);
    setSelectedPose(updatedPoses.find((p) => p.id === equipped.id) || updatedPoses[0]);
    setEquippedPoseId(equipped.id);
  }, [fighter.id]);

  // Handle Playback & Clip Loop
  const startClipAnimation = (pose: VictoryPose = selectedPose) => {
    setIsPlaying(true);
    setClipProgress(0);
    setIsStampLanded(false);

    if (clipTimerRef.current) clearTimeout(clipTimerRef.current);

    // Audio SFX & Voice trigger
    soundManager.playVictoryFanfare();
    if (!isVoiceMuted) {
      if (lang === 'ja' && pose.voiceTextJP) {
        entranceAudio.speakText(pose.voiceTextJP, 'ja');
      } else {
        entranceAudio.speakText(pose.quote, 'en');
      }
    }

    // Calligraphy Stamp Drop after 0.8s
    const stampTimer = setTimeout(() => {
      setIsStampLanded(true);
      soundManager.playCriticalStrike();

      // Confetti burst for rare/legendary/mythic poses
      if (pose.rarity !== 'common') {
        try {
          confetti({
            particleCount: pose.rarity === 'mythic' ? 70 : 40,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#fbbf24', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'],
          });
        } catch {}
      }
    }, 800 / playbackSpeed);

    // Progress Bar Ticker
    const durationMs = (pose.clipDurationSeconds || 4.0) * 1000 / playbackSpeed;
    const startTime = Date.now();

    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setClipProgress(progress);

      if (progress >= 100) {
        clearInterval(updateInterval);
        setIsPlaying(false);
      }
    }, 30);

    return () => {
      clearTimeout(stampTimer);
      clearInterval(updateInterval);
    };
  };

  useEffect(() => {
    const cleanup = startClipAnimation(selectedPose);
    return () => {
      if (cleanup) cleanup();
    };
  }, [selectedPose.id, lang, playbackSpeed]);

  // Dynamic Animated Particle Canvas for Victory Clip
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
      rotation?: number;
      vRot?: number;
      type?: string;
    }

    const particles: Particle[] = [];
    const effect = selectedPose.animationEffect;

    const createParticle = () => {
      let color = selectedPose.hakiAuraColor || '#f59e0b';
      let size = Math.random() * 4 + 2;
      let vx = (Math.random() - 0.5) * 3;
      let vy = -Math.random() * 3 - 1;

      if (effect === 'joyboy_bounce') {
        color = ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444'][Math.floor(Math.random() * 4)];
        size = Math.random() * 6 + 3;
      } else if (effect === 'blade_sheathe') {
        color = ['#10b981', '#a855f7', '#34d399', '#ffffff'][Math.floor(Math.random() * 4)];
        vx = (Math.random() - 0.5) * 6;
      } else if (effect === 'conqueror_aura') {
        color = ['#ef4444', '#7f1d1d', '#000000', '#dc2626'][Math.floor(Math.random() * 4)];
        size = Math.random() * 5 + 3;
      } else if (effect === 'flame_pillar') {
        color = ['#f97316', '#ea580c', '#facc15', '#38bdf8'][Math.floor(Math.random() * 4)];
      } else if (effect === 'ice_sculpture') {
        color = ['#38bdf8', '#bae6fd', '#ffffff'][Math.floor(Math.random() * 3)];
        vy = Math.random() * 2 + 1;
      } else if (effect === 'future_sight') {
        color = '#06b6d4';
        size = Math.random() * 3 + 2;
      }

      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height * 0.7 + (Math.random() - 0.5) * 60,
        vx,
        vy,
        size,
        alpha: 0.9,
        decay: Math.random() * 0.015 + 0.008,
        color,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isPlaying && particles.length < 50) {
        for (let i = 0; i < 3; i++) {
          createParticle();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.rotation !== undefined && p.vRot !== undefined) {
          p.rotation += p.vRot;
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

    };

    const unsubscribe = centralAnimationLoop.subscribe('victory_gallery_particles', render);

    return () => {
      unsubscribe();
    };
  }, [selectedPose.id, selectedPose.animationEffect, isPlaying]);

  const handleUnlockPose = () => {
    const cost = selectedPose.bountyCost || 5000;
    if (userProfile.bounty >= cost || totalWins >= selectedPose.requiredWins) {
      if (userProfile.bounty >= cost && totalWins < selectedPose.requiredWins) {
        // Deduct bounty
        const updatedProfile = {
          ...userProfile,
          bounty: Math.max(0, userProfile.bounty - cost),
        };
        setUserProfile(updatedProfile);
        saveUserProfile(updatedProfile);
      }
      victoryPoseStore.unlockPose(selectedPose.id);
      soundManager.playPowerUp();
      startClipAnimation(selectedPose);
    } else {
      soundManager.playGuardBlock();
    }
  };

  const handleEquipPose = () => {
    victoryPoseStore.setEquippedPose(fighter.id, selectedPose.id);
    setEquippedPoseId(selectedPose.id);
    soundManager.playEquip();
    if (onEquipChange) onEquipChange(selectedPose);
  };

  const rarityStyles: Record<string, { badge: string; text: string; border: string; glow: string }> = {
    common: {
      badge: 'bg-zinc-800 text-zinc-300',
      text: 'text-zinc-300',
      border: 'border-zinc-700',
      glow: '',
    },
    rare: {
      badge: 'bg-blue-950 text-blue-300 border border-blue-700',
      text: 'text-blue-400',
      border: 'border-blue-600/50',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    },
    legendary: {
      badge: 'bg-purple-950 text-purple-300 border border-purple-700',
      text: 'text-purple-400',
      border: 'border-purple-600/60',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    },
    mythic: {
      badge: 'bg-gradient-to-r from-amber-600 to-red-600 text-amber-100 font-black border border-amber-400',
      text: 'text-amber-300',
      border: 'border-amber-500',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    },
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Gallery Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 p-4 rounded-2xl border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide">
                VICTORY GALLERY & FINISHING POSES
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">
                {fighter.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Unlock authentic triumphant sequences, KOF calligraphy victory stamps, and signature battle quotes.
            </p>
          </div>
        </div>

        {/* Global Stats Badges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Fighter Wins: <strong className="text-amber-400">{fighterWins}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>Bounty: <strong className="text-amber-300">฿{userProfile.bounty.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Interactive Animation Clip Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative rounded-2xl border-2 border-amber-500/50 bg-black overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9)] aspect-[16/10] flex flex-col justify-between">
            {/* Background Canvas Particles */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 opacity-75" />

            {/* Background Atmosphere Aura */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-700"
              style={{
                background: `radial-gradient(circle at center, ${selectedPose.hakiAuraColor} 0%, transparent 70%)`,
              }}
            />

            {/* Cinematic Letterbox Bars */}
            <div className="relative z-20 w-full h-8 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <span className="font-bold tracking-widest">VICTORY SEQUENCE REC</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                CAM: {cameraMode.replace('_', ' ')}
              </span>
            </div>

            {/* Center Stage: Character Sprite / Avatar Choreography */}
            <div className="relative z-20 flex-1 flex items-center justify-center">
              <motion.div
                key={`${selectedPose.id}-${clipProgress === 0 ? 'start' : 'loop'}`}
                animate={
                  selectedPose.animationEffect === 'joyboy_bounce'
                    ? { y: [0, -25, 0, -15, 0], rotate: [0, -3, 3, -2, 0], scale: [1, 1.08, 1, 1.05, 1] }
                    : selectedPose.animationEffect === 'blade_sheathe'
                    ? { y: [0, -10, 0], scale: [1, 1.05, 1], x: [0, 5, 0] }
                    : selectedPose.animationEffect === 'world_quake'
                    ? { x: [-8, 8, -6, 6, -2, 2, 0], y: [-4, 4, -2, 2, 0], scale: [1, 1.1, 1] }
                    : selectedPose.animationEffect === 'light_glint'
                    ? { opacity: [0.7, 1, 0.8, 1], scale: [0.95, 1.08, 1] }
                    : { y: [0, -12, 0], scale: [1, 1.04, 1] }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className={`relative flex flex-col items-center justify-center transition-all ${
                  cameraMode === 'cinematic_zoom'
                    ? 'scale-125'
                    : cameraMode === 'anime_split'
                    ? 'scale-110 translate-y-2'
                    : 'scale-100'
                }`}
              >
                {/* Spiritual Aura Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-60 scale-150 pointer-events-none"
                  style={{ backgroundColor: selectedPose.hakiAuraColor }}
                />

                <div className="relative group">
                  <FighterAvatar
                    avatarUrl={fighter.avatarUrl}
                    avatarIcon={fighter.avatarIcon}
                    name={fighter.name}
                    size="hero"
                    borderColor={selectedPose.hakiAuraColor}
                  />

                  {/* Floating Victory Badge Emoji */}
                  <div className="absolute -top-3 -right-3 text-3xl animate-bounce drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                    {selectedPose.badgeEmoji}
                  </div>
                </div>
              </motion.div>

              {/* Japanese Calligraphy Victory Stamp Impact */}
              <AnimatePresence>
                {isStampLanded && (
                  <motion.div
                    initial={{ scale: 3.5, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: -3 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                    className="absolute top-8 right-6 z-30 pointer-events-none"
                  >
                    <div className="border-4 border-red-600 bg-red-950/80 px-4 py-2 rounded-xl text-center shadow-[0_0_35px_rgba(220,38,38,0.8)] backdrop-blur-sm">
                      <span className="font-['Cinzel'] text-xl sm:text-2xl font-black text-amber-300 tracking-wider block drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        {selectedPose.kanjiStamp}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400/90 font-bold block mt-0.5 tracking-widest uppercase">
                        ★ GRAND LINE TRIUMPH ★
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Subtitle / Speech Banner */}
            <div className="relative z-20 bg-gradient-to-t from-black via-black/90 to-transparent px-5 py-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-['Cinzel'] font-bold text-amber-400">
                  {selectedPose.signatureMoveName}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {lang === 'ja' ? 'ORIGINAL VOICE' : 'ENGLISH DUB'}
                </span>
              </div>
              <p className="font-serif italic text-xs sm:text-sm text-zinc-100 leading-snug">
                "{lang === 'ja' ? selectedPose.quoteJP : selectedPose.quote}"
              </p>
            </div>
          </div>

          {/* Interactive Player Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
            {/* Scrubber & Replay */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => startClipAnimation(selectedPose)}
                title="Replay Victory Animation Clip"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition active:scale-95 shadow-md shadow-amber-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>REPLAY</span>
              </button>

              <button
                onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
                title="Toggle Voice Subtitle Language"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono transition"
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang.toUpperCase()}</span>
              </button>

              <button
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                title={isVoiceMuted ? 'Unmute Character Voice' : 'Mute Character Voice'}
                className={`p-2 rounded-xl border text-xs transition ${
                  isVoiceMuted
                    ? 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    : 'border-amber-500/50 bg-amber-950/40 text-amber-400'
                }`}
              >
                {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Camera Switcher & Speed */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-zinc-900 rounded-xl p-0.5 border border-zinc-800 text-[10px] font-mono">
                <button
                  onClick={() => setCameraMode('cinematic_zoom')}
                  className={`px-2 py-1 rounded-lg transition ${
                    cameraMode === 'cinematic_zoom' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  ZOOM
                </button>
                <button
                  onClick={() => setCameraMode('wide_stage')}
                  className={`px-2 py-1 rounded-lg transition ${
                    cameraMode === 'wide_stage' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  WIDE
                </button>
                <button
                  onClick={() => setCameraMode('anime_split')}
                  className={`px-2 py-1 rounded-lg transition ${
                    cameraMode === 'anime_split' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400'
                  }`}
                >
                  ANIME
                </button>
              </div>

              <button
                onClick={() => setPlaybackSpeed((prev) => (prev === 1.0 ? 0.5 : 1.0))}
                className="px-2 py-1.5 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-mono font-bold"
              >
                {playbackSpeed === 1.0 ? '1.0x' : '0.5x SLOW'}
              </button>
            </div>
          </div>

          {/* Timeline Progress Bar */}
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-75"
              style={{ width: `${clipProgress}%` }}
            />
          </div>
        </div>

        {/* RIGHT: Pose Catalog & Unlock Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-['Cinzel'] text-sm font-bold text-amber-400">
              AVAILABLE FINISHING POSES ({poses.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {poses.filter((p) => victoryPoseStore.isPoseUnlocked(p, fighter.id)).length} / {poses.length} UNLOCKED
            </span>
          </div>

          {/* Pose Cards List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {poses.map((pose) => {
              const poseUnlocked = victoryPoseStore.isPoseUnlocked(pose, fighter.id);
              const isSelected = selectedPose.id === pose.id;
              const isCurrentlyEquipped = equippedPoseId === pose.id;
              const style = rarityStyles[pose.rarity] || rarityStyles.common;

              return (
                <div
                  key={pose.id}
                  onClick={() => setSelectedPose(pose)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? `border-amber-400 bg-amber-950/30 shadow-lg ${style.glow}`
                      : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                  } ${!poseUnlocked ? 'opacity-85' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{pose.badgeEmoji}</span>
                        <h4 className="font-['Cinzel'] text-sm font-bold text-white leading-tight">
                          {pose.name}
                        </h4>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400 mt-0.5">{pose.nameJP}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {pose.rarity}
                      </span>
                      {isCurrentlyEquipped && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 text-[9px] font-mono font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          EQUIPPED
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-snug line-clamp-2">
                    {pose.description}
                  </p>

                  {/* Requirements / Action Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[10px] font-mono">
                    <div>
                      {poseUnlocked ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold">
                          <Unlock className="w-3 h-3" /> UNLOCKED
                        </span>
                      ) : (
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-red-400" />
                          Requires {pose.requiredWins} Wins or ฿{(pose.bountyCost || 5000).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-zinc-400">
                      <span>{pose.clipDurationSeconds}s Clip</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Box: Equip or Unlock Button */}
          <div className="mt-2 p-4 rounded-2xl bg-zinc-950 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
            <div>
              <h5 className="font-['Cinzel'] text-xs font-bold text-white">
                {selectedPose.name}
              </h5>
              <p className="text-[10px] font-mono text-zinc-400">
                {isUnlocked
                  ? isEquipped
                    ? 'Currently active in all Grand Line victory sequences'
                    : 'Unlocked & ready to equip'
                  : `Locked • Need ${selectedPose.requiredWins} Wins or ฿${(selectedPose.bountyCost || 5000).toLocaleString()}`}
              </p>
            </div>

            {isUnlocked ? (
              <button
                onClick={handleEquipPose}
                disabled={isEquipped}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 ${
                  isEquipped
                    ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEquipped ? 'EQUIPPED' : 'EQUIP VICTORY POSE'}</span>
              </button>
            ) : (
              <button
                onClick={handleUnlockPose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs font-mono shadow-lg shadow-red-500/30 transition flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>UNLOCK POSE (฿{(selectedPose.bountyCost || 5000).toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
