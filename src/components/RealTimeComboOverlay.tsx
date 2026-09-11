import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getComboRank } from '../utils/combatEngine';
import { Zap, Flame, Sparkles, Crown, Swords, ShieldAlert } from 'lucide-react';

export interface ActiveComboState {
  activeSide: 'team1' | 'team2' | null;
  hits: number;
  accumulatedDamage: number;
  multiplier: number;
  lastHitTime: number;
  recentHitIncrement: number;
  isEnding?: boolean;
  actorName?: string;
  hakiMultiplier?: number;
  targetMaxHp?: number;
  damagePercentage?: number;
}

interface RealTimeComboOverlayProps {
  combo: ActiveComboState | null;
  team1Name: string;
  team2Name: string;
}

export const RealTimeComboOverlay: React.FC<RealTimeComboOverlayProps> = React.memo(({
  combo,
  team1Name,
  team2Name,
}) => {
  const [displayCombo, setDisplayCombo] = useState<ActiveComboState | null>(null);

  useEffect(() => {
    if (combo && combo.hits >= 2 && combo.activeSide && !combo.isEnding) {
      setDisplayCombo(combo);
    } else if (combo && combo.isEnding) {
      setDisplayCombo((prev) => (prev ? { ...prev, isEnding: true } : null));
      const timer = setTimeout(() => setDisplayCombo(null), 500);
      return () => clearTimeout(timer);
    } else if (!combo) {
      setDisplayCombo(null);
    }
  }, [combo]);

  if (!displayCombo || displayCombo.hits < 2 || !displayCombo.activeSide) {
    return null;
  }

  const isT1 = displayCombo.activeSide === 'team1';
  const hits = displayCombo.hits;
  const rank = getComboRank(hits);

  // Dynamic Color Shift & Aesthetic Tiering based on Combo Length
  let textColor = 'text-amber-400';
  let glowColor = 'rgba(251, 191, 36, 0.9)';
  let borderColor = 'border-amber-500/80';
  let badgeBg = 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
  let gradientBg = 'from-amber-500/20 via-zinc-950/90 to-transparent';
  let IconComponent = Zap;

  if (hits >= 20) {
    // Tier 5: GODLIKE / UNSTOPPABLE (Cyan Plasma)
    textColor = 'text-cyan-300';
    glowColor = 'rgba(34, 211, 238, 1)';
    borderColor = 'border-cyan-400';
    badgeBg = 'bg-cyan-950/95 border-cyan-400 text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.9)]';
    gradientBg = 'from-cyan-500/30 via-zinc-950/90 to-transparent';
    IconComponent = Crown;
  } else if (hits >= 12) {
    // Tier 4: SUPREME HAKI BURST (Royal Purple)
    textColor = 'text-purple-300';
    glowColor = 'rgba(168, 85, 247, 1)';
    borderColor = 'border-purple-400';
    badgeBg = 'bg-purple-950/95 border-purple-400 text-purple-200 shadow-[0_0_30px_rgba(168,85,247,0.85)]';
    gradientBg = 'from-purple-500/25 via-zinc-950/90 to-transparent';
    IconComponent = Sparkles;
  } else if (hits >= 8) {
    // Tier 3: VIOLENT CRIMSON (Blood Red)
    textColor = 'text-red-400';
    glowColor = 'rgba(239, 68, 68, 1)';
    borderColor = 'border-red-500';
    badgeBg = 'bg-red-950/95 border-red-500 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.8)]';
    gradientBg = 'from-red-500/25 via-zinc-950/90 to-transparent';
    IconComponent = Swords;
  } else if (hits >= 5) {
    // Tier 2: FIERY RUSH (Fiery Orange)
    textColor = 'text-orange-400';
    glowColor = 'rgba(249, 115, 22, 0.95)';
    borderColor = 'border-orange-500';
    badgeBg = 'bg-orange-950/95 border-orange-500 text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.7)]';
    gradientBg = 'from-orange-500/20 via-zinc-950/90 to-transparent';
    IconComponent = Flame;
  }

  const multiplierPercent = Math.round((displayCombo.multiplier - 1) * 100);
  const targetMaxHp = displayCombo.targetMaxHp || 1000;
  const hpDmgPct = Math.min(100, Math.round((displayCombo.accumulatedDamage / targetMaxHp) * 100));

  return (
    <div
      className={`absolute top-16 sm:top-20 z-40 pointer-events-none select-none transition-all duration-300 ${
        isT1 ? 'left-4 sm:left-10 items-start' : 'right-4 sm:right-10 items-end'
      } flex flex-col max-w-[280px] sm:max-w-[340px]`}
    >
      <AnimatePresence mode="wait">
        {!displayCombo.isEnding && (
          <motion.div
            key={`${displayCombo.activeSide}_${hits}`}
            initial={{ scale: 1.85, opacity: 0, y: -20, rotate: isT1 ? -6 : 6 }}
            animate={{ scale: [1.35, 1], opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 700, damping: 22 }}
            className={`flex flex-col ${isT1 ? 'items-start text-left' : 'items-end text-right'}`}
          >
            {/* HITS NUMBER ROW WITH SCALE-UP POP & SHADOW */}
            <div className={`flex items-baseline gap-2 ${isT1 ? 'flex-row' : 'flex-row-reverse'}`}>
              <motion.span
                animate={{
                  scale: [1, 1.15, 1],
                  filter: ['brightness(1)', 'brightness(1.4)', 'brightness(1)'],
                }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className={`font-['Press_Start_2P'] text-4xl sm:text-6xl font-black italic ${textColor} transform-gpu tracking-tighter`}
                style={{
                  textShadow: `0 0 25px ${glowColor}, 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000`,
                }}
              >
                {hits}
              </motion.span>

              <div className="flex flex-col">
                <span
                  className="font-['Bebas_Neue'] text-3xl sm:text-5xl text-white tracking-widest uppercase leading-none"
                  style={{
                    textShadow: '0 0 15px rgba(0,0,0,0.9), 2px 2px 0 #000, -2px -2px 0 #000',
                  }}
                >
                  HITS!
                </span>
                <span className="text-[10px] sm:text-xs font-black font-['Press_Start_2P'] uppercase tracking-widest text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {rank.title}
                </span>
              </div>
            </div>

            {/* REAL-TIME SCALING MULTIPLIER BADGE */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl border ${borderColor} ${badgeBg} backdrop-blur-md`}
            >
              <IconComponent className="h-4 w-4 animate-bounce flex-shrink-0" />
              <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black uppercase tracking-wider">
                <span>x{displayCombo.multiplier.toFixed(2)} MULTIPLIER</span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
                  +{multiplierPercent}% DMG
                </span>
              </div>
            </motion.div>

            {/* ACCUMULATED DAMAGE BAR */}
            <div className={`mt-2 w-full p-2 rounded-xl bg-gradient-to-r ${gradientBg} border border-zinc-800 backdrop-blur-sm`}>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-300 mb-1">
                <span className="flex items-center gap-1 text-amber-300">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  TOTAL DAMAGE:
                </span>
                <span className="font-black text-amber-400">{displayCombo.accumulatedDamage} HP ({hpDmgPct}%)</span>
              </div>

              {/* Progress bar of combo impact */}
              <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-700/80 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${hpDmgPct}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    hits >= 20
                      ? 'from-cyan-500 to-blue-400 shadow-[0_0_10px_#22d3ee]'
                      : hits >= 12
                      ? 'from-purple-500 to-pink-500 shadow-[0_0_10px_#a855f7]'
                      : hits >= 8
                      ? 'from-red-600 to-amber-500 shadow-[0_0_10px_#ef4444]'
                      : 'from-amber-500 to-yellow-400 shadow-[0_0_10px_#f59e0b]'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

RealTimeComboOverlay.displayName = 'RealTimeComboOverlay';
export default RealTimeComboOverlay;
