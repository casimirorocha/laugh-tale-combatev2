import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Zap,
  Flame,
  Shield,
  Sparkles,
  Film,
  Clock,
  Award,
  Volume2,
  VolumeX,
  Swords,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import { MatchResult, ActionLog, Fighter } from '../types/fighter';
import { soundManager } from '../utils/soundEffects';
import { vibrationService } from '../utils/vibrationService';
import { CHARACTERS } from '../data/characters';

export interface HighlightMoment {
  id: string;
  momentNumber: number; // 1, 2, or 3
  type: 'HAKI_CLASH' | 'ULTIMATE_MOVE' | 'SUPER_SPECIAL' | 'CRITICAL_FINISHER';
  title: string;
  timestampLabel: string; // e.g. "ROUND 2 • 00:42"
  roundNumber: number;
  actorName: string;
  targetName: string;
  moveName: string;
  damage: number;
  comboCount: number;
  isCrit: boolean;
  hakiType?: string;
  commentary: string;
  actorAvatar?: string;
  targetAvatar?: string;
  themeColor: string;
}

interface MatchHighlightsModalProps {
  result: MatchResult;
  isOpen: boolean;
  onClose: () => void;
}

export function parseTopHighlightMoments(result: MatchResult): HighlightMoment[] {
  const logs = result.combatLogs || [];

  // Helper to score logs by combat impact
  const getImpactScore = (log: ActionLog): number => {
    let score = log.damage || 0;
    if (log.isHakiClash) score += 220;
    if (log.moveType === 'finisher' || log.moveName?.toLowerCase().includes('finisher')) score += 200;
    if (log.moveType === 'super' || log.moveName?.toLowerCase().includes('super')) score += 150;
    if (log.moveType === 'ex') score += 100;
    if (log.isCrit) score += 60;
    if (log.comboCount && log.comboCount > 1) score += log.comboCount * 25;
    if (log.hakiType?.toLowerCase() === 'conqueror') score += 120;
    return score;
  };

  // Filter impactful candidates
  let candidates = logs.filter((log) => {
    const isHaki =
      log.isHakiClash ||
      log.hakiType ||
      log.moveName?.toLowerCase().includes('haki') ||
      log.moveName?.toLowerCase().includes('ryuo') ||
      log.moveName?.toLowerCase().includes('conqueror') ||
      log.moveName?.toLowerCase().includes('haoshoku');

    const isSuper =
      log.moveType === 'super' ||
      log.moveType === 'finisher' ||
      log.moveType === 'ex' ||
      log.moveName?.toLowerCase().includes('super') ||
      log.moveName?.toLowerCase().includes('finisher') ||
      log.moveName?.toLowerCase().includes('gear') ||
      log.moveName?.toLowerCase().includes('bajrang') ||
      log.moveName?.toLowerCase().includes('climax') ||
      log.damage >= 90;

    return isHaki || isSuper || log.isGuardCrush || log.isCrit;
  });

  // Fallback to top damage/combo logs if candidates < 3
  if (candidates.length < 3) {
    const sortedAll = [...logs].sort((a, b) => (b.damage || 0) - (a.damage || 0));
    for (const log of sortedAll) {
      if (!candidates.find((c) => c.id === log.id)) {
        candidates.push(log);
      }
      if (candidates.length >= 6) break;
    }
  }

  // Sort candidates by impact score descending
  candidates.sort((a, b) => getImpactScore(b) - getImpactScore(a));

  const top3Logs = candidates.slice(0, 3);
  const moments: HighlightMoment[] = [];

  const mvp = result.mvpFighter || result.winnerName || 'Luffy';
  const winnerTeam = result.team1.isWinner ? result.team1 : result.team2;
  const loserTeam = result.team1.isWinner ? result.team2 : result.team1;
  const opponent = (loserTeam?.fighters && loserTeam.fighters[0]) || 'Kaido';

  for (let i = 0; i < 3; i++) {
    const log = top3Logs[i];
    if (log) {
      const isHaki = log.isHakiClash || log.hakiType || log.moveName?.toLowerCase().includes('haki');
      const isFinisher =
        log.moveType === 'finisher' ||
        log.moveName?.toLowerCase().includes('finisher') ||
        log.moveName?.toLowerCase().includes('bajrang') ||
        log.moveName?.toLowerCase().includes('climax');

      let type: HighlightMoment['type'] = 'SUPER_SPECIAL';
      let title = 'SUPREME SPECIAL IMPACT';
      let themeColor = '#f59e0b'; // Amber

      if (isHaki) {
        type = 'HAKI_CLASH';
        const isConqueror = log.hakiType?.toLowerCase() === 'conqueror' || log.moveName?.toLowerCase().includes('conqueror');
        title = isConqueror ? 'HAOSHOKU HAKI CLASH' : 'RYUO ARMAMENT IMPACT';
        themeColor = isConqueror ? '#a855f7' : '#ef4444'; // Purple or Red
      } else if (isFinisher) {
        type = 'ULTIMATE_MOVE';
        title = 'ULTIMATE FINISHER';
        themeColor = '#eab308'; // Gold
      } else if (log.isCrit) {
        type = 'CRITICAL_FINISHER';
        title = 'DECISIVE CRITICAL BREAKTHROUGH';
        themeColor = '#3b82f6'; // Blue
      }

      // Calculate realistic timestamp label
      const elapsedSec = Math.floor(14 + i * 26 + ((log.damage || 50) % 18));
      const mins = Math.floor(elapsedSec / 60)
        .toString()
        .padStart(2, '0');
      const secs = (elapsedSec % 60).toString().padStart(2, '0');
      const roundNum = log.roundNumber || Math.min(result.totalRounds, i + 1);

      moments.push({
        id: log.id || `highlight-${i}`,
        momentNumber: i + 1,
        type,
        title,
        timestampLabel: `ROUND ${roundNum} • ${mins}:${secs}`,
        roundNumber: roundNum,
        actorName: log.actorName || mvp,
        targetName: log.targetName || opponent,
        moveName: log.moveName || 'Devastating Haki Strike',
        damage: log.damage || 190 + i * 35,
        comboCount: log.comboCount || i + 2,
        isCrit: log.isCrit || false,
        hakiType: log.hakiType || (isHaki ? (i % 2 === 0 ? 'Conqueror' : 'Armament') : undefined),
        commentary:
          log.commentaryText ||
          `${log.actorName || mvp} executed ${log.moveName || 'Ultimate Move'} tearing through defenses for ${
            log.damage || 220
          } damage!`,
        themeColor,
      });
    } else {
      // Fallback synthetic moment so player ALWAYS gets 3 full highlights
      const syntheticTemplates: {
        type: HighlightMoment['type'];
        title: string;
        move: string;
        color: string;
        haki?: 'conqueror' | 'armament';
      }[] = [
        {
          type: 'HAKI_CLASH',
          title: 'HAOSHOKU CONQUEROR CLASH',
          move: "Conqueror's Haki Sky Splitter",
          color: '#a855f7',
          haki: 'conqueror',
        },
        {
          type: 'ULTIMATE_MOVE',
          title: 'ULTIMATE FINISHER IMPACT',
          move: 'Bajrang Overdrive Climax',
          color: '#eab308',
        },
        {
          type: 'CRITICAL_FINISHER',
          title: 'PRECISION RYUO BREAKTHROUGH',
          move: 'Emissions Haki Counter',
          color: '#ef4444',
          haki: 'armament',
        },
      ];
      const tmpl = syntheticTemplates[i % syntheticTemplates.length];
      const mins = '00';
      const secs = (18 + i * 24).toString().padStart(2, '0');

      moments.push({
        id: `synth-highlight-${i}`,
        momentNumber: i + 1,
        type: tmpl.type,
        title: tmpl.title,
        timestampLabel: `ROUND ${Math.min(result.totalRounds, i + 1)} • ${mins}:${secs}`,
        roundNumber: Math.min(result.totalRounds, i + 1),
        actorName: i === 0 ? mvp : winnerTeam?.fighters?.[0] || mvp,
        targetName: opponent,
        moveName: tmpl.move,
        damage: 230 + i * 45,
        comboCount: 3 + i * 2,
        isCrit: true,
        hakiType: tmpl.haki,
        commentary: `${mvp} unleashed ${tmpl.move} in a dramatic turning point of the match!`,
        themeColor: tmpl.color,
      });
    }
  }

  return moments;
}

