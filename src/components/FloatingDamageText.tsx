import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ShieldAlert, Sparkles, Shield } from 'lucide-react';

export type DamageType = 'physical' | 'haki' | 'devil_fruit' | 'normal' | 'armament_crit' | 'conqueror_burst' | 'guarded' | 'miss';

export interface FloatingDamageItem {
  id: string;
  side: 'team1' | 'team2';
  damage: number;
  displayText?: string;
  damageType: DamageType;
  hakiMultiplier?: number;
  comboCount?: number;
  xOffset?: number;
  yOffset?: number;
  createdAt: number;
}

interface FloatingDamageTextProps {
  items: FloatingDamageItem[];
}

export const FloatingDamageText: React.FC<FloatingDamageTextProps> = React.memo(({ items }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible flex items-center justify-center">
      <AnimatePresence>
        {items.map((item) => {
          const isConqueror = item.damageType === 'conqueror_burst' || item.damageType === 'haki';
          const isArmamentCrit = item.damageType === 'armament_crit';
          const isDevilFruit = item.damageType === 'devil_fruit';
          const isPhysical = item.damageType === 'physical' || item.damageType === 'normal';
          const isGuarded = item.damageType === 'guarded';
          const isMiss = item.damageType === 'miss';

          // Color classification & fast GPU text shadows requested by user:
          // Red for Haki, Gold for Devil Fruit, White for physical
          let textColorClass = 'text-white';
          let textShadowStyle = '0 0 8px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.9)';
          let badgeBg = 'bg-zinc-900 border-zinc-700 text-zinc-300';
          let badgeText = '';

          if (item.damageType === 'conqueror_burst') {
            textColorClass = 'text-purple-300';
            textShadowStyle = '0 0 16px rgba(168, 85, 247, 1), 0 0 24px rgba(192, 132, 252, 0.9), 0 2px 6px rgba(0,0,0,1)';
            badgeBg = 'bg-purple-950/90 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.7)]';
            badgeText = "⚡ CONQUEROR'S BURST ⚡";
          } else if (item.damageType === 'haki' || isArmamentCrit) {
            textColorClass = 'text-red-500';
            textShadowStyle = '0 0 16px rgba(239, 68, 68, 1), 0 0 24px rgba(220, 38, 38, 0.8), 0 2px 6px rgba(0,0,0,1)';
            badgeBg = 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.7)]';
            badgeText = '🔥 HAKI STRIKE';
          } else if (isDevilFruit) {
            textColorClass = 'text-amber-400';
            textShadowStyle = '0 0 16px rgba(251, 191, 36, 1), 0 0 24px rgba(245, 158, 11, 0.8), 0 2px 6px rgba(0,0,0,1)';
            badgeBg = 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.7)]';
            badgeText = '🌟 DEVIL FRUIT';
          } else if (isGuarded) {
            textColorClass = 'text-cyan-300';
            textShadowStyle = '0 0 10px rgba(34, 211, 238, 0.8), 0 2px 4px rgba(0,0,0,0.9)';
            badgeBg = 'bg-cyan-950/90 border-cyan-500 text-cyan-300';
            badgeText = 'GUARDED';
          } else if (isMiss) {
            textColorClass = 'text-zinc-400';
            textShadowStyle = '0 2px 4px rgba(0,0,0,0.8)';
            badgeBg = 'bg-zinc-900 border-zinc-700 text-zinc-400';
            badgeText = 'WHIFF';
          } else if (isPhysical) {
            textColorClass = 'text-white';
            textShadowStyle = '0 0 10px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0,0,0,0.9)';
            badgeBg = 'bg-zinc-900/80 border-zinc-700 text-zinc-200';
            badgeText = '';
          }

          const displayText =
            item.displayText ??
            (isMiss ? 'MISS' : `-${item.damage}`);

          const xDrift = item.xOffset ?? 0;
          const initialScale = isConqueror ? 1.6 : isArmamentCrit ? 1.45 : 1.25;

          return (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                scale: 0.4,
                y: 15,
                x: xDrift,
              }}
              animate={{
                opacity: [0, 1, 1, 0.9, 0],
                scale: [0.4, initialScale, initialScale * 0.95, initialScale * 0.9, 0.8],
                y: [15, -45, -80, -115, -140],
                x: [xDrift, xDrift * 1.1, xDrift * 1.2, xDrift * 1.3, xDrift * 1.4],
              }}
              exit={{
                opacity: 0,
                y: -155,
                scale: 0.7,
              }}
              transition={{
                duration: 1.35,
                times: [0, 0.12, 0.55, 0.8, 1],
                ease: 'easeOut',
              }}
              style={{ textShadow: textShadowStyle, willChange: 'transform, opacity' }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center select-none pointer-events-none z-50 whitespace-nowrap transform-gpu"
            >
              {/* Optional Shockwave Ring on Hit for Crits & Conqueror Bursts */}
              {isConqueror && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute -inset-4 rounded-full border-2 border-purple-400 pointer-events-none -z-10"
                />
              )}
              {isArmamentCrit && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="absolute -inset-4 rounded-full border-2 border-red-500 pointer-events-none -z-10"
                />
              )}

              {/* Haki / Crit Type Badge Banner */}
              {badgeText && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider mb-0.5 ${badgeBg}`}
                >
                  {isConqueror ? (
                    <Zap className="h-2.5 w-2.5 text-purple-300 animate-pulse" />
                  ) : isArmamentCrit ? (
                    <ShieldAlert className="h-2.5 w-2.5 text-red-400" />
                  ) : isGuarded ? (
                    <Shield className="h-2.5 w-2.5 text-cyan-300" />
                  ) : null}
                  <span>{badgeText}</span>
                </div>
              )}

              {/* Main Damage Numerical Text */}
              <div className="relative flex items-center justify-center">
                {/* Outlined Shadow backing for extreme contrast */}
                <span
                  className="absolute font-['Press_Start_2P'] text-sm sm:text-lg font-black text-black select-none"
                  style={{
                    WebkitTextStroke: '4px black',
                  }}
                  aria-hidden="true"
                >
                  {displayText}
                </span>

                {/* Foreground Colored Text */}
                <span
                  className={`relative font-['Press_Start_2P'] text-sm sm:text-lg font-black tracking-wide ${textColorClass}`}
                >
                  {displayText}
                </span>
              </div>

              {/* Multiplier / Combo Tag if available */}
              {item.hakiMultiplier && item.hakiMultiplier > 1.05 && (
                <div className="mt-0.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.2 border border-purple-400/60 text-[8px] font-mono text-purple-300 shadow-sm">
                  <Sparkles className="h-2 w-2 text-purple-400" />
                  <span>x{item.hakiMultiplier.toFixed(2)} HAKI</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
