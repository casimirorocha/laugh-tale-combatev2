import { useEffect, useCallback, RefObject, MutableRefObject } from 'react';
import { battleBgmEngine } from '../utils/bgmSynthesizer';
import { characterVoiceManager } from '../utils/audioAssetLibrary';
import { battleAnnouncer } from '../utils/soundEffects';

interface UseBattleArenaCleanupProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  activeD3ParticlesRef: MutableRefObject<Map<string, any>>;
  activeTimeoutsRef: MutableRefObject<Set<NodeJS.Timeout>>;
  isMatchOverRef: MutableRefObject<boolean>;
  isRoundTransitioningRef: MutableRefObject<boolean>;
  isD3RoundTransitioningRef: MutableRefObject<boolean>;
  isD3RoundTransitioning: boolean;
  currentRound: number;
  stageId: string;
  onClearResidualUI?: () => void;
  resetDestructibleProps?: () => void;
}

export function useBattleArenaCleanup({
  canvasRef,
  activeD3ParticlesRef,
  activeTimeoutsRef,
  isMatchOverRef,
  isRoundTransitioningRef,
  isD3RoundTransitioningRef,
  isD3RoundTransitioning,
  currentRound,
  stageId,
  onClearResidualUI,
  resetDestructibleProps,
}: UseBattleArenaCleanupProps) {
  // Explicitly clear 2D canvas context and reset bounds
  const clearCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }, [canvasRef]);

  // Clean up all active timers and scheduled callbacks
  const clearAllScheduledTimeouts = useCallback(() => {
    if (activeTimeoutsRef.current) {
      activeTimeoutsRef.current.forEach((t) => clearTimeout(t));
      activeTimeoutsRef.current.clear();
    }
  }, [activeTimeoutsRef]);

  // Clean up residual combat visual state (particles, hazards, floating text)
  const cleanupResidualCombatState = useCallback(() => {
    // 1. Wipe active D3 particles Map to prevent ghost rendering
    if (activeD3ParticlesRef.current) {
      activeD3ParticlesRef.current.clear();
    }

    // 2. Clear canvas frame
    clearCanvasContext();

    // 3. Reset environmental destructible props
    if (resetDestructibleProps) {
      resetDestructibleProps();
    }

    // 4. Wipe floating damage, speech bubbles, super cutins
    if (onClearResidualUI) {
      onClearResidualUI();
    }
  }, [clearCanvasContext, activeD3ParticlesRef, resetDestructibleProps, onClearResidualUI]);

  // Handle transition state changes (e.g. D3 round transition overlay active)
  useEffect(() => {
    if (isD3RoundTransitioning) {
      // Synchronize ref immediately
      isD3RoundTransitioningRef.current = true;
      isRoundTransitioningRef.current = true;

      // Wipe background canvas frame so no ghost elements/hazards leak beneath overlay
      clearCanvasContext();

      // Wipe residual UI artifacts (floating damages, speech bubbles)
      if (onClearResidualUI) {
        onClearResidualUI();
      }
    } else {
      isD3RoundTransitioningRef.current = false;
    }
  }, [isD3RoundTransitioning, isD3RoundTransitioningRef, isRoundTransitioningRef, clearCanvasContext, onClearResidualUI]);

  // Handle round number changes
  useEffect(() => {
    // Clear residual floating combat elements on round shift
    if (onClearResidualUI) {
      onClearResidualUI();
    }
    clearCanvasContext();
  }, [currentRound, clearCanvasContext, onClearResidualUI]);

  // Handle stage ID changes
  useEffect(() => {
    if (activeD3ParticlesRef.current) {
      activeD3ParticlesRef.current.clear();
    }
    clearCanvasContext();
  }, [stageId, activeD3ParticlesRef, clearCanvasContext]);

  // Handle unmount of the Battle Arena component
  useEffect(() => {
    return () => {
      // 1. Signal all game loops, heartbeat ticks, and gamepad listeners to halt immediately
      isMatchOverRef.current = true;
      isRoundTransitioningRef.current = false;
      isD3RoundTransitioningRef.current = false;

      // 2. Stop audio engines and announcers
      battleBgmEngine.stop();
      characterVoiceManager.stopAll();
      battleAnnouncer.resetQueue();

      // 3. Clear all scheduled timeouts
      if (activeTimeoutsRef.current) {
        activeTimeoutsRef.current.forEach((t) => clearTimeout(t));
        activeTimeoutsRef.current.clear();
      }

      // 4. Wipe particle data structures
      if (activeD3ParticlesRef.current) {
        activeD3ParticlesRef.current.clear();
      }

      // 5. Clear canvas context explicitly
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }
    };
  }, [canvasRef, activeD3ParticlesRef, activeTimeoutsRef, isMatchOverRef, isRoundTransitioningRef, isD3RoundTransitioningRef]);

  return {
    clearCanvasContext,
    clearAllScheduledTimeouts,
    cleanupResidualCombatState,
  };
}
