import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { AwakeningProfile, AwakeningAuraStyle } from '../types/fighter';

interface AwakenedAuraVisualizerProps {
  awakeningProfile?: AwakeningProfile | null;
  side: 'team1' | 'team2';
  isAwakened: boolean;
  visualStyle?: 'modern_glow' | 'retro_8bit';
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export const AwakenedAuraVisualizer: React.FC<AwakenedAuraVisualizerProps> = React.memo(({
  awakeningProfile,
  side,
  isAwakened,
  visualStyle = 'modern_glow',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(Math.random() * 50);
  const instanceIdRef = useRef<string>(`awakened_d3_${side}_${Math.random().toString(36).substring(2, 9)}`);

  const style: AwakeningAuraStyle = awakeningProfile?.auraStyle || 'radiant_gold';
  const primaryColor = awakeningProfile?.auraColor || '#fbbf24';
  const secondaryColor = awakeningProfile?.secondaryAuraColor || '#d97706';
  const isRetro = visualStyle === 'retro_8bit';

  useEffect(() => {
    if (!isAwakened || !awakeningProfile) return;

    const instanceId = instanceIdRef.current;
    const particles: Particle[] = [];

    const createParticle = (cx: number, cy: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.2;
      const colors = [primaryColor, secondaryColor, '#ffffff'];

      return {
        x: cx + Math.cos(angle) * (60 * Math.random()),
        y: cy + Math.sin(angle) * (40 * Math.random()) + 20,
        vx: (Math.random() - 0.5) * 2.0,
        vy: -(2.0 + Math.random() * 3.0),
        size: 3 + Math.random() * 5,
        life: 0,
        maxLife: 0.8 + Math.random() * 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 280;
      const height = rect.height || 280;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      phaseRef.current += dt * 3.0;

      // 1. D3 VOLUMETRIC AURA WAVE (Dynamic Radial Curve Generator)
      const numPoints = 20;
      const radius = 110;
      const points: [number, number][] = d3.range(numPoints).map((i) => {
        const a = (i / numPoints) * Math.PI * 2;
        const wave = Math.sin(phaseRef.current * 2.0 + i * 1.2) * 12 + Math.cos(phaseRef.current * 1.5 - i * 0.8) * 8;
        return [a, radius + wave];
      });

      const radialLine = d3.radialLine<[number, number]>()
        .angle((d) => d[0])
        .radius((d) => d[1])
        .curve(d3.curveCardinalClosed.tension(0.7))
        .context(ctx);

      ctx.save();
      ctx.translate(cx, cy);

      const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.3);
      auraGrad.addColorStop(0, `${primaryColor}cc`);
      auraGrad.addColorStop(0.5, `${primaryColor}66`);
      auraGrad.addColorStop(0.8, `${secondaryColor}33`);
      auraGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      radialLine(points);
      ctx.fill();

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = isRetro ? 3 : 2;
      if (!isRetro) {
        ctx.shadowColor = primaryColor;
        ctx.shadowBlur = 18;
      }
      ctx.stroke();
      ctx.restore();

      // 2. STYLE-SPECIFIC D3 PATH CURVE RENDERING
      if (style === 'sun_god') {
        // Nika White Smoke Ribbon Curls using D3 Curve Basis
        const ribbons = 8;
        ctx.save();
        ctx.translate(cx, cy);

        for (let i = 0; i < ribbons; i++) {
          const baseAngle = (i / ribbons) * Math.PI * 2 + phaseRef.current * 0.4;
          const curvePoints: [number, number][] = [
            [0, 0],
            [Math.cos(baseAngle) * 50, Math.sin(baseAngle) * 50],
            [Math.cos(baseAngle + 0.4) * 90, Math.sin(baseAngle + 0.4) * 90],
            [Math.cos(baseAngle + 0.8) * 130, Math.sin(baseAngle + 0.8) * 130],
          ];

          const lineGen = d3.line<[number, number]>()
            .x((d) => d[0])
            .y((d) => d[1])
            .curve(d3.curveBasis)
            .context(ctx);

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          lineGen(curvePoints);
          ctx.stroke();
        }
        ctx.restore();
      } else if (style === 'hellfire') {
        // Emerald Hellfire Ribbons
        const flames = 6;
        ctx.save();
        ctx.translate(cx, cy + 20);

        for (let i = 0; i < flames; i++) {
          const offsetX = (i - flames / 2) * 22;
          const flamePoints: [number, number][] = [
            [offsetX, 20],
            [offsetX + Math.sin(phaseRef.current + i) * 18, -40],
            [offsetX + Math.cos(phaseRef.current * 1.5 + i) * 25, -90],
            [offsetX, -130],
          ];

          const lineGen = d3.line<[number, number]>()
            .x((d) => d[0])
            .y((d) => d[1])
            .curve(d3.curveCardinal)
            .context(ctx);

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 5;
          ctx.shadowColor = '#059669';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          lineGen(flamePoints);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. AWAKENED PARTICLES ENGINE
      while (particles.length < 24) {
        particles.push(createParticle(cx, cy));
      }

      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life += dt;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.sin(progress * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, [
    isAwakened,
    awakeningProfile,
    primaryColor,
    secondaryColor,
    style,
    isRetro,
    side,
  ]);

  if (!isAwakened || !awakeningProfile) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-10 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
});

AwakenedAuraVisualizer.displayName = 'AwakenedAuraVisualizer';
export default AwakenedAuraVisualizer;
