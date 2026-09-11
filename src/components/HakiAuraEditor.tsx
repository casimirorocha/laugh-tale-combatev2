import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Flame, Eye, Shield, Volume2, Palette, Sliders, Wind, Radio } from 'lucide-react';
import { HakiAuraConfig, HakiSparkEffect } from '../types/fighter';
import { HakiIdleAura } from './HakiIdleAura';
import { FighterAvatar } from './FighterAvatar';
import { soundManager } from '../utils/soundEffects';
import { vibrationService } from '../utils/vibrationService';

interface HakiAuraEditorProps {
  value: HakiAuraConfig;
  onChange: (value: HakiAuraConfig) => void;
  fighterName?: string;
  fighterIcon?: string;
  fighterUrl?: string;
  epithet?: string;
  bounty?: number;
  themeColor?: string;
}

const PRESET_PALETTES = [
  {
    id: 'supreme_haoshoku',
    name: "Supreme Haoshoku",
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
    armamentArmorTexture: 'emission_aura' as const,
    observationPulseStyle: 'future_sight_red' as const,
    visualStyle: 'modern_glow' as const,
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
    armamentArmorTexture: 'ryuo_glow' as const,
    observationPulseStyle: 'none' as const,
    visualStyle: 'modern_glow' as const,
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
    armamentArmorTexture: 'obsidian_black' as const,
    observationPulseStyle: 'none' as const,
    visualStyle: 'modern_glow' as const,
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
    armamentArmorTexture: 'ryuo_glow' as const,
    observationPulseStyle: 'sensory_waves' as const,
    visualStyle: 'modern_glow' as const,
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
    armamentArmorTexture: 'obsidian_black' as const,
    observationPulseStyle: 'spatial_distortion' as const,
    visualStyle: 'modern_glow' as const,
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
    armamentArmorTexture: 'emission_aura' as const,
    observationPulseStyle: 'mind_eye_cyan' as const,
    visualStyle: 'modern_glow' as const,
    badgeColor: 'border-cyan-500 text-cyan-400 bg-cyan-950/40',
  },
  {
    id: 'ice_age',
    name: 'Hie Hie Frost',
    subtitle: 'Absolute Sub-Zero Shimmer',
    color: '#38bdf8',
    secondaryColor: '#e0f2fe',
    conquerorLightningColor: '#93c5fd',
    sparkEffect: 'Stars' as HakiSparkEffect,
    particleIntensity: 65,
    particleSpeed: 0.8,
    auraRadius: 100,
    auraOpacity: 0.7,
    pulseSpeed: 0.8,
    armamentArmorTexture: 'coating' as const,
    observationPulseStyle: 'none' as const,
    visualStyle: 'modern_glow' as const,
    badgeColor: 'border-sky-400 text-sky-300 bg-sky-950/40',
  },
  {
    id: 'retro_arcade',
    name: 'KOF 98 Retro 8-Bit',
    subtitle: 'Classic Neo Geo Pixel Surge',
    color: '#f59e0b',
    secondaryColor: '#ef4444',
    conquerorLightningColor: '#facc15',
    sparkEffect: 'Particles' as HakiSparkEffect,
    particleIntensity: 70,
    particleSpeed: 1.2,
    auraRadius: 100,
    auraOpacity: 0.8,
    pulseSpeed: 1.6,
    armamentArmorTexture: 'ryuo_glow' as const,
    observationPulseStyle: 'none' as const,
    visualStyle: 'retro_8bit' as const,
    badgeColor: 'border-yellow-500 text-yellow-400 bg-yellow-950/40',
  },
];

const SWATCHES = [
  '#ef4444', '#dc2626', '#b91c1c', // Reds
  '#f97316', '#ea580c', // Oranges
  '#f59e0b', '#fbbf24', '#facc15', // Yellows / Golds
  '#10b981', '#059669', // Emeralds
  '#06b6d4', '#22d3ee', '#38bdf8', // Cyans / Sky
  '#3b82f6', '#2563eb', // Blues
  '#8b5cf6', '#a855f7', '#7c3aed', // Purples
  '#ec4899', '#f472b6', // Pinks
  '#ffffff', '#000000', '#71717a', // Neutrals
];

