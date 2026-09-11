import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Zap, 
  Sparkles, 
  Flame, 
  Shield, 
  CheckCircle2, 
  Activity, 
  Maximize2, 
  Minimize2,
  Info,
  Timer,
  Volume2,
  Award,
  Layers
} from 'lucide-react';
import { Fighter, Move } from '../types/fighter';
import { ComboGuideRoute, ComboGuideStep, TimingEvaluationResult, ComboDifficulty } from '../types/comboGuide';
import { getCharacterComboGuides } from '../data/characterComboGuides';
import { soundManager } from '../utils/soundEffects';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

interface ComboGuideOverlayProps {
  playerFighter: Fighter;
  lastExecutedMove: Move | null;
  onExecuteMove: (move: Move) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ComboGuideOverlay: React.FC<ComboGuideOverlayProps> = ({
  playerFighter,
  lastExecutedMove,
  onExecuteMove,
  isOpen,
  onClose,
}) => {
  const routes = getCharacterComboGuides(playerFighter);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [timingFeedback, setTimingFeedback] = useState<TimingEvaluationResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isRouteCompleted, setIsRouteCompleted] = useState<boolean>(false);

  // Timing bar rhythm loop
  const [timingBarProgress, setTimingBarProgress] = useState<number>(0);
  const timingBarAnimRef = useRef<number | null>(null);
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStepTimestampRef = useRef<number>(Date.now());

  const currentRoute: ComboGuideRoute = routes[selectedRouteIndex] || routes[0];
  const currentStep: ComboGuideStep | undefined = currentRoute?.steps[activeStepIndex];

  // Reset when route changes or fighter changes
  useEffect(() => {
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setIsRouteCompleted(false);
    setTimingFeedback(null);
    setIsDemoRunning(false);
    lastStepTimestampRef.current = Date.now();
  }, [selectedRouteIndex, playerFighter.id]);

  // Handle Live Move Execution Feedback against Active Route
  useEffect(() => {
    if (!lastExecutedMove || !currentStep || !isOpen) return;

    const isMatch = 
      lastExecutedMove.id === currentStep.moveId ||
      lastExecutedMove.name.toLowerCase() === currentStep.moveName.toLowerCase() ||
      (currentStep.moveName.includes('Gatling') && lastExecutedMove.name.includes('Gatling')) ||
      (currentStep.moveName.includes('Roc') && lastExecutedMove.name.includes('Roc')) ||
      (currentStep.moveName.includes('Rocket') && lastExecutedMove.name.includes('Rocket')) ||
      (currentStep.moveName.includes('Bajrang') && lastExecutedMove.name.includes('Bajrang'));

    if (isMatch) {
      const now = Date.now();
      const deltaSinceLast = now - lastStepTimestampRef.current;
      lastStepTimestampRef.current = now;

      // Evaluate timing window (simulated cancel sweet spot)
      const targetSweetSpot = currentStep.timing.cancelOffsetMs;
      const cancelRange = currentStep.timing.cancelWindowMs / 2;
      const errorDelta = Math.abs(deltaSinceLast - targetSweetSpot);

      let rating: TimingEvaluationResult['rating'] = 'PERFECT';
      let message = 'PERFECT RYUO HIT-CONFIRM!';
      let accuracyPercent = 100;

      if (errorDelta <= cancelRange * 0.4 || activeStepIndex === 0) {
        rating = 'PERFECT';
        message = 'PERFECT CANCEL (100% TIMING)';
        accuracyPercent = 100;
        soundManager.playEquip();
      } else if (errorDelta <= cancelRange) {
        rating = 'GREAT';
        message = 'GREAT CANCEL (85% TIMING)';
        accuracyPercent = 85;
        soundManager.playHit('medium');
      } else if (deltaSinceLast < targetSweetSpot) {
        rating = 'EARLY';
        message = 'EARLY INPUT (CHAIN BUFFERED)';
        accuracyPercent = 65;
        soundManager.playHit('light');
      } else {
        rating = 'LATE';
        message = 'LATE LINK (GAP IN PRESSURE)';
        accuracyPercent = 55;
        soundManager.playHit('light');
      }

      setTimingFeedback({
        rating,
        accuracyPercent,
        message,
        deltaMs: deltaSinceLast - targetSweetSpot
      });

      // Advance Step
      const nextIdx = activeStepIndex + 1;
      setCompletedSteps(prev => [...prev, activeStepIndex]);

      if (nextIdx >= (currentRoute?.steps?.length || 0)) {
        setIsRouteCompleted(true);
        soundManager.playVictoryFanfare();
      } else {
        setActiveStepIndex(nextIdx);
      }
    }
  }, [lastExecutedMove, currentStep, isOpen, currentRoute, activeStepIndex]);

