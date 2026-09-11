import React from 'react';
import { ActiveComboState } from './RealTimeComboOverlay';

export interface ArcadeComboCounterProps {
  combo: ActiveComboState | null;
  targetMaxHp?: number;
  className?: string;
}

export const ArcadeComboCounter: React.FC<ArcadeComboCounterProps> = React.memo(() => {
  // Handled by primary text-only RealTimeComboOverlay
  return null;
});

ArcadeComboCounter.displayName = 'ArcadeComboCounter';
export default ArcadeComboCounter;
