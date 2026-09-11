import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import {
  CrowdExcitementTier,
  CrowdHitEvent,
  CrowdShoutBubble,
  CrowdFlashPoint,
  CrowdIntensityState,
} from '../types/crowd';
import { soundManager } from '../utils/soundEffects';

interface UseMatchIntensityProps {
  isPaused?: boolean;
  isGameOver?: boolean;
  isClashActive?: boolean;
  isDesperate?: boolean;
  activeComboHits?: number;
  comboMultiplier?: number;
  soundEnabled?: boolean;
}

const CROWD_SHOUT_POOL: Array<{ text: string; subtext?: string; theme: 'amber' | 'red' | 'purple' | 'cyan' | 'gold' }> = [
  { text: 'SUGEEE!!', subtext: '凄い!!', theme: 'amber' },
  { text: 'DON!!', subtext: 'ドン!!', theme: 'gold' },
  { text: 'GET \'EM!!', theme: 'red' },
  { text: 'WHAT POWER!!', theme: 'purple' },
  { text: 'YEAAAH!!', theme: 'amber' },
  { text: 'KA-BOOM!!', theme: 'red' },
  { text: 'HOLY HAKI!!', subtext: '覇気!!', theme: 'purple' },
  { text: 'ONE MORE HIT!!', theme: 'cyan' },
  { text: 'PANDEMONIUM!!', subtext: '大熱狂!!', theme: 'gold' },
  { text: 'DON\'T BLINK!!', theme: 'amber' },
  { text: 'OVERWHELMING!!', theme: 'purple' },
  { text: 'UNREAL COMBO!!', theme: 'gold' },
];

