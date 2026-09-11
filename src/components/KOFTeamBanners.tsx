import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Team } from '../types/fighter';
import { calculateTeamTCP } from '../utils/combatEngine';
import { FighterAvatar } from './FighterAvatar';
import { HakiParticleEngine, ParticleBurst } from './HakiParticleEngine';

interface KOFTeamBannersProps {
  team1: Team;
  team2: Team;
  onSelectMatchup: (index: number) => void;
  activeMatchupIndex: number;
}

export const KOFTeamBanners: React.FC<KOFTeamBannersProps> = ({
  team1,
  team2,
  onSelectMatchup,
  activeMatchupIndex,
}) => {
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);

  // Trigger clash effect when banners meet
  useEffect(() => {
    const timer = setTimeout(() => {
      setBursts([{
        id: `banner_clash_${Date.now()}`,
        x: 50,
        y: 50,
        color: 'red',
        type: 'clash'
      }]);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const handleBurstComplete = (id: string) => {
    setBursts(prev => prev.filter(b => b.id !== id));
  };

  const t1TCP = calculateTeamTCP(team1.fighters);
  const t2TCP = calculateTeamTCP(team2.fighters);

  return (
    <div id="kof-team-banners-container" className="relative w-full flex-1 flex flex-col justify-center my-auto overflow-hidden py-3 sm:py-6">
      {/* Background Animated Radial Speed Lines */}
      <div className="absolute inset-0 kof-radial-speedlines opacity-30 pointer-events-none" />

      {/* Entrance Clash Particles */}
      <HakiParticleEngine bursts={bursts} onBurstComplete={handleBurstComplete} />

      {/* Main Split Screen Face-off Container */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center max-w-7xl mx-auto px-3 sm:px-6">
        {/* TEAM 1 BANNER (LEFT) */}
        <motion.div
          initial={{ x: -350, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-500/70 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/40 p-5 sm:p-7 shadow-[0_0_40px_rgba(245,158,11,0.2)] backdrop-blur-md"
        >
          {/* Diagonal Angle Accent Strip */}
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

          {/* Team Crest & Name */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/80 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0">
              {team1.crestEmoji || '🏴‍☠️'}
            </div>
            <div className="min-w-0">
              <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-widest block">
                TEAM 1 // SIDE ALPHA
              </span>
              <h2 className="font-['Bebas_Neue'] text-2xl sm:text-4xl tracking-wider text-white truncate leading-tight mt-0.5">
                {team1.name}
              </h2>
              <p className="font-mono text-xs sm:text-sm text-zinc-300">
                TOTAL COMBAT POWER:{' '}
                <span className="text-amber-400 font-bold">{t1TCP.toLocaleString()} TCP</span>
              </p>
            </div>
          </div>

          {/* Fighter Lineup Roster (Point, Middle, Anchor) */}
          <div className="mt-5 pt-4 border-t border-amber-500/30">
            <span className="font-['Press_Start_2P'] text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-wider block mb-2.5">
              ORDER OF BATTLE LINEUP:
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {team1.fighters.map((f, i) => {
                const isSelected = activeMatchupIndex === i;
                const roleLabel = i === 0 ? 'POINT' : i === 1 ? 'MIDDLE' : 'ANCHOR';
                const roleKanji = i === 0 ? '先鋒' : i === 1 ? '中堅' : '大将';

                return (
                  <button
                    key={`t1_banner_fighter_${f.id}_${i}`}
                    onClick={() => onSelectMatchup(i)}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center group ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-amber-500/60 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="mb-1.5 transform group-hover:scale-105 transition-transform">
                      <FighterAvatar
                        avatarUrl={f.avatarUrl}
                        avatarIcon={f.avatarIcon}
                        name={f.name}
                        size="md"
                        borderColor={f.themeColor || '#f59e0b'}
                      />
                    </div>
                    <span className="font-['Bebas_Neue'] text-xs sm:text-sm text-white truncate w-full">
                      {f.shortName || f.name.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] font-mono text-amber-400 font-bold">{roleLabel}</span>
                      <span className="text-[8px] font-serif text-amber-300/80">{roleKanji}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* CENTER VS EMBLEM */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center justify-center z-30 pointer-events-none">
          <motion.div
            initial={{ scale: 2.8, opacity: 0, rotate: -25 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.25, duration: 0.4, type: 'spring', bounce: 0.5 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 font-['Cinzel'] text-3xl font-black text-black shadow-[0_0_40px_rgba(239,68,68,0.7)] ring-4 ring-zinc-950 border-2 border-white/80"
          >
            VS
          </motion.div>
          <span className="font-['Press_Start_2P'] text-[8px] text-amber-400 uppercase tracking-widest mt-2 bg-zinc-950/90 px-2 py-0.5 rounded border border-amber-500/40">
            CLASH
          </span>
        </div>

        {/* TEAM 2 BANNER (RIGHT) */}
        <motion.div
          initial={{ x: 350, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-purple-500/70 bg-gradient-to-l from-zinc-950 via-zinc-900 to-purple-950/40 p-5 sm:p-7 shadow-[0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-md text-right"
        >
          {/* Diagonal Angle Accent Strip */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />

          {/* Team Crest & Name */}
          <div className="flex items-center gap-4 flex-row-reverse">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-purple-500/20 border-2 border-purple-500/80 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0">
              {team2.crestEmoji || '⚓'}
            </div>
            <div className="min-w-0">
              <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-purple-400 uppercase tracking-widest block">
                TEAM 2 // SIDE OMEGA
              </span>
              <h2 className="font-['Bebas_Neue'] text-2xl sm:text-4xl tracking-wider text-white truncate leading-tight mt-0.5">
                {team2.name}
              </h2>
              <p className="font-mono text-xs sm:text-sm text-zinc-300">
                TOTAL COMBAT POWER:{' '}
                <span className="text-purple-400 font-bold">{t2TCP.toLocaleString()} TCP</span>
              </p>
            </div>
          </div>

          {/* Fighter Lineup Roster (Point, Middle, Anchor) */}
          <div className="mt-5 pt-4 border-t border-purple-500/30">
            <span className="font-['Press_Start_2P'] text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-wider block mb-2.5">
              ORDER OF BATTLE LINEUP:
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {team2.fighters.map((f, i) => {
                const isSelected = activeMatchupIndex === i;
                const roleLabel = i === 0 ? 'POINT' : i === 1 ? 'MIDDLE' : 'ANCHOR';
                const roleKanji = i === 0 ? '先鋒' : i === 1 ? '中堅' : '大将';

                return (
                  <button
                    key={`t2_banner_fighter_${f.id}_${i}`}
                    onClick={() => onSelectMatchup(i)}
                    className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center group ${
                      isSelected
                        ? 'bg-purple-600/25 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-purple-500/60 hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="mb-1.5 transform group-hover:scale-105 transition-transform">
                      <FighterAvatar
                        avatarUrl={f.avatarUrl}
                        avatarIcon={f.avatarIcon}
                        name={f.name}
                        size="md"
                        borderColor={f.themeColor || '#a855f7'}
                      />
                    </div>
                    <span className="font-['Bebas_Neue'] text-xs sm:text-sm text-white truncate w-full">
                      {f.shortName || f.name.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[8px] font-mono text-purple-400 font-bold">{roleLabel}</span>
                      <span className="text-[8px] font-serif text-purple-300/80">{roleKanji}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
