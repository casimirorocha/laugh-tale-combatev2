import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveComboState } from './RealTimeComboOverlay';

interface FloatingComboCounterProps {
  combo: ActiveComboState | null;
}

export const FloatingComboCounter: React.FC<FloatingComboCounterProps> = React.memo(({ combo }) => {
  if (!combo || combo.hits < 2 || combo.isEnding) return null;

  const isT1 = combo.activeSide === 'team1';
  const hits = combo.hits;

  let colorClass = 'text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]';
  if (hits >= 20) colorClass = 'text-cyan-300 drop-shadow-[0_0_25px_rgba(34,211,238,1)]';
  else if (hits >= 12) colorClass = 'text-purple-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]';
  else if (hits >= 8) colorClass = 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${combo.activeSide}_floating_${hits}`}
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: 1, scale: [1.4, 1], y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: 'spring', stiffness: 800, damping: 20 }}
        className={`absolute top-28 z-30 pointer-events-none select-none ${
          isT1 ? 'left-[22%]' : 'right-[22%]'
        } flex items-center gap-1.5`}
      >
        <span className={`font-['Press_Start_2P'] text-2xl sm:text-3xl font-black ${colorClass}`}>
          {hits}x
        </span>
        <span className="font-['Bebas_Neue'] text-xl sm:text-2xl text-white tracking-widest uppercase bg-black/60 px-2 py-0.5 rounded border border-zinc-700">
          COMBO
        </span>
      </motion.div>
    </AnimatePresence>
  );
});

FloatingComboCounter.displayName = 'FloatingComboCounter';
export default FloatingComboCounter;
