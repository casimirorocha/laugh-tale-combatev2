// Types for Dynamic Background Crowd System in Arcade Battle Arena

export type CrowdExcitementTier = 'calm' | 'building' | 'hyped' | 'frenzy' | 'pandemonium';

export interface CrowdHitEvent {
  timestamp: number;
  damage: number;
  isCrit?: boolean;
  isSuper?: boolean;
  isClash?: boolean;
  isGuardCrush?: boolean;
  comboCount?: number;
  side?: 'team1' | 'team2';
}

export interface CrowdShoutBubble {
  id: string;
  text: string;
  subtext?: string;
  x: number; // percentage 15% - 85%
  y: number; // percentage 25% - 65%
  scale: number;
  colorTheme?: 'amber' | 'red' | 'purple' | 'cyan' | 'gold';
}

export interface CrowdFlashPoint {
  id: string;
  x: number;
  y: number;
  size: number;
  color?: string;
}

export interface CrowdIntensityState {
  intensity: number; // 0 to 100 normalized
  tier: CrowdExcitementTier;
  tierLabel: string;
  tierColor: string;
  damageFrequency: number; // hits per second over 3.5s window
  recentDamageVelocity: number; // total damage over 3.5s window
  recentHitCount: number;
  isJoltActive: boolean;
  flashPoints: CrowdFlashPoint[];
  shoutBubbles: CrowdShoutBubble[];
}
