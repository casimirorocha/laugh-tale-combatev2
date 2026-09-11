import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

interface HakiEnergyFieldD3Props {
  team1HealthPct: number; // 0 to 100
  team2HealthPct: number; // 0 to 100
  team1MaxMode?: boolean;
  team2MaxMode?: boolean;
  hakiClashActive?: boolean;
  conquerorFlash?: boolean;
  className?: string;
}

interface EnergyNode {
  angle: number; // Radians
  baseRadius: number;
  noiseOffset: number;
  freq: number;
}

export const HakiEnergyFieldD3: React.FC<HakiEnergyFieldD3Props> = React.memo(({
  team1HealthPct,
  team2HealthPct,
  team1MaxMode = false,
  team2MaxMode = false,
  hakiClashActive = false,
  conquerorFlash = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(`haki_d3_field_${Math.random().toString(36).substring(2, 9)}`);

  // Target intensity values based on health states (desperation surge at low health)
  const t1Desperation = Math.max(0, (30 - team1HealthPct) / 30); // 0 to 1 as HP drops below 30%
  const t2Desperation = Math.max(0, (30 - team2HealthPct) / 30);

  const t1Intensity = (100 - team1HealthPct) / 100 + (team1MaxMode ? 0.6 : 0) + t1Desperation * 0.8;
  const t2Intensity = (100 - team2HealthPct) / 100 + (team2MaxMode ? 0.6 : 0) + t2Desperation * 0.8;

  // Refs to hold current values for smooth interpolation
  const currentT1Intensity = useRef(t1Intensity);
  const currentT2Intensity = useRef(t2Intensity);

  useEffect(() => {
    currentT1Intensity.current = t1Intensity;
    currentT2Intensity.current = t2Intensity;
  }, [t1Intensity, t2Intensity]);

  useEffect(() => {
    const instanceId = instanceIdRef.current;

    // Build static node configurations around circle (24 nodes for organic D3 cardinal spline)
    const nodeCount = 24;
    const nodes: EnergyNode[] = d3.range(nodeCount).map((i) => ({
      angle: (i / nodeCount) * Math.PI * 2,
      baseRadius: 100,
      noiseOffset: Math.random() * 100,
      freq: 1 + Math.random() * 2,
    }));

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure canvas dimensions match client size for high-DPI
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth || 800;
        canvas.height = canvas.clientHeight || 400;
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      phaseRef.current += dt * (hakiClashActive ? 4.5 : 2.0);

      // Interpolate current intensities smoothly
      const i1 = currentT1Intensity.current;
      const i2 = currentT2Intensity.current;
      const totalPressure = (i1 + i2) / 2 + (hakiClashActive ? 1.2 : 0) + (conquerorFlash ? 1.5 : 0);

      // Base radius calculation using D3 linear scale
      const maxDist = Math.min(width, height) * 0.42;
      const radiusScale = d3.scaleLinear()
        .domain([0, 2])
        .range([maxDist * 0.4, maxDist * 0.95])
        .clamp(true);

      const baseR = radiusScale(totalPressure);

      // D3 Radial Area Generator outputting directly into Canvas 2D context
      const radialArea = d3.radialArea<EnergyNode>()
        .context(ctx)
        .angle((d) => d.angle)
        .innerRadius((d) => {
          const wave = Math.sin(phaseRef.current * d.freq + d.noiseOffset) * (15 + totalPressure * 25);
          return Math.max(10, baseR * 0.5 + wave);
        })
        .outerRadius((d) => {
          const wave = Math.cos(phaseRef.current * d.freq * 1.3 + d.noiseOffset) * (20 + totalPressure * 35);
          return baseR + wave;
        })
        .curve(d3.curveCardinalClosed.tension(0.4));

      // 1. Draw Team 1 Haki Aura Layer (Left / Crimson-Purple)
      ctx.save();
      ctx.translate(centerX - (i1 - i2) * 40, centerY);

      // Radial gradient for energy core
      const grad1 = ctx.createRadialGradient(0, 0, baseR * 0.2, 0, 0, baseR * 1.2);
      if (conquerorFlash) {
        grad1.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        grad1.addColorStop(0.6, 'rgba(168, 85, 247, 0.25)');
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad1.addColorStop(0, `rgba(220, 38, 38, ${0.15 + i1 * 0.2})`);
        grad1.addColorStop(0.7, `rgba(126, 34, 206, ${0.1 + i1 * 0.15})`);
        grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.beginPath();
      radialArea(nodes);
      ctx.fillStyle = grad1;
      ctx.fill();

      ctx.strokeStyle = conquerorFlash
        ? 'rgba(248, 113, 113, 0.8)'
        : `rgba(239, 68, 68, ${0.3 + i1 * 0.4})`;
      ctx.lineWidth = 2 + totalPressure * 3;
      ctx.shadowColor = conquerorFlash ? '#ef4444' : '#a855f7';
      ctx.shadowBlur = 12 + totalPressure * 15;
      ctx.stroke();

      ctx.restore();

      // 2. Draw Team 2 Haki Aura Layer (Right / Cyan-Amber)
      ctx.save();
      ctx.translate(centerX + (i2 - i1) * 40, centerY);

      const grad2 = ctx.createRadialGradient(0, 0, baseR * 0.2, 0, 0, baseR * 1.2);
      grad2.addColorStop(0, `rgba(34, 211, 238, ${0.15 + i2 * 0.2})`);
      grad2.addColorStop(0.6, `rgba(245, 158, 11, ${0.1 + i2 * 0.15})`);
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      radialArea(nodes.map(n => ({ ...n, noiseOffset: n.noiseOffset + 50 })));
      ctx.fillStyle = grad2;
      ctx.fill();

      ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 + i2 * 0.4})`;
      ctx.lineWidth = 2 + totalPressure * 2.5;
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10 + i2 * 12;
      ctx.stroke();

      ctx.restore();

      // 3. Draw Haki Clash Fissures if clashing
      if (hakiClashActive) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;

        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (k / 6) * Math.PI * 2 + Math.sin(phaseRef.current * 10) * 0.2;
          const len = baseR * (0.8 + Math.random() * 0.4);
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
        }
        ctx.stroke();
        ctx.restore();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hakiClashActive, conquerorFlash]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full transform-gpu"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
});