  // Rhythm Bar Animation (Loops continuously for visual timing reference)
  useEffect(() => {
    let start = performance.now();
    const cycleDuration = currentStep ? currentStep.timing.activeWindowMs + currentStep.timing.cancelWindowMs : 800;

    const frame = (_dt: number, now: number) => {
      const elapsed = (now - start) % cycleDuration;
      setTimingBarProgress((elapsed / cycleDuration) * 100);
    };

    const unsubscribe = centralAnimationLoop.subscribe('combo_rhythm_bar', frame);
    return () => {
      unsubscribe();
    };
  }, [currentStep]);

  // Demo Sequence Simulation
  const handlePlayDemo = () => {
    if (isDemoRunning) {
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
      setIsDemoRunning(false);
      return;
    }

    setIsDemoRunning(true);
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setIsRouteCompleted(false);
    setTimingFeedback(null);

    let stepCounter = 0;
    const playNextDemoStep = () => {
      if (stepCounter >= (currentRoute?.steps?.length || 0)) {
        setIsDemoRunning(false);
        setIsRouteCompleted(true);
        soundManager.playVictoryFanfare();
        return;
      }

      const step = currentRoute.steps[stepCounter];
      setActiveStepIndex(stepCounter);
      setCompletedSteps(prev => [...prev, stepCounter]);

      // Sound simulation
      if (step.category === 'climax' || step.category === 'awakening') {
        soundManager.playHakiThunder();
      } else if (step.category === 'haki_cancel') {
        soundManager.playPowerUp();
      } else {
        soundManager.playHit('heavy');
      }

      // Execute on dummy to visually showcase impact
      const moveObj = playerFighter.moves.find(m => m.id === step.moveId) || playerFighter.moves[0];
      if (moveObj) {
        onExecuteMove(moveObj);
      }

      setTimingFeedback({
        rating: 'PERFECT',
        accuracyPercent: 100,
        message: `DEMO: ${step.timing.timingLabel.toUpperCase()}`,
        deltaMs: 0
      });

      stepCounter++;
      const nextDelay = step.timing.activeWindowMs + 150;
      demoTimeoutRef.current = setTimeout(playNextDemoStep, nextDelay);
    };

    playNextDemoStep();
  };

  const handleResetPractice = () => {
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setIsRouteCompleted(false);
    setTimingFeedback(null);
    lastStepTimestampRef.current = Date.now();
    soundManager.playUiConfirm();
  };

  if (!isOpen) return null;

