import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles, Swords } from 'lucide-react';
import { Fighter } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';
import { entranceAudio, FIGHTER_TAUNT_DATABASE, getMatchupTaunt } from '../utils/entranceAudio';
import { HakiParticleEngine, ParticleBurst } from './HakiParticleEngine';

interface KOFFighterDuelProps {
  fighter1: Fighter;
  fighter2: Fighter;
  fighter1Role: string; // 'POINT (先鋒)' | 'MIDDLE (中堅)' | 'ANCHOR (大将)'
  fighter2Role: string;
  lang: 'ja' | 'en';
  isTaunting1: boolean;
  isTaunting2: boolean;
  onTriggerTaunt1: () => void;
  onTriggerTaunt2: () => void;
}

export const KOFFighterDuel: React.FC<KOFFighterDuelProps> = React.memo(({
  fighter1,
  fighter2,
  fighter1Role,
  fighter2Role,
  lang,
  isTaunting1,
  isTaunting2,
  onTriggerTaunt1,
  onTriggerTaunt2,
}) => {
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);

  // Trigger clash effect when cards meet
  useEffect(() => {
    const timer = setTimeout(() => {
      setBursts([{
        id: `entrance_clash_${Date.now()}`,
        x: 50,
        y: 50,
        color: 'amber',
        type: 'clash'
      }]);
    }, 450);

    return () => clearTimeout(timer);
  }, [fighter1.id, fighter2.id]);

  const handleBurstComplete = (id: string) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  };

  const special1 = getMatchupTaunt(fighter1.id, fighter2.id);
  const taunt1 = FIGHTER_TAUNT_DATABASE[fighter1.id] || {
    quoteEN: fighter1.clashQuote || "I won't back down!",
    quoteJP: fighter1.clashQuote || "退くわけにはいかない！",
    voiceTextJP: fighter1.japaneseName || "いくぞ！",
  };

  const special2 = getMatchupTaunt(fighter2.id, fighter1.id);
  const taunt2 = FIGHTER_TAUNT_DATABASE[fighter2.id] || {
    quoteEN: fighter2.clashQuote || "Show me your strength!",
    quoteJP: fighter2.clashQuote || "貴様の力を見せてみろ！",
    voiceTextJP: fighter2.japaneseName || "受けて立て！",
  };

  return (
    <div id="kof-fighter-duel-container" className="relative w-full flex-1 flex flex-col justify-center my-auto overflow-hidden py-2 sm:py-4">
      {/* Background Animated Speedlines */}
      <div className="absolute inset-0 kof-horizontal-speedlines opacity-40 pointer-events-none" />

      {/* Entrance Clash Particles */}
      <HakiParticleEngine bursts={bursts} onBurstComplete={handleBurstComplete} />

      {/* Centered VS Clash Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={bursts.length > 0 ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex items-center justify-center"
        >
          <div className="relative">
             <div className="absolute inset-0 blur-2xl bg-amber-500/50 animate-pulse" />
             <div className="relative bg-zinc-950 border-4 border-amber-500 rounded-full p-4 shadow-[0_0_50px_rgba(245,158,11,0.6)]">
                <Swords className="h-12 w-12 text-amber-400 drop-shadow-lg" />
             </div>
             <div className="absolute -top-4 -right-4 bg-red-600 text-white font-black px-2 py-1 text-xs rounded border-2 border-white rotate-12 shadow-lg">
                VS
             </div>
          </div>
        </motion.div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center relative z-10 px-2 sm:px-6">
        {/* FIGHTER 1 (LEFT SIDE - TEAM 1) */}
        <motion.div
          key={`f1_${fighter1.id}`}
          initial={{ x: -800, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1
          }}
          className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-zinc-950/95 via-zinc-900/90 to-zinc-950/80 border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-md"
        >
          {/* Fighter Avatar Portrait with Metallic Clips */}
          <div className="relative shrink-0">
            <FighterAvatar
              avatarUrl={fighter1.avatarUrl}
              avatarIcon={fighter1.avatarIcon}
              name={fighter1.name}
              size="hero"
              borderColor={fighter1.themeColor || '#f59e0b'}
              showScanlines={true}
              glowEffect={true}
            />

            {/* Role Badge */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-['Press_Start_2P'] text-[8px] whitespace-nowrap shadow-lg uppercase tracking-wider font-black">
              {fighter1Role}
            </div>

            {/* Haki Aura Indicator */}
            {fighter1.haki && fighter1.haki.conqueror > 85 && (
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-purple-900/90 border border-purple-400 text-[9px] font-mono text-purple-200 shadow">
                HAOSHOKU
              </div>
            )}
          </div>

          {/* Fighter Info & Japanese Stamp */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 w-full">
            {/* Japanese Name Calligraphy Stamp */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="kof-stamp-slam inline-block px-2 py-0.5 rounded bg-red-700/90 border border-red-400 text-white font-serif font-black text-xs sm:text-sm tracking-widest shadow-md">
                {fighter1.japaneseName || fighter1.name}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                BOUNTY: ฿{(fighter1.bounty || 100000000).toLocaleString()}
              </span>
            </div>

            {/* Main Fighter Name */}
            <h2 className="font-['Cinzel'] text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 leading-tight truncate w-full">
              {fighter1.name}
            </h2>

            {/* Epithet */}
            <span className="font-['Bebas_Neue'] text-amber-400 text-sm sm:text-base tracking-wider">
              {fighter1.epithet || fighter1.fightingStyle}
            </span>

            {/* Fighting Style / Devil Fruit Badge */}
            <p className="font-mono text-[10px] sm:text-xs text-zinc-300 mt-1 line-clamp-1">
              {fighter1.devilFruit ? fighter1.devilFruit.name : fighter1.fightingStyle}
            </p>

            {/* Interactive Taunt Dialog Bubble */}
            <div className="relative mt-3 w-full p-3 rounded-xl bg-zinc-950/90 border border-amber-500/40 shadow-inner">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-['Press_Start_2P'] text-[8px] text-amber-400 uppercase">
                  BATTLE TAUNT // 挑発
                </span>

                <button
                  id={`play-taunt-btn-1-${fighter1.id}`}
                  onClick={onTriggerTaunt1}
                  disabled={isTaunting1}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition shadow-md ${
                    isTaunting1
                      ? 'bg-amber-500 text-black animate-pulse'
                      : 'bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-300 border border-amber-500/50'
                  }`}
                  title="Play custom fighter taunt audio sample"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isTaunting1 ? 'VOICING...' : 'PLAY TAUNT'}</span>
                </button>
              </div>

              {/* Speech Text */}
              <p className="font-serif italic text-xs sm:text-sm text-amber-100 leading-snug">
                "{special1 || (lang === 'ja' ? taunt1.quoteJP : taunt1.quoteEN)}"
              </p>

              {/* Sound wave visualizer when speaking */}
              {isTaunting1 && (
                <div className="flex items-center gap-1 mt-2 justify-center sm:justify-start">
                  <div className="voice-wave-bar w-1 bg-amber-400 rounded-full" style={{ '--anim-delay': '0s' }} />
                  <div className="voice-wave-bar w-1 bg-amber-400 rounded-full" style={{ '--anim-delay': '0.12s' }} />
                  <div className="voice-wave-bar w-1 bg-amber-400 rounded-full" style={{ '--anim-delay': '0.24s' }} />
                  <div className="voice-wave-bar w-1 bg-amber-400 rounded-full" style={{ '--anim-delay': '0.08s' }} />
                  <div className="voice-wave-bar w-1 bg-amber-400 rounded-full" style={{ '--anim-delay': '0.18s' }} />
                  <span className="text-[10px] font-mono text-amber-300 ml-2">AUDIO SAMPLE PLAYING</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* FIGHTER 2 (RIGHT SIDE - TEAM 2) */}
        <motion.div
          key={`f2_${fighter2.id}`}
          initial={{ x: 800, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.1
          }}
          className="relative flex flex-col sm:flex-row-reverse items-center sm:items-start gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-zinc-950/95 via-zinc-900/90 to-zinc-950/80 border-2 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.25)] backdrop-blur-md"
        >
          {/* Fighter Avatar Portrait with Metallic Clips */}
          <div className="relative shrink-0">
            <FighterAvatar
              avatarUrl={fighter2.avatarUrl}
              avatarIcon={fighter2.avatarIcon}
              name={fighter2.name}
              size="hero"
              borderColor={fighter2.themeColor || '#a855f7'}
              showScanlines={true}
              glowEffect={true}
            />

            {/* Role Badge */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-['Press_Start_2P'] text-[8px] whitespace-nowrap shadow-lg uppercase tracking-wider font-black">
              {fighter2Role}
            </div>

            {/* Haki Aura Indicator */}
            {fighter2.haki && fighter2.haki.conqueror > 85 && (
              <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded bg-purple-900/90 border border-purple-400 text-[9px] font-mono text-purple-200 shadow">
                HAOSHOKU
              </div>
            )}
          </div>

          {/* Fighter Info & Japanese Stamp */}
          <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right min-w-0 w-full">
            {/* Japanese Name Calligraphy Stamp */}
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end flex-row-reverse">
              <span className="kof-stamp-slam inline-block px-2 py-0.5 rounded bg-purple-800/90 border border-purple-400 text-white font-serif font-black text-xs sm:text-sm tracking-widest shadow-md">
                {fighter2.japaneseName || fighter2.name}
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                BOUNTY: ฿{(fighter2.bounty || 100000000).toLocaleString()}
              </span>
            </div>

            {/* Main Fighter Name */}
            <h2 className="font-['Cinzel'] text-xl sm:text-2xl lg:text-3xl font-black text-white mt-1 leading-tight truncate w-full">
              {fighter2.name}
            </h2>

            {/* Epithet */}
            <span className="font-['Bebas_Neue'] text-purple-400 text-sm sm:text-base tracking-wider">
              {fighter2.epithet || fighter2.fightingStyle}
            </span>

            {/* Fighting Style / Devil Fruit Badge */}
            <p className="font-mono text-[10px] sm:text-xs text-zinc-300 mt-1 line-clamp-1">
              {fighter2.devilFruit ? fighter2.devilFruit.name : fighter2.fightingStyle}
            </p>

            {/* Interactive Taunt Dialog Bubble */}
            <div className="relative mt-3 w-full p-3 rounded-xl bg-zinc-950/90 border border-purple-500/40 shadow-inner">
              <div className="flex items-center justify-between gap-2 mb-1 flex-row-reverse">
                <span className="font-['Press_Start_2P'] text-[8px] text-purple-400 uppercase">
                  BATTLE TAUNT // 挑発
                </span>

                <button
                  id={`play-taunt-btn-2-${fighter2.id}`}
                  onClick={onTriggerTaunt2}
                  disabled={isTaunting2}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition shadow-md ${
                    isTaunting2
                      ? 'bg-purple-600 text-white animate-pulse'
                      : 'bg-zinc-800 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/50'
                  }`}
                  title="Play custom fighter taunt audio sample"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isTaunting2 ? 'VOICING...' : 'PLAY TAUNT'}</span>
                </button>
              </div>

              {/* Speech Text */}
              <p className="font-serif italic text-xs sm:text-sm text-purple-100 leading-snug">
                "{special2 || (lang === 'ja' ? taunt2.quoteJP : taunt2.quoteEN)}"
              </p>

              {/* Sound wave visualizer when speaking */}
              {isTaunting2 && (
                <div className="flex items-center gap-1 mt-2 justify-center sm:justify-end">
                  <span className="text-[10px] font-mono text-purple-300 mr-2">AUDIO SAMPLE PLAYING</span>
                  <div className="voice-wave-bar w-1 bg-purple-400 rounded-full" style={{ '--anim-delay': '0s' }} />
                  <div className="voice-wave-bar w-1 bg-purple-400 rounded-full" style={{ '--anim-delay': '0.12s' }} />
                  <div className="voice-wave-bar w-1 bg-purple-400 rounded-full" style={{ '--anim-delay': '0.24s' }} />
                  <div className="voice-wave-bar w-1 bg-purple-400 rounded-full" style={{ '--anim-delay': '0.08s' }} />
                  <div className="voice-wave-bar w-1 bg-purple-400 rounded-full" style={{ '--anim-delay': '0.18s' }} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
