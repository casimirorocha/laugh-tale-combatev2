import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, Flame, Eye, Shield, Palette, Sliders, Play, Save, CheckCircle, Info } from 'lucide-react';
import { Fighter, HakiAuraConfig, HakiSparkEffect } from '../types/fighter';
import { saveFighterCustomAura, getFighterCustomAura } from '../utils/storage';
import { FighterAvatar } from './FighterAvatar';
import { soundManager } from '../utils/soundEffects';

interface HakiAuraCustomizerPanelProps {
  fighter: Fighter;
  onAuraSaved: (updatedFighter: Fighter) => void;
}

const PRESETS = [
  {
    id: 'supreme_haoshoku',
    name: 'Supreme Haoshoku',
    subtitle: 'Crimson Will & Black Lightning',
    color: '#ef4444',
    secondaryColor: '#7f1d1d',
    conquerorLightningColor: '#9333ea',
    sparkEffect: 'Conqueror_Rift' as HakiSparkEffect,
    particleIntensity: 90,
    particleSpeed: 1.3,
    auraRadius: 115,
    auraOpacity: 0.85,
    pulseSpeed: 1.2,
    badgeColor: 'border-red-500 text-red-400 bg-red-950/40',
  },
  {
    id: 'sun_god_nika',
    name: 'Sun God Liberation',
    subtitle: 'Golden Dawn & White Embers',
    color: '#fbbf24',
    secondaryColor: '#ffffff',
    conquerorLightningColor: '#fef08a',
    sparkEffect: 'Ghost_Embers' as HakiSparkEffect,
    particleIntensity: 80,
    particleSpeed: 1.1,
    auraRadius: 125,
    auraOpacity: 0.8,
    pulseSpeed: 1.4,
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-950/40',
  },
  {
    id: 'king_of_hell',
    name: 'King of Hell',
    subtitle: 'Demonic Emerald Flames',
    color: '#10b981',
    secondaryColor: '#064e3b',
    conquerorLightningColor: '#047857',
    sparkEffect: 'Fire' as HakiSparkEffect,
    particleIntensity: 85,
    particleSpeed: 1.2,
    auraRadius: 110,
    auraOpacity: 0.85,
    pulseSpeed: 1.1,
    badgeColor: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
  },
  {
    id: 'wano_ryuo',
    name: 'Wano Sakura Ryuo',
    subtitle: 'Flowing Spirit & Cherry Petals',
    color: '#f472b6',
    secondaryColor: '#fb7185',
    conquerorLightningColor: '#fbbf24',
    sparkEffect: 'Ryuo_Petals' as HakiSparkEffect,
    particleIntensity: 75,
    particleSpeed: 0.9,
    auraRadius: 105,
    auraOpacity: 0.75,
    pulseSpeed: 0.9,
    badgeColor: 'border-pink-500 text-pink-400 bg-pink-950/40',
  },
  {
    id: 'yami_void',
    name: 'Yami Void Abyss',
    subtitle: 'Primordial Gravity & Eclipse',
    color: '#7c3aed',
    secondaryColor: '#000000',
    conquerorLightningColor: '#4c1d95',
    sparkEffect: 'Conqueror_Rift' as HakiSparkEffect,
    particleIntensity: 95,
    particleSpeed: 1.4,
    auraRadius: 130,
    auraOpacity: 0.9,
    pulseSpeed: 1.3,
    badgeColor: 'border-purple-500 text-purple-400 bg-purple-950/40',
  },
  {
    id: 'goro_plasma',
    name: 'Goro 200M Volts',
    subtitle: 'High Voltage Cyan Plasma',
    color: '#06b6d4',
    secondaryColor: '#3b82f6',
    conquerorLightningColor: '#67e8f9',
    sparkEffect: 'Lightning' as HakiSparkEffect,
    particleIntensity: 85,
    particleSpeed: 1.5,
    auraRadius: 115,
    auraOpacity: 0.8,
    pulseSpeed: 1.5,
    badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950/40',
  },
];

