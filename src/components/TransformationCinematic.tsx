import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fighter, Transformation } from '../types/fighter';
import { soundManager } from '../utils/soundEffects';
import { audioManager } from '../utils/AudioManager';

interface TransformationCinematicProps {
  isActive: boolean;
  transformation: Transformation | null;
  side: 'team1' | 'team2' | null;
  fighter?: Fighter | null;
  onComplete: () => void;
}

export const TransformationCinematic: React.FC<TransformationCinematicProps> = ({
  isActive,
  transformation,
  side,
  fighter,
  onComplete
}) => {
  useEffect(() => {
    if (isActive && transformation) {
      soundManager.playUltimateFinisher();
      audioManager.synthesizeTransformationEnter(transformation.visuals.themeColor);
      if (fighter) {
        audioManager.playTransformationEnter(fighter, transformation, side);
      }
      
      // Auto-complete the cinematic after 4 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, transformation, side, fighter, onComplete]);

  if (!isActive || !transformation) return null;

  const isT1 = side === 'team1';
  const themeColor = transformation.visuals.themeColor;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 overflow-hidden"
      >
        {/* Background Flash and Aura */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.8, 0.3], scale: [0.5, 2, 3] }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ backgroundColor: themeColor }}
        />

        {/* Diagonal Split Lines (Action Lines) */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgNDBsNDAtNDBIMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat" style={{ animation: 'slideBg 1s linear infinite' }} />

        {/* Container for Avatar and Text */}
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Transforming Character Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: isT1 ? -15 : 15, x: isT1 ? -100 : 100 }}
            animate={{ scale: 1, rotate: 0, x: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.2 }}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-8 shadow-2xl mb-8"
            style={{ borderColor: themeColor, boxShadow: `0 0 50px ${themeColor}` }}
          >
            <img 
              src={transformation.visuals.avatarUrl} 
              alt={transformation.name}
              className="w-full h-full object-cover"
            />
            
            {/* Inner Glare / Flash */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute inset-0 bg-white"
            />
          </motion.div>

          {/* Transformation Name Text */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.6 }}
            className="text-center"
          >
            <div className="text-sm md:text-base font-mono tracking-[0.3em] text-white/70 mb-2 uppercase">
              Transformation
            </div>
            <h1 
              className="font-['Cinzel'] text-4xl md:text-6xl lg:text-7xl font-black italic tracking-wider text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              style={{ backgroundImage: `linear-gradient(to right, #ffffff, ${themeColor}, #ffffff)` }}
            >
              {transformation.name}
            </h1>
          </motion.div>
          
        </div>
        
        {/* Screen Shake Effect */}
        <motion.div
          animate={{ x: [-10, 10, -10, 10, 0], y: [-10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 pointer-events-none"
        />
        
      </motion.div>
    </AnimatePresence>
  );
};
