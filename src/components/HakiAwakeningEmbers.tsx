import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

interface Props {
  isActive: boolean;
  className?: string;
}

interface EmberNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = ['#ef4444', '#a855f7', '#fbbf24', '#ffffff']; // Red, Purple, Gold, White

export const HakiAwakeningEmbers: React.FC<Props> = React.memo(({ isActive, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instanceIdRef = useRef<string>(`haki_embers_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (!isActive) return;

    const instanceId = instanceIdRef.current;
    const embers: EmberNode[] = [];
    const maxEmbers = 32;

    const createEmber = (width: number, height: number): EmberNode => {
      const isHands = Math.random() > 0.35;
      const x = isHands
        ? (Math.random() > 0.5 ? Math.random() * width * 0.25 : width * 0.75 + Math.random() * width * 0.25)
        : width * 0.15 + Math.random() * width * 0.7;
      const y = isHands ? height * 0.45 + Math.random() * height * 0.25 : height * 0.8 + Math.random() * height * 0.2;

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(1.5 + Math.random() * 2.5),
        size: 2.5 + Math.random() * 5.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: 1.0 + Math.random() * 1.2,
      };
    };

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 300;
      const height = rect.height || 300;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      while (embers.length < maxEmbers) {
        embers.push(createEmber(width, height));
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.life += dt;

        const progress = e.life / e.maxLife;
        if (progress >= 1) {
          embers.splice(i, 1);
          continue;
        }

        const alpha = Math.sin(progress * Math.PI);
        const radius = e.size * (1 - progress * 0.4);

        ctx.fillStyle = e.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = d3.scaleLinear().domain([0, 1]).range([4, 12])(progress);
        ctx.beginPath();
        ctx.arc(e.x, e.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={`absolute -inset-8 pointer-events-none z-20 overflow-visible ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
});

HakiAwakeningEmbers.displayName = 'HakiAwakeningEmbers';
export default HakiAwakeningEmbers;