  // ----------------------------------------------------
  // 1. MINIMIZED FLOATING HUD DOCK MODE
  // ----------------------------------------------------
  if (isMinimized) {
    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-4 left-4 z-40 max-w-md w-full bg-zinc-950/95 border-2 border-amber-500/60 rounded-xl shadow-2xl p-3 font-sans backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-['Bebas_Neue'] text-amber-300 text-base tracking-wider truncate">
              {currentRoute.title}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 uppercase">
              {currentRoute.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
              title="Expand Guide"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-400 transition"
              title="Close Guide"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Current Step Input Prompt */}
        {currentStep && !isRouteCompleted ? (
          <div className="flex items-center justify-between gap-3 bg-zinc-900/80 rounded-lg p-2 border border-zinc-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-amber-400">
                  STEP {activeStepIndex + 1}/{currentRoute?.steps?.length || 0}:
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[160px]">
                  {currentStep.moveName}
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                Input: <span className="font-bold text-yellow-300">{currentStep.inputNotation}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const m = playerFighter.moves.find(mv => mv.id === currentStep.moveId) || playerFighter.moves[0];
                if (m) onExecuteMove(m);
              }}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] transition shadow"
            >
              TRIGGER
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/50 rounded-lg p-2 text-emerald-300 text-xs font-bold">
            <span>★ COMBO SEQUENCE MASTERED!</span>
            <button 
              onClick={handleResetPractice}
              className="text-[10px] underline hover:text-emerald-200"
            >
              Restart
            </button>
          </div>
        )}

        {/* Live Feedback Toast */}
        {timingFeedback && (
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-amber-300">
            <span>{timingFeedback.message}</span>
            <span>{timingFeedback.accuracyPercent}%</span>
          </div>
        )}
      </motion.div>
    );
  }

  // ----------------------------------------------------
  // 2. FULL EXPANDED COMBO GUIDE DASHBOARD
  // ----------------------------------------------------
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="relative z-30 w-full max-w-6xl mx-auto rounded-2xl border border-amber-500/50 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 shadow-2xl p-4 sm:p-6 font-sans backdrop-blur-md mb-6"
    >
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white shadow-lg shadow-amber-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Bebas_Neue'] text-2xl tracking-wider text-amber-300">
                COMBO GUIDE & TIMING LAB
              </h3>
              <span className="rounded-full bg-red-950/80 border border-red-500/50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-red-300">
                {playerFighter.shortName || playerFighter.name}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Master Devil Fruit cancel windows, frame-links, and Advanced Haki infusions with real-time visual rhythm cues.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold transition"
            title="Dock to bottom corner to practice with full screen visibility"
          >
            <Minimize2 className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">PIN TO HUD</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Route Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
        {routes.map((route, idx) => {
          const isSelected = idx === selectedRouteIndex;
          const diffBadgeColor = 
            route.difficulty === 'Starter' ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' :
            route.difficulty === 'Intermediate' ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' :
            'bg-red-950/80 border-red-500/60 text-red-300 animate-pulse';

          return (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRouteIndex(idx);
                soundManager.playUiSelect();
              }}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-zinc-900/95 border-amber-400 shadow-lg shadow-amber-950/60 ring-2 ring-amber-400/20'
                  : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${diffBadgeColor}`}>
                  {route.difficulty}
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {route.totalDamageEstimate} DMG • {route.meterRequired} METER
                </span>
              </div>
              <h4 className="font-['Bebas_Neue'] text-lg text-white tracking-wide truncate mt-0.5">
                {route.title}
              </h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {route.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Route Info Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-zinc-900/90 rounded-xl border border-zinc-800 p-3.5 mb-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-['Bebas_Neue'] text-xl text-amber-300">
              {currentRoute.title}
            </span>
            {currentRoute.titleJP && (
              <span className="text-xs text-zinc-500 font-mono">
                ({currentRoute.titleJP})
              </span>
            )}
            <div className="flex items-center gap-1 ml-2">
              {currentRoute.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-300 mt-1">
            {currentRoute.description}
          </p>
        </div>

        {/* Demo & Reset Practice Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePlayDemo}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-extrabold text-xs transition shadow-md ${
              isDemoRunning
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/20'
            }`}
          >
            {isDemoRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-black" />}
            <span>{isDemoRunning ? 'STOP DEMO' : 'DEMO PREVIEW'}</span>
          </button>

          <button
            onClick={handleResetPractice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold transition"
            title="Reset active combo progress"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </div>

      {/* VISUAL TIMING RHYTHM BAR (Dynamic Sweet-Spot Indicator) */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              CANCEL TIMING WINDOW & HIT-CONFIRM METER
            </span>
          </div>
          {currentStep && (
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {currentStep.timing.timingLabel} ({currentStep.timing.difficultyRating})
            </span>
          )}
        </div>

        {/* Timeline Bar Track */}
        <div className="relative h-7 w-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center">
          {/* Startup section */}
          <div 
            className="h-full bg-zinc-800/80 border-r border-zinc-700 flex items-center justify-center text-[9px] font-mono text-zinc-400"
            style={{ width: '30%' }}
          >
            STARTUP ({currentStep?.timing.startupFrames || 8}f)
          </div>

          {/* Sweet Spot Golden Cancel Window */}
          <div 
            className="h-full bg-gradient-to-r from-amber-500/30 via-emerald-500/40 to-amber-500/30 border-x-2 border-emerald-400/80 flex items-center justify-center text-[10px] font-mono font-black text-emerald-300 shadow-inner"
            style={{ width: '40%' }}
          >
            ★ PERFECT CANCEL SWEET SPOT ({currentStep?.timing.cancelWindowMs || 300}ms)
          </div>

          {/* Recovery / Whiff */}
          <div 
            className="h-full bg-zinc-800/60 flex items-center justify-center text-[9px] font-mono text-zinc-500"
            style={{ width: '30%' }}
          >
            RECOVERY
          </div>

          {/* Moving Needle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,1)] transition-all pointer-events-none"
            style={{ left: `${timingBarProgress}%` }}
          />
        </div>

        {/* Live Evaluation Result Banner */}
        {timingFeedback && (
          <div className={`mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            timingFeedback.rating === 'PERFECT' 
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 shadow-md' 
              : timingFeedback.rating === 'GREAT'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60'
              : 'bg-red-950/80 text-red-300 border border-red-500/60'
          }`}>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{timingFeedback.message}</span>
            </span>
            <span>ACCURACY: {timingFeedback.accuracyPercent}%</span>
          </div>
        )}
      </div>

      {/* STEP-BY-STEP COMBO CHAIN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
        {currentRoute.steps.map((step, idx) => {
          const isCurrent = idx === activeStepIndex && !isRouteCompleted;
          const isPassed = completedSteps.includes(idx) || isRouteCompleted;

          const categoryBadgeColor = 
            step.category === 'starter' ? 'bg-blue-950/80 text-blue-300 border-blue-500/50' :
            step.category === 'fruit_link' ? 'bg-purple-950/80 text-purple-300 border-purple-500/50' :
            step.category === 'haki_cancel' ? 'bg-red-950/80 text-red-300 border-red-500/50' :
            step.category === 'awakening' ? 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50' :
            'bg-amber-950/80 text-amber-300 border-amber-500/50';

          return (
            <motion.div
              key={`${step.moveId}_${idx}`}
              animate={{
                scale: isCurrent ? 1.02 : 1,
                borderColor: isPassed ? 'rgba(34, 197, 94, 0.8)' : isCurrent ? 'rgba(245, 158, 11, 1)' : 'rgba(39, 39, 42, 0.8)'
              }}
              className={`relative flex flex-col justify-between rounded-xl border-2 p-4 transition-all ${
                isPassed 
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/50' 
                  : isCurrent 
                  ? 'bg-amber-950/50 border-amber-400 shadow-xl shadow-amber-950/70 ring-2 ring-amber-400/30' 
                  : 'bg-zinc-900/60 border-zinc-800 opacity-70'
              }`}
            >
              {/* Step Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      STEP {idx + 1}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${categoryBadgeColor}`}>
                      {step.category.replace('_', ' ')}
                    </span>
                  </div>
                  {isPassed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  ) : null}
                </div>

                {/* Move Title & Notation */}
                <h5 className="font-['Bebas_Neue'] text-xl text-white tracking-wide truncate">
                  {step.moveName}
                </h5>

                {/* Motion Notation Display */}
                <div className="flex items-center gap-1.5 my-2">
                  <div className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700 text-yellow-300 font-mono font-bold text-xs shadow-inner">
                    {step.inputNotation}
                  </div>
                </div>

                {/* Fruit / Haki Synergy Callout */}
                {step.fruitSynergy && (
                  <div className="text-[11px] text-purple-300 flex items-center gap-1 my-1">
                    <span>🌀</span>
                    <span className="truncate">{step.fruitSynergy}</span>
                  </div>
                )}
                {step.hakiTechnique && (
                  <div className="text-[11px] text-red-300 flex items-center gap-1 my-1">
                    <span>🛡️</span>
                    <span className="truncate">{step.hakiTechnique}</span>
                  </div>
                )}

                {/* Execution Tip */}
                <p className="text-[11px] text-zinc-400 leading-relaxed mt-2 line-clamp-2">
                  {step.executionTip}
                </p>
              </div>

              {/* Action Trigger Button */}
              <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400">
                  {step.damageEstimate} DMG • {step.meterCost > 0 ? `${step.meterCost} STOCK` : '0 METER'}
                </span>
                <button
                  onClick={() => {
                    const m = playerFighter.moves.find(mv => mv.id === step.moveId) || playerFighter.moves[0];
                    if (m) onExecuteMove(m);
                  }}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase transition flex items-center gap-1 ${
                    isCurrent 
                      ? 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  <span>{isCurrent ? 'PRACTICE' : 'TRIGGER'}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pro Tips Footer */}
      {(currentRoute?.proTips?.length || 0) > 0 && (
        <div className="mt-4 bg-zinc-950/80 rounded-xl border border-zinc-800 p-3 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-[11px] text-zinc-400">
            <span className="font-bold text-amber-300 uppercase mr-1">Grand Line Pro Tip:</span>
            {currentRoute.proTips?.join(' • ')}
          </div>
        </div>
      )}
    </motion.div>
  );
};
