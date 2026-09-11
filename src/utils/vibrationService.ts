import { getUserProfile } from './storage';

/**
 * Vibration Service Utility for Haptic Feedback during Battle Simulations.
 * Uses the Web Vibration API for mobile devices and the Gamepad API for controller rumble.
 */
export type AttackIntensity =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'super'
  | 'crit'
  | 'guardCrush'
  | 'ko'
  | 'hakiConqueror'
  | 'hakiArmament'
  | 'hakiObservation'
  | 'hakiClash'
  | 'ultimateCharge'
  | 'ultimateImpact';

interface GamepadRumbleEffect {
  duration: number;
  strong: number; // 0.0 to 1.0
  weak: number;   // 0.0 to 1.0
}

const GAMEPAD_RUMBLES: Record<AttackIntensity, GamepadRumbleEffect> = {
  light: { duration: 100, strong: 0.2, weak: 0.1 },
  medium: { duration: 150, strong: 0.4, weak: 0.3 },
  heavy: { duration: 250, strong: 0.7, weak: 0.5 },
  super: { duration: 400, strong: 0.9, weak: 0.7 },
  crit: { duration: 350, strong: 0.8, weak: 0.6 },
  guardCrush: { duration: 300, strong: 0.6, weak: 0.8 },
  ko: { duration: 600, strong: 1.0, weak: 0.9 },
  hakiConqueror: { duration: 500, strong: 1.0, weak: 0.8 },
  hakiArmament: { duration: 300, strong: 0.8, weak: 0.5 },
  hakiObservation: { duration: 80, strong: 0.1, weak: 0.2 },
  hakiClash: { duration: 450, strong: 0.9, weak: 0.7 },
  ultimateCharge: { duration: 350, strong: 0.5, weak: 0.4 },
  ultimateImpact: { duration: 800, strong: 1.0, weak: 0.9 }
};

export const vibrationService = {
  /**
   * Triggers device vibration pattern and controller haptic rumble based on combat intensity.
   * Respects the user's customized vibration intensity setting from their profile.
   */
  vibrate(intensity: AttackIntensity): void {
    let settingIntensity = 70; // default
    try {
      const profile = getUserProfile();
      if (profile && profile.vibrationIntensity !== undefined) {
        settingIntensity = profile.vibrationIntensity;
      }
    } catch (err) {
      console.warn('Could not read user profile for vibration intensity:', err);
    }

    // 0% intensity means haptics are completely disabled
    if (settingIntensity <= 0) {
      return;
    }

    // 1. Controller Gamepad Rumble
    this.vibrateGamepad(intensity, settingIntensity);

    // 2. Mobile / Device Vibration
    if (typeof window === 'undefined' || !navigator.vibrate) {
      return;
    }

    try {
      let pattern: number | number[];

      switch (intensity) {
        case 'light':
          pattern = 30;
          break;
        case 'medium':
          pattern = [50, 40, 50];
          break;
        case 'heavy':
          pattern = [100, 50, 120];
          break;
        case 'super':
        case 'crit':
          pattern = [80, 60, 140, 60, 200];
          break;
        case 'guardCrush':
          pattern = [150, 80, 150, 80, 250];
          break;
        case 'ko':
          pattern = [300, 100, 400];
          break;
        case 'hakiConqueror':
          pattern = [120, 40, 200, 40, 320, 60, 450];
          break;
        case 'hakiArmament':
          pattern = [80, 30, 150, 40, 220];
          break;
        case 'hakiObservation':
          pattern = [20, 25, 25];
          break;
        case 'hakiClash':
          pattern = [100, 50, 180, 50, 260, 60, 350];
          break;
        case 'ultimateCharge':
          pattern = [40, 50, 70, 50, 110, 60, 160];
          break;
        case 'ultimateImpact':
          pattern = [160, 50, 260, 50, 450, 80, 650];
          break;
        default:
          pattern = 50;
          break;
      }

      // Scale pattern timings proportionally to the intensity setting
      const scaledPattern = this.scaleVibrationPattern(pattern, settingIntensity);
      navigator.vibrate(scaledPattern);
    } catch (e) {
      console.warn('Device vibration failed:', e);
    }
  },

  /**
   * Helper to scale standard mobile device vibration pattern timings.
   */
  scaleVibrationPattern(pattern: number | number[], settingIntensity: number): number | number[] {
    const multiplier = settingIntensity / 100;
    if (typeof pattern === 'number') {
      return Math.max(1, Math.round(pattern * multiplier));
    } else {
      return pattern.map((val, idx) => {
        // Only scale duration pulses, keep delay silences relatively standard but proportional
        return Math.max(1, Math.round(val * multiplier));
      });
    }
  },

  /**
   * Triggers haptic rumble on all active gamepads with haptic actuators.
   */
  vibrateGamepad(intensity: AttackIntensity, settingIntensity: number): void {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return;
    }

    const effect = GAMEPAD_RUMBLES[intensity] || { duration: 150, strong: 0.4, weak: 0.3 };
    const multiplier = settingIntensity / 100;

    const strongMag = Math.min(1.0, Math.max(0.0, effect.strong * multiplier));
    const weakMag = Math.min(1.0, Math.max(0.0, effect.weak * multiplier));
    const finalDuration = Math.round(effect.duration);

    try {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          // Play on gamepad actuator if supported (Chrome/Edge/Opera standard)
          const actuator = (gp as any).vibrationActuator || (gp as any).hapticActuators?.[0];
          if (actuator && typeof actuator.playEffect === 'function') {
            actuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: finalDuration,
              strongMagnitude: strongMag,
              weakMagnitude: weakMag,
            }).catch((err: any) => {
              console.debug('[VibrationService] Gamepad actuator playEffect failed:', err);
            });
          }
        }
      }
    } catch (e) {
      console.warn('[VibrationService] Gamepad vibration failed:', e);
    }
  },

  /**
   * Dedicated Haki Clash vibration trigger based on Haki type & damage scale.
   */
  vibrateHakiClash(hakiType?: string, damage: number = 100): void {
    const normalized = (hakiType || '').toLowerCase();
    if (normalized.includes('conqueror') || normalized.includes('haoshoku')) {
      this.vibrate('hakiConqueror');
    } else if (normalized.includes('armament') || normalized.includes('ryuo') || normalized.includes('busoshoku')) {
      this.vibrate('hakiArmament');
    } else if (normalized.includes('observation') || normalized.includes('future') || normalized.includes('kenbunshoku')) {
      this.vibrate('hakiObservation');
    } else {
      if (damage >= 180) {
        this.vibrate('hakiConqueror');
      } else {
        this.vibrate('hakiClash');
      }
    }
  },

  /**
   * Dedicated Ultimate Move vibration trigger based on execution phase.
   */
  vibrateUltimateMove(phase: 'charge' | 'impact' | 'finisher' = 'impact', _moveName?: string): void {
    if (phase === 'charge') {
      this.vibrate('ultimateCharge');
    } else if (phase === 'finisher') {
      this.vibrate('ko');
    } else {
      this.vibrate('ultimateImpact');
    }
  },
};
