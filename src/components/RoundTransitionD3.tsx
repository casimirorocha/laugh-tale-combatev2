import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { Fighter, StageInfo } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';
import { entranceAudio } from '../utils/entranceAudio';
import { soundManager } from '../utils/soundEffects';
import { audioManager } from '../utils/AudioManager';
import { Swords, Tv, Sparkles, Zap, Flame, Shield, Trophy } from 'lucide-react';

export interface RoundTransitionD3Props {
  currentRound: number;
  totalRounds?: number;
  isTransitioning: boolean;
  activeStage: StageInfo;
  fighter1?: Fighter | null;
  fighter2?: Fighter | null;
  fighter1Role?: string;
  fighter2Role?: string;
  team1Name?: string;
  team2Name?: string;
  onTransitionComplete: () => void;
}

export const RoundTransitionD3: React.FC<RoundTransitionD3Props> = React.memo(({
  currentRound,
  totalRounds = 3,
  isTransitioning,
  activeStage,
  fighter1,
  fighter2,
  fighter1Role = 'POINT (先鋒)',
  fighter2Role = 'POINT (先鋒)',
  team1Name = 'Team 1',
  team2Name = 'Team 2',
  onTransitionComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(`round_trans_d3_${Math.random().toString(36).substring(2, 9)}`);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [showVsStamp, setShowVsStamp] = useState<boolean>(false);
  const [isKoFlashActive, setIsKoFlashActive] = useState<boolean>(false);
  const [isCameraShaking, setIsCameraShaking] = useState<boolean>(false);
  const [showRoundSlamFx, setShowRoundSlamFx] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const isFinalRound = currentRound >= totalRounds && totalRounds > 1;

  const handleComplete = useCallback(() => {
    onTransitionComplete();
  }, [onTransitionComplete]);

  // Audio & Animation Sequence Trigger
  useEffect(() => {
    if (!isTransitioning) {
      elapsedRef.current = 0;
      setShowContent(false);
      setShowVsStamp(false);
      setIsKoFlashActive(false);
      setIsCameraShaking(false);
      setShowRoundSlamFx(false);
      setProgressPercent(0);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    elapsedRef.current = 0;
    setShowContent(true);

    // 1. Instant High-Energy KO / Transition Flash
    setIsKoFlashActive(true);
    soundManager.playKO();
    const flashEndTimer = setTimeout(() => {
      setIsKoFlashActive(false);
    }, 450);

    // 2. Play dramatic portrait slide audio
    entranceAudio.playPortraitSlide();

    // 3. Camera Shake + Round Slam Impact + Synced Announcer Voice Narration
    const stampTimer = setTimeout(() => {
      // Trigger camera shake
      setIsCameraShaking(true);
      setShowRoundSlamFx(true);

      // Play synced impact SFX
      entranceAudio.playKanjiStamp();
      soundManager.playHit('heavy');
      soundManager.playPowerUp();

      // Announce the upcoming round with audio narration
      const narrationText = isFinalRound
        ? 'Final Round! Fight!'
        : `Round ${currentRound}! Fight!`;
      audioManager.speakAnnouncer(narrationText);

      setShowVsStamp(true);

      // Settle camera shake after impact
      setTimeout(() => {
        setIsCameraShaking(false);
      }, 500);
    }, 250);

    // 4. Play Ready Go fanfare near conclusion
    const fanfareTimer = setTimeout(() => {
      entranceAudio.playReadyGoFanfare();
      // Subtle excitement camera pulse
      setIsCameraShaking(true);
      setTimeout(() => setIsCameraShaking(false), 200);
    }, 1600);

    const instanceId = instanceIdRef.current;
    const duration = 2.6; // 2.6 seconds transition

    // Initialize D3 particles & background elements
    const stars = d3.range(60).map(() => ({
      x: Math.random() * 900,
      y: Math.random() * 400,
      size: Math.random() * 2.2 + 0.8,
      opacity: Math.random() * 0.8 + 0.2,
    }));

    const clouds = d3.range(8).map((i) => ({
      x: i * 140 + Math.random() * 50,
      y: 70 + Math.random() * 80,
      radius: 35 + Math.random() * 30,
      speedMult: 0.35 + Math.random() * 0.45,
    }));

    const spires = d3.range(10).map((i) => ({
      x: i * 110 + 30,
      height: 140 + Math.random() * 120,
      width: 45 + Math.random() * 45,
    }));

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth || 800;
      const height = rect.height || window.innerHeight || 450;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      elapsedRef.current += dt;
      const t = elapsedRef.current;
      const progress = Math.min(1.0, t / duration);
      setProgressPercent(Math.round(progress * 100));

      // 1. D3 CAMERA PANNING CALCULATION
      const panAmount = Math.sin(progress * Math.PI) * 160;

      // 2. STAGE GRADIENT BACKGROUND
      const colorScale = d3.scaleLinear<string>()
        .domain([0, 0.5, 1.0])
        .range([activeStage.accentColor || '#38bdf8', '#09090b', '#18181b']);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, colorScale(progress * 0.4));
      bgGrad.addColorStop(1, '#020205');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. LAYER A: DISTANT BACKGROUND PARALLAX
      ctx.save();
      ctx.translate(-panAmount * 0.15, 0);
      stars.forEach((s) => {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = s.opacity * (1.0 - Math.abs(0.5 - progress) * 0.4);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 4. LAYER B: MIDGROUND PARALLAX
      ctx.save();
      ctx.translate(-panAmount * 0.4, 0);
      ctx.fillStyle = '#111827';
      ctx.globalAlpha = 0.65;

      spires.forEach((sp) => {
        ctx.beginPath();
        ctx.moveTo(sp.x, height);
        ctx.lineTo(sp.x + sp.width / 2, height - sp.height);
        ctx.lineTo(sp.x + sp.width, height);
        ctx.closePath();
        ctx.fill();
      });

      // Ambient Clouds
      ctx.fillStyle = activeStage.accentColor || '#fbbf24';
      ctx.globalAlpha = 0.12;
      clouds.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x + panAmount * 0.05, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 5. LAYER C: FOREGROUND ATMOSPHERIC SPEED STREAKS
      ctx.save();
      ctx.translate(-panAmount * 1.4, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.28;

      const windLine = d3.line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .context(ctx);

      for (let i = 0; i < 10; i++) {
        const lineY = 50 + i * 40;
        const lineX = (i * 170 + progress * 1100) % (width * 1.6);
        ctx.beginPath();
        windLine([[lineX, lineY], [lineX + 130, lineY]]);
        ctx.stroke();
      }
      ctx.restore();

      // 6. MIDPOINT RADIAL SUNBURST
      if (progress >= 0.2 && progress <= 0.85) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        const segments = 18;
        const beamRadius = Math.sin((progress - 0.2) * (Math.PI / 0.65)) * (width * 0.7);

        ctx.fillStyle = activeStage.accentColor || '#fbbf24';
        ctx.globalAlpha = 0.14;

        for (let i = 0; i < segments; i++) {
          const angleStart = (i / segments) * Math.PI * 2 + progress * 0.6;
          const angleEnd = ((i + 0.45) / segments) * Math.PI * 2 + progress * 0.6;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, Math.max(0, beamRadius), angleStart, angleEnd);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // 7. CRT SCANLINES & VIGNETTE
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.lineWidth = 1.0;
      const scanlineSpacing = 4;
      for (let y = 0; y < height; y += scanlineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const vignetteGrad = ctx.createRadialGradient(
        width / 2, height / 2, width * 0.25,
        width / 2, height / 2, width * 0.55
      );
      vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
      vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.restore();

      // Check transition end trigger
      if (t >= duration) {
        unsubscribe();
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        handleComplete();
      }
    });

    // Keyboard listener for skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(flashEndTimer);
      clearTimeout(stampTimer);
      clearTimeout(fanfareTimer);
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, [isTransitioning, activeStage, currentRound, isFinalRound, handleComplete]);

  if (!isTransitioning) return null;

  const f1 = fighter1;
  const f2 = fighter2;

  return (
    <motion.div
      id="round-transition-screen"
      onClick={handleComplete}
      animate={
        isCameraShaking
          ? {
              x: [0, -14, 12, -10, 8, -5, 3, 0],
              y: [0, 10, -12, 8, -6, 4, -2, 0],
              rotate: [0, -1.2, 1.4, -0.9, 0.6, -0.3, 0],
              scale: [1, 1.03, 0.99, 1.02, 1],
            }
          : { x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed inset-0 z-[150] flex flex-col justify-between items-center bg-black select-none cursor-pointer overflow-hidden p-3 sm:p-6"
    >
      {/* Parallax Moving Backdrop Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Retro Horizontal Jitter Accent */}
      <div className="absolute inset-0 z-10 bg-scanlines pointer-events-none opacity-25" />

      {/* Speedlines Flash Overlay */}
      <div className="absolute inset-0 kof-horizontal-speedlines opacity-40 pointer-events-none z-10" />

      {/* ANIMATED HIGH-VOLTAGE 'KO' & ROUND IMPACT FLASH */}
      <AnimatePresence>
        {isKoFlashActive && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut' }}
            className="absolute inset-0 z-40 bg-gradient-to-r from-amber-100 via-white to-amber-100 pointer-events-none flex items-center justify-center overflow-hidden"
          >
            {/* Exploding Radial Shockwave Rings */}
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-96 h-96 rounded-full border-8 border-amber-400/80 shadow-[0_0_100px_rgba(251,191,36,1)]"
            />
            {/* Stylized Arcade K.O. Watermark Burst */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0.9 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              className="absolute font-['Press_Start_2P'] text-6xl sm:text-8xl text-red-600 font-black tracking-widest drop-shadow-[0_0_40px_rgba(239,68,68,0.9)]"
            >
              K.O.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP: UPCOMING ROUND HEADER & STAGE BANNER */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center pt-2 sm:pt-4">
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ y: -80, opacity: 0, scale: 0.75 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 18, delay: 0.12 }}
              className="flex flex-col items-center text-center relative"
            >
              {/* Round Impact Shockwave Ring */}
              {showRoundSlamFx && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0.9 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl pointer-events-none"
                />
              )}

              {/* Japanese Calligraphy / Stage Title Tag */}
              <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-950/80 border border-amber-500/40 shadow-lg backdrop-blur-md mb-1.5">
                <Tv className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="font-mono text-[10px] sm:text-xs text-amber-300 font-bold uppercase tracking-[0.25em]">
                  {activeStage.location.toUpperCase()} • &ldquo;{activeStage.name.toUpperCase()}&rdquo;
                </span>
              </div>

              {/* Main Prominent Round Header Banner with Slam Physics */}
              <div className="relative flex items-center justify-center gap-3 sm:gap-6 my-1">
                <div className="h-1 sm:h-1.5 w-12 sm:w-28 bg-gradient-to-r from-transparent via-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                <div className="flex flex-col items-center">
                  <h1 className="font-['Cinzel'] text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)] leading-none">
                    {isFinalRound ? 'FINAL ROUND' : `ROUND ${currentRound}`}
                  </h1>
                  <span className="font-serif text-[11px] sm:text-xs text-amber-200/80 tracking-[0.4em] uppercase font-bold mt-1">
                    {isFinalRound ? '完全決着 • DECISIVE SHOWDOWN' : `第 ${currentRound} 回戦 • READY TO CLASH`}
                  </span>
                </div>
                <div className="h-1 sm:h-1.5 w-12 sm:w-28 bg-gradient-to-l from-transparent via-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CENTER: STYLIZED CHARACTER PORTRAIT DUEL OVERLAY */}
      <div className="relative z-20 w-full max-w-6xl my-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center px-2 sm:px-4">
        {/* FIGHTER 1 (LEFT SIDE - PLAYER 1 / TEAM 1) */}
        {f1 && (
          <motion.div
            initial={{ x: -600, opacity: 0, scale: 0.85 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.08 }}
            className="relative flex items-center gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950/95 via-zinc-900/90 to-zinc-950/75 border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] backdrop-blur-md overflow-hidden transform lg:-skew-x-2"
          >
            {/* Ambient Background Accent Color */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ background: `radial-gradient(circle at 20% 50%, ${f1.themeColor || '#f59e0b'}, transparent 70%)` }}
            />

            {/* Stylized Fighter Portrait Avatar */}
            <div className="relative shrink-0 transform lg:skew-x-2">
              <FighterAvatar
                avatarUrl={f1.avatarUrl}
                avatarIcon={f1.avatarIcon}
                name={f1.name}
                size="hero"
                borderColor={f1.themeColor || '#f59e0b'}
                showScanlines={true}
                glowEffect={true}
              />
              {/* Role Badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-['Press_Start_2P'] text-[8px] whitespace-nowrap shadow-lg uppercase tracking-wider font-black border border-amber-300">
                {fighter1Role}
              </div>
            </div>

            {/* Fighter Details & Kanji Stamp */}
            <div className="flex-1 flex flex-col items-start min-w-0 transform lg:skew-x-2">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {/* Kanji Stamp Badge */}
                <span className="kof-stamp-slam inline-block px-2.5 py-0.5 rounded bg-red-700/90 border border-red-400 text-white font-serif font-black text-xs sm:text-sm tracking-widest shadow-md">
                  {f1.japaneseName || f1.name}
                </span>
                <span className="font-mono text-[10px] text-amber-400/90 uppercase tracking-wider font-semibold">
                  {team1Name}
                </span>
              </div>

              {/* Fighter Name */}
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl lg:text-3xl font-black text-zinc-100 uppercase tracking-wide truncate max-w-full drop-shadow-md">
                {f1.name}
              </h3>

              {/* Epithet / Title */}
              <p className="font-serif italic text-xs sm:text-sm text-amber-300/90 font-medium truncate max-w-full">
                &ldquo;{f1.epithet || 'Grand Line Titan'}&rdquo;
              </p>

              {/* Badges / Style / Affiliation */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-zinc-800/80 w-full">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                  <Shield className="w-2.5 h-2.5 text-amber-400" />
                  {f1.archetype || 'Fighter'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/60 text-[10px] font-mono text-amber-300 truncate max-w-[170px]">
                  <Flame className="w-2.5 h-2.5 text-orange-400" />
                  {f1.fightingStyle || 'Combat Style'}
                </span>
                {f1.haki && f1.haki.conqueror > 80 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/70 text-[9px] font-mono text-purple-200 font-bold">
                    <Zap className="w-2.5 h-2.5 text-purple-400" />
                    HAOSHOKU
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CENTER VS EMBLEM OVERLAY */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-30 pointer-events-none">
          <AnimatePresence>
            {showVsStamp && (
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 16 }}
                className="relative flex items-center justify-center"
              >
                <div className="absolute inset-0 blur-2xl bg-amber-500/60 rounded-full animate-pulse" />
                <div className="relative bg-zinc-950 border-4 border-amber-400 rounded-full p-3.5 shadow-[0_0_50px_rgba(245,158,11,0.7)] flex items-center justify-center">
                  <Swords className="w-9 h-9 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                </div>
                <div className="absolute -top-3 -right-3 bg-red-600 text-white font-black px-2 py-0.5 text-xs rounded border-2 border-white rotate-12 shadow-xl font-mono">
                  VS
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FIGHTER 2 (RIGHT SIDE - OPPONENT / TEAM 2) */}
        {f2 && (
          <motion.div
            initial={{ x: 600, opacity: 0, scale: 0.85 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.12 }}
            className="relative flex items-center flex-row-reverse sm:flex-row-reverse lg:flex-row-reverse gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-2xl bg-gradient-to-l from-zinc-950/95 via-zinc-900/90 to-zinc-950/75 border-2 border-red-500/60 shadow-[0_0_35px_rgba(239,68,68,0.25)] backdrop-blur-md overflow-hidden transform lg:skew-x-2"
          >
            {/* Ambient Background Accent Color */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{ background: `radial-gradient(circle at 80% 50%, ${f2.themeColor || '#ef4444'}, transparent 70%)` }}
            />

            {/* Stylized Fighter Portrait Avatar */}
            <div className="relative shrink-0 transform lg:-skew-x-2">
              <FighterAvatar
                avatarUrl={f2.avatarUrl}
                avatarIcon={f2.avatarIcon}
                name={f2.name}
                size="hero"
                borderColor={f2.themeColor || '#ef4444'}
                showScanlines={true}
                glowEffect={true}
              />
              {/* Role Badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-['Press_Start_2P'] text-[8px] whitespace-nowrap shadow-lg uppercase tracking-wider font-black border border-red-300">
                {fighter2Role}
              </div>
            </div>

            {/* Fighter Details & Kanji Stamp */}
            <div className="flex-1 flex flex-col items-end min-w-0 text-right transform lg:-skew-x-2">
              <div className="flex items-center gap-2 flex-wrap justify-end mb-1">
                <span className="font-mono text-[10px] text-red-400/90 uppercase tracking-wider font-semibold">
                  {team2Name}
                </span>
                {/* Kanji Stamp Badge */}
                <span className="kof-stamp-slam inline-block px-2.5 py-0.5 rounded bg-red-700/90 border border-red-400 text-white font-serif font-black text-xs sm:text-sm tracking-widest shadow-md">
                  {f2.japaneseName || f2.name}
                </span>
              </div>

              {/* Fighter Name */}
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl lg:text-3xl font-black text-zinc-100 uppercase tracking-wide truncate max-w-full drop-shadow-md">
                {f2.name}
              </h3>

              {/* Epithet / Title */}
              <p className="font-serif italic text-xs sm:text-sm text-red-300/90 font-medium truncate max-w-full">
                &ldquo;{f2.epithet || 'Grand Line Rival'}&rdquo;
              </p>

              {/* Badges / Style / Affiliation */}
              <div className="flex items-center justify-end gap-1.5 flex-wrap mt-2 pt-2 border-t border-zinc-800/80 w-full">
                {f2.haki && f2.haki.conqueror > 80 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/70 text-[9px] font-mono text-purple-200 font-bold">
                    <Zap className="w-2.5 h-2.5 text-purple-400" />
                    HAOSHOKU
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/50 border border-red-800/60 text-[10px] font-mono text-red-300 truncate max-w-[170px]">
                  <Flame className="w-2.5 h-2.5 text-red-400" />
                  {f2.fightingStyle || 'Combat Style'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                  <Shield className="w-2.5 h-2.5 text-red-400" />
                  {f2.archetype || 'Fighter'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* BOTTOM: READY PULSE, PROGRESS BAR & SKIP HINT */}
      <div className="relative z-20 w-full max-w-3xl flex flex-col items-center pb-2 sm:pb-4">
        {/* Pulsing Action Callout */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-600/30 via-orange-600/40 to-amber-600/30 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] backdrop-blur-md mb-2.5"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="font-['Press_Start_2P'] text-[10px] sm:text-xs text-amber-300 tracking-wider">
            READY... FIGHT!
          </span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </motion.div>

        {/* Transition Countdown Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            style={{ width: `${progressPercent}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        {/* Subtle Tap to Skip Indicator */}
        <p className="font-mono text-[9px] sm:text-[10px] text-zinc-400 mt-1.5 tracking-widest uppercase opacity-75 hover:opacity-100">
          [ CLICK ANYWHERE OR PRESS SPACE TO SKIP ]
        </p>
      </div>
    </motion.div>
  );
});

RoundTransitionD3.displayName = 'RoundTransitionD3';
export default RoundTransitionD3;


