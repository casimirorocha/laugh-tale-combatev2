import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StageInfo } from '../types/fighter';
import {
  CrowdExcitementTier,
  CrowdFlashPoint,
  CrowdShoutBubble,
} from '../types/crowd';
import { Zap, Flame } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface BackgroundCrowdSystemProps {
  intensity: number; // 0 to 100
  tier: CrowdExcitementTier;
  tierLabel: string;
  tierColor: string;
  damageFrequency: number; // hits per second
  recentDamageVelocity: number; // damage per 3.5s
  recentHitCount: number;
  isJoltActive: boolean;
  flashPoints: CrowdFlashPoint[];
  shoutBubbles: CrowdShoutBubble[];
  stage?: StageInfo;
  isClashActive?: boolean;
  activeComboHits?: number;
  onCheerTap?: () => void;
}

export const BackgroundCrowdSystem: React.FC<BackgroundCrowdSystemProps> = ({
  intensity,
  tier,
  tierLabel,
  tierColor,
  damageFrequency,
  recentDamageVelocity,
  recentHitCount,
  isJoltActive,
  flashPoints,
  shoutBubbles,
  stage,
  isClashActive = false,
  activeComboHits = 0,
  onCheerTap,
}) => {

  // Calculate dynamic opacity: from subtle 0.22 at idle calm to 0.94 at peak pandemonium
  const crowdOpacity = useMemo(() => {
    const raw = 0.22 + (intensity / 100) * 0.72;
    return Math.min(0.96, Math.max(0.20, Number(raw.toFixed(2))));
  }, [intensity]);

  // Dynamic animation speeds based on intensity
  // At 0% intensity: slow 2.4s calm sway
  // At 100% intensity: rapid 0.45s frenzy bounce
  const cheerDuration = useMemo(() => {
    const dur = Math.max(0.42, 2.3 - (intensity / 100) * 1.88);
    return `${dur.toFixed(2)}s`;
  }, [intensity]);

  const waveDuration = useMemo(() => {
    const dur = Math.max(0.5, 2.0 - (intensity / 100) * 1.5);
    return `${dur.toFixed(2)}s`;
  }, [intensity]);

  const flagDuration = useMemo(() => {
    const dur = Math.max(0.7, 3.2 - (intensity / 100) * 2.3);
    return `${dur.toFixed(2)}s`;
  }, [intensity]);

  // Jump height scaling
  const bounceY = useMemo(() => {
    if (intensity < 25) return 0;
    if (intensity < 50) return -6;
    if (intensity < 75) return -12;
    if (intensity < 90) return -18;
    return -24;
  }, [intensity]);

  // Stage-specific accent nuances
  const stageAccent = stage?.accentColor || '#38bdf8';
  const stageId = stage?.id || '';

  const handleManualCheer = () => {
    soundManager.playCrowdCheer(Math.max(65, intensity));
    if (onCheerTap) onCheerTap();
  };

  return (
    <div
      id="background-crowd-system"
      className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden"
      aria-label="Dynamic Arena Background Crowd"
    >
      {/* 1. DISTANT STADIUM GRANDSTANDS & BLEACHERS */}
      <div
        className="absolute bottom-[24%] left-0 right-0 h-[28%] transition-opacity duration-300 ease-out"
        style={{
          opacity: crowdOpacity * 0.75,
        }}
      >
        {/* Tiered bleacher architectural lines */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-white/10" />
        <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-white/10" />
        <div className="absolute top-[70%] left-0 right-0 h-[1px] bg-white/10" />

        {/* Stadium Floodlight Cones (subtle glow on high excitement) */}
        {intensity >= 45 && (
          <>
            <div
              className="absolute -top-16 left-[12%] w-32 h-64 bg-gradient-to-b from-white/15 to-transparent blur-xl pointer-events-none transform -rotate-12 transition-opacity duration-500"
              style={{ opacity: (intensity - 45) / 55 }}
            />
            <div
              className="absolute -top-16 right-[12%] w-32 h-64 bg-gradient-to-b from-white/15 to-transparent blur-xl pointer-events-none transform rotate-12 transition-opacity duration-500"
              style={{ opacity: (intensity - 45) / 55 }}
            />
          </>
        )}

        {/* Distant dense crowd head silhouettes pattern */}
        <svg
          className="w-full h-full object-cover"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
          fill="#090d16"
        >
          {/* Back Tier Heads */}
          <path
            d="M0 120 L0 50 Q 20 35 40 50 Q 60 30 80 50 Q 100 25 120 50 Q 140 38 160 50 Q 180 28 200 50 Q 220 32 240 50 Q 260 22 280 50 Q 300 36 320 50 Q 340 28 360 50 Q 380 34 400 50 Q 420 20 440 50 Q 460 35 480 50 Q 500 25 520 50 Q 540 32 560 50 Q 580 20 600 50 Q 620 35 640 50 Q 660 26 680 50 Q 700 34 720 50 Q 740 22 760 50 Q 780 36 800 50 Q 820 25 840 50 Q 860 32 880 50 Q 900 20 920 50 Q 940 35 960 50 Q 980 28 1000 50 Q 1020 34 1040 50 Q 1060 22 1080 50 Q 1100 35 1120 50 Q 1140 26 1160 50 Q 1180 34 1200 50 L1200 120 Z"
            fill="#080c14"
          />
          {/* Mid Tier Heads */}
          <path
            d="M0 120 L0 75 Q 30 55 60 75 Q 90 48 120 75 Q 150 52 180 75 Q 210 45 240 75 Q 270 58 300 75 Q 330 42 360 75 Q 390 54 420 75 Q 450 46 480 75 Q 510 58 540 75 Q 570 42 600 75 Q 630 52 660 75 Q 690 44 720 75 Q 750 56 780 75 Q 810 45 840 75 Q 870 54 900 75 Q 930 42 960 75 Q 990 55 1020 75 Q 1050 48 1080 75 Q 1110 56 1140 75 Q 1170 46 1200 75 L1200 120 Z"
            fill="#0e1524"
          />
        </svg>

        {/* Dynamic Camera Flashbulbs in the Bleachers */}
        {flashPoints.map((flash) => (
          <div
            key={flash.id}
            className="absolute rounded-full crowd-flash-point pointer-events-none"
            style={{
              left: `${flash.x}%`,
              top: `${flash.y}%`,
              width: `${flash.size}px`,
              height: `${flash.size}px`,
              backgroundColor: flash.color || '#ffffff',
              boxShadow: `0 0 ${flash.size * 1.5}px ${flash.size * 0.8}px ${flash.color || '#ffffff'}, 0 0 ${flash.size * 3}px rgba(255,255,255,0.8)`,
            }}
          />
        ))}
      </div>

      {/* 2. MIDGROUND ARENA BALCONY & CHEERING SILHOUETTE CHARACTERS */}
      <div
        className={`absolute bottom-[20%] left-0 right-0 h-[22%] transition-opacity duration-250 ease-out ${
          isJoltActive ? 'crowd-jolt-active' : ''
        }`}
        style={{
          opacity: crowdOpacity,
          filter: `drop-shadow(0 -4px 12px rgba(0, 0, 0, 0.8))`,
        }}
      >
        {/* Balcony Railing Bar */}
        <div className="absolute bottom-[2px] left-0 right-0 h-3 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-t border-b border-zinc-700/60 shadow-lg z-20">
          <div className="flex justify-between px-6 h-full items-center">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-600/80 shadow-inner" />
            ))}
          </div>
        </div>

        {/* Individual SVG Silhouette Spectators with Dynamic Cheering Animations */}
        <div className="absolute inset-0 flex items-end justify-around px-2 pb-2 z-10">
          {/* 1. Luffy Fan / Straw Hat Spectator (Jumping & Both Fists Pumped) */}
          <div
            className="relative flex flex-col items-center origin-bottom"
            style={{
              animationName: intensity >= 45 ? 'crowdBounce' : 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              transform: `translate3d(0, ${bounceY}px, 0)`,
              '--anim-delay': '0.05s',
            }}
          >
            <svg width="46" height="72" viewBox="0 0 46 72" fill="#0d1117">
              {/* Straw hat brim silhouette */}
              <ellipse cx="23" cy="18" rx="14" ry="4" fill="#161b22" />
              <path d="M16 18 Q23 10 30 18 Z" fill="#0d1117" />
              {/* Head */}
              <circle cx="23" cy="22" r="7" fill="#0d1117" />
              {/* Torso */}
              <path d="M15 28 L31 28 L28 55 L18 55 Z" fill="#0d1117" />
              {/* Left Arm Raised High with Clenched Fist */}
              <path
                d="M16 30 Q8 15 6 4"
                stroke="#0d1117"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: 'crowdArmWave', animationDuration: waveDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                }}
              />
              {/* Right Arm Raised High */}
              <path
                d="M30 30 Q38 15 40 4"
                stroke="#0d1117"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: 'crowdArmWave', animationDuration: waveDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                  '--anim-delay': '0.2s',
                }}
              />
            </svg>
          </div>

          {/* 2. Marine Soldier Silhouette (Standing tall, cheering with salute / fists) */}
          <div
            className="relative flex flex-col items-center origin-bottom"
            style={{
              animationName: 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              '--anim-delay': '0.35s',
            }}
          >
            <svg width="48" height="74" viewBox="0 0 48 74" fill="#0b0f19">
              {/* Marine Cap Silhouette with bill */}
              <path d="M16 14 Q24 7 32 14 L36 18 L12 18 Z" fill="#0b0f19" />
              <ellipse cx="24" cy="18" rx="11" ry="2.5" fill="#1e293b" />
              {/* Head */}
              <circle cx="24" cy="23" r="7.5" fill="#0b0f19" />
              {/* Marine Officer Coat draped over shoulders */}
              <path d="M10 30 Q24 26 38 30 L42 62 L6 62 Z" fill="#0b0f19" />
              {/* Cheering Arm */}
              <path
                d="M13 32 Q7 20 12 8"
                stroke="#0b0f19"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: intensity >= 40 ? 'crowdArmWave' : 'none', animationDuration: waveDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                }}
              />
              <path
                d="M35 32 Q42 22 36 10"
                stroke="#0b0f19"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* 3. Flag Waving Spectator (Waving large Jolly Roger / Grand Line Tournament Banner) */}
          <div
            className="relative flex flex-col items-center origin-bottom hidden sm:flex"
            style={{
              animationName: 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              '--anim-delay': '0.15s',
            }}
          >
            {/* Waving Flag Mast & Fabric */}
            <div
              className="absolute -top-10 -left-6 origin-bottom-right"
              style={{
                animationName: 'crowdFlagWave', animationDuration: flagDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              }}
            >
              <svg width="54" height="42" viewBox="0 0 54 42" fill="none">
                {/* Flag pole */}
                <line x1="12" y1="42" x2="38" y2="4" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                {/* Flowing Banner Fabric */}
                <path
                  d="M36 6 Q20 2 6 8 Q20 18 32 16 Q18 26 4 28 L10 32 Q26 26 38 24 Z"
                  fill={stageId === 'stage_marineford' ? '#0284c7' : stageId === 'stage_onigashima' ? '#9333ea' : '#dc2626'}
                  opacity={0.85}
                />
                {/* Skull / Crest emblem */}
                <circle cx="20" cy="14" r="3.5" fill="#ffffff" opacity={0.7} />
              </svg>
            </div>

            <svg width="42" height="68" viewBox="0 0 42 68" fill="#090d16">
              <circle cx="21" cy="18" r="7" fill="#090d16" />
              <path d="M14 26 L28 26 L26 54 L16 54 Z" fill="#090d16" />
              <path d="M14 28 Q24 16 34 22" stroke="#090d16" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* 4. Giant Brawny Pirate (Broad Shouldered with Horned Helmet & Tankard) */}
          <div
            className="relative flex flex-col items-center origin-bottom"
            style={{
              animationName: intensity >= 60 ? 'crowdBounce' : 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              transform: `translate3d(0, ${bounceY * 0.7}px, 0)`,
              '--anim-delay': '0.45s',
            }}
          >
            <svg width="58" height="82" viewBox="0 0 58 82" fill="#070a10">
              {/* Viking / Pirate Horns */}
              <path d="M16 16 Q10 8 6 12 Q14 18 18 20" fill="#070a10" />
              <path d="M42 16 Q48 8 52 12 Q44 18 40 20" fill="#070a10" />
              {/* Head with beard */}
              <circle cx="29" cy="22" r="9" fill="#070a10" />
              <path d="M22 26 Q29 36 36 26 Z" fill="#070a10" />
              {/* Massive Torso */}
              <path d="M12 32 L46 32 L42 68 L16 68 Z" fill="#070a10" />
              {/* Raised Left Arm with Giant Tankard */}
              <path
                d="M14 34 Q4 22 8 10"
                stroke="#070a10"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Tankard silhouette */}
              <rect x="3" y="4" width="10" height="12" rx="2" fill="#1e293b" />
              <path d="M13 7 Q17 10 13 13" stroke="#1e293b" strokeWidth="2" fill="none" />
              {/* Right Arm Pumping Fist */}
              <path
                d="M44 34 Q54 20 50 6"
                stroke="#070a10"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: 'crowdArmWave', animationDuration: waveDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                  '--anim-delay': '0.1s',
                }}
              />
            </svg>
          </div>

          {/* 5. Excited Spectator Leaning Over Balcony (Clapping & Shouting) */}
          <div
            className="relative flex flex-col items-center origin-bottom hidden md:flex"
            style={{
              animationName: 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              '--anim-delay': '0.22s',
            }}
          >
            <svg width="44" height="66" viewBox="0 0 44 66" fill="#0a0e17">
              {/* Head leaning forward */}
              <circle cx="22" cy="18" r="7.5" fill="#0a0e17" />
              {/* Bandana tail */}
              <path d="M15 16 Q8 18 10 24" stroke="#0a0e17" strokeWidth="3" fill="none" />
              {/* Torso leaning */}
              <path d="M14 26 L30 26 L28 54 L16 54 Z" fill="#0a0e17" />
              {/* Clapping Hands */}
              <path
                d="M15 28 Q22 22 28 28"
                stroke="#0a0e17"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: 'crowdBounce', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                }}
              />
            </svg>
          </div>

          {/* 6. Broadcast Den Den Mushi News Reporter Silhouette */}
          <div
            className="relative flex flex-col items-center origin-bottom hidden lg:flex"
            style={{
              animationName: 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              '--anim-delay': '0.5s',
            }}
          >
            <svg width="50" height="72" viewBox="0 0 50 72" fill="#080c14">
              {/* Reporter fedora hat */}
              <ellipse cx="25" cy="16" rx="13" ry="3.5" fill="#080c14" />
              <path d="M18 16 Q25 9 32 16 Z" fill="#080c14" />
              <circle cx="25" cy="21" r="7" fill="#080c14" />
              {/* Body */}
              <path d="M16 28 L34 28 L30 58 L18 58 Z" fill="#080c14" />
              {/* Holding Den Den Mushi snail microphone up */}
              <path d="M32 30 Q44 24 38 14" stroke="#080c14" strokeWidth="5" strokeLinecap="round" fill="none" />
              {/* Snail shell */}
              <circle cx="38" cy="12" r="5" fill="#1e293b" />
              {/* Eye stalks */}
              <line x1="36" y1="9" x2="35" y2="5" stroke="#1e293b" strokeWidth="1.5" />
              <line x1="40" y1="9" x2="41" y2="5" stroke="#1e293b" strokeWidth="1.5" />
            </svg>
          </div>

          {/* 7. Frenzied Leaping Fan (High Jumps during high damage frequency) */}
          <div
            className="relative flex flex-col items-center origin-bottom"
            style={{
              animationName: intensity >= 30 ? 'crowdBounce' : 'crowdSway', animationDuration: cheerDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
              transform: `translate3d(0, ${bounceY * 1.15}px, 0)`,
              '--anim-delay': '0.12s',
            }}
          >
            <svg width="46" height="76" viewBox="0 0 46 76" fill="#090d16">
              {/* Wild Spiky Anime Hair Silhouette */}
              <path d="M14 16 L10 6 L18 11 L23 2 L28 11 L36 6 L32 16 Z" fill="#090d16" />
              <circle cx="23" cy="22" r="7" fill="#090d16" />
              <path d="M15 29 L31 29 L28 58 L17 58 Z" fill="#090d16" />
              {/* Both Arms Wildly Waving in air */}
              <path
                d="M16 30 Q6 16 8 2"
                stroke="#090d16"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: 'crowdArmWave', animationDuration: waveDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                  '--anim-delay': '0.05s',
                }}
              />
              <path
                d="M30 30 Q40 16 38 2"
                stroke="#090d16"
                strokeWidth="5.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  animationName: 'crowdArmWave', animationDuration: waveDuration, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out',
                  '--anim-delay': '0.25s',
                }}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC MANGA SHOUT BUBBLES FROM EXCITED CROWD */}
      <AnimatePresence>
        {shoutBubbles.map((bubble) => {
          const borderColor =
            bubble.colorTheme === 'gold'
              ? 'border-amber-400 bg-amber-950/90 text-amber-200 shadow-amber-500/50'
              : bubble.colorTheme === 'purple'
              ? 'border-purple-400 bg-purple-950/90 text-purple-200 shadow-purple-500/50'
              : bubble.colorTheme === 'red'
              ? 'border-red-500 bg-red-950/90 text-red-200 shadow-red-500/50'
              : bubble.colorTheme === 'cyan'
              ? 'border-cyan-400 bg-cyan-950/90 text-cyan-200 shadow-cyan-500/50'
              : 'border-yellow-400 bg-yellow-950/90 text-yellow-200 shadow-yellow-500/50';

          return (
            <div
              key={bubble.id}
              className="absolute pointer-events-none crowd-shout-bubble z-30"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                transform: `scale(${bubble.scale})`,
              }}
            >
              <div
                className={`relative px-3 py-1.5 rounded-xl border-2 font-black tracking-wider uppercase text-xs shadow-lg backdrop-blur-sm flex flex-col items-center whitespace-nowrap ${borderColor}`}
                style={{
                  fontFamily: '"Impact", "Arial Black", sans-serif',
                }}
              >
                <span>{bubble.text}</span>
                {bubble.subtext && (
                  <span className="text-[9px] font-sans opacity-85">{bubble.subtext}</span>
                )}
                {/* Comic Speech Bubble Triangle Pointer */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-inherit"
                />
              </div>
            </div>
          );
        })}
      </AnimatePresence>

      {/* 4. FOREGROUND CORNER SPECTATOR SILHOUETTES (Soft Vignette Depth) */}
      <div
        className="absolute bottom-0 left-0 w-36 h-28 pointer-events-none transition-opacity duration-300"
        style={{ opacity: crowdOpacity * 0.45 }}
      >
        <svg viewBox="0 0 140 110" fill="#04060a" className="w-full h-full">
          <ellipse cx="20" cy="110" rx="45" ry="35" />
          <ellipse cx="65" cy="105" rx="35" ry="30" />
          <circle cx="35" cy="70" r="18" />
          <path d="M45 70 Q70 50 65 30" stroke="#04060a" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>

      <div
        className="absolute bottom-0 right-0 w-36 h-28 pointer-events-none transition-opacity duration-300"
        style={{ opacity: crowdOpacity * 0.45 }}
      >
        <svg viewBox="0 0 140 110" fill="#04060a" className="w-full h-full">
          <ellipse cx="120" cy="110" rx="45" ry="35" />
          <ellipse cx="75" cy="105" rx="35" ry="30" />
          <circle cx="105" cy="70" r="18" />
          <path d="M95 70 Q70 50 75 30" stroke="#04060a" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};