const STAGE_BACKGROUNDS = [
  { id: 'night_dojo', name: 'Wano Night Dojo', bg: 'from-zinc-950 via-slate-950 to-black' },
  { id: 'onigashima', name: 'Onigashima Roof', bg: 'from-purple-950/70 via-red-950/60 to-black' },
  { id: 'marineford', name: 'Marineford Glacial Ice', bg: 'from-sky-950/60 via-slate-900 to-black' },
  { id: 'abyssal_void', name: 'Pangaea Abyssal Void', bg: 'from-zinc-900 via-black to-black' },
];

export const HakiAuraEditor: React.FC<HakiAuraEditorProps> = ({
  value,
  onChange,
  fighterName = 'Custom Fighter',
  fighterIcon = '⚡',
  fighterUrl,
  epithet = 'Grand Line Legend',
  bounty = 1000000000,
  themeColor = '#38bdf8',
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'particles' | 'styles' | 'presets'>('colors');
  const [previewStance, setPreviewStance] = useState<'idle' | 'combat' | 'awakened'>('idle');
  const [previewBg, setPreviewBg] = useState<string>('night_dojo');
  const [isSurgeFlash, setIsSurgeFlash] = useState<boolean>(false);

  const updateConfig = (patch: Partial<HakiAuraConfig>) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  const getIntensityLabel = (val: number) => {
    if (val <= 0) return { label: 'Dormant (Aura Only)', color: 'text-zinc-500' };
    if (val <= 25) return { label: 'Subtle Motes', color: 'text-blue-400' };
    if (val <= 60) return { label: 'Pronounced Surge', color: 'text-emerald-400' };
    if (val <= 85) return { label: 'Overwhelming Power', color: 'text-amber-400' };
    return { label: 'Cataclysmic Emperor Haki', color: 'text-red-400 font-black' };
  };

  const handleTestSurgeSound = () => {
    setIsSurgeFlash(true);
    setTimeout(() => setIsSurgeFlash(false), 400);

    vibrationService.vibrateHakiClash(
      value.primaryColor === 'Purple' || value.sparkEffect === 'Conqueror_Rift' ? 'conqueror' : 'armament'
    );

    try {
      if (value.sparkEffect === 'Lightning' || value.sparkEffect === 'Conqueror_Rift') {
        soundManager.playHakiThunder();
      } else {
        soundManager.playHakiAura('conqueror');
      }
    } catch {
      // Audio playback failsafe
    }
  };

  const currentBgObj = STAGE_BACKGROUNDS.find((b) => b.id === previewBg) || STAGE_BACKGROUNDS[0];
  const intensityInfo = getIntensityLabel(value.particleIntensity ?? 65);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/90 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <h2 className="font-['Bebas_Neue'] text-xl sm:text-2xl tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              HAKI AURA & IDLE STANCE STUDIO
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Customize the radiant energy colors, particle intensity, and spiritual pressure surrounding your custom fighter's idle stance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestSurgeSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-amber-300 border border-amber-500/40 transition active:scale-95 shadow-md"
          >
            <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            <span>TEST HAKI SURGE</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Live Idle Stance Stage + Control Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / TOP: Interactive Live Stance Preview Arena (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="font-bold text-zinc-300">IDLE STANCE LIVE VIEW</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-500">Stage:</span>
              <select
                value={previewBg}
                onChange={(e) => setPreviewBg(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-300 outline-none"
              >
                {STAGE_BACKGROUNDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stance Stage Box */}
          <div
            className={`relative w-full h-80 sm:h-96 rounded-2xl border-2 border-zinc-800 overflow-hidden flex flex-col items-center justify-center p-4 bg-gradient-to-b ${currentBgObj.bg} shadow-inner transition-colors duration-500`}
          >
            {/* Surge flash effect */}
            {isSurgeFlash && (
              <div
                className="absolute inset-0 z-40 pointer-events-none animate-pulse"
                style={{ backgroundColor: `${value.color}40` }}
              />
            )}

            {/* Stage Floor Line */}
            <div className="absolute bottom-10 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-60" />

            {/* Fighter Standing in Idle Stance with Haki Aura */}
            <div className="relative flex flex-col items-center justify-center mb-6">
              {/* Dynamic Haki Idle Aura Surrounding Fighter */}
              <HakiIdleAura
                auraConfig={value}
                size="hero"
                stanceState={previewStance}
                showGroundRing={true}
                showLightning={true}
              />

              {/* Fighter Avatar with Idle Breathing Stance Animation */}
              <motion.div
                animate={
                  previewStance === 'awakened'
                    ? {
                        y: [-4, 4, -4],
                        scale: [1.02, 1.05, 1.02],
                      }
                    : previewStance === 'combat'
                    ? {
                        y: [-2, 2, -2],
                        scale: [1, 1.02, 1],
                      }
                    : {
                        y: [-3, 3, -3],
                        scale: [1, 1.01, 1],
                      }
                }
                transition={{
                  repeat: Infinity,
                  duration: previewStance === 'awakened' ? 1.1 : 2.2 / (value.pulseSpeed ?? 1),
                  ease: 'easeInOut',
                }}
                className="relative z-20"
              >
                <FighterAvatar
                  avatarUrl={fighterUrl}
                  avatarIcon={fighterIcon}
                  name={fighterName}
                  size="hero"
                  borderColor={value.color}
                  glowEffect={previewStance === 'awakened'}
                />
              </motion.div>

              {/* Shadow disc under feet */}
              <div className="absolute -bottom-4 w-28 h-5 rounded-[100%] bg-black/70 blur-sm pointer-events-none z-10" />
            </div>

            {/* Fighter Arcade Dossier Plaque */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between bg-zinc-950/85 backdrop-blur-sm border border-zinc-800 px-3 py-1.5 rounded-xl">
              <div className="truncate">
                <div className="font-['Cinzel'] text-xs font-bold text-white truncate">{fighterName}</div>
                <div className="font-mono text-[9px] text-amber-400 truncate">{epithet}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[8px] font-mono text-zinc-500 uppercase">BOUNTY</div>
                <div className="font-mono text-[10px] font-bold text-amber-300">
                  ฿{(bounty / 100000000).toFixed(1)}B
                </div>
              </div>
            </div>
          </div>

          {/* Stance Mode Tester Buttons */}
          <div className="flex items-center gap-2 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter pl-1">Stance:</span>
            <div className="flex-1 grid grid-cols-3 gap-1 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setPreviewStance('idle')}
                className={`py-1 rounded font-bold transition ${
                  previewStance === 'idle'
                    ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Idle (Calm)
              </button>
              <button
                type="button"
                onClick={() => setPreviewStance('combat')}
                className={`py-1 rounded font-bold transition ${
                  previewStance === 'combat'
                    ? 'bg-zinc-800 text-amber-400 border border-amber-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Combat Ready
              </button>
              <button
                type="button"
                onClick={() => setPreviewStance('awakened')}
                className={`py-1 rounded font-bold transition ${
                  previewStance === 'awakened'
                    ? 'bg-red-950 text-red-400 border border-red-500/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Awakened Surge
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Customization Control Workstation (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Sub-tabs for clean, modular editing */}
          <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                activeTab === 'colors'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>AURA COLORS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('particles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                activeTab === 'particles'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>PARTICLE INTENSITY</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('styles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                activeTab === 'styles'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>FX & TEXTURES</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                activeTab === 'presets'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>LEGENDARY PRESETS</span>
            </button>
          </div>

          {/* TAB 1: COLORS & PALETTE */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {/* Primary Aura Core Color */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                      style={{ backgroundColor: value.color }}
                    />
                    Primary Aura Core Color
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">{value.color}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value.color}
                    onChange={(e) => updateConfig({ color: e.target.value })}
                    className="h-9 w-14 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer p-0.5"
                  />
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SWATCHES.map((hex) => (
                      <button
                        key={`core-${hex}`}
                        type="button"
                        onClick={() => updateConfig({ color: hex })}
                        className={`h-6 w-6 rounded-md border transition hover:scale-110 ${
                          value.color.toLowerCase() === hex.toLowerCase()
                            ? 'border-white ring-2 ring-amber-400 scale-105'
                            : 'border-zinc-800'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Coronal Flare Halo Color */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                      style={{ backgroundColor: value.secondaryColor || '#0284c7' }}
                    />
                    Secondary Coronal Halo Color
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">{value.secondaryColor || '#0284c7'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value.secondaryColor || '#0284c7'}
                    onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                    className="h-9 w-14 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer p-0.5"
                  />
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {SWATCHES.map((hex) => (
                      <button
                        key={`sec-${hex}`}
                        type="button"
                        onClick={() => updateConfig({ secondaryColor: hex })}
                        className={`h-6 w-6 rounded-md border transition hover:scale-110 ${
                          (value.secondaryColor || '').toLowerCase() === hex.toLowerCase()
                            ? 'border-white ring-2 ring-amber-400 scale-105'
                            : 'border-zinc-800'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Conqueror's Lightning Crackle Color */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-zinc-200 flex items-center gap-2">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                      style={{ backgroundColor: value.conquerorLightningColor || '#a855f7' }}
                    />
                    Conqueror's Lightning Arc Color
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">{value.conquerorLightningColor || '#a855f7'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={value.conquerorLightningColor || '#a855f7'}
                    onChange={(e) => updateConfig({ conquerorLightningColor: e.target.value })}
                    className="h-9 w-14 rounded-lg bg-zinc-900 border border-zinc-700 cursor-pointer p-0.5"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['#ef4444', '#dc2626', '#a855f7', '#7c3aed', '#000000', '#fbbf24', '#06b6d4', '#10b981'].map((hex) => (
                      <button
                        key={`lightning-${hex}`}
                        type="button"
                        onClick={() => updateConfig({ conquerorLightningColor: hex })}
                        className={`h-6 w-6 rounded-md border transition hover:scale-110 ${
                          (value.conquerorLightningColor || '').toLowerCase() === hex.toLowerCase()
                            ? 'border-white ring-2 ring-amber-400 scale-105'
                            : 'border-zinc-800'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTICLE INTENSITY & DYNAMICS */}
          {activeTab === 'particles' && (
            <div className="space-y-4 font-mono text-xs">
              {/* Particle Intensity Slider (Core prompt requirement) */}
              <div className="rounded-xl border border-amber-500/40 bg-zinc-950/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-200 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Particle Intensity Density
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] ${intensityInfo.color}`}>{intensityInfo.label}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-black">
                      {value.particleIntensity ?? 65}%
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={value.particleIntensity ?? 65}
                  onChange={(e) => updateConfig({ particleIntensity: Number(e.target.value) })}
                  className="w-full accent-amber-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[9px] text-zinc-500">
                  <span>0% (No Particles)</span>
                  <span>25% (Mild)</span>
                  <span>50% (Standard)</span>
                  <span>75% (Surging)</span>
                  <span>100% (Emperor Apex)</span>
                </div>
              </div>

              {/* Particle Drift Speed Slider */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 flex items-center gap-1.5">
                    <Wind className="h-3.5 w-3.5 text-cyan-400" />
                    Particle Drift Velocity
                  </span>
                  <span className="text-cyan-400 font-bold">{(value.particleSpeed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={value.particleSpeed ?? 1.0}
                  onChange={(e) => updateConfig({ particleSpeed: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Aura Coronal Radius (Spread) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Aura Spread Radius</span>
                  <span className="text-emerald-400 font-bold">{value.auraRadius ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="5"
                  value={value.auraRadius ?? 100}
                  onChange={(e) => updateConfig({ auraRadius: Number(e.target.value) })}
                  className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Aura Core Opacity / Luminance Density */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Aura Glow Opacity</span>
                  <span className="text-purple-400 font-bold">{Math.round((value.auraOpacity ?? 0.75) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={value.auraOpacity ?? 0.75}
                  onChange={(e) => updateConfig({ auraOpacity: Number(e.target.value) })}
                  className="w-full accent-purple-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Idle Breathing Pulse Frequency */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300">Idle Breathing Rhythm</span>
                  <span className="text-amber-400 font-bold">{(value.pulseSpeed ?? 1.0).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={value.pulseSpeed ?? 1.0}
                  onChange={(e) => updateConfig({ pulseSpeed: Number(e.target.value) })}
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SPARK FX, ARMAMENT & OBSERVATION TEXTURES */}
          {activeTab === 'styles' && (
            <div className="space-y-4">
              {/* Particle Spark Visual Effect Type */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-200 block">
                  Idle Particle & Spark Effect Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {[
                    { id: 'Particles', label: 'Energy Motes', icon: '🔮' },
                    { id: 'Lightning', label: 'Lightning Arcs', icon: '⚡' },
                    { id: 'Fire', label: 'Hellfire Embers', icon: '🔥' },
                    { id: 'Stars', label: 'Cosmic Stars', icon: '✨' },
                    { id: 'Conqueror_Rift', label: 'Haoshoku Rifts', icon: '⚔️' },
                    { id: 'Ghost_Embers', label: 'Ghost Wisps', icon: '👻' },
                    { id: 'Ryuo_Petals', label: 'Sakura Petals', icon: '🌸' },
                    { id: 'None', label: 'Pure Glow (None)', icon: '🚫' },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => updateConfig({ sparkEffect: eff.id as HakiSparkEffect })}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition ${
                        value.sparkEffect === eff.id
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300 shadow-sm'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-base mb-0.5">{eff.icon}</span>
                      <span className="text-[10px] font-bold">{eff.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Armament Armor Texture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-purple-400" />
                    Armament Texture (Busoshoku)
                  </label>
                  <select
                    value={value.armamentArmorTexture || 'ryuo_glow'}
                    onChange={(e) => updateConfig({ armamentArmorTexture: e.target.value as any })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="ryuo_glow">Ryuo Internal Destruction Glow</option>
                    <option value="obsidian_black">Hardened Obsidian Black (Koka)</option>
                    <option value="emission_aura">Flowing Barrier Emission Aura</option>
                    <option value="coating">Armament Weapon/Body Coating</option>
                  </select>
                </div>

                {/* Observation Future Sight Pulse Style */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-red-400" />
                    Observation Radar (Kenbunshoku)
                  </label>
                  <select
                    value={value.observationPulseStyle || 'none'}
                    onChange={(e) => updateConfig({ observationPulseStyle: e.target.value as any })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="none">None (Dormant)</option>
                    <option value="future_sight_red">Future Sight Red Ripple</option>
                    <option value="mind_eye_cyan">Mind's Eye Cyan Ring</option>
                    <option value="sensory_waves">Sensory Perception Waves</option>
                    <option value="spatial_distortion">Spatial Distortion Shockwave</option>
                  </select>
                </div>
              </div>

              {/* Visual Rendering Engine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                    <Radio className="h-3.5 w-3.5 text-amber-400" />
                    Aura Visual Style
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => updateConfig({ visualStyle: 'modern_glow' })}
                      className={`p-2 rounded-lg border text-center font-bold transition ${
                        (value.visualStyle || 'modern_glow') === 'modern_glow'
                          ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Modern Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => updateConfig({ visualStyle: 'retro_8bit' })}
                      className={`p-2 rounded-lg border text-center font-bold transition ${
                        value.visualStyle === 'retro_8bit'
                          ? 'border-yellow-400 bg-yellow-950/40 text-yellow-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      Retro 8-Bit
                    </button>
                  </div>
                </div>

                {/* Special Edge Flash Color */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-zinc-300">
                    EX / Super Move Screen Edge Flash
                  </label>
                  <select
                    value={value.specialEdgeFlashColor || 'purple'}
                    onChange={(e) => updateConfig({ specialEdgeFlashColor: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-2 text-xs text-zinc-200 outline-none"
                  >
                    <option value="purple">Purple (Void Conqueror)</option>
                    <option value="red">Red (Crimson Slash)</option>
                    <option value="gold">Gold (Supreme Light)</option>
                    <option value="cyan">Cyan (Plasma Discharge)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LEGENDARY PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-zinc-400 block">
                Click any legendary Haki archetype preset to instantly load authentic colors, particle intensities, and effects:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {PRESET_PALETTES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateConfig({
                        color: preset.color,
                        secondaryColor: preset.secondaryColor,
                        conquerorLightningColor: preset.conquerorLightningColor,
                        sparkEffect: preset.sparkEffect,
                        particleIntensity: preset.particleIntensity,
                        particleSpeed: preset.particleSpeed,
                        auraRadius: preset.auraRadius,
                        auraOpacity: preset.auraOpacity,
                        pulseSpeed: preset.pulseSpeed,
                        armamentArmorTexture: preset.armamentArmorTexture,
                        observationPulseStyle: preset.observationPulseStyle,
                        visualStyle: preset.visualStyle,
                      });
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition hover:scale-[1.02] active:scale-95 ${
                      value.color === preset.color && value.sparkEffect === preset.sparkEffect
                        ? 'border-amber-400 bg-amber-950/30 shadow-md shadow-amber-400/10 ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Color Orbs */}
                    <div className="flex -space-x-2 shrink-0 mt-0.5">
                      <div
                        className="h-6 w-6 rounded-full border border-black shadow-sm"
                        style={{ backgroundColor: preset.color }}
                      />
                      <div
                        className="h-6 w-6 rounded-full border border-black shadow-sm"
                        style={{ backgroundColor: preset.secondaryColor }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-['Cinzel'] text-xs font-bold text-white truncate">{preset.name}</div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate">{preset.subtitle}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-zinc-500">
                        <span>{preset.sparkEffect}</span>
                        <span>•</span>
                        <span>{preset.particleIntensity}% Intensity</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
