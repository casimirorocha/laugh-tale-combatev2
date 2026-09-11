import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { ActiveTauntState, CrowdReactionType } from '../types/battleTaunts';
import { Volume2, Sparkles, Zap, ShieldAlert, Smile } from 'lucide-react';

interface BattleTauntFXProps {
  activeTaunt: ActiveTauntState | null;
}

export const BattleTauntFX: React.FC<BattleTauntFXProps> = React.memo(({ activeTaunt }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(`taunt_fx_d3_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (!activeTaunt) return;

    const instanceId = instanceIdRef.current;
    const { taunt, side } = activeTaunt;
    const isLeft = side === 'team1';

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth || 800;
      const height = rect.height || window.innerHeight || 600;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      phaseRef.current += dt * 3.5;

      const cx = isLeft ? width * 0.25 : width * 0.75;
      const cy = height * 0.5;

      // Render motion-specific D3 energy geometries
      ctx.save();
      ctx.translate(cx, cy);

      const radiusScale = d3.scaleLinear().domain([0, 10]).range([30, 160]);
      const currentRadius = radiusScale((phaseRef.current * 3) % 10);

      // Radial shockwave ring
      ctx.strokeStyle = taunt.crowdReaction === 'cheer_hype' ? '#f59e0b' : taunt.crowdReaction === 'gasp_shock' ? '#22d3ee' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.globalAlpha = Math.max(0, 1 - (currentRadius / 160));
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      // D3 Energy Starburst generator
      const rays = 12;
      const rayPoints: [number, number][] = d3.range(rays * 2).map((i) => {
        const angle = (i / (rays * 2)) * Math.PI * 2 + phaseRef.current * 0.2;
        const r = i % 2 === 0 ? 80 + Math.sin(phaseRef.current * 2) * 15 : 35;
        return [Math.cos(angle) * r, Math.sin(angle) * r];
      });

      const lineGen = d3.line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveLinearClosed)
        .context(ctx);

      ctx.fillStyle = ctx.strokeStyle;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      lineGen(rayPoints);
      ctx.fill();

      ctx.restore();
      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, [activeTaunt]);

  if (!activeTaunt) return null;

  const { taunt, side, fighterName } = activeTaunt;
  const isLeft = side === 'team1';

  const getReactionTheme = (type: CrowdReactionType) => {
    switch (type) {
      case 'cheer_hype':
        return {
          border: 'border-amber-400',
          bg: 'from-amber-950/90 via-orange-950/80 to-stone-950/95',
          text: 'text-amber-300',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />,
        };
      case 'gasp_shock':
        return {
          border: 'border-cyan-400',
          bg: 'from-cyan-950/90 via-blue-950/80 to-stone-950/95',
          text: 'text-cyan-300',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <Zap className="w-4 h-4 text-cyan-300 animate-bounce" />,
        };
      case 'laughter_amused':
        return {
          border: 'border-yellow-400',
          bg: 'from-yellow-950/90 via-lime-950/80 to-stone-950/95',
          text: 'text-yellow-300',
          badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          icon: <Smile className="w-4 h-4 text-yellow-300" />,
        };
      case 'whistle_boos':
        return {
          border: 'border-rose-500',
          bg: 'from-rose-950/90 via-red-950/80 to-stone-950/95',
          text: 'text-rose-300',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        };
      case 'chants_stadium':
      default:
        return {
          border: 'border-indigo-400',
          bg: 'from-indigo-950/90 via-purple-950/80 to-stone-950/95',
          text: 'text-indigo-300',
          badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          icon: <Volume2 className="w-4 h-4 text-indigo-300 animate-pulse" />,
        };
    }
  };

  const reactionTheme = getReactionTheme(taunt.crowdReaction);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex flex-col justify-between">
      {/* 1. D3 CANVAS BACKDROP ENERGY FX */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      {/* 2. TAUNT BANNER CARD OVERLAY */}
      <div className="w-full flex justify-center pt-8 z-10 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTaunt.id}
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`max-w-md w-full bg-gradient-to-r ${reactionTheme.bg} border-2 ${reactionTheme.border} rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col gap-2`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${reactionTheme.badgeBg} flex items-center gap-1.5`}>
                {reactionTheme.icon}
                {fighterName} TAUNT
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase">
                {side === 'team1' ? 'P1 SIDE' : 'P2 SIDE'}
              </span>
            </div>

            <p className={`font-['Cinzel'] text-base sm:text-lg font-black italic ${reactionTheme.text} leading-tight`}>
              &ldquo;{taunt.dialogueQuote}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px] font-mono text-zinc-400">
              <span className="text-emerald-400 font-bold">
                +{taunt.meterBoost} SUPER METER
              </span>
              <span>CROWD: {taunt.crowdReaction.replace('_', ' ').toUpperCase()}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});

BattleTauntFX.displayName = 'BattleTauntFX';
export default BattleTauntFX;
