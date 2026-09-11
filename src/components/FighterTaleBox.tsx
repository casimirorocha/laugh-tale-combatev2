import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Pause, Play, RotateCcw, FastForward, Sparkles, ScrollText, Flame } from 'lucide-react';
import { Team, StageInfo } from '../types/fighter';

interface FighterTaleBoxProps {
  team1: Team;
  team2: Team;
  stage: StageInfo;
}

interface FighterTaleData {
  title: string;
  chapter: string;
  narrative: string;
  rivalryType: string;
  clashMotto: string;
}

export const FighterTaleBox: React.FC<FighterTaleBoxProps> = ({ team1, team2, stage }) => {
  const [tale, setTale] = useState<FighterTaleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScrolling, setIsScrolling] = useState<boolean>(true);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1x, 2x, 3x
  const [scrollPos, setScrollPos] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  const fetchFighterTale = () => {
    setIsLoading(true);
    setScrollPos(0);
    fetch('/api/fighter-tale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team1, team2, stage }),
    })
      .then((res) => res.json())
      .then((data: FighterTaleData) => {
        if (data && data.narrative) {
          setTale(data);
        } else {
          setTale(getFallbackTale(team1, team2, stage));
        }
      })
      .catch(() => {
        setTale(getFallbackTale(team1, team2, stage));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFighterTale();
  }, [team1, team2, stage]);

  const scrollPosRef = useRef<number>(0);

  // Smooth continuous scrolling loop
  useEffect(() => {
    if (!isScrolling || isLoading) {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    const scrollLoop = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (maxScroll > 0) {
          scrollPosRef.current += 0.45 * scrollSpeed;
          if (scrollPosRef.current >= maxScroll + 30) {
            scrollPosRef.current = 0; // Loop back seamlessly
          }
          container.scrollTop = scrollPosRef.current;
        }
      }
      scrollAnimRef.current = requestAnimationFrame(scrollLoop);
    };

    scrollAnimRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isScrolling, scrollSpeed, isLoading, tale]);

  const handleResetScroll = () => {
    scrollPosRef.current = 0;
    setScrollPos(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const toggleSpeed = () => {
    setScrollSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-3 relative rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 p-4 sm:p-5 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-xl overflow-hidden">
      {/* Decorative Golden Corner Accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-2xl pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-black font-bold shadow-md">
            <ScrollText className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Press_Start_2P'] text-[9px] text-amber-400 uppercase tracking-wider">
                {tale?.chapter || 'GRAND LINE CHRONICLE'}
              </span>
              {tale?.rivalryType && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                  ⚡ {tale.rivalryType}
                </span>
              )}
            </div>
            <h4 className="font-['Cinzel'] text-sm sm:text-lg font-black text-white tracking-wide leading-tight mt-0.5">
              {isLoading ? 'Consulting Ancient Grand Line Archives...' : tale?.title}
            </h4>
          </div>
        </div>

        {/* SCROLL CONTROLS */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-zinc-200 transition"
            title={isScrolling ? 'Pause Story Scroll' : 'Resume Story Scroll'}
          >
            {isScrolling ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isScrolling ? 'PAUSE' : 'SCROLL'}</span>
          </button>

          <button
            onClick={toggleSpeed}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-amber-300 transition"
            title="Adjust Scroll Speed"
          >
            <FastForward className="h-3.5 w-3.5" />
            <span>{scrollSpeed}X</span>
          </button>

          <button
            onClick={handleResetScroll}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition"
            title="Reset Scroll to Top"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={fetchFighterTale}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition"
            title="Regenerate Lore Story"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ANIMATED SCROLLING TEXT CONTAINER */}
      <div className="relative h-28 sm:h-36 w-full rounded-xl bg-zinc-950/80 border border-amber-900/40 p-3 sm:p-4 overflow-hidden shadow-inner">
        {/* Top & Bottom Vignette Overlay for Arcade Scroll Viewport */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />

        {/* Floating Haki Embers Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />

        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-3 text-amber-400 font-mono text-xs animate-pulse">
            <Flame className="h-5 w-5 animate-bounce" />
            <span>Procedurally Chronicling Matchup Lore with Gemini AI...</span>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="h-full w-full overflow-y-auto no-scrollbar scroll-smooth pr-1"
            style={{ scrollBehavior: 'auto' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-serif text-xs sm:text-sm md:text-base text-amber-100/90 leading-relaxed tracking-wide text-justify space-y-2.5"
            >
              <p className="first-letter:text-2xl sm:first-letter:text-3xl first-letter:font-black first-letter:font-['Cinzel'] first-letter:text-amber-400 first-letter:mr-1">
                {tale?.narrative}
              </p>
            </motion.div>
          </div>
        )}
      </div>

      {/* CLASH MOTTO FOOTER */}
      {tale?.clashMotto && !isLoading && (
        <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-center text-center">
          <p className="font-['Cinzel'] text-xs sm:text-sm font-bold italic text-amber-300 tracking-wide drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            ⚡ {tale.clashMotto} ⚡
          </p>
        </div>
      )}
    </div>
  );
};

function getFallbackTale(team1: Team, team2: Team, stage: StageInfo): FighterTaleData {
  const t1Name = team1.name || team1.fighters[0]?.name || 'Team 1';
  const t2Name = team2.name || team2.fighters[0]?.name || 'Team 2';
  return {
    title: `CHRONICLE OF INHERITED WILL: ${t1Name.toUpperCase()} VS ${t2Name.toUpperCase()}`,
    chapter: 'GRAND LINE CHRONICLE #892',
    narrative: `The turbulent waters of the Grand Line rage as ${t1Name} locks eyes with ${t2Name} at ${stage.name}. Bounties in the billions hang in the balance, and centuries of inherited willpower clash under the dark sky. Neither captain will step back—for on these seas, only the victor carves their name into the immortal pages of history!`,
    rivalryType: 'HISTORICAL DESTINY DUEL',
    clashMotto: '"He who holds the strongest conviction commands the waves!"',
  };
}
