import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleFighterState, AwakeningProfile } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';
import { Zap, Flame, Sparkles } from 'lucide-react';

interface AwakeningTransformationCinematicProps {
  isActive: boolean;
  fighterState: BattleFighterState | null;
  awakeningProfile: AwakeningProfile | null;
  onComplete?: () => void;
}

export const AwakeningTransformationCinematic: React.FC<AwakeningTransformationCinematicProps> = React.memo(({
  isActive,
  fighterState,
  awakeningProfile,
}) => {
  if (!isActive || !fighterState || !awakeningProfile) return null;

  const { formName, formNameJP, epithetTitle, subtitle, auraColor, secondaryAuraColor, transformationQuote, transformationQuoteJP } = awakeningProfile;
  const fighter = fighterState.fighter;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden pointer-events-none"
      >
        {/* Fullscreen Shockwave Flash */}
        <motion.div
          initial={{ opacity: 0.9, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 bg-white z-50 pointer-events-none"
        />

        {/* Ambient Darkened Arena Veil with Dynamic Aura Color Tint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Dynamic Energy Beam / Radiant Sunburst */}
        <motion.div
          initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 180, scale: 1.5, opacity: 0.4 }}
          transition={{ duration: 2.2, ease: 'linear' }}
          className="absolute w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${auraColor} 0%, ${secondaryAuraColor} 45%, transparent 70%)`,
          }}
        />

        {/* Top & Bottom Cinematic Japanese Letterbox Banners */}
        <motion.div
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          exit={{ y: -80 }}
          className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black via-black/80 to-transparent flex items-center justify-between px-8 z-30 border-b border-white/10"
        >
          <div className="flex items-center gap-3">
            <span className="font-['Bebas_Neue'] text-2xl tracking-[0.3em] text-red-500 flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse text-amber-400" />
              CRITICAL LIMIT BREAKER
            </span>
            <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest hidden sm:inline">
              HP &lt; 25% REACHED
            </span>
          </div>
          <div className="font-['Cinzel'] font-black text-amber-400 tracking-widest text-lg drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
            【 覚 醒 発 動 】
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between px-8 z-30 border-t border-white/10"
        >
          <div className="text-zinc-400 text-xs font-mono">
            STAT BOOST: <span className="text-emerald-400 font-bold">+35% ATK</span> • <span className="text-cyan-400 font-bold">+25% DEF</span> • <span className="text-amber-400 font-bold">+25% CRIT</span>
          </div>
          <div className="text-amber-300 text-xs font-mono font-bold tracking-wider">
            UNIQUE AWAKENING MOVES UNLOCKED
          </div>
        </motion.div>

        {/* Main Transformation Centerpiece */}
        <div className="relative z-40 max-w-4xl w-full mx-4 flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Avatar Hero Zoom with Radiant Awakened Aura */}
          <motion.div
            initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 120 }}
            className="relative flex-shrink-0"
          >
            {/* Pulsing Aura Rings */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="absolute -inset-6 rounded-full blur-xl pointer-events-none"
              style={{ backgroundColor: auraColor }}
            />
            <motion.div
              animate={{
                scale: [1.1, 1.4, 1.1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="absolute -inset-10 rounded-full blur-2xl pointer-events-none"
              style={{ backgroundColor: secondaryAuraColor }}
            />

            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-zinc-800 to-zinc-950 border-4 shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              style={{ borderColor: auraColor }}>
              <FighterAvatar
                avatarUrl={fighter.avatarUrl}
                avatarIcon={fighter.avatarIcon}
                name={fighter.name}
                size="hero"
                glowEffect={true}
                className="w-36 h-36 md:w-44 md:h-44"
              />
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 font-['Bebas_Neue'] text-xs font-black tracking-widest px-3 py-0.5 rounded-full text-black shadow-lg uppercase whitespace-nowrap flex items-center gap-1 border border-white/50"
                style={{ backgroundColor: auraColor }}
              >
                <Sparkles className="h-3 w-3" /> AWAKENED
              </div>
            </div>
          </motion.div>

          {/* Transformation Title & Quotes Card */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex-1 text-center md:text-left flex flex-col items-center md:items-start"
          >
            {/* Epithet / Kanji Category Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap justify-center md:justify-start">
              <span className="bg-red-950/80 border border-red-500/80 text-red-400 font-mono text-[10px] font-black px-2.5 py-0.5 rounded tracking-widest flex items-center gap-1">
                <Flame className="h-3 w-3 text-red-400 fill-red-400" />
                TRUE POTENTIAL UNLEASHED
              </span>
              <span className="text-zinc-300 font-['Cinzel'] font-bold text-xs tracking-wider">
                {epithetTitle}
              </span>
            </div>

            {/* Japanese Form Name Kanji */}
            <motion.h3
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg md:text-xl font-['Cinzel'] font-black tracking-widest text-zinc-300"
              style={{ color: secondaryAuraColor }}
            >
              {formNameJP}
            </motion.h3>

            {/* Main English Form Name with Glow */}
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 12 }}
              className="text-3xl md:text-5xl font-['Bebas_Neue'] tracking-wider leading-none text-white my-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
              style={{
                textShadow: `0 0 25px ${auraColor}, 0 0 50px ${secondaryAuraColor}`,
              }}
            >
              {formName}
            </motion.h1>

            {/* Subtitle / Battle Atmosphere Note */}
            <p className="text-zinc-300 text-xs md:text-sm italic font-sans mb-3 max-w-lg">
              "{subtitle}"
            </p>

            {/* Transformation Dialogue Quote */}
            <div className="bg-zinc-900/90 border-l-4 rounded-r-lg p-3 max-w-lg shadow-xl"
              style={{ borderColor: auraColor }}>
              <p className="text-amber-200 font-['Cinzel'] text-xs md:text-sm font-semibold leading-relaxed">
                "{transformationQuote}"
              </p>
              {transformationQuoteJP && (
                <p className="text-zinc-400 text-[11px] font-sans mt-1">
                  {transformationQuoteJP}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
