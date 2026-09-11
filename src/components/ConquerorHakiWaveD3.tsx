import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

interface ConquerorHakiWaveD3Props {
  isActive: boolean;
  winnerSide?: 'team1' | 'team2';
  onComplete: () => void;
}

export const ConquerorHakiWaveD3: React.FC<ConquerorHakiWaveD3Props> = React.memo(({
  isActive,
  winnerSide = 'team1',
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const elapsedRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(`haki_wave_d3_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (!isActive) {
      elapsedRef.current = 0;
      return;
    }

    const instanceId = instanceIdRef.current;
    const duration = 1.6; // 1.6 seconds shockwave animation
    elapsedRef.current = 0;

    const numCracks = 24;
    const cracks = d3.range(numCracks).map((i) => {
      const angle = (i / numCracks) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 150 + Math.random() * 250;
      return { angle, speed };
    });

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth || 800;
      const height = rect.height || window.innerHeight || 450;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      elapsedRef.current += dt;
      const progress = Math.min(1.0, elapsedRef.current / duration);

      const originX = winnerSide === 'team1' ? width * 0.25 : width * 0.75;
      const originY = height * 0.5;

      // 1. D3 RADIATING SHOCKWAVE CIRCLES
      const numRings = 5;
      const scaleRadius = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width * 1.4]);

      const currentBaseRadius = scaleRadius(progress);

      for (let r = 0; r < numRings; r++) {
        const ringProgress = (progress - (r * 0.12));
        if (ringProgress <= 0) continue;

        const radius = scaleRadius(ringProgress);
        const opacity = (1.0 - ringProgress) * 0.8;

        const pathGen = d3.arc<any, any>()
          .innerRadius(radius - 8)
          .outerRadius(radius)
          .startAngle(0)
          .endAngle(Math.PI * 2);

        ctx.save();
        ctx.translate(originX, originY);
        ctx.fillStyle = winnerSide === 'team1' ? '#c084fc' : '#f43f5e';
        ctx.shadowColor = winnerSide === 'team1' ? '#a855f7' : '#e11d48';
        ctx.shadowBlur = 24;
        ctx.globalAlpha = opacity;

        ctx.beginPath();
        pathGen({} as any);
        ctx.fill();
        ctx.restore();
      }

      // 2. CONQUEROR'S BLACK & RED LIGHTNING BOLTS (D3 Line Generator)
      ctx.save();
      ctx.translate(originX, originY);
      cracks.forEach((crack) => {
        const length = crack.speed * progress;
        const targetX = Math.cos(crack.angle) * length;
        const targetY = Math.sin(crack.angle) * length;

        const segments = 8;
        const boltPoints: [number, number][] = d3.range(segments).map((s) => {
          const sFrac = s / (segments - 1);
          const baseDist = sFrac * length;
          const noiseX = (Math.random() - 0.5) * 14;
          const noiseY = (Math.random() - 0.5) * 14;

          const px = Math.cos(crack.angle) * baseDist + noiseX;
          const py = Math.sin(crack.angle) * baseDist + noiseY;
          return [px, py];
        });

        const lineGen = d3.line<[number, number]>()
          .x((d) => d[0])
          .y((d) => d[1])
          .context(ctx);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.globalAlpha = (1.0 - progress) * 0.9;
        ctx.beginPath();
        lineGen(boltPoints);
        ctx.stroke();

        ctx.strokeStyle = winnerSide === 'team1' ? '#a855f7' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = winnerSide === 'team1' ? '#c084fc' : '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        lineGen(boltPoints);
        ctx.stroke();
      });
      ctx.restore();

      // Screen Jitter Flash
      if (progress < 0.25) {
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.35;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();

      if (elapsedRef.current >= duration) {
        unsubscribe();
        onComplete();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isActive, winnerSide, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[210] pointer-events-none overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
});

ConquerorHakiWaveD3.displayName = 'ConquerorHakiWaveD3';
export default ConquerorHakiWaveD3;