export const MatchHighlightsModal: React.FC<MatchHighlightsModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const [moments, setMoments] = useState<HighlightMoment[]>([]);
  const [activeMomentIndex, setActiveMomentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to find fighter avatar or icon
  const getFighterAvatar = (name: string): string => {
    const found = CHARACTERS.find(
      (f) =>
        f.name.toLowerCase() === name.toLowerCase() ||
        f.shortName?.toLowerCase() === name.toLowerCase() ||
        f.id.toLowerCase() === name.toLowerCase()
    );
    return found?.avatarIcon || '🏴‍☠️';
  };

  useEffect(() => {
    if (isOpen && result) {
      const top3 = parseTopHighlightMoments(result);
      setMoments(top3);
      setActiveMomentIndex(0);
      setIsPlaying(true);
      setPlaybackProgress(0);
      
      // Play opening highlight chime
      if (soundEnabled) {
        soundManager.playHakiThunder();
      }
    }
  }, [isOpen, result]);

  // Audio and vibration triggers when moment changes
  const playMomentAudio = (moment: HighlightMoment) => {
    if (moment.type === 'HAKI_CLASH') {
      vibrationService.vibrateHakiClash(moment.hakiType || 'conqueror', moment.damage);
      if (soundEnabled) soundManager.playHakiThunder();
    } else if (moment.type === 'ULTIMATE_MOVE') {
      vibrationService.vibrateUltimateMove('impact', moment.moveName);
      if (soundEnabled) soundManager.playUltimateFinisher();
    } else if (moment.isCrit) {
      vibrationService.vibrate('crit');
      if (soundEnabled) soundManager.playCriticalStrike();
    } else {
      vibrationService.vibrate('heavy');
      if (soundEnabled) soundManager.playHit('heavy');
    }
    if (soundEnabled) soundManager.playCrowdCheer(85);
  };

  // Playback timer ticker (4.5s per highlight moment)
  useEffect(() => {
    if (!isOpen || !isPlaying || moments.length === 0) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const DURATION_MS = 4500;
    const TICK_MS = 50;
    const step = (TICK_MS / DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev + step >= 100) {
          // Advance to next moment
          setActiveMomentIndex((curIdx) => {
            const nextIdx = (curIdx + 1) % moments.length;
            if (moments[nextIdx]) {
              playMomentAudio(moments[nextIdx]);
            }
            return nextIdx;
          });
          return 0;
        }
        return prev + step;
      });
    }, TICK_MS);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, isPlaying, moments, activeMomentIndex, soundEnabled]);

  const handleSelectMoment = (idx: number) => {
    setActiveMomentIndex(idx);
    setPlaybackProgress(0);
    if (moments[idx]) {
      playMomentAudio(moments[idx]);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    const prevIdx = (activeMomentIndex - 1 + moments.length) % moments.length;
    handleSelectMoment(prevIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeMomentIndex + 1) % moments.length;
    handleSelectMoment(nextIdx);
  };

  if (!isOpen) return null;

  const activeMoment = moments[activeMomentIndex] || moments[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          id="match-highlights-modal"
          className="relative w-full max-w-4xl bg-zinc-950 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col text-zinc-100 font-sans"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* TOP HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-purple-950/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black font-black shadow-lg">
                <Film className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Press_Start_2P'] text-[9px] text-amber-400 uppercase tracking-wider">
                    GRAND LINE REPLAY ENGINE
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-500/30">
                    TOP 3 MOMENTS
                  </span>
                </div>
                <h2 className="font-['Cinzel'] text-lg sm:text-xl font-black text-white tracking-wider">
                  MATCH HIGHLIGHTS REEL
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 transition"
                title={soundEnabled ? 'Mute Highlight Audio' : 'Unmute Highlight Audio'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
              </button>

              <button
                onClick={onClose}
                id="close-highlights-btn"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-red-950/80 border border-zinc-800 hover:border-red-500/50 text-zinc-400 hover:text-red-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* TOP PLAYBACK PROGRESS BAR */}
          <div className="w-full bg-zinc-900 h-1.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-purple-500 transition-all duration-75 ease-linear"
              style={{ width: `${playbackProgress}%` }}
            />
          </div>

          {/* MOMENT SELECTOR TIMELINE TABS (TOP 3 CLIPS) */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-900/60 border-b border-zinc-800">
            {moments.map((m, idx) => {
              const isActive = idx === activeMomentIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMoment(idx)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-500/20 via-zinc-900 to-purple-900/20 border-amber-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`font-['Press_Start_2P'] text-[8px] uppercase ${
                        isActive ? 'text-amber-400' : 'text-zinc-500'
                      }`}
                    >
                      MOMENT #{m.momentNumber}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-500/80" />
                      {m.timestampLabel}
                    </span>
                  </div>

                  <div className="font-bold text-xs truncate text-zinc-200">{m.moveName}</div>

                  <div className="flex items-center justify-between text-[10px] font-mono mt-1 pt-1 border-t border-zinc-800/60">
                    <span className="text-zinc-400 truncate">{m.actorName}</span>
                    <span className="font-bold text-red-400">+{m.damage} HP</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* CANVA / REPLAY PREVIEW STAGE */}
          {activeMoment && (
            <div className="relative p-6 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col gap-6 min-h-[320px] justify-between overflow-hidden">
              {/* Dynamic Haki Background Effects */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500"
                style={{
                  background: `radial-gradient(circle at center, ${activeMoment.themeColor} 0%, transparent 70%)`,
                }}
              />

              {/* STAGE HEADER BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider font-mono text-black shadow-md"
                    style={{ backgroundColor: activeMoment.themeColor }}
                  >
                    ⚡ {activeMoment.title}
                  </span>
                  <span className="font-mono text-xs text-zinc-400 flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>TIMESTAMP: {activeMoment.timestampLabel}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  {activeMoment.hakiType && (
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-bold">
                      {activeMoment.hakiType} HAKI
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                    {activeMoment.damage} DAMAGE
                  </span>
                </div>
              </div>

              {/* DYNAMIC COMBATANTS REPLAY COLLISION VISUALIZER */}
              <div className="relative py-8 flex items-center justify-center gap-4 sm:gap-12 z-10">
                {/* ATTACKER SIDE */}
                <motion.div
                  key={`actor-${activeMoment.id}-${activeMomentIndex}`}
                  className="flex flex-col items-center gap-2 text-center"
                  initial={{ x: -40, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                >
                  <div
                    className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-zinc-900 border-2 shadow-2xl"
                    style={{ borderColor: activeMoment.themeColor }}
                  >
                    <span className="text-4xl sm:text-5xl">{getFighterAvatar(activeMoment.actorName)}</span>
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      ATTACKER
                    </div>
                  </div>
                  <span className="font-['Cinzel'] font-bold text-sm sm:text-base text-white">
                    {activeMoment.actorName}
                  </span>
                </motion.div>

                {/* LIGHTNING VS SHOCKWAVE SEAM */}
                <div className="flex flex-col items-center gap-1 my-auto">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                  >
                    <Zap className="h-6 w-6 text-amber-400 fill-amber-400 animate-pulse" />
                  </motion.div>
                  <span className="font-['Press_Start_2P'] text-[8px] text-amber-400 tracking-wider uppercase mt-1">
                    VS
                  </span>
                </div>

                {/* TARGET SIDE */}
                <motion.div
                  key={`target-${activeMoment.id}-${activeMomentIndex}`}
                  className="flex flex-col items-center gap-2 text-center"
                  initial={{ x: 40, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                >
                  <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-zinc-900 border-2 border-red-500/50 shadow-2xl">
                    <span className="text-4xl sm:text-5xl">{getFighterAvatar(activeMoment.targetName)}</span>
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                      TARGET
                    </div>
                  </div>
                  <span className="font-['Cinzel'] font-bold text-sm sm:text-base text-zinc-300">
                    {activeMoment.targetName}
                  </span>
                </motion.div>
              </div>

              {/* MOVE ACTION & COMMENTARY RECAP CARD */}
              <div className="rounded-xl border border-amber-500/30 bg-zinc-950/80 p-4 z-10 flex flex-col gap-2 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="font-['Cinzel'] text-lg font-black text-amber-300 flex items-center gap-2">
                    <Swords className="h-4 w-4 text-amber-400" />
                    {activeMoment.moveName}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-amber-400">{activeMoment.comboCount} COMBO HITS</span>
                    {activeMoment.isCrit && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-black font-black text-[9px] uppercase">
                        CRITICAL!
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-['Montserrat'] italic text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                  "{activeMoment.commentary}"
                </p>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS FOOTER */}
          <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-zinc-900/90">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                <SkipBack className="h-4 w-4" />
                <span className="hidden sm:inline">PREV</span>
              </button>

              <button
                onClick={handleTogglePlay}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs transition active:scale-95 flex items-center gap-2 shadow-md"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 fill-black" />
                    <span>PAUSE REPLAY</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-black" />
                    <span>AUTO REPLAY</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              >
                <span className="hidden sm:inline">NEXT</span>
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition active:scale-95"
            >
              CLOSE REPLAY
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
