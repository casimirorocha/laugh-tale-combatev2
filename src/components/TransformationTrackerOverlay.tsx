import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Flame,
  Shield,
  Heart,
  Timer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Lock,
  Crown,
  Swords,
  Info,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { BattleFighterState, Transformation } from '../types/fighter';
import { getTransformationTelemetry, TransformationTelemetry } from '../utils/transformationEngine';
import { soundManager } from '../utils/soundEffects';

interface TransformationTrackerOverlayProps {
  fighterState: BattleFighterState;
  opponentState: BattleFighterState | null;
  currentTurnCount: number;
  currentRound: number;
  onInitiateShift?: (transformation: Transformation) => void;
  onRevertForm?: () => void;
  onOpenGuide?: () => void;
  isBusy?: boolean;
  className?: string;
}

export const TransformationTrackerOverlay: React.FC<TransformationTrackerOverlayProps> = ({
  fighterState,
  opponentState,
  currentTurnCount,
  currentRound,
  onInitiateShift,
  onRevertForm,
  onOpenGuide,
  isBusy = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const telemetry: TransformationTelemetry = getTransformationTelemetry(
    fighterState,
    opponentState,
    currentTurnCount
  );

  // If fighter has no multi-tier transformations, return null or a subtle indicator
  if (!telemetry.hasTransformations) {
    return null;
  }

  const handleShiftClick = () => {
    if (!telemetry.nextTransformation || !telemetry.canShiftNow || isBusy) return;
    try {
      soundManager.playPowerUp();
    } catch {
      // Audio fallback
    }
    onInitiateShift?.(telemetry.nextTransformation);
  };

  const currentTheme = fighterState.fighter.themeColor || '#eab308';
  const nextTheme = telemetry.nextTransformation?.visuals?.themeColor || '#38bdf8';

  return (
    <div className={`relative z-20 select-none ${className}`}>
      {/* 1. COMPACT OVERLAY DOCK (Always visible during combat) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/90 border border-amber-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {/* Left: Active Form & Duration Badge */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg border shadow-inner relative overflow-hidden"
            style={{
              borderColor: currentTheme,
              backgroundColor: `${currentTheme}15`,
            }}
          >
            <Flame
              className="h-4 w-4 animate-pulse"
              style={{ color: currentTheme }}
            />
            {telemetry.isApexForm && (
              <Crown className="absolute -top-1 -right-1 h-3 w-3 text-amber-300" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-['Cinzel'] text-xs sm:text-sm font-black text-white tracking-wide truncate max-w-[130px] sm:max-w-[200px]">
                {telemetry.currentFormName}
              </span>
              <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {telemetry.currentFormTier === 0 ? 'BASE' : `TIER ${telemetry.currentFormTier}/${telemetry.totalTiers}`}
              </span>
            </div>

            {/* Current Form Duration Counter */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-0.5 text-zinc-300">
                <Timer className="h-3 w-3 text-amber-400" />
                <span className="text-zinc-500">Duration:</span>{' '}
                <strong className="text-amber-300 font-bold">
                  {telemetry.currentFormDurationTurns}{' '}
                  {telemetry.currentFormDurationTurns === 1 ? 'Action' : 'Actions'}
                </strong>
              </span>

              {telemetry.lastTransformationTurn !== undefined && (
                <span className="hidden md:inline text-zinc-500 text-[9px]">
                  (Shifted at Action #{telemetry.lastTransformationTurn})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Cooldown Stabilization Meter */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800">
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-[9px] font-mono gap-2">
              <span className="text-zinc-400 font-bold flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-amber-400" />
                COOLDOWN:
              </span>
              <span
                className={`font-black ${
                  telemetry.isCooldownReady ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {telemetry.isCooldownReady
                  ? 'READY'
                  : `${telemetry.cooldownRemainingTurns} LEFT`}
              </span>
            </div>

            {/* Segmented Cooldown Gauge (3 actions max) */}
            <div className="flex items-center gap-1 w-20 sm:w-24 h-1.5 mt-0.5">
              {[0, 1, 2].map((idx) => {
                const filled =
                  telemetry.isCooldownReady ||
                  idx <
                    telemetry.cooldownTurnsRequired -
                      telemetry.cooldownRemainingTurns;
                return (
                  <div
                    key={`cd_seg_${idx}`}
                    className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                      filled
                        ? 'bg-gradient-to-r from-amber-400 to-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                        : 'bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Quick Action & Expand Toggle */}
        <div className="flex items-center gap-1.5">
          {telemetry.nextTransformation && (
            <button
              onClick={handleShiftClick}
              disabled={!telemetry.canShiftNow || isBusy}
              title={
                telemetry.canShiftNow
                  ? `Initiate Form Shift: ${telemetry.nextTransformation.name}`
                  : telemetry.verdictMessage
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition-all flex items-center gap-1 shadow-md active:scale-95 ${
                telemetry.canShiftNow && !isBusy
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-black border-2 border-white animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.6)] cursor-pointer hover:brightness-110'
                  : 'bg-zinc-900/90 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Sparkles
                className={`h-3 w-3 ${
                  telemetry.canShiftNow ? 'text-black' : 'text-zinc-600'
                }`}
              />
              <span className="hidden sm:inline">SHIFT:</span>
              <span className="truncate max-w-[90px] sm:max-w-[120px]">
                {telemetry.nextTransformation.name.replace(/.*:\s*/, '')}
              </span>
              {telemetry.canShiftNow && (
                <span className="px-1 py-0.2 rounded bg-black text-amber-300 text-[8px] font-black uppercase">
                  READY
                </span>
              )}
            </button>
          )}

          {telemetry.isApexForm && (
            <div className="px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-black flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-400" />
              <span>APEX FORM</span>
            </div>
          )}

          {telemetry.currentFormTier > 0 && onRevertForm && (
            <button
              onClick={() => {
                if (isBusy) return;
                onRevertForm();
              }}
              disabled={isBusy}
              title="Revert to Base Form (Exit Transformed State)"
              className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3 text-zinc-400" />
              <span className="hidden sm:inline">REVERT</span>
            </button>
          )}

          {/* Expand/Collapse telemetry view */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-amber-400/60 transition"
            title={isExpanded ? 'Collapse Telemetry' : 'Expand Detailed Telemetry'}
          >
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. EXPANDED TACTICAL TELEMETRY MATRIX (Rich interactive overlay) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mt-2 rounded-2xl border border-amber-500/50 bg-zinc-950/95 p-3 sm:p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            {/* Overlay Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-['Cinzel'] text-sm sm:text-base font-bold text-amber-300 flex items-center gap-1.5">
                    Transformation Telemetry & Cooldown
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Real-time cooldown monitoring, form duration & shift criteria matrix
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenGuide && (
                  <button
                    type="button"
                    onClick={onOpenGuide}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold transition shadow-sm cursor-pointer"
                    title="Abrir Guia Oficial: Como funcionam as transformações"
                  >
                    <BookOpen className="h-3 w-3 text-amber-400" />
                    <span>COMO FUNCIONA: GUIA</span>
                  </button>
                )}
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                  Round {currentRound} • Action #{currentTurnCount}
                </span>
              </div>
            </div>

            {/* Grid: Current Form Status vs Next Shift Readiness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Box A: Active Form & Duration Profile */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 sm:p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-zinc-400 uppercase font-bold flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-400" /> Active Form Profile
                    </span>
                    <span className="text-amber-400 font-black">
                      {telemetry.currentFormTier === 0 ? 'Base Form' : `Tier ${telemetry.currentFormTier}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-10 h-10 rounded-xl border-2 overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/50"
                      style={{ borderColor: currentTheme }}
                    >
                      <img
                        src={fighterState.fighter.avatarUrl}
                        alt={telemetry.currentFormName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h5 className="font-['Cinzel'] font-bold text-sm sm:text-base text-white">
                        {telemetry.currentFormName}
                      </h5>
                      <p className="font-mono text-[10px] text-zinc-400">
                        {fighterState.fighter.epithet || 'Warrior of the Seas'}
                      </p>
                    </div>
                  </div>

                  {/* Form Duration & Telemetry Metrics */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                    <div className="rounded-lg bg-zinc-950/80 p-1.5 border border-zinc-800/80">
                      <span className="text-zinc-500 block">Form Duration</span>
                      <strong className="text-amber-300 text-xs font-bold">
                        {telemetry.currentFormDurationTurns} Actions
                      </strong>
                    </div>

                    <div className="rounded-lg bg-zinc-950/80 p-1.5 border border-zinc-800/80">
                      <span className="text-zinc-500 block">Cooldown State</span>
                      <strong
                        className={`text-xs font-bold ${
                          telemetry.isCooldownReady ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {telemetry.isCooldownReady ? 'Stabilized (3/3)' : `${telemetry.cooldownRemainingTurns} Actions Left`}
                      </strong>
                    </div>
                  </div>

                  {/* Active Stat Modifiers */}
                  {telemetry.currentFormModifiers && (
                    <div className="mt-2 flex flex-wrap gap-1 text-[9px] font-mono">
                      {telemetry.currentFormModifiers.attackMultiplier > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30">
                          ⚔️ ATK +{Math.round((telemetry.currentFormModifiers.attackMultiplier - 1) * 100)}%
                        </span>
                      )}
                      {telemetry.currentFormModifiers.defenseMultiplier > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                          🛡️ DEF +{Math.round((telemetry.currentFormModifiers.defenseMultiplier - 1) * 100)}%
                        </span>
                      )}
                      {telemetry.currentFormModifiers.speedMultiplier > 1 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30">
                          ⚡ SPD +{Math.round((telemetry.currentFormModifiers.speedMultiplier - 1) * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Box B: Next Shift Opportunity & Live Criteria Checklist */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 sm:p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                    <span className="text-zinc-400 uppercase font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-cyan-400" /> Next Form Target
                    </span>
                    <span
                      className={`font-black ${
                        telemetry.canShiftNow ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {telemetry.canShiftNow ? 'AVAILABLE' : 'LOCKED'}
                    </span>
                  </div>

                  {telemetry.nextTransformation ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5
                            className="font-['Cinzel'] font-bold text-sm sm:text-base"
                            style={{ color: nextTheme }}
                          >
                            {telemetry.nextTransformation.name}
                          </h5>
                          <p className="text-[10px] text-zinc-400 line-clamp-1">
                            {telemetry.nextTransformation.description || 'Superior battle form'}
                          </p>
                        </div>
                      </div>

                      {/* Criteria Checklist */}
                      <div className="space-y-1.5 mb-2">
                        {telemetry.shiftConditions.map((cond, i) => (
                          <div
                            key={`cond_${i}`}
                            className={`flex items-center justify-between text-[10px] font-mono p-1.5 rounded-lg border ${
                              cond.isMet
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                                : 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {cond.isMet ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                              )}
                              <span>{cond.label}</span>
                            </div>
                            <span className="font-bold">
                              {cond.currentValue} / {cond.requiredValue}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <Crown className="h-8 w-8 text-amber-400 mx-auto mb-1 animate-bounce" />
                      <h5 className="font-['Cinzel'] font-bold text-sm text-amber-300">
                        Pinnacle Form Engaged
                      </h5>
                      <p className="font-mono text-[10px] text-zinc-400">
                        This character has reached their maximum transformation tier!
                      </p>
                    </div>
                  )}
                </div>

                {/* Tactical Verdict Notice */}
                <div
                  className={`p-2 rounded-lg text-[10px] font-mono border flex items-start gap-1.5 ${
                    telemetry.canShiftNow
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                      : 'bg-zinc-950 border-amber-500/30 text-amber-300/90'
                  }`}
                >
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{telemetry.verdictMessage}</span>
                </div>
              </div>
            </div>

            {/* 3. Progression Hierarchy Pipeline */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2 sm:p-2.5 mb-3">
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1.5">
                <span className="font-bold uppercase tracking-wider">
                  Linear Form Shift Progression (Anti-Loop Guarantee)
                </span>
                <span>Minimum Cooldown: 3 Actions</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
                {telemetry.allForms.map((form, idx) => {
                  const isCurrent = form.isCurrent;
                  const isPast = form.isPast;
                  const isNext = form.isNext;

                  return (
                    <React.Fragment key={`prog_${form.id}_${idx}`}>
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-mono flex-shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400'
                            : isPast
                            ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500 opacity-60'
                            : isNext && telemetry.canShiftNow
                            ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 animate-pulse'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="font-bold">
                          {idx === 0 ? 'BASE' : `T${idx}`}
                        </span>
                        <span className="truncate max-w-[90px] sm:max-w-[130px] font-['Cinzel'] font-bold">
                          {form.name}
                        </span>
                        {isCurrent && (
                          <span className="px-1 py-0.2 rounded bg-amber-400 text-black text-[8px] font-black">
                            ACTIVE
                          </span>
                        )}
                        {isNext && (
                          <span
                            className={`px-1 py-0.2 rounded text-[8px] font-black ${
                              telemetry.canShiftNow
                                ? 'bg-cyan-400 text-black'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            NEXT
                          </span>
                        )}
                      </div>

                      {idx < telemetry.allForms.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-zinc-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* 4. Action Bar (Initiate Form Shift Button in Expanded View) */}
            {telemetry.nextTransformation && (
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-xs font-mono hover:text-white transition"
                >
                  Close Telemetry
                </button>

                <button
                  type="button"
                  onClick={handleShiftClick}
                  disabled={!telemetry.canShiftNow || isBusy}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-black transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                    telemetry.canShiftNow && !isBusy
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 text-black border-2 border-white animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.6)] cursor-pointer hover:brightness-110'
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                  }`}
                >
                  {telemetry.canShiftNow ? (
                    <Zap className="h-4 w-4 text-black animate-bounce" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-zinc-600" />
                  )}
                  <span>
                    INITIATE FORM SHIFT: {telemetry.nextTransformation.name}
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
