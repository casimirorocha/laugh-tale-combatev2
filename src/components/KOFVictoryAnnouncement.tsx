import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, Sparkles, Swords, Zap, Flame, Shield, Star, Volume2 } from 'lucide-react';
import { Fighter } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';
import { audioManager } from '../utils/AudioManager';
import { soundManager } from '../utils/soundEffects';
import { characterVoiceManager } from '../utils/audioAssetLibrary';
import { getFighterLaughText } from '../utils/customAudio';

export interface KOFVictoryAnnouncementProps {
  winnerFighter: Fighter;
  winningTeamName: string;
  roundNumber: number;
  isMatchPoint?: boolean;
  isDraw?: boolean;
  onSequenceComplete?: () => void;
}

type SequencePhase = 'ko_impact' | 'winner_showcase';

export const KOFVictoryAnnouncement: React.FC<KOFVictoryAnnouncementProps> = ({
  winnerFighter,
  winningTeamName,
  roundNumber,
  isMatchPoint = false,
  isDraw = false,
  onSequenceComplete,
}) => {
  const [phase, setPhase] = useState<SequencePhase>('ko_impact');
  const [hasPlayedNarration, setHasPlayedNarration] = useState(false);
  const [hasPlayedLaugh, setHasPlayedLaugh] = useState(false);
  const laughText = getFighterLaughText(winnerFighter?.id);

  // Step 1: Initial K.O. Impact Effect & Sound
  useEffect(() => {
    soundManager.playKO();
    characterVoiceManager.playKO();

    // Transition from K.O. impact to Winner Announcement after 1.1s
    const winnerTimer = setTimeout(() => {
      setPhase('winner_showcase');
    }, 1100);

    return () => clearTimeout(winnerTimer);
  }, []);

  // Step 2 & 3 & 4: Winner Announcement, Voiceover Narration, & Victory Laugh Audio
  useEffect(() => {
    if (phase === 'winner_showcase' && !hasPlayedNarration) {
      setHasPlayedNarration(true);

      // Step 3: Audio Narration format "[Player Name] wins!"
      const announcementText = isDraw
        ? 'Mutual Knockout! It is a draw!'
        : `${winnerFighter.name} wins!`;
      
      audioManager.speakAnnouncer(announcementText);

      // Step 4: Victory Sound - Recorded laugh audio corresponding to the winning player
      const laughTimer = setTimeout(() => {
        if (!isDraw && !hasPlayedLaugh) {
          setHasPlayedLaugh(true);
          audioManager.playFighterVictoryLaugh(winnerFighter.id, winnerFighter.name);
        }
      }, 1000);

      // Optional sequence completion notification
      const completeTimer = setTimeout(() => {
        if (onSequenceComplete) {
          onSequenceComplete();
        }
      }, 3400);

      return () => {
        clearTimeout(laughTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [phase, hasPlayedNarration, hasPlayedLaugh, winnerFighter, isDraw, onSequenceComplete]);

  return (
    <div
      id="kof-victory-sequence-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden select-none"
    >
      {/* 1. Dramatic Fullscreen Impact Flash & Speedlines (KOF 2002 Aesthetic) */}
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="absolute inset-0 bg-red-600 mix-blend-screen pointer-events-none z-10"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none z-0" />

      {/* Retro Arcade Scanline Texture */}
      <div className="absolute inset-0 kof-horizontal-speedlines opacity-45 pointer-events-none z-0" />

      {/* 2. Stylized KOF 2002 Diagonal Slash Cut Banners */}
      <div className="absolute inset-x-0 h-44 sm:h-52 -skew-y-3 flex flex-col justify-center items-center pointer-events-none overflow-hidden z-10">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.95 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-to-r from-red-950/95 via-zinc-950/95 to-red-950/95 border-y-4 border-amber-500 shadow-[0_0_60px_rgba(239,68,68,0.85)]"
        >
          {/* Internal diagonal warning hazard stripes */}
          <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_15px,transparent_15px,transparent_30px)]" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* PHASE 1: STYLIZED "K.O.!" IMPACT ANIMATION (KOF 2002 ARCADE STYLE)       */}
        {/* ========================================================================= */}
        {phase === 'ko_impact' && (
          <motion.div
            key="kof-ko-impact"
            initial={{ scale: 3.8, opacity: 0, rotate: -4 }}
            animate={{
              scale: [3.8, 0.9, 1.1, 1],
              opacity: 1,
              rotate: [-4, 2, -1, 0],
            }}
            exit={{ scale: 0.7, opacity: 0, y: -40, filter: 'blur(6px)' }}
            transition={{ duration: 0.48, ease: 'easeOut' }}
            className="relative z-30 flex flex-col items-center justify-center px-4"
          >
            {/* Top Japanese Arcade Ribbon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex items-center gap-2 mb-1 px-3 py-0.5 rounded-full bg-red-600/90 border border-amber-400 text-amber-200 text-xs sm:text-sm font-black tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.8)]"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>ROUND {roundNumber} • 完全決着</span>
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
            </motion.div>

            {/* Giant Stylized KOF 2002 "K.O.!" Logo */}
            <div className="relative flex items-center justify-center my-1">
              {/* Outer Glow & Shockwave Emitters */}
              <div className="absolute -inset-6 bg-red-600/40 blur-2xl rounded-full animate-pulse pointer-events-none" />
              <div className="absolute -inset-3 bg-amber-500/30 blur-xl rounded-full pointer-events-none" />

              <h1
                id="kof-ko-title"
                className="font-['Press_Start_2P'] text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-red-600 drop-shadow-[0_8px_16px_rgba(0,0,0,1)] relative select-none transform italic"
                style={{
                  WebkitTextStroke: '4px #18181b',
                  textShadow: '0 0 35px #ef4444, 0 0 60px #f59e0b, 4px 6px 0px #000000',
                }}
              >
                K.O.!
              </h1>
            </div>

            {/* Bottom Subtitle / Decisive Finish */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="font-['Cinzel'] text-sm sm:text-xl font-extrabold text-amber-300 tracking-[0.3em] uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mt-1"
            >
              KNOCK OUT!
            </motion.div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: WINNER ANNOUNCEMENT SHOWCASE (AVATAR + NAME + AUDIO + LAUGH)    */}
        {/* ========================================================================= */}
        {phase === 'winner_showcase' && (
          <motion.div
            key="kof-winner-showcase"
            initial={{ scale: 0.75, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative z-30 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-3"
          >
            {/* Top Victory Header Banner */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center gap-2 px-5 py-1 rounded-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-zinc-950 font-black text-xs sm:text-base tracking-widest uppercase border-2 border-white shadow-[0_0_30px_rgba(245,158,11,0.9)] mb-3"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950 fill-zinc-950 animate-bounce" />
              <span>ROUND {roundNumber} WINNER</span>
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-950 fill-zinc-950 animate-bounce" />
            </motion.div>

            {/* Winner Portrait Card & Laugh Bubble */}
            <div className="relative flex items-center justify-center gap-4 sm:gap-6 my-1">
              {/* Radial Golden Sunburst behind avatar */}
              <div className="absolute -inset-8 bg-amber-500/25 blur-3xl rounded-full pointer-events-none animate-pulse" />

              {/* Avatar Frame with Champion Halo */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
                className="relative"
              >
                <div className="relative p-1.5 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-red-500 shadow-[0_0_40px_rgba(245,158,11,0.8)]">
                  <FighterAvatar
                    avatarUrl={winnerFighter.avatarUrl}
                    avatarIcon={winnerFighter.avatarIcon}
                    name={winnerFighter.name}
                    size="hero"
                    borderColor="#fbbf24"
                    showScanlines={true}
                    glowEffect={true}
                  />

                  {/* Corner Champion Laurel Badges */}
                  <div className="absolute -top-2 -right-2 bg-amber-400 text-zinc-950 p-1.5 rounded-full border-2 border-white shadow-lg">
                    <Star className="w-4 h-4 fill-zinc-950" />
                  </div>
                </div>
              </motion.div>

              {/* Character Details & Victory Laugh Speech Bubble */}
              <div className="flex flex-col items-start justify-center">
                {/* Team Tag */}
                <div className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-400/90 uppercase mb-0.5">
                  {winningTeamName}
                </div>

                {/* Winner Name in Large Arcade Display Typography */}
                <motion.h2
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                  id="kof-winner-name"
                  className="font-['Cinzel'] text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-wider"
                  style={{
                    WebkitTextStroke: '1px #78350f',
                  }}
                >
                  {winnerFighter.name}
                </motion.h2>

                {/* Epithet / Title */}
                {winnerFighter.title && (
                  <p className="text-xs sm:text-sm font-semibold text-zinc-300 tracking-wide mt-0.5 drop-shadow">
                    « {winnerFighter.title} »
                  </p>
                )}

                {/* Step 4: Iconic Victory Laugh Callout Bubble */}
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4, type: 'spring' }}
                  className="relative mt-2 px-3.5 py-1.5 rounded-2xl bg-zinc-900/95 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                  <span className="font-['Press_Start_2P'] text-[10px] sm:text-xs font-bold text-amber-300 italic tracking-wider">
                    "{laughText}"
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
