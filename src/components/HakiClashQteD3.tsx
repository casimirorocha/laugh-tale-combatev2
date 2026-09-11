import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { Zap, ShieldAlert, Award } from 'lucide-react';

interface HakiClashQteD3Props {
  player1Name?: string;
  player2Name?: string;
  p1MashKey?: string;
  p2MashKey?: string;
  isCpuVsCpu?: boolean;
  onComplete: (winner: 'team1' | 'team2') => void;
}

export const HakiClashQteD3: React.FC<HakiClashQteD3Props> = React.memo(({
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  p1MashKey = 'F',
  p2MashKey = 'J',
  isCpuVsCpu = false,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(5.0);
  const [tension, setTension] = useState<number>(50); // 0 (P2 wins) to 100 (P1 wins)
  
  const tensionRef = useRef<number>(50);
  const phaseRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(`haki_clash_qte_${Math.random().toString(36).substring(2, 9)}`);

  // Detect keyboard mashing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === p1MashKey.toUpperCase()) {
        tensionRef.current = Math.min(98, tensionRef.current + 4.5);
        setTension(tensionRef.current);
      }
      if (!isCpuVsCpu && key === p2MashKey.toUpperCase()) {
        tensionRef.current = Math.max(2, tensionRef.current - 4.5);
        setTension(tensionRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [p1MashKey, p2MashKey, isCpuVsCpu]);

  // CPU / Passive decay simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate CPU mash strength (P2 CPU or P1+P2 if CpuVsCpu)
      const cpuPower = 2.5 + Math.random() * 3.5;
      if (isCpuVsCpu) {
        // Both CPUs clash randomly
        const p1Power = 2.5 + Math.random() * 3.5;
        tensionRef.current = Math.max(5, Math.min(95, tensionRef.current + p1Power - cpuPower));
      } else {
        // CPU mashing to counter player
        tensionRef.current = Math.max(5, tensionRef.current - cpuPower);
      }
      
      // Pull tension slightly toward center if inactive (passive decay)
      const diff = 50 - tensionRef.current;
      tensionRef.current += diff * 0.05;

      setTension(tensionRef.current);
    }, 120);

    return () => clearInterval(interval);
  }, [isCpuVsCpu]);

  // QTE Countdown timer
  useEffect(() => {
    let currentVal = 5.0;
    const timer = setInterval(() => {
      currentVal -= 0.1;
      if (currentVal <= 0.05) {
        clearInterval(timer);
        setTimeLeft(0);
        // Trigger winner on expiration outside any component rendering flow
        const winner = tensionRef.current >= 50 ? 'team1' : 'team2';
        onComplete(winner);
      } else {
        setTimeLeft(currentVal);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  // D3-powered lightning rope visualization
  useEffect(() => {
    const instanceId = instanceIdRef.current;

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 550;
      const height = rect.height || 140;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      phaseRef.current += dt * 18;

      // 1. Calculate rope bend based on tension balance
      const currentTension = tensionRef.current;
      const midX = (currentTension / 100) * width;
      const midY = height / 2;

      // Draw left anchor (Cyan)
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(30, midY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw right anchor (Rose)
      ctx.fillStyle = '#fb7185';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(width - 30, midY, 6, 0, Math.PI * 2);
      ctx.fill();

      // 2. D3 Curve for tension line
      const numPoints = 15;
      const clashPoints: [number, number][] = d3.range(numPoints).map((i) => {
        const fraction = i / (numPoints - 1);
        const x = 30 + fraction * (width - 60);

        // Calculate a sine distortion based on clash shockwaves
        const wave = Math.sin(phaseRef.current + fraction * Math.PI * 3) * 6;
        
        // Base alignment follows a parabola towards the clash center
        const distanceToCenter = 1 - Math.abs(fraction - currentTension / 100);
        const bend = distanceToCenter * Math.sin(phaseRef.current * 1.5) * 16;
        
        return [x, midY + wave + bend];
      });

      const lineGen = d3.line<[number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(d3.curveBasis)
        .context(ctx);

      // Red/Purple/Gold energy streams clashing
      const streams = [
        { color: '#fbbf24', offset: 0, width: 3.5, blur: 14 },
        { color: '#c084fc', offset: 1.5, width: 2.5, blur: 8 },
        { color: '#ffffff', offset: 3.0, width: 1.5, blur: 4 },
      ];

      streams.forEach((stream) => {
        ctx.strokeStyle = stream.color;
        ctx.shadowColor = stream.color;
        ctx.shadowBlur = stream.blur;
        ctx.lineWidth = stream.width;
        ctx.globalAlpha = 0.85;

        ctx.beginPath();
        lineGen(clashPoints);
        ctx.stroke();
      });

      // 3. Central Lightning Impact Sparkles
      ctx.save();
      ctx.translate(midX, midY);
      const spikes = 10;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;

      for (let i = 0; i < spikes; i++) {
        const angle = (i / spikes) * Math.PI * 2 + phaseRef.current * 0.1;
        const length = 20 + Math.random() * 25;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md select-none pointer-events-auto">
      <div className="bg-zinc-950 border-2 border-amber-500/80 rounded-2xl p-6 max-w-xl w-full mx-4 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center gap-4 text-center">
        {/* Banner header */}
        <div className="flex items-center gap-2 text-amber-400 font-black tracking-widest text-sm animate-bounce">
          <Zap className="w-5 h-5 animate-pulse" />
          <span>CONQUEROR'S HAKI CLASH TRIGGERED</span>
        </div>

        <h3 className="font-['Cinzel'] text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
          MASH ATTACK TO DOMINATE!
        </h3>

        {/* Dynamic Mash Indicator Guides */}
        <div className="flex w-full justify-between items-center px-4 font-mono text-xs">
          <div className="flex flex-col items-center gap-1">
            <span className="text-cyan-400 font-bold">{player1Name}</span>
            <span className="bg-cyan-950 text-cyan-200 font-black border border-cyan-500 px-3 py-1.5 rounded-lg text-lg shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-pulse">
              [{p1MashKey}]
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex flex-col items-center">
            <span className="text-red-400 text-[10px] font-bold">TIME REMAINING</span>
            <span className="text-xl font-black text-white">{timeLeft.toFixed(1)}s</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-rose-400 font-bold">{player2Name}</span>
            <span className="bg-rose-950 text-rose-200 font-black border border-rose-500 px-3 py-1.5 rounded-lg text-lg shadow-[0_0_10px_rgba(244,63,94,0.4)]">
              {isCpuVsCpu ? 'AUTO (CPU)' : `[${p2MashKey}]`}
            </span>
          </div>
        </div>

        {/* D3 Tension Canvas */}
        <div className="w-full h-24 rounded bg-zinc-900 border border-zinc-800 relative overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Tension Balance Bar representation */}
        <div className="w-full flex justify-between text-[10px] font-mono text-zinc-500 px-2">
          <span>P1 POWER: {Math.round(tension)}%</span>
          <span>P2 POWER: {Math.round(100 - tension)}%</span>
        </div>
      </div>
    </div>
  );
});

HakiClashQteD3.displayName = 'HakiClashQteD3';
export default HakiClashQteD3;
