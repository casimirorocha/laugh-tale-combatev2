import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Film,
  Zap,
  Flame,
  Shield,
  Sparkles,
  Clock,
  Swords,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import { MatchResult, ActionLog, Fighter } from '../types/fighter';
import { CHARACTERS } from '../data/characters';
import { soundManager } from '../utils/soundEffects';

interface MatchReplayModalProps {
  result: MatchResult;
  isOpen: boolean;
  onClose: () => void;
}

export const MatchReplayModal: React.FC<MatchReplayModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const logs = result.combatLogs || [];
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 0.5x
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number | 'all'>('all');

  // Filtered logs based on round filter
  const filteredLogs = selectedRoundFilter === 'all'
    ? logs
    : logs.filter((l) => l.roundNumber === selectedRoundFilter);

  const activeLog = filteredLogs[currentIndex] || filteredLogs[0] || logs[0];

  // Playback timer effect
  useEffect(() => {
    if (!isOpen || !isPlaying || filteredLogs.length === 0) return;

    const intervalTime = Math.max(300, 1200 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 < filteredLogs.length) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, playbackSpeed, filteredLogs.length]);

  if (!isOpen) return null;

  const handlePlayToggle = () => {
    soundManager.playUiClick();
    if (currentIndex >= filteredLogs.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    soundManager.playUiClick();
    if (currentIndex + 1 < filteredLogs.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    soundManager.playUiClick();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    soundManager.playUiClick();
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  // Find fighter images
  const allFighters = [...CHARACTERS];
  const findFighterAvatar = (name?: string) => {
    if (!name) return '';
    const found = allFighters.find(
      (f) =>
        f.name.toLowerCase() === name.toLowerCase() ||
        f.shortName?.toLowerCase() === name.toLowerCase() ||
        f.id.toLowerCase() === name.toLowerCase()
    );
    return found?.avatarUrl || found?.avatarIcon || '';
  };

  const actorAvatar = findFighterAvatar(activeLog?.actorName || activeLog?.actorShortName);
  const targetAvatar = findFighterAvatar(activeLog?.targetName || activeLog?.targetShortName);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl rounded-3xl border border-amber-500/50 bg-zinc-950 p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Film className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Press_Start_2P'] text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    MATCH REPLAY ENGINE v2.0
                  </span>
                  <span className="font-mono text-xs text-zinc-400">
                    {result.team1.name} vs {result.team2.name}
                  </span>
                </div>
                <h2 className="font-['Cinzel'] text-xl font-bold text-white tracking-wide mt-0.5">
                  COMBAT ACTION REPLAY PLAYER
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:border-amber-500/50 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Round Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 shrink-0">
            <span className="font-mono text-xs text-zinc-400 mr-2">FILTER ROUND:</span>
            <button
              onClick={() => {
                setSelectedRoundFilter('all');
                setCurrentIndex(0);
                setIsPlaying(false);
              }}
              className={`rounded-lg px-3 py-1 font-mono text-xs transition ${
                selectedRoundFilter === 'all'
                  ? 'bg-amber-500 text-black font-bold shadow'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              All Actions ({logs.length})
            </button>
            {Array.from({ length: result.totalRounds || 1 }).map((_, idx) => {
              const rNum = idx + 1;
              const rCount = logs.filter((l) => l.roundNumber === rNum).length;
              return (
                <button
                  key={rNum}
                  onClick={() => {
                    setSelectedRoundFilter(rNum);
                    setCurrentIndex(0);
                    setIsPlaying(false);
                  }}
                  className={`rounded-lg px-3 py-1 font-mono text-xs transition whitespace-nowrap ${
                    selectedRoundFilter === rNum
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Round {rNum} ({rCount})
                </button>
              );
            })}
          </div>

          {/* Main Visual Arena Stage Screen */}
          <div className="relative flex-1 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 flex flex-col justify-between overflow-hidden min-h-[320px] shadow-2xl">
            {/* Background Stage Grid & Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Top Stage Bar: Round & Action Progress */}
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500 px-2 py-0.5 font-mono text-[10px] font-black text-black">
                  ROUND {activeLog?.roundNumber || 1}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  Step {currentIndex + 1} of {filteredLogs.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {activeLog?.isHakiClash && (
                  <span className="rounded bg-purple-950 border border-purple-500 px-2.5 py-0.5 font-mono text-[10px] text-purple-300 font-bold animate-pulse">
                    ⚡ HAKI CLASH
                  </span>
                )}
                {activeLog?.isCrit && (
                  <span className="rounded bg-red-950 border border-red-500 px-2.5 py-0.5 font-mono text-[10px] text-red-300 font-bold">
                    💥 CRITICAL HIT
                  </span>
                )}
                {activeLog?.isGuardCrush && (
                  <span className="rounded bg-amber-950 border border-amber-500 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 font-bold">
                    🛡️ GUARD CRUSH
                  </span>
                )}
              </div>
            </div>

            {/* Central Action Stage: Actor vs Target */}
            <div className="relative z-10 my-auto grid grid-cols-1 md:grid-cols-7 items-center gap-4 py-4">
              {/* Actor (Attacker) */}
              <div className="md:col-span-3 flex flex-col items-center md:items-end text-center md:text-right gap-2">
                <div className="relative">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-2 border-amber-500/80 overflow-hidden bg-zinc-900 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                    {actorAvatar ? (
                      <img src={actorAvatar} alt={activeLog?.actorName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl font-bold bg-amber-500/20 text-amber-300">
                        ⚔️
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-2 rounded bg-amber-500 px-2 py-0.5 font-mono text-[9px] font-black text-black shadow">
                    ATTACKER
                  </span>
                </div>
                <div>
                  <h3 className="font-['Cinzel'] text-base sm:text-lg font-bold text-white">
                    {activeLog?.actorName || 'Fighter 1'}
                  </h3>
                  <p className="font-mono text-xs text-amber-400 uppercase">
                    Side: {activeLog?.actorSide === 'team1' ? result.team1.name : result.team2.name}
                  </p>
                </div>
              </div>

              {/* Action Banner in Center */}
              <div className="md:col-span-1 flex flex-col items-center justify-center text-center my-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-black font-['Press_Start_2P'] text-sm shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
                  VS
                </div>
                <span className="font-mono text-[10px] text-zinc-400 mt-2 uppercase tracking-widest">
                  {activeLog?.moveType || 'strike'}
                </span>
              </div>

              {/* Target (Defender) */}
              <div className="md:col-span-3 flex flex-col items-center md:items-start text-center md:text-left gap-2">
                <div className="relative">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-2 border-red-500/80 overflow-hidden bg-zinc-900 shadow-[0_0_25px_rgba(239,68,68,0.3)]">
                    {targetAvatar ? (
                      <img src={targetAvatar} alt={activeLog?.targetName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-3xl font-bold bg-red-500/20 text-red-300">
                        🛡️
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-2 -left-2 rounded bg-red-600 px-2 py-0.5 font-mono text-[9px] font-black text-white shadow">
                    DEFENDER
                  </span>
                </div>
                <div>
                  <h3 className="font-['Cinzel'] text-base sm:text-lg font-bold text-white">
                    {activeLog?.targetName || 'Fighter 2'}
                  </h3>
                  <p className="font-mono text-xs text-red-400">
                    Damage Taken: <span className="font-bold text-white">-{activeLog?.damage || 0} HP</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Move & Commentary Banner */}
            <div className="relative z-10 rounded-xl border border-zinc-800 bg-zinc-950/90 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Cinzel'] text-sm font-bold text-amber-400">
                      {activeLog?.moveName || 'Direct Strike'}
                    </span>
                    {activeLog?.comboCount && activeLog.comboCount > 1 && (
                      <span className="rounded bg-amber-500 px-1.5 py-0.2 font-mono text-[9px] font-black text-black">
                        {activeLog.comboCount}-HIT COMBO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 font-mono mt-0.5">
                    {activeLog?.commentaryText || `${activeLog?.actorName} executed a powerful tactical maneuver against ${activeLog?.targetName}.`}
                  </p>
                </div>
              </div>
              <div className="shrink-0 font-['Press_Start_2P'] text-[10px] text-red-400 bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-lg">
                -{activeLog?.damage || 0} HP
              </div>
            </div>
          </div>

          {/* Timeline Scrubbing Bar & Controls */}
          <div className="mt-4 flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-zinc-400 w-12 text-right">
                {currentIndex + 1}/{filteredLogs.length}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, filteredLogs.length - 1)}
                value={currentIndex}
                onChange={(e) => {
                  setCurrentIndex(parseInt(e.target.value, 10));
                  setIsPlaying(false);
                }}
                className="flex-1 accent-amber-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[10px] text-zinc-400 w-12">
                {Math.round(((currentIndex + 1) / Math.max(1, filteredLogs.length)) * 100)}%
              </span>
            </div>

            {/* Playback Control Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  title="Restart from Beginning"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-300 hover:text-white hover:border-amber-500/50 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={handleStepBack}
                  title="Previous Action"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-300 hover:text-white hover:border-amber-500/50 transition"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlayToggle}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 font-bold text-black transition shadow-lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-black" />
                      <span className="font-['Cinzel'] text-xs">PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-black" />
                      <span className="font-['Cinzel'] text-xs">PLAY REPLAY</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleStepForward}
                  title="Next Action"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-zinc-300 hover:text-white hover:border-amber-500/50 transition"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-400 flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5 text-amber-500" /> SPEED:
                </span>
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-lg px-2.5 py-1 font-mono text-xs transition ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
