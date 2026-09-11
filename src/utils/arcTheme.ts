import { useState, useEffect } from 'react';

export type ArcTimeTheme = 'east_blue_dawn' | 'alabasta_noon' | 'wano_dusk' | 'thriller_bark_night';

export interface ArcThemeConfig {
  id: ArcTimeTheme;
  label: string;
  emoji: string;
  primaryColor: string; // Tailwind class color or hex
  accentColor: string;
  bgGradient: string; // Global UI backdrop gradient
  cardBg: string; // Card background modifier
  textColor: string;
  weatherEffectOverride: string;
}

export const ARC_THEMES: Record<ArcTimeTheme, ArcThemeConfig> = {
  east_blue_dawn: {
    id: 'east_blue_dawn',
    label: 'East Blue Dawn',
    emoji: '🌊',
    primaryColor: 'text-sky-400',
    accentColor: '#38bdf8',
    bgGradient: 'from-slate-900 via-sky-950 to-blue-900',
    cardBg: 'bg-sky-950/20 border-sky-900/50',
    textColor: 'text-sky-100',
    weatherEffectOverride: 'snow', // Used as sea mist/sparkles
  },
  alabasta_noon: {
    id: 'alabasta_noon',
    label: 'Alabasta Noon',
    emoji: '☀️',
    primaryColor: 'text-amber-400',
    accentColor: '#f59e0b',
    bgGradient: 'from-orange-950 via-amber-950/80 to-yellow-950/40',
    cardBg: 'bg-amber-950/20 border-amber-900/50',
    textColor: 'text-amber-100',
    weatherEffectOverride: 'clouds', // Golden sand/stardust
  },
  wano_dusk: {
    id: 'wano_dusk',
    label: 'Wano Dusk',
    emoji: '🌸',
    primaryColor: 'text-rose-400',
    accentColor: '#f43f5e',
    bgGradient: 'from-purple-950 via-rose-950/80 to-red-950/40',
    cardBg: 'bg-rose-950/20 border-rose-900/50',
    textColor: 'text-rose-100',
    weatherEffectOverride: 'cherry_blossoms',
  },
  thriller_bark_night: {
    id: 'thriller_bark_night',
    label: 'Thriller Bark Night',
    emoji: '🦇',
    primaryColor: 'text-purple-400',
    accentColor: '#a855f7',
    bgGradient: 'from-zinc-950 via-purple-950/40 to-slate-950',
    cardBg: 'bg-purple-950/20 border-purple-900/50',
    textColor: 'text-purple-100',
    weatherEffectOverride: 'lightning',
  },
};

// Auto-detect based on hour of day
export function getAutoArcTheme(hour: number): ArcTimeTheme {
  // 6 AM - 11 AM: East Blue Dawn
  if (hour >= 6 && hour < 12) return 'east_blue_dawn';
  // 12 PM - 4 PM: Alabasta Noon
  if (hour >= 12 && hour < 17) return 'alabasta_noon';
  // 5 PM - 7 PM: Wano Dusk
  if (hour >= 17 && hour < 20) return 'wano_dusk';
  // 8 PM - 5 AM: Thriller Bark Night
  return 'thriller_bark_night';
}

export function useArcTheme() {
  const [currentThemeId, setCurrentThemeId] = useState<ArcTimeTheme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('arcade_battle_arc_theme') as ArcTimeTheme | null;
    if (saved && ARC_THEMES[saved]) return saved;
    // Detect dynamically based on hour
    const currentHour = new Date().getHours();
    return getAutoArcTheme(currentHour);
  });

  const [isAuto, setIsAuto] = useState<boolean>(() => {
    return localStorage.getItem('arcade_battle_arc_theme_auto') !== 'false';
  });

  const selectTheme = (themeId: ArcTimeTheme) => {
    setCurrentThemeId(themeId);
    setIsAuto(false);
    localStorage.setItem('arcade_battle_arc_theme', themeId);
    localStorage.setItem('arcade_battle_arc_theme_auto', 'false');
  };

  const setAutoMode = () => {
    setIsAuto(true);
    localStorage.setItem('arcade_battle_arc_theme_auto', 'true');
    const currentHour = new Date().getHours();
    const autoTheme = getAutoArcTheme(currentHour);
    setCurrentThemeId(autoTheme);
    localStorage.removeItem('arcade_battle_arc_theme');
  };

  const theme = ARC_THEMES[currentThemeId];

  return {
    themeId: currentThemeId,
    theme,
    isAuto,
    selectTheme,
    setAutoMode,
  };
}
