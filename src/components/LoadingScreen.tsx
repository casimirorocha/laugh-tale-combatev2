import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { getTipsForCharacters } from '../data/combatTips';
import { Team } from '../types/fighter';

interface LoadingScreenProps {
  team1: Team;
  team2: Team;
  onFinished: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ team1, team2, onFinished }) => {
  const [tips, setTips] = useState<string[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceIdRef = useRef<string>(`loading_d3_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const fighterIds = [
      ...team1.fighters.map((f) => f.id),
      ...team2.fighters.map((f) => f.id),
    ];
    setTips(getTipsForCharacters(fighterIds));
  }, [team1, team2]);

  // D3 Canvas Stardust particle animation
  useEffect(() => {
    const instanceId = instanceIdRef.current;
    const count = 40;
    const particles = d3.range(count).map(() => ({
      x: Math.random() * (window.innerWidth || 800),
      y: Math.random() * (window.innerHeight || 600),
      r: Math.random() * 3 + 1,
      vy: -(Math.random() * 0.8 + 0.4),
      vx: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      color: Math.random() > 0.5 ? '#f59e0b' : '#38bdf8',
    }));

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || window.innerWidth || 800;
      const height = canvas.clientHeight || window.innerHeight || 600;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = d3.scaleLinear().domain([1, 4]).range([2, 8])(p.r);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onFinished, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [tips, onFinished]);

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden select-none">
      {/* Hardware Accelerated D3 Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40 z-0"
      />

      {/* Background Decorative Radial */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[20rem] font-black text-white/5 select-none font-serif">KOF</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-1 w-full bg-gradient-to-r from-transparent to-amber-500" />
            <h2 className="font-['Cinzel'] text-4xl font-bold tracking-widest text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              LOADING
            </h2>
            <div className="w-16 h-1 w-full bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </motion.div>

        {/* Tips Section */}
        <div className="w-full h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center px-4"
            >
              <p className="text-zinc-400 text-xs font-['Press_Start_2P'] mb-4 uppercase tracking-tighter">
                Did you know?
              </p>
              <p className="text-xl sm:text-2xl font-['Playfair_Display'] italic text-zinc-100 leading-relaxed max-w-lg mx-auto">
                &ldquo;{tips[currentTipIndex] || 'The sea is vast and full of legends...'}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="mt-16 w-full max-w-md">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-mono text-amber-500/70 uppercase">Establishing Haki Connection...</span>
            <span className="text-sm font-mono text-amber-500">{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full border border-zinc-800 p-0.5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
