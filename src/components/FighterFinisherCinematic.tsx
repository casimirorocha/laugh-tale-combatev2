import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleFighterState } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';

interface FighterFinisherCinematicProps {
  isActive: boolean;
  fighter: BattleFighterState | null;
}

export const FighterFinisherCinematic: React.FC<FighterFinisherCinematicProps> = React.memo(({ isActive, fighter }) => {
  if (!isActive || !fighter) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {/* Cinematic Black Bars */}
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-0 left-0 w-full h-20 bg-black z-10"
        />
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-0 left-0 w-full h-20 bg-black z-10"
        />

        {/* Dynamic Background Flare */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-radial from-white via-transparent to-transparent opacity-30"
          style={{ background: `radial-gradient(circle, ${fighter.fighter.themeColor} 0%, transparent 70%)` }}
        />

        {/* Fighter Hero Zoom */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, x: -200 }}
          animate={{ scale: 1.1, opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 15 }}
          className="relative z-20 flex flex-col items-center"
        >
          <div className="relative">
            <FighterAvatar
              avatarUrl={fighter.fighter.avatarUrl}
              avatarIcon={fighter.fighter.avatarIcon}
              name={fighter.fighter.name}
              size="hero"
              borderColor="#ffffff"
              glowEffect={true}
              className="scale-150 shadow-[0_0_100px_rgba(255,255,255,0.5)] border-4"
            />
            
            {/* Energy Aura */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -inset-8 rounded-full blur-2xl -z-10"
              style={{ backgroundColor: fighter.fighter.themeColor }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 text-center"
          >
            <h2 className="font-['Cinzel'] text-5xl sm:text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(0,0,0,1)] uppercase">
              {fighter.fighter.name}
            </h2>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent my-2" />
            <p className="font-['Press_Start_2P'] text-lg sm:text-xl text-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
              COMBO FINISHER!
            </p>
          </motion.div>
        </motion.div>

        {/* Diagonal Slash Effect */}
        <motion.div
          initial={{ x: '-100%', skewX: -45 }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.5, delay: 0.8, ease: "linear" }}
          className="absolute inset-0 bg-white/40 z-30 pointer-events-none"
        />

        {/* Screen Flash at End */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, delay: 3.1 }}
          className="absolute inset-0 bg-white z-[110]"
        />
      </motion.div>
    </AnimatePresence>
  );
});
