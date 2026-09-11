import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, Award, ArrowRight, Flame, Shield, Zap, Star, MessageSquare } from 'lucide-react';
import { Fighter, CombatArchetype } from '../types/fighter';
import { MatchAchievement } from '../types/achievements';
import { FighterAvatar } from './FighterAvatar';
import { soundManager } from '../utils/soundEffects';
import { victoryPoseStore } from '../utils/victoryPoseStore';
import { VictoryPose } from '../types/victoryPoses';
import { getTauntsForFighter, VictoryTaunt } from '../types/victoryTaunts';
import { characterVoiceManager } from '../utils/audioAssetLibrary';
import gsap from 'gsap';

interface VictoryCelebrationSequenceProps {
  winnerFighter: Fighter;
  winningTeamName: string;
  isTeam1Winner: boolean;
  isDraw?: boolean;
  totalRounds: number;
  achievements: MatchAchievement[];
  onProceed: () => void;
  onOpenTournament?: () => void;
}

export const VictoryCelebrationSequence: React.FC<VictoryCelebrationSequenceProps> = ({
  winnerFighter,
  winningTeamName,
  isTeam1Winner,
  isDraw = false,
  totalRounds,
  achievements,
  onProceed,
  onOpenTournament,
}) => {
  const [countdown, setCountdown] = useState<number>(7);
  const [equippedPose, setEquippedPose] = useState<VictoryPose | null>(null);
  const [activeTaunt, setActiveTaunt] = useState<VictoryTaunt | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tauntCaptionRef = useRef<HTMLDivElement>(null);

  const archetype: CombatArchetype = winnerFighter?.combatArchetype || 'Berserker';

  // Archetype-specific color themes & ray styles
  const getArchetypeTheme = (arch: CombatArchetype) => {
    switch (arch) {
      case 'Berserker':
        return {
          rayColor: 'from-red-600/40 via-orange-500/20 to-transparent',
          accentColor: '#ef4444',
          glowShadow: 'rgba(239, 68, 68, 0.6)',
          badgeIcon: '🔥',
        };
      case 'Tank':
        return {
          rayColor: 'from-amber-600/40 via-yellow-500/20 to-transparent',
          accentColor: '#f59e0b',
          glowShadow: 'rgba(245, 158, 11, 0.6)',
          badgeIcon: '🛡️',
        };
      case 'Speedster':
        return {
          rayColor: 'from-cyan-500/40 via-blue-500/20 to-transparent',
          accentColor: '#06b6d4',
          glowShadow: 'rgba(6, 182, 212, 0.6)',
          badgeIcon: '⚡',
        };
      case 'Technician':
        return {
          rayColor: 'from-emerald-500/40 via-teal-500/20 to-transparent',
          accentColor: '#10b981',
          glowShadow: 'rgba(16, 185, 129, 0.6)',
          badgeIcon: '⚙️',
        };
      case 'Specialist':
        return {
          rayColor: 'from-purple-600/40 via-pink-500/20 to-transparent',
          accentColor: '#a855f7',
          glowShadow: 'rgba(168, 85, 247, 0.6)',
          badgeIcon: '✨',
        };
      case 'Trickster':
      default:
        return {
          rayColor: 'from-violet-600/40 via-indigo-500/20 to-transparent',
          accentColor: '#8b5cf6',
          glowShadow: 'rgba(139, 92, 246, 0.6)',
          badgeIcon: '🃏',
        };
    }
  };

  const theme = getArchetypeTheme(archetype);
  const fighterTaunts = getTauntsForFighter(winnerFighter.id);

  // Play archetype-specific ambient victory audio effect
  const playArchetypeAudio = (arch: CombatArchetype) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (arch === 'Berserker') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
      } else if (arch === 'Tank') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.0);
      } else if (arch === 'Speedster') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.6);
      }

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (arch === 'Speedster' ? 0.6 : 0.9));

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    } catch (e) {
      // Audio context error fallback
    }
  };

  const triggerTaunt = (taunt: VictoryTaunt) => {
    setActiveTaunt(taunt);
    soundManager.playUiClick();
    
    if (winnerFighter.id.toLowerCase().includes('katakuri')) {
      characterVoiceManager.playKatakuriPrediction(taunt.text, taunt.textJP);
    }

    if (tauntCaptionRef.current) {
      gsap.fromTo(
        tauntCaptionRef.current,
        { scale: 0.8, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  };

  useEffect(() => {
    soundManager.playVictoryFanfare();
    playArchetypeAudio(archetype);
    
    victoryPoseStore.recordWin();
    const pose = victoryPoseStore.getEquippedPose(winnerFighter.id);
    setEquippedPose(pose);

    const tl = gsap.timeline();

    if (containerRef.current) {
      tl.to(containerRef.current, {
        x: () => (Math.random() - 0.5) * 20,
        y: () => (Math.random() - 0.5) * 20,
        duration: 0.04,
        repeat: 8,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }

    if (cardRef.current) {
      tl.fromTo(
        cardRef.current,
        { scale: 0.75, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' },
        '-=0.2'
      );
    }

    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { scale: 0.7, filter: 'brightness(2) contrast(1.4)', rotateY: -30 },
        { scale: 1, filter: 'brightness(1) contrast(1)', rotateY: 0, duration: 1.4, ease: 'power3.out', delay: 0.2 }
      );
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [winnerFighter, archetype]);

  useEffect(() => {
    if (countdown <= 0) {
      onProceed();
    }
  }, [countdown, onProceed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden p-4 select-none">
      {/* Dynamic Rotating 3D Light Rays / Sunburst */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className={`absolute w-[200vw] h-[200vw] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,var(--tw-gradient-stops))] ${theme.rayColor} animate-[spin_20s_linear_infinite] opacity-60`} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-black/80 to-zinc-950 pointer-events-none" />
      </div>

      {/* Main Celebration Card with 3D Tilt Perspective */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        className="relative max-w-2xl w-full rounded-2xl border-2 bg-zinc-950/95 p-6 sm:p-8 text-center flex flex-col items-center opacity-0 shadow-2xl"
        style={{
          borderColor: theme.accentColor,
          boxShadow: `0 0 70px ${theme.glowShadow}`,
          transform: `perspective(1000px) rotateY(${mousePos.x * 10}deg) rotateX(${-mousePos.y * 10}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Japanese Top Banner */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-['Cinzel'] text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase">
            {isDraw ? '★ 両者相打 • DRAW GAME ★' : '★ 完全勝利 • TOTAL VICTORY ★'}
          </span>
          <span className="rounded bg-amber-500 text-black font-black text-[9px] px-1.5 py-0.2 font-mono">
            ROUND {totalRounds} • {archetype.toUpperCase()}
          </span>
        </div>

        {/* Big Victory Title */}
        <h1 className="font-['Cinzel'] text-3xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]">
          {isDraw ? 'DRAW GAME' : 'VICTORIOUS'}
        </h1>
        <p className="font-['Montserrat'] text-xs sm:text-sm font-bold text-zinc-400 tracking-widest uppercase mt-0.5">
          {isDraw ? 'MUTUAL KNOCKOUT • STALEMATE' : winningTeamName}
        </p>

        {/* Hero Character Presentation Box with 3D Tilt & Light Rays */}
        <div ref={heroRef} className="relative my-4 flex flex-col items-center">
          <div className="relative group cursor-pointer">
            {/* Pulsing Aura Ring */}
            <div
              className="absolute -inset-6 rounded-full opacity-70 blur-2xl animate-pulse -z-10"
              style={{ backgroundColor: winnerFighter.themeColor || theme.accentColor }}
            />
            <div
              className="relative rounded-2xl border-4 p-1.5 bg-black shadow-2xl transition-transform duration-300 group-hover:scale-105"
              style={{ borderColor: theme.accentColor }}
            >
              <FighterAvatar
                avatarUrl={winnerFighter.avatarUrl}
                avatarIcon={winnerFighter.avatarIcon}
                name={winnerFighter.name}
                size="hero"
                glowEffect={true}
              />
            </div>

            {/* Archetype Badge */}
            <div
              className="absolute -bottom-3 -right-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-black text-white font-black shadow-xl text-lg"
              style={{ backgroundColor: theme.accentColor }}
            >
              {theme.badgeIcon}
            </div>
          </div>

          <div className="mt-3">
            <h2 className="font-['Cinzel'] text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
              <span>{winnerFighter.name}</span>
            </h2>
            <p className="font-mono text-xs text-amber-400">
              {winnerFighter.japaneseName} • {winnerFighter.epithet}
            </p>
          </div>
        </div>

        {/* Character's Equipped Victory Pose & Signature Win Quote */}
        <div
          className="w-full rounded-xl border px-4 py-3 my-1.5 shadow-inner text-center bg-black/40"
          style={{ borderColor: `${theme.accentColor}50` }}
        >
          {equippedPose && (
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>VICTORY POSE: {equippedPose.name}</span>
            </div>
          )}
          <p className="font-['Montserrat'] text-xs sm:text-sm italic font-medium text-amber-100 leading-relaxed">
            "{equippedPose?.quote || winnerFighter.winQuote || "I won't lose to anyone who lacks resolve!"}"
          </p>
          <p className="font-mono text-[10px] text-amber-400/70 mt-1">
            「{equippedPose?.quoteJP || winnerFighter.tauntQuoteJP || "お前に負けるわけにいかん！"}」
          </p>
        </div>

        {/* Victory Taunt Interactive System */}
        <div className="w-full my-1.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-amber-400/90 mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>TRIGGER VICTORY TAUNT</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {fighterTaunts.map((taunt, index) => (
              <button
                key={taunt.id}
                onClick={() => triggerTaunt(taunt)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold font-['Cinzel'] transition-all flex flex-col items-center gap-0.5 ${
                  activeTaunt?.id === taunt.id
                    ? 'border-amber-400 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-amber-500/50 hover:bg-zinc-800'
                }`}
              >
                <span>Taunt #{index + 1}</span>
                <span className="text-[9px] uppercase opacity-70 font-mono tracking-tighter">
                  {taunt.tone}
                </span>
              </button>
            ))}
          </div>

          {/* GSAP Animated Taunt Caption Box */}
          {activeTaunt && (
            <div
              ref={tauntCaptionRef}
              className="mt-2 rounded-xl border-2 border-yellow-400 bg-zinc-900/95 p-2.5 text-center shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <p className="font-['Montserrat'] text-xs font-bold text-yellow-300 italic">
                "{activeTaunt.text}"
              </p>
              <p className="font-mono text-[11px] text-amber-400 mt-0.5">
                「{activeTaunt.textJP}」
              </p>
            </div>
          )}
        </div>

        {/* Unlocked Feats / Match Achievements from this Fight */}
        {achievements?.length > 0 && (
          <div className="w-full mt-2">
            <div className="flex items-center justify-center gap-1 text-[11px] font-mono text-zinc-400 mb-1">
              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
              <span>MATCH FEATS ACHIEVED ({achievements?.length})</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 max-h-20 overflow-y-auto p-1">
              {achievements?.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-zinc-900/90 px-2 py-1 text-xs text-yellow-300 shadow-sm"
                >
                  <span>{ach.icon}</span>
                  <span className="font-bold font-['Bebas_Neue'] text-sm tracking-wide">
                    {ach.name}
                  </span>
                  <span className="text-[9px] text-zinc-400">+{ach.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button & Countdown */}
        <div className="mt-4 flex flex-wrap items-center gap-3 w-full justify-center">
          {onOpenTournament && (
            <button
              onClick={onOpenTournament}
              className="flex items-center gap-2 rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 px-5 py-2.5 font-['Cinzel'] text-sm sm:text-base font-black text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition animate-pulse"
            >
              <Trophy className="h-4 w-4 text-black" />
              <span>🏆 TOURNAMENT BRACKET</span>
            </button>
          )}

          <button
            onClick={onProceed}
            className="flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-2.5 font-['Cinzel'] text-sm sm:text-base font-black text-black shadow-lg hover:brightness-110 active:scale-95 transition"
          >
            <span>PROCEED TO RESULTS</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs text-zinc-400">
            Auto in {countdown}s
          </span>
        </div>
      </div>
    </div>
  );
};
