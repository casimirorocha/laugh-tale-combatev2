import React, { useEffect, useRef } from 'react';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

export interface ParticleBurst {
  id: string;
  x: number; // Percentage from left of stage (e.g. 20, 50, 80)
  y: number; // Percentage from top of stage
  color: 'red' | 'purple' | 'amber' | 'cyan' | 'gray';
  type: 'clash' | 'critical' | 'haki';
}

interface HakiParticleEngineProps {
  bursts: ParticleBurst[];
  onBurstComplete: (id: string) => void;
}

interface CanvasParticle {
  burstId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'dust';
}

const COLOR_MAP: Record<string, { main: string; glow: string }> = {
  red: { main: '#ef4444', glow: '#dc2626' },
  purple: { main: '#a855f7', glow: '#7e22ce' },
  amber: { main: '#f59e0b', glow: '#d97706' },
  cyan: { main: '#22d3ee', glow: '#0891b2' },
  gray: { main: '#a1a1aa', glow: '#52525b' },
};

export const HakiParticleEngine: React.FC<HakiParticleEngineProps> = React.memo(({
  bursts,
  onBurstComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<CanvasParticle[]>([]);
  const processedBurstsRef = useRef<Set<string>>(new Set());
  const instanceIdRef = useRef<string>(`particle_engine_${Math.random().toString(36).substring(2, 9)}`);

  // Process incoming particle bursts
  useEffect(() => {
    if (!canvasRef.current || bursts.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.width;
    const height = rect.height || canvas.height;

    // Prune processed bursts set if bursts were cleared
    const currentBurstIds = new Set(bursts.map((b) => b.id));
    for (const id of processedBurstsRef.current) {
      if (!currentBurstIds.has(id)) {
        processedBurstsRef.current.delete(id);
      }
    }

    const unprocessed = bursts.filter((b) => !processedBurstsRef.current.has(b.id));
    if (unprocessed.length === 0) return;

    const newParticles: CanvasParticle[] = [];

    unprocessed.forEach((burst) => {
      processedBurstsRef.current.add(burst.id);
      const isClash = burst.type === 'clash';
      const isCrit = burst.type === 'critical';

      const posX = (burst.x / 100) * width;
      const posY = (burst.y / 100) * height;

      const colors = COLOR_MAP[burst.color] || COLOR_MAP.red;
      const sparkCount = isClash ? 20 : isCrit ? 14 : 8;
      const dustCount = isClash ? 4 : isCrit ? 2 : 1;

      // 1. Generate Sparks
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i * (360 / sparkCount) + Math.random() * 20) * (Math.PI / 180);
        const speed = (isClash ? 180 : isCrit ? 130 : 90) + Math.random() * 60;

        newParticles.push({
          burstId: burst.id,
          x: posX,
          y: posY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 2,
          color: colors.main,
          glowColor: colors.glow,
          alpha: 1.0,
          decay: 1.8 + Math.random() * 0.8,
          type: 'spark',
        });
      }

      // 2. Generate Dust
      for (let i = 0; i < dustCount; i++) {
        const speed = Math.random() * 20 + 5;
        const angle = Math.random() * Math.PI * 2;

        newParticles.push({
          burstId: burst.id,
          x: posX,
          y: posY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: (isClash ? 25 : isCrit ? 18 : 12) + Math.random() * 10,
          color: colors.glow,
          glowColor: colors.main,
          alpha: 0.5,
          decay: 1.2 + Math.random() * 0.5,
          type: 'dust',
        });
      }
    });

    // Cap total particles to avoid excessive rendering
    particlesRef.current = [...particlesRef.current.slice(-60), ...newParticles];
  }, [bursts]);

  // Central Animation Loop subscription
  useEffect(() => {
    const instanceId = instanceIdRef.current;

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle retina / high DPI displays smoothly
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth || 300;
        canvas.height = canvas.clientHeight || 150;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particlesRef.current.length === 0) return;

      const activeBurstIds = new Set<string>();
      const nextParticles: CanvasParticle[] = [];

      particlesRef.current.forEach((p) => {
        p.alpha -= p.decay * dt;

        if (p.alpha > 0) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.94; // friction
          p.vy *= 0.94;

          activeBurstIds.add(p.burstId);
          nextParticles.push(p);

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);

          if (p.type === 'spark') {
            ctx.shadowColor = p.glowColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha)), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      });

      // Notify completion for bursts whose particles have fully vanished
      processedBurstsRef.current.forEach((burstId) => {
        if (!activeBurstIds.has(burstId)) {
          processedBurstsRef.current.delete(burstId);
          onBurstComplete(burstId);
        }
      });

      particlesRef.current = nextParticles;
    });

    return () => {
      unsubscribe();
    };
  }, [onBurstComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-40 pointer-events-none w-full h-full rounded-3xl"
    />
  );
});