export function useMatchIntensity({
  isPaused = false,
  isGameOver = false,
  isClashActive = false,
  isDesperate = false,
  activeComboHits = 0,
  comboMultiplier = 1,
  soundEnabled = true,
}: UseMatchIntensityProps = {}) {
  // Current interpolated intensity (0 - 100)
  const [intensity, setIntensity] = useState<number>(18);
  const [damageFrequency, setDamageFrequency] = useState<number>(0);
  const [recentDamageVelocity, setRecentDamageVelocity] = useState<number>(0);
  const [recentHitCount, setRecentHitCount] = useState<number>(0);
  const [isJoltActive, setIsJoltActive] = useState<boolean>(false);
  const [flashPoints, setFlashPoints] = useState<CrowdFlashPoint[]>([]);
  const [shoutBubbles, setShoutBubbles] = useState<CrowdShoutBubble[]>([]);

  // Sliding window hit queue
  const hitsRef = useRef<CrowdHitEvent[]>([]);
  const intensityRef = useRef<number>(18);
  const lastCheerSoundTimeRef = useRef<number>(0);
  const lastShoutTimeRef = useRef<number>(0);
  const lastFlashTimeRef = useRef<number>(0);
  const joltTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  intensityRef.current = intensity;

  // Determine current tier from numerical intensity
  const getTierDetails = (value: number): { tier: CrowdExcitementTier; label: string; color: string } => {
    if (value >= 90) return { tier: 'pandemonium', label: 'PANDEMONIUM', color: '#f59e0b' };
    if (value >= 70) return { tier: 'frenzy', label: 'FRENZY', color: '#ef4444' };
    if (value >= 45) return { tier: 'hyped', label: 'HYPED', color: '#ec4899' };
    if (value >= 25) return { tier: 'building', label: 'BUILDING', color: '#38bdf8' };
    return { tier: 'calm', label: 'CALM', color: '#94a3b8' };
  };

  // Record a damage impact event
  const recordHit = useCallback((hit: CrowdHitEvent) => {
    const now = Date.now();
    const hitWithTime = { ...hit, timestamp: now };
    hitsRef.current.push(hitWithTime);

    // Keep queue bounded
    if (hitsRef.current.length > 25) {
      hitsRef.current = hitsRef.current.slice(-25);
    }

    // Sudden crowd impact jolt! Silhouettes jerk and throw hands into the air
    setIsJoltActive(true);
    if (joltTimeoutRef.current) clearTimeout(joltTimeoutRef.current);
    joltTimeoutRef.current = setTimeout(() => {
      setIsJoltActive(false);
    }, 280);

    // Immediate hype spike calculation based on impact type
    let spike = 14;
    spike += Math.min(22, hit.damage / 12);

    if (hit.isCrit) spike += 18;
    if (hit.isSuper) spike += 28;
    if (hit.isClash) spike += 40;
    if (hit.isGuardCrush) spike += 22;
    if (hit.comboCount && hit.comboCount >= 3) {
      spike += Math.min(30, hit.comboCount * 5);
    }

    setIntensity((prev) => {
      const next = Math.min(100, prev + spike);
      intensityRef.current = next;

      // Audio feedback on hype milestones
      if (soundEnabled && next >= 70 && now - lastCheerSoundTimeRef.current > 3200) {
        lastCheerSoundTimeRef.current = now;
        soundManager.playCrowdCheer(next);
      }

      return next;
    });

    // Maybe spawn excitement shout bubble from the crowd
    if (intensityRef.current >= 38 && now - lastShoutTimeRef.current > 1100) {
      lastShoutTimeRef.current = now;
      const pick = CROWD_SHOUT_POOL[Math.floor(Math.random() * CROWD_SHOUT_POOL.length)];
      const newBubble: CrowdShoutBubble = {
        id: `shout-${now}-${Math.random().toString(36).substring(2, 6)}`,
        text: pick.text,
        subtext: pick.subtext,
        x: Math.floor(18 + Math.random() * 64),
        y: Math.floor(25 + Math.random() * 35),
        scale: 0.85 + Math.random() * 0.35,
        colorTheme: pick.theme,
      };

      setShoutBubbles((prev) => [...prev.slice(-3), newBubble]);
      setTimeout(() => {
        setShoutBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
      }, 1600);
    }
  }, [soundEnabled]);

  // Main tick loop for decay, frequency recalculation, and flashbulbs
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const WINDOW_MS = 3500;

      // Filter hits within sliding window
      hitsRef.current = hitsRef.current.filter((h) => now - h.timestamp <= WINDOW_MS);
      const recentHits = hitsRef.current;
      const count = recentHits.length;
      const freq = Number((count / (WINDOW_MS / 1000)).toFixed(1));
      const dmgVelocity = recentHits.reduce((acc, h) => acc + h.damage, 0);

      setDamageFrequency((prev) => (prev === freq ? prev : freq));
      setRecentDamageVelocity((prev) => (prev === dmgVelocity ? prev : dmgVelocity));
      setRecentHitCount((prev) => (prev === count ? prev : count));

      // Baseline minimums based on match context
      let floor = 14;
      if (isDesperate) floor = Math.max(floor, 35); // Close round/desperation builds natural tension
      if (isClashActive) floor = 95; // Haki clash electrifies the crowd to maximum!
      if (activeComboHits >= 4) floor = Math.max(floor, 40 + Math.min(45, activeComboHits * 7));

      // Calculate target intensity from activity
      const hitScore = Math.min(75, count * 18);
      const dmgScore = Math.min(30, dmgVelocity / 20);
      const computedTarget = Math.min(100, Math.max(floor, hitScore + dmgScore));

      // Smooth decay & lerp towards target
      setIntensity((prev) => {
        let next: number;
        if (computedTarget > prev) {
          // Rapid swell upon attacks
          next = prev * 0.75 + computedTarget * 0.25;
        } else {
          // Graceful decay when fighting pauses
          next = prev * 0.94 + computedTarget * 0.06;
        }
        const clamped = Math.min(100, Math.max(floor, Number(next.toFixed(1))));
        if (Math.abs(clamped - prev) < 0.1) return prev;
        intensityRef.current = clamped;
        return clamped;
      });

      // Camera Flashbulbs in the bleachers during elevated intensity
      const currentIntensity = intensityRef.current;
      if (currentIntensity >= 32) {
        const flashChance = currentIntensity >= 85 ? 0.85 : currentIntensity >= 65 ? 0.6 : 0.35;
        if (Math.random() < flashChance && now - lastFlashTimeRef.current > (currentIntensity >= 80 ? 120 : 280)) {
          lastFlashTimeRef.current = now;
          const flashCount = currentIntensity >= 85 ? 2 + Math.floor(Math.random() * 2) : 1;
          const newFlashes: CrowdFlashPoint[] = Array.from({ length: flashCount }, (_, idx) => ({
            id: `flash-${now}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
            x: Math.floor(10 + Math.random() * 80),
            y: Math.floor(15 + Math.random() * 55),
            size: Math.floor(16 + Math.random() * 22),
            color: Math.random() > 0.3 ? '#ffffff' : '#fef08a',
          }));

          setFlashPoints((prev) => [...prev.slice(-6), ...newFlashes]);
          setTimeout(() => {
            const idsToRemove = new Set(newFlashes.map((f) => f.id));
            setFlashPoints((prev) => prev.filter((f) => !idsToRemove.has(f.id)));
          }, 320);
        }
      }
    }, 130);

    return () => {
      clearInterval(interval);
      if (joltTimeoutRef.current) clearTimeout(joltTimeoutRef.current);
    };
  }, [isPaused, isGameOver, isClashActive, isDesperate, activeComboHits]);

  const { tier, label: tierLabel, color: tierColor } = getTierDetails(intensity);

  // Sync Ambient Crowd Volume with current Intensity & Combo Multiplier
  useEffect(() => {
    if (isGameOver || isPaused || !soundEnabled) {
      soundManager.stopAmbientCrowd();
      return;
    }

    // Boost intensity proportionally based on the current Combo Count multiplier
    // Higher multipliers (x1.10, x1.50+) directly swell the crowd floor atmosphere
    const audioMixingIntensity = comboMultiplier > 1 
      ? Math.min(100, intensity * (1 + (comboMultiplier - 1) * 0.5)) 
      : intensity;

    soundManager.updateAmbientCrowd(audioMixingIntensity);

    return () => {
      // If the hook unmounts, stop the loop
      soundManager.stopAmbientCrowd();
    };
  }, [intensity, activeComboHits, comboMultiplier, isGameOver, isPaused, soundEnabled]);

  return {
    intensity,
    tier,
    tierLabel,
    tierColor,
    damageFrequency,
    recentDamageVelocity,
    recentHitCount,
    isJoltActive,
    flashPoints,
    shoutBubbles,
    recordHit,
    setIntensity,
  } as CrowdIntensityState & {
    recordHit: (hit: CrowdHitEvent) => void;
    setIntensity: Dispatch<SetStateAction<number>>;
  };
}
