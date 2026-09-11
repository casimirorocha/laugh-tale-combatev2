import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Sparkles, X, Minimize2, Maximize2, Award } from 'lucide-react';
import { MatchAchievement } from '../types/achievements';
import { soundManager } from '../utils/soundEffects';

interface AchievementBannerProps {
  achievement: MatchAchievement | null;
  onDismiss: () => void;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  achievement,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDense, setIsDense] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  
  const lastSoundAchievementIdRef = useRef<string | null>(null);
  const timeRemainingRef = useRef<number>(4000);
  const lastTickTimeRef = useRef<number>(Date.now());

  const DURATION = 4000;

  const handleDismiss = () => {
    soundManager.playUiConfirm();
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setTimeout(() => {
      onDismissRef.current();
    }, 250);
  };

  // Trigger banner visibility and single audio chime when a NEW achievement appears
  useEffect(() => {
    if (!achievement) {
      setIsVisible(false);
      setProgress(100);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const uniqueId = `${achievement.id}_${achievement.unlockedAt || ''}`;
    if (lastSoundAchievementIdRef.current !== uniqueId) {
      lastSoundAchievementIdRef.current = uniqueId;
      setIsVisible(true);
      setProgress(100);
      timeRemainingRef.current = DURATION;
      lastTickTimeRef.current = Date.now();
    }
  }, [achievement?.id, achievement?.unlockedAt]);

  // Handle countdown timer and progress tick without re-triggering sound or re-mounting
  useEffect(() => {
    if (!achievement || !isVisible) return;

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    lastTickTimeRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      if (!isHovered) {
        const now = Date.now();
        const delta = now - lastTickTimeRef.current;
        lastTickTimeRef.current = now;

        timeRemainingRef.current = Math.max(0, timeRemainingRef.current - delta);
        const currentProgress = (timeRemainingRef.current / DURATION) * 100;
        setProgress(currentProgress);

        if (timeRemainingRef.current <= 0) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setIsVisible(false);
          setTimeout(() => {
            onDismissRef.current();
          }, 250);
        }
      } else {
        lastTickTimeRef.current = Date.now();
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [achievement?.id, isVisible, isHovered]);

  if (!achievement) return null;

  const rarityStyles = {
    bronze: 'border-amber-600/70 bg-gradient-to-r from-amber-950/80 via-zinc-950/85 to-amber-950/80 text-amber-300 shadow-amber-950/60',
    silver: 'border-slate-400/70 bg-gradient-to-r from-slate-900/80 via-zinc-950/85 to-slate-900/80 text-slate-200 shadow-slate-900/60',
    gold: 'border-yellow-400/80 bg-gradient-to-r from-yellow-950/85 via-zinc-950/90 to-amber-950/85 text-yellow-300 shadow-yellow-950/70',
    legendary: 'border-red-500/80 bg-gradient-to-r from-red-950/85 via-purple-950/90 to-zinc-950/90 text-red-300 shadow-red-950/80',
  }[achievement.rarity];

  const rarityAccent = {
    bronze: 'bg-amber-500',
    silver: 'bg-slate-300',
    gold: 'bg-yellow-400',
    legendary: 'bg-red-500',
  }[achievement.rarity];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-20 right-3 sm:right-6 md:right-8 z-40 transition-all duration-300 transform select-none ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Dense Micro Mode */}
      {isDense ? (
        <div
          onClick={handleDismiss}
          className={`group relative flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105 ${rarityStyles}`}
        >
          <span className="text-base">{achievement.icon}</span>
          <span className="text-xs font-bold font-['Bebas_Neue'] tracking-wider text-white">
            {achievement.name}
          </span>
          <span className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300">
            +{achievement.points}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDense(false);
            }}
            className="p-0.5 text-zinc-400 hover:text-white rounded"
            title="Expand feat details"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="p-0.5 text-zinc-400 hover:text-red-300 rounded"
            title="Dismiss feat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Full Creative Banner */
        <div
          className={`relative overflow-hidden flex flex-col rounded-xl border-2 px-3.5 py-2.5 shadow-2xl backdrop-blur-md max-w-xs sm:max-w-sm transition-all duration-200 hover:bg-opacity-95 ${rarityStyles}`}
        >
          {/* Subtle Glow aura */}
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-sm pointer-events-none" />

          {/* Top row with tags & controls */}
          <div className="relative flex items-center justify-between gap-1.5 pb-1 text-[10px] font-bold tracking-widest uppercase text-amber-400 border-b border-white/10">
            <div className="flex items-center gap-1.5 truncate">
              <Trophy className="h-3 w-3 text-amber-400 shrink-0" />
              <span className="truncate">FEAT UNLOCKED {achievement.japaneseName ? `• ${achievement.japaneseName}` : ''}</span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="rounded bg-yellow-400/20 px-1.5 py-0.5 font-mono text-[9px] font-extrabold text-yellow-300 border border-yellow-400/30">
                +{achievement.points} PTS
              </span>
              
              <button
                onClick={() => setIsDense(true)}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded transition"
                title="Switch to compact dense mode"
              >
                <Minimize2 className="h-3 w-3" />
              </button>

              <button
                onClick={handleDismiss}
                className="p-1 text-zinc-400 hover:text-red-300 hover:bg-red-500/20 rounded transition"
                title="Dismiss (or click anywhere on toast)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative flex items-center gap-3 pt-2">
            {/* Icon & Badge */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-yellow-400/40 bg-black/70 text-2xl shadow-inner">
              <span>{achievement.icon}</span>
              <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] text-black font-extrabold shadow-sm">
                ★
              </div>
            </div>

            {/* Text Details */}
            <div className="relative min-w-0 flex-1">
              <h4 className="font-['Bebas_Neue'] text-base tracking-wider text-white drop-shadow-sm flex items-center gap-1.5 leading-tight">
                <span className="truncate">{achievement.name}</span>
                <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse shrink-0" />
              </h4>

              <p className="text-[11px] leading-tight text-zinc-300 line-clamp-2 mt-0.5">
                {achievement.description}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono">
                <span className="font-semibold text-amber-300 truncate max-w-[120px]">
                  {achievement.awardedToFighter}
                </span>
                <span>•</span>
                <span className="uppercase text-[9px] text-zinc-400 tracking-wider">
                  {achievement.awardedToSide === 'team1' ? 'P1' : 'P2'}
                </span>
              </div>
            </div>
          </div>

          {/* Dismiss countdown progress bar */}
          <div className="relative mt-2 h-1 w-full bg-black/40 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${rarityAccent}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
