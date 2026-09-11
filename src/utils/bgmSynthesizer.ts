// Web Audio API Dynamic Arcade Battle Background Music (BGM) Engine
// Generates responsive, high-energy arcade battle themes for Opening, Mid, Climax, and Desperate phases.

export type BattleBGMPhase = 'Opening' | 'Mid' | 'Climax' | 'Desperate';

export class DynamicBattleBGMEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.25;
  private currentPhase: BattleBGMPhase = 'Opening';
  private isPlaying: boolean = false;
  private timerId: any = null;
  private step: number = 0;
  private masterGain: GainNode | null = null;

  // Track Phase Configurations
  private phaseConfigs: Record<
    BattleBGMPhase,
    {
      bpm: number;
      scale: number[];
      bassNotes: number[];
      arpeggios: number[];
      leadWave: OscillatorType;
      bassWave: OscillatorType;
      drumIntensity: number;
    }
  > = {
    Opening: {
      bpm: 128,
      // D minor / F Major upbeat heroic scale frequencies
      scale: [293.66, 329.63, 349.23, 392.0, 440.0, 523.25, 587.33, 659.25], // D4, E4, F4, G4, A4, C5, D5, E5
      bassNotes: [73.42, 87.31, 98.0, 110.0], // D2, F2, G2, A2
      arpeggios: [293.66, 349.23, 440.0, 587.33, 440.0, 349.23, 392.0, 523.25],
      leadWave: 'triangle',
      bassWave: 'sawtooth',
      drumIntensity: 1,
    },
    Mid: {
      bpm: 138,
      // Intensified driving battle scale
      scale: [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25], // C4, D4, Eb4, F4, G4, Ab4, Bb4, C5
      bassNotes: [65.41, 77.78, 82.41, 98.0], // C2, Eb2, E2, G2
      arpeggios: [261.63, 392.0, 311.13, 523.25, 349.23, 466.16, 392.0, 311.13],
      leadWave: 'sawtooth',
      bassWave: 'sawtooth',
      drumIntensity: 2,
    },
    Climax: {
      bpm: 148,
      // High-stakes climax battle scale (E Minor / Harmonic Minor)
      scale: [329.63, 369.99, 392.0, 440.0, 493.88, 523.25, 622.25, 659.25], // E4, F#4, G4, A4, B4, C5, D#5, E5
      bassNotes: [82.41, 98.0, 110.0, 123.47], // E2, G2, A2, B2
      arpeggios: [329.63, 493.88, 392.0, 659.25, 523.25, 622.25, 493.88, 392.0],
      leadWave: 'square',
      bassWave: 'sawtooth',
      drumIntensity: 3,
    },
    Desperate: {
      bpm: 158,
      // Maximum tension urgency scale (A Minor Phrygian Dominant)
      scale: [220.0, 233.08, 277.18, 293.66, 329.63, 349.23, 392.0, 440.0], // A3, Bb3, C#4, D4, E4, F4, G4, A4
      bassNotes: [55.0, 58.27, 69.3, 73.42], // A1, Bb1, C#2, D2
      arpeggios: [440.0, 349.23, 277.18, 233.08, 440.0, 587.33, 493.88, 329.63],
      leadWave: 'sawtooth',
      bassWave: 'square',
      drumIntensity: 4,
    },
  };

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public async resumeContext(): Promise<void> {
    this.initContext();
    if (this.ctx && (this.ctx.state === 'suspended' || (this.ctx.state as string) === 'interrupted')) {
      try {
        await this.ctx.resume();
        console.log('[DynamicBattleBGMEngine] Context successfully resumed!');
      } catch (err) {
        console.warn('[DynamicBattleBGMEngine] Failed to resume context:', err);
      }
    }
  }

  public start(initialPhase: BattleBGMPhase = 'Opening') {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.currentPhase = initialPhase;
    this.isPlaying = true;
    this.step = 0;

    if (this.timerId) {
      clearInterval(this.timerId);
    }

    this.runSequencerLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    // Fade out or kill audio instantly
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    }
  }

  public setPhase(newPhase: BattleBGMPhase) {
    if (this.currentPhase === newPhase) return;
    this.currentPhase = newPhase;

    if (this.isPlaying) {
      // Reconfigure loop timing dynamically
      if (this.timerId) clearInterval(this.timerId);
      this.runSequencerLoop();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);
    }
    if (!this.isPlaying && !this.isMuted) {
      this.start(this.currentPhase);
    }
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.volume, now);
    }
  }

  public getCurrentPhase(): BattleBGMPhase {
    return this.currentPhase;
  }

  private runSequencerLoop() {
    const config = this.phaseConfigs[this.currentPhase];
    // 16th note step duration in milliseconds
    const stepDurationMs = (60 / config.bpm / 4) * 1000;

    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.masterGain || this.isMuted) {
        this.step = (this.step + 1) % 32;
        return;
      }

      this.scheduleStep(this.step, config);
      this.step = (this.step + 1) % 32;
    }, stepDurationMs);
  }

  private scheduleStep(
    step: number,
    config: (typeof this.phaseConfigs)['Opening']
  ) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // 1. Bassline (On 8th notes)
    if (step % 2 === 0) {
      const bassIndex = Math.floor(step / 8) % (config.bassNotes?.length || 1);
      const baseFreq = config.bassNotes[bassIndex];
      // Bass octave bounce
      const freq = step % 4 === 2 ? baseFreq * 1.5 : baseFreq;
      this.playBassNote(freq, now, config.bassWave, config.bpm);
    }

    // 2. Arpeggio / Lead Melody (16th notes)
    const arpNote = config.arpeggios[step % (config.arpeggios?.length || 1)];
    if (arpNote) {
      const isAccented = step % 4 === 0;
      this.playLeadNote(arpNote, now, config.leadWave, isAccented);
    }

    // 3. Drums / Percussion
    // Kick on beats 1, 5, 9, 13 (every 4 steps)
    if (step % 4 === 0) {
      this.playKick(now, config.drumIntensity);
    } else if (config.drumIntensity >= 3 && (step % 8 === 6 || step % 16 === 14)) {
      // Syncopated double kick for Climax/Desperate
      this.playKick(now, config.drumIntensity * 0.8);
    }

    // Snare on beats 2 & 4 (steps 4, 12, 20, 28)
    if (step % 8 === 4) {
      this.playSnare(now, config.drumIntensity);
    }

    // Hi-hats on every 16th or off-beat
    if (step % 2 === 1 || config.drumIntensity >= 2) {
      const isAccent = step % 4 === 2;
      this.playHiHat(now, isAccent);
    }

    // Crash cymbal on bar start (step 0)
    if (step === 0 && config.drumIntensity >= 2) {
      this.playCrash(now);
    }
  }

  private playBassNote(freq: number, time: number, wave: OscillatorType, bpm: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const duration = (60 / bpm / 2) * 0.85;

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, time);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, time + duration);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playLeadNote(freq: number, time: number, wave: OscillatorType, isAccent: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const duration = 0.12;

    osc.type = wave;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isAccent ? 2400 : 1600, time);
    filter.Q.setValueAtTime(2.0, time);

    const amp = isAccent ? 0.22 : 0.14;
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playKick(time: number, intensity: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + intensity * 15, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    const dur = 0.15;
    gain.gain.setValueAtTime(0.45 + intensity * 0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur);
  }

  private playSnare(time: number, intensity: number) {
    if (!this.ctx || !this.masterGain) return;

    // Body tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.12);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28 + intensity * 0.05, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private playHiHat(time: number, isAccent: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(6000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isAccent ? 0.15 : 0.08, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private playCrash(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3500, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.4);
  }
}

export const battleBgmEngine = new DynamicBattleBGMEngine();
