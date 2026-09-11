import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';

interface WeatherOverlayProps {
  effect: 'snow' | 'lightning' | 'cyber_grid' | 'clouds' | 'cherry_blossoms' | 'maple_leaves' | string;
  className?: string;
}

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
  color: string;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = React.memo(({ effect, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flashTimerRef = useRef<number>(0);
  const isFlashingRef = useRef<boolean>(false);
  const instanceIdRef = useRef<string>(`weather_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const instanceId = instanceIdRef.current;
    const particles: ParticleNode[] = [];
    const maxParticles = effect === 'lightning' ? 45 : 30;

    const createParticle = (width: number, height: number): ParticleNode => {
      const x = Math.random() * width;
      const y = Math.random() * -height * 0.5;

      switch (effect) {
        case 'snow':
          return {
            x,
            y,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 1.2 + Math.random() * 1.5,
            size: 2 + Math.random() * 3.5,
            rotation: 0,
            vRot: 0,
            alpha: 0.4 + Math.random() * 0.5,
            color: '#ffffff',
          };

        case 'lightning': // Rain drops
          return {
            x,
            y,
            vx: -1.5 - Math.random() * 1.0,
            vy: 12 + Math.random() * 8,
            size: 1.5,
            rotation: 0,
            vRot: 0,
            alpha: 0.3 + Math.random() * 0.4,
            color: 'rgba(156, 163, 175, 0.6)',
          };

        case 'cherry_blossoms': // Sakura petals
          return {
            x,
            y,
            vx: 0.5 + Math.random() * 1.2,
            vy: 0.8 + Math.random() * 1.2,
            size: 6 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.05,
            alpha: 0.7 + Math.random() * 0.3,
            color: '#ff8da1',
          };

        case 'cyber_grid': // Floating cyan sparks upward
          return {
            x: Math.random() * width,
            y: height + Math.random() * 50,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -(1.5 + Math.random() * 2.0),
            size: 3 + Math.random() * 4,
            rotation: Math.random() * Math.PI,
            vRot: 0.02,
            alpha: 0.6 + Math.random() * 0.4,
            color: '#06b6d4',
          };

        case 'clouds': // Gold stardust drifting
          return {
            x,
            y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0.6 + Math.random() * 0.9,
            size: 3 + Math.random() * 5,
            rotation: 0,
            vRot: 0,
            alpha: 0.5 + Math.random() * 0.5,
            color: '#f59e0b',
          };

        case 'maple_leaves': // Autumn orange leaves
        default:
          return {
            x,
            y,
            vx: 0.8 + Math.random() * 1.5,
            vy: 1.0 + Math.random() * 1.5,
            size: 8 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.06,
            alpha: 0.75 + Math.random() * 0.25,
            color: '#f97316',
          };
      }
    };

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

      // Lightning Flash handling
      if (effect === 'lightning') {
        flashTimerRef.current += dt;
        if (flashTimerRef.current > 4.5) {
          flashTimerRef.current = 0;
          isFlashingRef.current = true;
          setTimeout(() => {
            isFlashingRef.current = false;
          }, 80);
        }

        if (isFlashingRef.current) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(0, 0, width, height);
        }
      }

      while (particles.length < maxParticles) {
        particles.push(createParticle(width, height));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Reset off-screen particles
        if (p.y > height + 20 || p.x > width + 30 || p.x < -30 || p.y < -30) {
          particles[i] = createParticle(width, height);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;

        if (effect === 'lightning') {
          // Rain Streak
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + p.size * 8);
          ctx.stroke();
        } else if (effect === 'cherry_blossoms' || effect === 'maple_leaves') {
          // Organic Petal / Leaf Shape
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Circular particle (Snow, Stardust, Cyber)
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = d3.scaleLinear().domain([2, 8]).range([2, 10])(p.size);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, [effect]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-10 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
});

WeatherOverlay.displayName = 'WeatherOverlay';
export default WeatherOverlay;