interface D3TrailNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  length: number;
  history: { x: number; y: number }[];
  color: string;
  speed: number;
  width: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const HakiAuraCustomizerPanel: React.FC<HakiAuraCustomizerPanelProps> = ({
  fighter,
  onAuraSaved,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize aura values from storage or character defaults
  const initialAura: HakiAuraConfig = getFighterCustomAura(fighter.id) || fighter.hakiAura || {
    color: fighter.themeColor || '#ef4444',
    secondaryColor: fighter.secondaryColor || '#7f1d1d',
    sparkEffect: 'Particles',
    particleIntensity: 60,
    particleSpeed: 1.0,
    auraRadius: 100,
    auraOpacity: 0.8,
    pulseSpeed: 1.0,
    conquerorLightningColor: '#a855f7',
    visualStyle: 'modern_glow',
  };

  const [config, setConfig] = useState<HakiAuraConfig>(initialAura);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [activePresetId, setActivePresetId] = useState<string>('');
  const [activeMenu, setActiveMenu] = useState<'preset' | 'colors' | 'sliders' | 'effects'>('preset');

  // Mouse interact position
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Reset state on fighter swap
    const loaded = getFighterCustomAura(fighter.id) || fighter.hakiAura || {
      color: fighter.themeColor || '#ef4444',
      secondaryColor: fighter.secondaryColor || '#7f1d1d',
      sparkEffect: 'Particles',
      particleIntensity: 60,
      particleSpeed: 1.0,
      auraRadius: 100,
      auraOpacity: 0.8,
      pulseSpeed: 1.0,
      conquerorLightningColor: '#a855f7',
      visualStyle: 'modern_glow',
    };
    setConfig(loaded);
    setActivePresetId('');
    setSuccessMsg('');
  }, [fighter.id]);

  // Handle preset clicks
  const applyPreset = (preset: typeof PRESETS[0]) => {
    const updated: HakiAuraConfig = {
      color: preset.color,
      secondaryColor: preset.secondaryColor,
      sparkEffect: preset.sparkEffect,
      particleIntensity: preset.particleIntensity,
      particleSpeed: preset.particleSpeed,
      auraRadius: preset.auraRadius,
      auraOpacity: preset.auraOpacity,
      pulseSpeed: preset.pulseSpeed,
      conquerorLightningColor: preset.conquerorLightningColor,
      visualStyle: 'modern_glow',
    };
    setConfig(updated);
    setActivePresetId(preset.id);
    soundManager.playUiSelect();
  };

  const handleSave = () => {
    saveFighterCustomAura(fighter.id, config);
    soundManager.playAchievementUnlock();
    setSuccessMsg(`CUSTOM HAKI AURA SUCCESSFULLY ASSIGNED TO ${fighter.name.toUpperCase()}!`);
    onAuraSaved({
      ...fighter,
      hakiAura: config,
    });
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // High-performance D3 force flow simulation for swirling ribbons
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.parentElement?.clientWidth || 400;
    let height = canvas.parentElement?.clientHeight || 400;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const trails: D3TrailNode[] = [];
    let particleId = 0;
    let time = 0;

    const maxTrailsCount = Math.max(15, Math.min(80, Math.round(((config.particleIntensity || 60) / 100) * 50)));

    // Handle interactive resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = entry.contentRect.width || width;
        height = entry.contentRect.height || height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const createTrailNode = (cx: number, cy: number, index: number): D3TrailNode => {
      const angle = (index / 20) * Math.PI * 2 + Math.random() * 0.4;
      const speedValue = (config.particleSpeed || 1.0) * (1.2 + Math.random() * 1.5);
      const isLightning = config.sparkEffect === 'Lightning' || config.sparkEffect === 'Conqueror_Rift';
      const col = isLightning && Math.random() > 0.6 
        ? config.conquerorLightningColor || '#a855f7' 
        : Math.random() > 0.5 ? config.color : config.secondaryColor || config.color;

      return {
        id: particleId++,
        x: cx + Math.cos(angle) * 30,
        y: cy + Math.sin(angle) * 30,
        vx: Math.cos(angle) * speedValue,
        vy: Math.sin(angle) * speedValue - (0.5 + Math.random() * 0.5),
        angle,
        length: 8 + Math.floor(Math.random() * 12),
        history: [],
        color: col,
        speed: speedValue,
        width: 1.5 + Math.random() * 2.5,
        opacity: 0.2 + Math.random() * 0.8,
        life: 0,
        maxLife: 2.0 + Math.random() * 3.0,
      };
    };

    const drawSimulation = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      time += 0.02 * (config.pulseSpeed || 1.0);

      // 1. Swirling volumetric Haki vortex backing (D3 cardinal closed radial mesh)
      const numPoints = 12;
      const baseRadius = (config.auraRadius || 100) * 0.8;
      const radialPoints: [number, number][] = d3.range(numPoints).map((i) => {
        const angle = (i / numPoints) * Math.PI * 2;
        const waveOffset = Math.sin(time * 2.5 + i * 1.2) * 12 + Math.cos(time * 3.2 - i * 0.6) * 6;
        const r = baseRadius + waveOffset;
        return [angle, r];
      });

      const d3RadialLine = d3.radialLine<[number, number]>()
        .angle((d) => d[0])
        .radius((d) => d[1])
        .curve(d3.curveCardinalClosed.tension(0.55))
        .context(ctx);

      ctx.save();
      ctx.translate(cx, cy);

      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, baseRadius * 1.5);
      glowGrad.addColorStop(0, `${config.color}aa`);
      glowGrad.addColorStop(0.35, `${config.secondaryColor || config.color}66`);
      glowGrad.addColorStop(0.7, `${config.color}22`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.globalAlpha = config.auraOpacity || 0.8;
      ctx.beginPath();
      d3RadialLine(radialPoints);
      ctx.fill();

      // Outer ripple stroke
      ctx.strokeStyle = `${config.color}90`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();

      // 2. Interactive flow-field physics simulation
      // Spawn new trails if current count is less than target density
      if (trails.length < maxTrailsCount && Math.random() < 0.4) {
        trails.push(createTrailNode(cx, cy, trails.length));
      }

      ctx.save();
      for (let i = trails.length - 1; i >= 0; i--) {
        const p = trails[i];
        p.life += 0.016;

        if (p.life >= p.maxLife) {
          trails.splice(i, 1);
          continue;
        }

        // Add history point
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > p.length) {
          p.history.shift();
        }

        // Apply flow physics (swirling gravity force around the avatar center + noise)
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const forceDirectionX = -dy / (dist || 1);
        const forceDirectionY = dx / (dist || 1);

        // Simulated noise using D3-like sine-wave harmonics
        const noiseX = Math.sin(p.x * 0.02 + time * 3.0) * 0.8;
        const noiseY = Math.cos(p.y * 0.02 + time * 2.5) * 0.8;

        // Gravity pull to maintain radius
        const targetRadius = (config.auraRadius || 100) * (0.6 + 0.5 * Math.sin(time + p.id));
        const pullForce = (targetRadius - dist) * 0.05;
        const px = dx / (dist || 1);
        const py = dy / (dist || 1);

        // Update velocity
        p.vx += forceDirectionX * 0.15 * p.speed + noiseX + px * pullForce;
        p.vy += forceDirectionY * 0.15 * p.speed + noiseY + py * pullForce;

        // Friction / drag
        p.vx *= 0.96;
        p.vy *= 0.96;

        // If mouse is interacting, apply a repulsion or attraction force
        if (mousePosRef.current) {
          const mdx = p.x - mousePosRef.current.x;
          const mdy = p.y - mousePosRef.current.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 100) {
            // Push outwards from cursor
            const push = (100 - mdist) * 0.1;
            p.vx += (mdx / (mdist || 1)) * push;
            p.vy += (mdy / (mdist || 1)) * push;
          }
        }

        // Apply coordinates update
        p.x += p.vx;
        p.y += p.vy;

        // Draw trails using D3 curve basis spline rendering
        if (p.history.length > 2) {
          const points = [...p.history, { x: p.x, y: p.y }];
          const d3Line = d3.line<{ x: number; y: number }>()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveBasis)
            .context(ctx);

          const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.opacity;

          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.width * (1 - p.life / p.maxLife);
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = config.sparkEffect === 'Conqueror_Rift' ? 10 : 4;
          ctx.beginPath();
          d3Line(points);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 3. Optional Spark overlays based on selected style (e.g. Petals, Conqueror Black Lightning)
      if (config.sparkEffect === 'Ryuo_Petals') {
        // Draw falling/rising cherry petals
        ctx.save();
        ctx.fillStyle = '#f472b6';
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 4; i++) {
          const px = cx + Math.sin(time + i) * baseRadius * 0.9;
          const py = cy - baseRadius * 0.4 + (time * 40 + i * 50) % (baseRadius * 1.5);
          ctx.beginPath();
          ctx.ellipse(px, py, 4, 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(drawSimulation);
    };

    drawSimulation();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [config]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 h-full">
      {/* Visual Live Interactive Canvas (6 cols) */}
      <div className="lg:col-span-6 flex flex-col items-center justify-center bg-zinc-950 rounded-2xl border border-zinc-800/80 p-6 relative overflow-hidden h-[380px] lg:h-full group">
        <div className="absolute top-3 left-4 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-400 text-[10px] z-20">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>Move cursor inside the vortex to warp Haki energy trails</span>
        </div>

        {/* Dynamic D3 Interactive Canvas container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full absolute inset-0 cursor-crosshair z-0"
        >
          <canvas ref={canvasRef} className="w-full h-full pointer-events-none absolute inset-0" />
        </div>

        {/* Static Fighter Avatar Core inside the aura */}
        <div className="relative z-10 flex flex-col items-center select-none pointer-events-none">
          <div className="rounded-full bg-zinc-900 p-2 border-2 border-dashed border-zinc-800 relative shadow-inner">
            <FighterAvatar
              avatarUrl={fighter.avatarUrl}
              avatarIcon={fighter.avatarIcon}
              name={fighter.name}
              size="hero"
              borderColor={config.color}
            />
          </div>
          <div className="mt-3 text-center bg-zinc-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-zinc-800 shadow-md">
            <span className="font-['Cinzel'] text-xs font-bold text-white block leading-tight">
              {fighter.name}
            </span>
            <span className="font-mono text-[9px] text-zinc-500 font-semibold tracking-wider">
              {fighter.epithet}
            </span>
          </div>
        </div>

        {/* Success toast notification inside preview panel */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-4 right-4 z-30 flex items-center gap-2 bg-emerald-500 border border-emerald-400 text-zinc-950 font-mono text-[10px] font-extrabold px-4 py-2.5 rounded-xl shadow-lg"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Editor & Sliders Control Dashboard (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Settings Navigation Menu */}
        <div className="flex border-b border-zinc-800/80 pb-1.5 gap-2">
          <button
            onClick={() => { setActiveMenu('preset'); soundManager.playUiSelect(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider border transition ${
              activeMenu === 'preset'
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRESETS</span>
          </button>
          <button
            onClick={() => { setActiveMenu('colors'); soundManager.playUiSelect(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider border transition ${
              activeMenu === 'colors'
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>AURA COLORS</span>
          </button>
          <button
            onClick={() => { setActiveMenu('sliders'); soundManager.playUiSelect(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider border transition ${
              activeMenu === 'sliders'
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>FLOW PHYSICS</span>
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="flex-1 bg-zinc-950/40 rounded-2xl border border-zinc-800/80 p-4 min-h-[220px]">
          {activeMenu === 'preset' && (
            <div className="space-y-2.5">
              <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block mb-1">
                PREMIUM HAKI SPIRIT PRESETS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[210px] overflow-y-auto pr-1">
                {PRESETS.map((preset) => {
                  const isActive = activePresetId === preset.id || 
                    (config.color === preset.color && config.sparkEffect === preset.sparkEffect);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`flex flex-col text-left p-2.5 rounded-xl border transition group ${
                        isActive
                          ? 'border-amber-400 bg-amber-950/20 shadow-md shadow-amber-500/10'
                          : 'border-zinc-800/60 bg-zinc-900/35 hover:border-zinc-700 hover:bg-zinc-900/70'
                      }`}
                    >
                      <span className="font-['Cinzel'] text-[11px] font-bold text-white group-hover:text-amber-300 transition">
                        {preset.name}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5 leading-tight">
                        {preset.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeMenu === 'colors' && (
            <div className="space-y-4">
              <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block">
                CUSTOM HAKI COLOR SELECTION
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs text-zinc-300">
                {/* Primary Aura Color */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 block">PRIMARY AURA GLOW</span>
                  <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                    <input
                      type="color"
                      value={config.color}
                      onChange={(e) => setConfig({ ...config, color: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={config.color.toUpperCase()}
                      onChange={(e) => setConfig({ ...config, color: e.target.value })}
                      className="bg-transparent text-white outline-none w-20 text-[11px]"
                    />
                  </div>
                </div>

                {/* Secondary Aura Color */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 block">SECONDARY AURA GLOW</span>
                  <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                    <input
                      type="color"
                      value={config.secondaryColor || '#000000'}
                      onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={(config.secondaryColor || '').toUpperCase()}
                      onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                      className="bg-transparent text-white outline-none w-20 text-[11px]"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Conqueror Lightning Color */}
                <div className="space-y-1.5 sm:col-span-2">
                  <span className="text-[10px] text-zinc-400 block">HAOSHOKU BLACK LIGHTNING CARRIER COLOR</span>
                  <div className="flex items-center gap-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 max-w-sm">
                    <input
                      type="color"
                      value={config.conquerorLightningColor || '#a855f7'}
                      onChange={(e) => setConfig({ ...config, conquerorLightningColor: e.target.value })}
                      className="w-8 h-8 rounded border-none bg-transparent cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={(config.conquerorLightningColor || '').toUpperCase()}
                      onChange={(e) => setConfig({ ...config, conquerorLightningColor: e.target.value })}
                      className="bg-transparent text-white outline-none w-20 text-[11px]"
                    />
                    <span className="text-[10px] text-zinc-500 italic ml-auto pr-1">Co-exists with Lightning Effect</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'sliders' && (
            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block mb-1">
                SPIRIT FLOW & MASS DENSITIES
              </span>

              {/* Slider 1: Aura Radius */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>AURA RADIUS</span>
                  <span className="text-amber-400 font-bold">{config.auraRadius || 100}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={config.auraRadius || 100}
                  onChange={(e) => setConfig({ ...config, auraRadius: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-full cursor-pointer"
                />
              </div>

              {/* Slider 2: Aura Opacity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>AURA TRANSPARENCY (OPACITY)</span>
                  <span className="text-amber-400 font-bold">{Math.round((config.auraOpacity || 0.8) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={Math.round((config.auraOpacity || 0.8) * 100)}
                  onChange={(e) => setConfig({ ...config, auraOpacity: Number(e.target.value) / 100 })}
                  className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-full cursor-pointer"
                />
              </div>

              {/* Slider 3: Particle Density */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>HAKI PARTICLES TRAIL DENSITY</span>
                  <span className="text-amber-400 font-bold">{config.particleIntensity || 60}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.particleIntensity || 60}
                  onChange={(e) => setConfig({ ...config, particleIntensity: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-full cursor-pointer"
                />
              </div>

              {/* Slider 4: Trail Speed */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>ENERGY VELOCITY (SPEED)</span>
                  <span className="text-amber-400 font-bold">{(config.particleSpeed || 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={Math.round((config.particleSpeed || 1.0) * 10)}
                  onChange={(e) => setConfig({ ...config, particleSpeed: Number(e.target.value) / 10 })}
                  className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-full cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Spark Effect Style Selectors */}
        <div className="bg-zinc-950/40 rounded-2xl border border-zinc-800/80 p-4 space-y-3">
          <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block">
            HAKI EMISSION & SPARK PATTERNS
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'None', label: 'PURE AURA', icon: Shield },
              { id: 'Particles', label: 'ENERGY PARTICLES', icon: Sparkles },
              { id: 'Lightning', label: 'CONQUEROR LIGHTNING', icon: Zap },
              { id: 'Fire', label: 'DEMON HELLFIRE', icon: Flame },
              { id: 'Ryuo_Petals', label: 'RYUO CHERRY FLOW', icon: Sparkles },
              { id: 'Conqueror_Rift', label: 'HAOSHOKU SPLIT', icon: Zap },
            ].map((eff) => {
              const isSelected = config.sparkEffect === eff.id;
              const Icon = eff.icon;
              return (
                <button
                  key={eff.id}
                  onClick={() => {
                    setConfig({ ...config, sparkEffect: eff.id as HakiSparkEffect });
                    soundManager.playUiSelect();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border font-mono text-[9px] font-extrabold transition tracking-wide ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/25 text-amber-300'
                      : 'border-zinc-800/60 bg-zinc-900/35 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{eff.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SAVE & PERSIST BUTTON */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-amber-500 text-black font-mono text-xs font-black tracking-widest hover:bg-amber-400 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
        >
          <Save className="w-4 h-4" />
          <span>ASSIGN CUSTOM AURA TO FIGHTER</span>
        </button>
      </div>
    </div>
  );
};
