import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Zap, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  Award,
  Shield,
  Play,
  Volume2
} from 'lucide-react';
import { Fighter, Move } from '../types/fighter';
import { ComboChallenge, ComboChallengeStep, ChallengeDifficulty, ChallengeStats } from '../types/comboChallenge';
import { generateFighterComboChallenge } from '../utils/comboChallengeGenerator';
import { soundManager } from '../utils/soundEffects';

interface ComboChallengeModeProps {
  playerFighter: Fighter;
  lastExecutedMove: Move | null;
  onExecuteMove: (move: Move) => void;
  onClose: () => void;
}

export const ComboChallengeMode: React.FC<ComboChallengeModeProps> = ({
  playerFighter,
  lastExecutedMove,
  onExecuteMove,
  onClose,
}) => {
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>('silver');
  const [currentChallenge, setCurrentChallenge] = useState<ComboChallenge>(() => 
    generateFighterComboChallenge(playerFighter, 'silver')
  );
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(() => currentChallenge.timeLimitSec);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [challengeStatus, setChallengeStatus] = useState<'idle' | 'active' | 'success' | 'failed'>('idle');
  
  const [stats, setStats] = useState<ChallengeStats>({
    score: 0,
    streak: 0,
    highestStreak: 0,
    completedCount: 0,
    totalAttempts: 0,
    rank: 'Bronze'
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveProcessedRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Calculate Rank based on score & streak
  const calculateRank = (score: number, streak: number): ChallengeStats['rank'] => {
    if (score >= 5000 || streak >= 10) return 'Pirate King';
    if (score >= 3000 || streak >= 7) return 'Yonko';
    if (score >= 1800 || streak >= 5) return 'Warlord';
    if (score >= 1000 || streak >= 3) return 'Gold';
    if (score >= 400 || streak >= 2) return 'Silver';
    return 'Bronze';
  };

  // Start new challenge
  const handleStartChallenge = (newDiff?: ChallengeDifficulty) => {
    const diffToUse = newDiff || difficulty;
    const challenge = generateFighterComboChallenge(playerFighter, diffToUse);
    setCurrentChallenge(challenge);
    setCurrentStepIndex(0);
    setTimeRemaining(challenge.timeLimitSec);
    setChallengeStatus('active');
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    soundManager.playPowerUp();
  };

  // Reset current challenge
  const handleRetryChallenge = () => {
    setCurrentStepIndex(0);
    setTimeRemaining(currentChallenge.timeLimitSec);
    setChallengeStatus('active');
    setIsTimerRunning(true);
    startTimeRef.current = Date.now();
    soundManager.playUiConfirm();
  };

  // Process Move execution against target sequence
  useEffect(() => {
    if (!lastExecutedMove || challengeStatus !== 'active' || !isTimerRunning) return;

    // Avoid duplicate triggers for the same exact execution tick
    const moveKey = `${lastExecutedMove.id}_${Date.now()}`;
    lastMoveProcessedRef.current = moveKey;

    const expectedStep = currentChallenge.targetSteps[currentStepIndex];
    if (!expectedStep) return;

    // Check if executed move matches expected step
    const isMatch = 
      lastExecutedMove.id === expectedStep.moveId || 
      lastExecutedMove.name.toLowerCase() === expectedStep.name.toLowerCase() ||
      (expectedStep.moveType && lastExecutedMove.type === expectedStep.moveType);

    if (isMatch) {
      soundManager.playEquip();
      const nextStepIndex = currentStepIndex + 1;
      
      if (nextStepIndex >= (currentChallenge?.targetSteps?.length || 0)) {
        // COMPLETED CHALLENGE!
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setIsTimerRunning(false);
        setChallengeStatus('success');
        soundManager.playVictoryFanfare();

        const speedBonus = Math.round(timeRemaining * 50);
        const streakBonus = stats.streak * 100;
        const totalAwarded = currentChallenge.rewardPoints + speedBonus + streakBonus;

        setStats(prev => {
          const newStreak = prev.streak + 1;
          const newScore = prev.score + totalAwarded;
          return {
            ...prev,
            score: newScore,
            streak: newStreak,
            highestStreak: Math.max(prev.highestStreak, newStreak),
            completedCount: prev.completedCount + 1,
            totalAttempts: prev.totalAttempts + 1,
            rank: calculateRank(newScore, newStreak)
          };
        });
      } else {
        setCurrentStepIndex(nextStepIndex);
      }
    }
  }, [lastExecutedMove, currentStepIndex, challengeStatus, isTimerRunning, currentChallenge, timeRemaining]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning && challengeStatus === 'active') {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0.05) {
            // TIME EXPIRED
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            setChallengeStatus('failed');
            soundManager.playUiCancel();
            setStats(s => ({ ...s, streak: 0, totalAttempts: s.totalAttempts + 1 }));
            return 0;
          }
          // Sound warning under 1.5s
          if (prev <= 1.5 && prev > 1.4) {
            soundManager.playClashCountdown(1);
          }
          return Math.max(0, prev - 0.05);
        });
      }, 50);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [isTimerRunning, challengeStatus]);

  const progressPercent = Math.min(100, Math.max(0, (timeRemaining / currentChallenge.timeLimitSec) * 100));
  const isTimeCritical = timeRemaining <= 1.8 && isTimerRunning;

  return (
    <div className="relative w-full rounded-xl border border-amber-500/40 bg-zinc-950/95 backdrop-blur-md shadow-2xl p-4 sm:p-5 flex flex-col gap-3 font-sans">
      
      {/* Header bar: Mode title, Difficulty selector, and Score/Streak */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-md">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Bebas_Neue'] text-xl tracking-wider text-amber-300">
                COMBO CHALLENGE LAB
              </h3>
              <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-yellow-300 border border-yellow-500/30">
                {stats.rank.toUpperCase()} RANK
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Chain Devil Fruit arts & Haki strikes in exact sequence before time runs out!
            </p>
          </div>
        </div>

        {/* Difficulty buttons */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
          {(['bronze', 'silver', 'gold', 'yonko'] as ChallengeDifficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                handleStartChallenge(diff);
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${
                difficulty === diff
                  ? diff === 'bronze' ? 'bg-amber-800 text-amber-200' :
                    diff === 'silver' ? 'bg-slate-700 text-slate-100' :
                    diff === 'gold' ? 'bg-yellow-500 text-black font-extrabold' :
                    'bg-red-600 text-white animate-pulse'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            <span className="font-bold">{stats.score} PTS</span>
          </div>
          <div className="h-3 w-px bg-zinc-700" />
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="h-3.5 w-3.5" />
            <span className="font-bold">{stats.streak}x STREAK</span>
          </div>
        </div>
      </div>

      {/* Challenge Banner Title & Timer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 rounded-lg border border-zinc-800 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentChallenge.theme === 'devil_fruit' ? '🌀' : currentChallenge.theme === 'haki' ? '🛡️' : '👑'}</span>
            <h4 className="font-['Bebas_Neue'] text-lg tracking-wide text-white truncate">
              {currentChallenge.title}
            </h4>
            {currentChallenge.titleJP && (
              <span className="text-[11px] text-zinc-500 font-mono hidden md:inline">
                ({currentChallenge.titleJP})
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-300 mt-0.5">
            {currentChallenge.description}
          </p>
        </div>

        {/* Strict Countdown Display */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
              <Timer className={`h-4 w-4 ${isTimeCritical ? 'text-red-500 animate-spin' : 'text-amber-400'}`} />
              <span className={isTimeCritical ? 'text-red-400 animate-pulse text-base' : 'text-white'}>
                {timeRemaining.toFixed(2)}s
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 uppercase font-mono">
              TIME REMAINING
            </span>
          </div>

          <div className="w-24 sm:w-32 h-2.5 bg-black/60 rounded-full border border-zinc-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                progressPercent > 50 ? 'bg-emerald-500' :
                progressPercent > 25 ? 'bg-amber-400' :
                'bg-red-500 animate-pulse'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Target Steps Visual Chain */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-1">
        {currentChallenge.targetSteps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex && challengeStatus === 'active';
          const isPassed = idx < currentStepIndex || challengeStatus === 'success';
          const isFailedStep = idx === currentStepIndex && challengeStatus === 'failed';

          return (
            <motion.div
              key={step.id}
              initial={false}
              animate={{
                scale: isCurrent ? 1.03 : 1,
                borderColor: isPassed ? 'rgba(34, 197, 94, 0.8)' : isCurrent ? 'rgba(245, 158, 11, 0.9)' : 'rgba(39, 39, 42, 0.8)'
              }}
              className={`relative flex flex-col justify-between rounded-xl border-2 p-3 transition-all ${
                isPassed 
                  ? 'bg-emerald-950/40 border-emerald-500/70 shadow-md shadow-emerald-950/50' 
                  : isCurrent 
                  ? 'bg-amber-950/50 border-amber-400 shadow-lg shadow-amber-950/70 ring-2 ring-amber-400/30' 
                  : isFailedStep
                  ? 'bg-red-950/40 border-red-500/70'
                  : 'bg-zinc-900/60 border-zinc-800 opacity-70'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-1 font-mono uppercase text-zinc-400">
                  <span>STEP {idx + 1}</span>
                  {idx < (currentChallenge?.targetSteps?.length || 0) - 1 && (
                    <ChevronRight className="h-3 w-3 text-zinc-600 inline" />
                  )}
                </span>
                
                {isPassed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : isFailedStep ? (
                  <XCircle className="h-4 w-4 text-red-400 animate-bounce" />
                ) : isCurrent ? (
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                ) : null}
              </div>

              {/* Move info & click to trigger */}
              <div className="my-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{step.icon}</span>
                  <span className="font-['Bebas_Neue'] text-base text-white tracking-wide truncate">
                    {step.name}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                  {step.instruction}
                </p>
              </div>

              {/* Quick Execute button for accessibility / touch */}
              <button
                onClick={() => {
                  const moveObj = playerFighter.moves.find(m => m.id === step.moveId) || playerFighter.moves[0];
                  if (moveObj) {
                    onExecuteMove(moveObj);
                  }
                }}
                className={`w-full py-1 rounded text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 ${
                  isCurrent 
                    ? 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-sm'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                <Zap className="h-3 w-3" />
                <span>{isCurrent ? 'EXECUTE NOW' : 'EXECUTE'}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Status Overlay / Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          {challengeStatus === 'idle' && (
            <button
              onClick={() => handleStartChallenge()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs shadow-md transition"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>START COMBO TRIAL</span>
            </button>
          )}

          {challengeStatus === 'active' && (
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>TRIAL IN PROGRESS — PERFORM STEP {currentStepIndex + 1} OF {currentChallenge?.targetSteps?.length || 0}</span>
            </div>
          )}

          {challengeStatus === 'success' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-lg shadow-md animate-bounce">
                <Sparkles className="h-4 w-4" />
                <span>CHALLENGE CLEARED! +{currentChallenge.rewardPoints} PTS</span>
              </span>
              <button
                onClick={() => handleStartChallenge()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs transition shadow-md"
              >
                <span>NEXT TRIAL</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {challengeStatus === 'failed' && (
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-bold text-xs bg-red-950/80 border border-red-500/50 px-3 py-1.5 rounded-lg">
                TIME EXPIRED / COMBO BROKEN
              </span>
              <button
                onClick={handleRetryChallenge}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-md"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>RETRY TRIAL</span>
              </button>
              <button
                onClick={() => handleStartChallenge()}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                NEW COMBO
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartChallenge()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition"
            title="Generate a new randomized sequence"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">REROLL CHALLENGE</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs transition"
          >
            CLOSE LAB
          </button>
        </div>
      </div>

    </div>
  );
};
