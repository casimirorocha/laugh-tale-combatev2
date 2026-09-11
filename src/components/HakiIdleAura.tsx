import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { HakiAuraConfig, HakiSparkEffect } from '../types/fighter';

interface HakiIdleAuraProps {
  auraConfig?: HakiAuraConfig | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'arena';
  stanceState?: 'idle' | 'combat' | 'awakened';
  showGroundRing?: boolean;
  showLightning?: boolean;
}

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface LightningArcNode {
  points: { x: number; y: number }[];
  alpha: number;
  color: string;
}

export const HakiIdleAura: React.FC<HakiIdleAuraProps> = React.memo(({
  auraConfig,
  className = '',
  size = 'hero',
  stanceState = 'idle',
  showGroundRing = true,
  showLightning = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(Math.random() * 100);
  const instanceIdRef = useRef<string>(`haki_idle_d3_${Math.random().toString(36).substring(2, 9)}`);

  // Extract aura properties
  const color = auraConfig?.color || '#38bdf8';
  const secondaryColor = auraConfig?.secondaryColor || '#0284c7';
  const sparkEffect: HakiSparkEffect = auraConfig?.sparkEffect || 'Particles';
  const particleIntensity = auraConfig?.particleIntensity ?? 65;
  const particleSpeed = auraConfig?.particleSpeed ?? 1.0;
  const auraRadius = auraConfig?.auraRadius ?? 100;
  const auraOpacity = auraConfig?.auraOpacity ?? 0.75;
  const pulseSpeed = auraConfig?.pulseSpeed ?? 1.0;
  const conquerorLightningColor = auraConfig?.conquerorLightningColor || '#a855f7';
  const observationPulseStyle = auraConfig?.observationPulseStyle || 'none';
  const isRetro = auraConfig?.visualStyle === 'retro_8bit';

  // Size configurations in pixels
  const coreDiameter = {
    sm: 90,
    md: 140,
    lg: 190,
    hero: 250,
    arena: 280,
  }[size];

  const stanceScale = stanceState === 'awakened' ? 1.35 : stanceState === 'combat' ? 1.15 : 1.0;
  const effectiveRadius = (coreDiameter / 2) * (auraRadius / 100) * stanceScale;

  useEffect(() => {
    const instanceId = instanceIdRef.current;
    const particles: ParticleNode[] = [];
    const lightningArcs: LightningArcNode[] = [];

    // Particle emitter threshold
    const maxParticles = Math.max(6, Math.min(50, Math.round((particleIntensity / 100) * 36)));

    const createParticle = (cx: number, cy: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 1.5) * particleSpeed;
      const palette = [color, secondaryColor, '#ffffff'];
      if (sparkEffect === 'Lightning' || sparkEffect === 'Conqueror_Rift') {
        palette.push(conquerorLightningColor);
      }

      return {
        x: cx + Math.cos(angle) * (effectiveRadius * 0.4 * Math.random()),
        y: cy + Math.sin(angle) * (effectiveRadius * 0.3) + 15,
        vx: (Math.random() - 0.5) * 1.2 * particleSpeed,
        vy: -(1.5 + Math.random() * 2.5) * particleSpeed,
        life: 0,
        maxLife: 0.8 + Math.random() * 1.2,
        size: 2 + Math.random() * 4,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    };

    const generateLightningArc = (cx: number, cy: number): LightningArcNode => {
      const angle = Math.random() * Math.PI * 2;
      const startR = effectiveRadius * 0.3;
      const endR = effectiveRadius * (0.9 + Math.random() * 0.4);
      const points: { x: number; y: number }[] = [];
      const steps = 6;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const currentR = d3.interpolate(startR, endR)(progress);
        const jitterA = angle + (Math.random() - 0.5) * 0.3;
        points.push({
          x: cx + Math.cos(jitterA) * currentR,
          y: cy + Math.sin(jitterA) * currentR,
        });
      }

      return {
        points,
        alpha: 1.0,
        color: Math.random() > 0.4 ? conquerorLightningColor : '#ffffff',
      };
    };

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || coreDiameter * 1.5;
      const height = rect.height || coreDiameter * 1.5;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      phaseRef.current += dt * pulseSpeed * 2.5;

      // 1. GROUND RING / ENERGY SHOCKWAVE DISC (D3 Elliptical Radial Scale)
      if (showGroundRing) {
        const groundR = effectiveRadius * 1.25;
        const pulseRatio = 1 + Math.sin(phaseRef.current) * 0.08;

        ctx.save();
        ctx.translate(cx, cy + effectiveRadius * 0.65);
        ctx.scale(1.0, 0.32); // Elliptical 3D perspective projection

        // Outer Glow Ring
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, groundR * pulseRatio);
        grad.addColorStop(0, `${color}40`);
        grad.addColorStop(0.6, `${secondaryColor}25`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, groundR * pulseRatio, 0, Math.PI * 2);
        ctx.fill();

        // Dashed Spirit Ring
        ctx.strokeStyle = color;
        ctx.lineWidth = isRetro ? 3 : 1.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, groundR * 0.85, phaseRef.current * 0.5, phaseRef.current * 0.5 + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 2. D3 RADIAL VOLUMETRIC AURA WAVE (D3 Cardinal Curve Spline)
      const numPoints = 16;
      const auraPoints: [number, number][] = d3.range(numPoints).map((i) => {
        const a = (i / numPoints) * Math.PI * 2;
        const noise = Math.sin(phaseRef.current * 1.8 + i * 1.5) * 8 + Math.cos(phaseRef.current * 2.2 - i * 0.8) * 6;
        const r = effectiveRadius + noise;
        return [a, r];
      });

      // D3 Radial Area Generator outputting to Canvas
      const radialLine = d3.radialLine<[number, number]>()
        .angle((d) => d[0])
        .radius((d) => d[1])
        .curve(d3.curveCardinalClosed.tension(0.65))
        .context(ctx);

      ctx.save();
      ctx.translate(cx, cy);

      // Core Radial Gradient
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveRadius * 1.3);
      coreGrad.addColorStop(0, `${color}99`);
      coreGrad.addColorStop(0.4, `${color}66`);
      coreGrad.addColorStop(0.8, `${secondaryColor}33`);
      coreGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = coreGrad;
      ctx.globalAlpha = auraOpacity;
      ctx.beginPath();
      radialLine(auraPoints);
      ctx.fill();

      if (isRetro) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else {
        ctx.strokeStyle = `${color}aa`;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.stroke();
      }
      ctx.restore();

      // 3. OBSERVATION HAKI DISTORTION RIPPLES (KENBUNSHOKU - RED)
      if (observationPulseStyle !== 'none') {
        const rippleR = ((phaseRef.current * 40) % (effectiveRadius * 1.8));
        const rippleAlpha = Math.max(0, 1 - rippleR / (effectiveRadius * 1.8));
        const rippleColor = '#ef4444';

        ctx.save();
        ctx.strokeStyle = rippleColor;
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = rippleAlpha * 0.85;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. PARTICLES ENGINE UPDATE & DRAW
      if (sparkEffect !== 'None' && particleIntensity > 0) {
        while (particles.length < maxParticles) {
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

          const alpha = Math.sin(progress * Math.PI);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 5. CONQUEROR / LIGHTNING CRACKLE ARCS
      if (showLightning && (sparkEffect === 'Lightning' || sparkEffect === 'Conqueror_Rift')) {
        if (Math.random() < 0.2) {
          lightningArcs.push(generateLightningArc(cx, cy));
        }

        ctx.save();
        for (let i = lightningArcs.length - 1; i >= 0; i--) {
          const arc = lightningArcs[i];
          arc.alpha -= dt * 3.5;
          if (arc.alpha <= 0) {
            lightningArcs.splice(i, 1);
            continue;
          }

          const d3Line = d3.line<{ x: number; y: number }>()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveLinear)
            .context(ctx);

          ctx.strokeStyle = arc.color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = arc.alpha;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          d3Line(arc.points);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, [
    color,
    secondaryColor,
    sparkEffect,
    particleIntensity,
    particleSpeed,
    effectiveRadius,
    auraOpacity,
    pulseSpeed,
    conquerorLightningColor,
    observationPulseStyle,
    isRetro,
    showGroundRing,
    showLightning,
    size,
    coreDiameter,
  ]);

  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible select-none z-10 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
});

HakiIdleAura.displayName = 'HakiIdleAura';
export default HakiIdleAura;
