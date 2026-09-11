// Web Audio API Synthesizer & Japanese Male Anime Battle Announcer Engine
import { CrowdReactionType, TauntMotionChoreography } from '../types/battleTaunts';

export type AnnouncerLanguage = 'ja' | 'en' | 'pt';

class ArcadeAudioSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public volume: number = 0.5;
  private activeSources: Set<AudioBufferSourceNode | OscillatorNode> = new Set();

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Stop all active synthesized sound effects instantly
   */
  public stopAll() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source already stopped
      }
    });
    this.activeSources.clear();
  }

  private trackSource(source: AudioBufferSourceNode | OscillatorNode) {
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
    };
  }

  public playHit(type: 'light' | 'medium' | 'heavy' | 'crit') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    this.trackSource(osc);

    osc.type = type === 'crit' ? 'sawtooth' : 'triangle';
    const freq = type === 'light' ? 180 : type === 'medium' ? 120 : type === 'heavy' ? 80 : 240;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + (type === 'heavy' ? 0.25 : 0.15));

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'crit' ? 3000 : 1500, now);

    const dur = type === 'heavy' || type === 'crit' ? 0.3 : 0.15;
    gain.gain.setValueAtTime(this.volume * (type === 'crit' ? 0.9 : 0.7), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);

    this.playNoiseImpact(now, type);
  }

  private playNoiseImpact(now: number, type: 'light' | 'medium' | 'heavy' | 'crit') {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    this.trackSource(noise);
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(type === 'heavy' ? 400 : 800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    this.trackSource(osc);
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(this.volume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playHakiThunder() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    this.trackSource(osc1);
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.4);
    gain1.gain.setValueAtTime(this.volume * 0.8, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    this.trackSource(sub);
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.6);
    subGain.gain.setValueAtTime(this.volume * 0.9, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 0.6);
  }

  public playSuperCharge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    this.trackSource(osc);
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playParry() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Layer 1: High-pitched resonant ping (crisp metal bell)
    const oscPing = this.ctx.createOscillator();
    const gainPing = this.ctx.createGain();
    const filterPing = this.ctx.createBiquadFilter();
    this.trackSource(oscPing);

    oscPing.type = 'sine';
    oscPing.frequency.setValueAtTime(1400, now);
    oscPing.frequency.exponentialRampToValueAtTime(950, now + 0.35);

    filterPing.type = 'highpass';
    filterPing.frequency.setValueAtTime(800, now);

    gainPing.gain.setValueAtTime(this.volume * 0.9, now);
    gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscPing.connect(filterPing);
    filterPing.connect(gainPing);
    gainPing.connect(this.ctx.destination);

    oscPing.start(now);
    oscPing.stop(now + 0.35);

    // Layer 2: Medium harmonic chime for rich tone
    const oscChime = this.ctx.createOscillator();
    const gainChime = this.ctx.createGain();
    this.trackSource(oscChime);

    oscChime.type = 'triangle';
    oscChime.frequency.setValueAtTime(1800, now);
    oscChime.frequency.setValueAtTime(1200, now + 0.05);

    gainChime.gain.setValueAtTime(this.volume * 0.4, now);
    gainChime.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscChime.connect(gainChime);
    gainChime.connect(this.ctx.destination);

    oscChime.start(now);
    oscChime.stop(now + 0.25);

    // Layer 3: Noise snap for a clean impact transient
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2500, now);
    noiseFilter.Q.setValueAtTime(2.0, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    this.trackSource(noiseNode);
    noiseNode.start(now);
    noiseNode.stop(now + 0.05);
  }

  public playGuardBlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Layer 1: Solid Cushioned Low-End Force Absorption
    const oscLow = this.ctx.createOscillator();
    const gainLow = this.ctx.createGain();
    const filterLow = this.ctx.createBiquadFilter();
    this.trackSource(oscLow);

    oscLow.type = 'triangle';
    oscLow.frequency.setValueAtTime(160, now);
    oscLow.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    filterLow.type = 'lowpass';
    filterLow.frequency.setValueAtTime(600, now);
    filterLow.frequency.exponentialRampToValueAtTime(100, now + 0.22);

    gainLow.gain.setValueAtTime(this.volume * 0.75, now);
    gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    oscLow.connect(filterLow);
    filterLow.connect(gainLow);
    gainLow.connect(this.ctx.destination);

    oscLow.start(now);
    oscLow.stop(now + 0.22);

    // Layer 2: Metallic / Energy Shield Resonant Clink
    const oscShield = this.ctx.createOscillator();
    const gainShield = this.ctx.createGain();
    const filterShield = this.ctx.createBiquadFilter();
    this.trackSource(oscShield);

    oscShield.type = 'square';
    oscShield.frequency.setValueAtTime(480, now);
    oscShield.frequency.exponentialRampToValueAtTime(240, now + 0.16);

    filterShield.type = 'bandpass';
    filterShield.frequency.setValueAtTime(1200, now);
    filterShield.Q.setValueAtTime(3.5, now);

    gainShield.gain.setValueAtTime(this.volume * 0.45, now);
    gainShield.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    oscShield.connect(filterShield);
    filterShield.connect(gainShield);
    gainShield.connect(this.ctx.destination);

    oscShield.start(now);
    oscShield.stop(now + 0.16);

    // Layer 3: Cushioned Impact Noise Dispersion
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    this.trackSource(noise);
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(900, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.38, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playDodge() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Layer 1: Rapid Aerodynamic Wind Displacement Whoosh
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    this.trackSource(noise);
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.55, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);

    // Layer 2: Swift Body Evasion Tone Swipe
    const osc = this.ctx.createOscillator();
    this.trackSource(osc);
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

    oscGain.gain.setValueAtTime(this.volume * 0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playGuardCrush() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    this.trackSource(osc);
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(160, now + 0.1);
    osc.frequency.setValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(this.volume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playFutureSight() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    this.trackSource(osc);
    this.trackSource(osc2);
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(1280, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.45);
    osc.frequency.exponentialRampToValueAtTime(360, now + 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(290, now);
    osc2.frequency.exponentialRampToValueAtTime(640, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 1.0);

    gain.gain.setValueAtTime(this.volume * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.3, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 1.25);
    osc2.stop(now + 1.25);
  }

  /**
   * Synthesizes a dizzying, pulsating stun feedback sound effect
   * with oscillating dissonance, LFO pitch wobbles, and sparkling pings.
   */
  public playStunSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 0.95;

    // Layer 1: Dizzy Wobbling LFO-modulated Dual Carrier Oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const mainGain = this.ctx.createGain();

    this.trackSource(osc1);
    this.trackSource(osc2);
    this.trackSource(lfo);

    // LFO frequency modulation (6.5 Hz dizzy wobble)
    lfo.frequency.setValueAtTime(6.5, now);
    lfoGain.gain.setValueAtTime(25, now);
    lfoGain.gain.exponentialRampToValueAtTime(8, now + dur);

    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    // Dissonant minor second / tritone resonance (dizziness)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(440, now + dur);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(622.25, now); // D#5 (dissonance)
    osc2.frequency.exponentialRampToValueAtTime(466.16, now + dur);

    // Volume envelope with pulsing amplitude
    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.05);
    mainGain.gain.exponentialRampToValueAtTime(this.volume * 0.25, now + 0.5);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(mainGain);
    osc2.connect(mainGain);
    mainGain.connect(this.ctx.destination);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + dur);
    osc1.stop(now + dur);
    osc2.stop(now + dur);

    // Layer 2: Sparkling High-Pitch Stun Stars Ping Chimes
    [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
      if (!this.ctx) return;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      this.trackSource(chimeOsc);

      chimeOsc.type = 'sine';
      const chimeTime = now + (idx * 0.08);
      chimeOsc.frequency.setValueAtTime(freq, chimeTime);
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 1.05, chimeTime + 0.2);

      chimeGain.gain.setValueAtTime(this.volume * 0.22, chimeTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.25);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);

      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 0.26);
    });

    // Layer 3: Sub-bass Vulnerability Impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    this.trackSource(subOsc);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    subGain.gain.setValueAtTime(this.volume * 0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.36);
  }

  public playMiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    this.trackSource(osc);
    const gain = this.ctx.createGain();

    // Whiff whoosh pitch drop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(this.volume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playCounterAttack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // High-pitched counter chime snap
    this.playTone(880, now, 0.08, 'triangle', 0.6);
    this.playTone(1320, now + 0.06, 0.15, 'sawtooth', 0.7);
  }

  public playHeavyCounterClash(intensity: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low-frequency bass swell (Sub-bass drop)
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(80, now);
    bassOsc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
    
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(1.0 * intensity, now + 0.05); // Quick swell
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6); // Fade out
    
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    
    bassOsc.start(now);
    bassOsc.stop(now + 0.6);
    this.trackSource(bassOsc);

    // Metallic ringing SFX
    const ringOsc1 = this.ctx.createOscillator();
    const ringOsc2 = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();

    ringOsc1.type = 'triangle';
    ringOsc1.frequency.setValueAtTime(1200, now); // High pitch metallic
    ringOsc1.frequency.exponentialRampToValueAtTime(600, now + 0.3); 

    ringOsc2.type = 'square';
    ringOsc2.frequency.setValueAtTime(2400, now); // Dissonant harmonic
    ringOsc2.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    ringGain.gain.setValueAtTime(0, now);
    ringGain.gain.linearRampToValueAtTime(0.6 * intensity, now + 0.02); // Sharp attack
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Longer ring

    ringOsc1.connect(ringGain);
    ringOsc2.connect(ringGain);
    ringGain.connect(this.ctx.destination);

    ringOsc1.start(now);
    ringOsc2.start(now);
    ringOsc1.stop(now + 0.4);
    ringOsc2.stop(now + 0.4);
    
    this.trackSource(ringOsc1);
    this.trackSource(ringOsc2);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(330, now, 0.08, 'sine', 0.5);
    this.playTone(440, now + 0.06, 0.08, 'sine', 0.6);
    this.playTone(550, now + 0.12, 0.08, 'triangle', 0.7);
    this.playTone(660, now + 0.18, 0.25, 'sawtooth', 0.8);
  }

  public playEquip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(523.25, now, 0.06, 'triangle', 0.5);
    this.playTone(659.25, now + 0.05, 0.08, 'triangle', 0.6);
    this.playTone(783.99, now + 0.10, 0.18, 'sine', 0.7);
  }

  public playTaunt() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Energetic brassy arcade taunt note
    this.playTone(330, now, 0.08, 'sawtooth', 0.4);
    this.playTone(495, now + 0.07, 0.18, 'sawtooth', 0.5);
  }

  public playUiClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(600, now, 0.04, 'sine', 0.25);
  }

  public playUiConfirm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(523.25, now, 0.06, 'triangle', 0.4);
    this.playTone(783.99, now + 0.05, 0.12, 'sine', 0.45);
  }

  public playUiCancel() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(440, now, 0.06, 'sawtooth', 0.3);
    this.playTone(330, now + 0.05, 0.1, 'sawtooth', 0.3);
  }

  public playUiSelect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(720, now, 0.04, 'sine', 0.3);
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playTone(523.25, now, 0.2, 'triangle', 0.6);
    this.playTone(659.25, now + 0.15, 0.2, 'triangle', 0.6);
    this.playTone(783.99, now + 0.3, 0.2, 'triangle', 0.6);
    this.playTone(1046.5, now + 0.45, 0.5, 'sawtooth', 0.7);
  }

  /**
   * Synthesized stadium crowd cheer and roar burst with dynamic intensity modulation
   */
  public playCrowdCheer(intensity: number = 70) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = intensity > 80 ? 1.4 : intensity > 50 ? 0.9 : 0.6;
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brownian noise generation for warm stadium crowd acoustics
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.05;
        b1 = 0.96300 * b1 + white * 0.09;
        b2 = 0.57000 * b2 + white * 0.35;
        data[i] = (b0 + b1 + b2) * 0.35;
      }

      const noiseSource = this.ctx.createBufferSource();
      this.trackSource(noiseSource);
      noiseSource.buffer = buffer;

      // Bandpass filter to sculpt formant human crowd roar frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const centerFreq = intensity > 85 ? 680 : 540;
      filter.frequency.setValueAtTime(centerFreq, now);
      filter.Q.setValueAtTime(1.8, now);

      // Second formant resonance
      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(intensity > 85 ? 1400 : 1000, now);

      const gain = this.ctx.createGain();
      const targetVol = this.volume * Math.min(0.45, 0.12 + (intensity / 100) * 0.28);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(targetVol, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(filter2);
      filter2.connect(gain);
      gain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (e) {
      // AudioContext safe fallback
    }
  }

  /**
   * Procedural Web Audio API synthesis for unique crowd reactions triggered mid-battle
   */
  public playCrowdReaction(reaction: CrowdReactionType, intensity: number = 80) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const volMultiplier = this.volume * Math.min(0.65, 0.25 + (intensity / 100) * 0.4);

      switch (reaction) {
        case 'cheer_hype': {
          // 1. Dual-layer rising formant stadium roar
          const duration = 1.35;
          const bufferSize = Math.floor(this.ctx.sampleRate * duration);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);

          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99765 * b0 + white * 0.05;
            b1 = 0.96300 * b1 + white * 0.09;
            b2 = 0.57000 * b2 + white * 0.35;
            data[i] = (b0 + b1 + b2) * 0.35;
          }

          const noise = this.ctx.createBufferSource();
          this.trackSource(noise);
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450, now);
          filter.frequency.linearRampToValueAtTime(750, now + 0.5);
          filter.frequency.exponentialRampToValueAtTime(520, now + duration);
          filter.Q.setValueAtTime(2.2, now);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(volMultiplier * 0.9, now + 0.25);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          noise.start(now);
          noise.stop(now + duration);

          // 2. Piercing fan whistles from bleachers
          const whistleCount = 3;
          for (let w = 0; w < whistleCount; w++) {
            const osc = this.ctx.createOscillator();
            const wGain = this.ctx.createGain();
            this.trackSource(osc);

            const startDelay = 0.12 + w * 0.18;
            const startFreq = 2200 + Math.random() * 600;
            const endFreq = startFreq + (Math.random() > 0.5 ? 650 : -450);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, now + startDelay);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + startDelay + 0.35);

            wGain.gain.setValueAtTime(0.001, now + startDelay);
            wGain.gain.linearRampToValueAtTime(volMultiplier * 0.28, now + startDelay + 0.08);
            wGain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + 0.35);

            osc.connect(wGain);
            wGain.connect(this.ctx.destination);

            osc.start(now + startDelay);
            osc.stop(now + startDelay + 0.36);
          }
          break;
        }

        case 'gasp_shock': {
          // Sharp collective inhalation vacuum drop + stunned subsonic shudder
          const duration = 1.1;
          const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);

          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
          }

          const suckNoise = this.ctx.createBufferSource();
          this.trackSource(suckNoise);
          suckNoise.buffer = buffer;

          const suckFilter = this.ctx.createBiquadFilter();
          suckFilter.type = 'bandpass';
          suckFilter.frequency.setValueAtTime(1400, now);
          suckFilter.frequency.exponentialRampToValueAtTime(380, now + 0.28);
          suckFilter.Q.setValueAtTime(3.0, now);

          const suckGain = this.ctx.createGain();
          suckGain.gain.setValueAtTime(0.001, now);
          suckGain.gain.linearRampToValueAtTime(volMultiplier * 0.8, now + 0.14);
          suckGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

          suckNoise.connect(suckFilter);
          suckFilter.connect(suckGain);
          suckGain.connect(this.ctx.destination);

          suckNoise.start(now);
          suckNoise.stop(now + 0.35);

          // Subsonic awe tremor
          const subTremor = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          this.trackSource(subTremor);

          subTremor.type = 'triangle';
          subTremor.frequency.setValueAtTime(75, now + 0.12);
          subTremor.frequency.linearRampToValueAtTime(55, now + duration);

          subGain.gain.setValueAtTime(0.001, now + 0.12);
          subGain.gain.linearRampToValueAtTime(volMultiplier * 0.6, now + 0.25);
          subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          subTremor.connect(subGain);
          subGain.connect(this.ctx.destination);

          subTremor.start(now + 0.12);
          subTremor.stop(now + duration);
          break;
        }

        case 'laughter_amused': {
          // Syncopated bubbling chuckles from spectators
          const laughs = [
            { time: 0.05, freq: 520, dur: 0.11 },
            { time: 0.18, freq: 640, dur: 0.12 },
            { time: 0.32, freq: 580, dur: 0.10 },
            { time: 0.45, freq: 720, dur: 0.13 },
            { time: 0.60, freq: 610, dur: 0.12 },
            { time: 0.74, freq: 480, dur: 0.14 },
          ];

          laughs.forEach((l) => {
            const osc = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            this.trackSource(osc);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(l.freq, now + l.time);
            osc.frequency.exponentialRampToValueAtTime(l.freq * 0.75, now + l.time + l.dur);

            g.gain.setValueAtTime(0.001, now + l.time);
            g.gain.linearRampToValueAtTime(volMultiplier * 0.32, now + l.time + 0.03);
            g.gain.exponentialRampToValueAtTime(0.001, now + l.time + l.dur);

            osc.connect(g);
            g.connect(this.ctx!.destination);

            osc.start(now + l.time);
            osc.stop(now + l.time + l.dur);
          });

          // Playful slide chuckle whistle
          const whistle = this.ctx.createOscillator();
          const wGain = this.ctx.createGain();
          this.trackSource(whistle);

          whistle.type = 'sine';
          whistle.frequency.setValueAtTime(950, now + 0.3);
          whistle.frequency.exponentialRampToValueAtTime(540, now + 0.65);

          wGain.gain.setValueAtTime(0.001, now + 0.3);
          wGain.gain.linearRampToValueAtTime(volMultiplier * 0.25, now + 0.4);
          wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

          whistle.connect(wGain);
          wGain.connect(this.ctx.destination);

          whistle.start(now + 0.3);
          whistle.stop(now + 0.66);
          break;
        }

        case 'whistle_boos': {
          // Sharp referee / audience slide whistles + deep drone booing
          const whistles = [
            { delay: 0.05, startF: 2900, endF: 1700, dur: 0.35 },
            { delay: 0.25, startF: 1950, endF: 3200, dur: 0.42 },
          ];

          whistles.forEach((w) => {
            const osc = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            this.trackSource(osc);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(w.startF, now + w.delay);
            osc.frequency.exponentialRampToValueAtTime(w.endF, now + w.delay + w.dur);

            g.gain.setValueAtTime(0.001, now + w.delay);
            g.gain.linearRampToValueAtTime(volMultiplier * 0.38, now + w.delay + 0.08);
            g.gain.exponentialRampToValueAtTime(0.001, now + w.delay + w.dur);

            osc.connect(g);
            g.connect(this.ctx!.destination);

            osc.start(now + w.delay);
            osc.stop(now + w.delay + w.dur + 0.01);
          });

          // Deep resonating boo murmur
          const booOsc1 = this.ctx.createOscillator();
          const booOsc2 = this.ctx.createOscillator();
          const booGain = this.ctx.createGain();
          this.trackSource(booOsc1);
          this.trackSource(booOsc2);

          booOsc1.type = 'sawtooth';
          booOsc2.type = 'triangle';
          booOsc1.frequency.setValueAtTime(215, now + 0.1);
          booOsc2.frequency.setValueAtTime(175, now + 0.1);

          const booFilter = this.ctx.createBiquadFilter();
          booFilter.type = 'lowpass';
          booFilter.frequency.setValueAtTime(360, now + 0.1);

          booGain.gain.setValueAtTime(0.001, now + 0.1);
          booGain.gain.linearRampToValueAtTime(volMultiplier * 0.45, now + 0.4);
          booGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

          booOsc1.connect(booFilter);
          booOsc2.connect(booFilter);
          booFilter.connect(booGain);
          booGain.connect(this.ctx.destination);

          booOsc1.start(now + 0.1);
          booOsc2.start(now + 0.1);
          booOsc1.stop(now + 1.26);
          booOsc2.stop(now + 1.26);
          break;
        }

        case 'chants_stadium': {
          // 3 synchronized rhythmic bleacher stomps + vocal crowd bursts
          const beats = [0.0, 0.38, 0.76];
          beats.forEach((bTime) => {
            // Bass foot stomp
            const stompOsc = this.ctx!.createOscillator();
            const stompGain = this.ctx!.createGain();
            this.trackSource(stompOsc);

            stompOsc.type = 'sine';
            stompOsc.frequency.setValueAtTime(110, now + bTime);
            stompOsc.frequency.exponentialRampToValueAtTime(45, now + bTime + 0.22);

            stompGain.gain.setValueAtTime(0.001, now + bTime);
            stompGain.gain.linearRampToValueAtTime(volMultiplier * 0.7, now + bTime + 0.02);
            stompGain.gain.exponentialRampToValueAtTime(0.001, now + bTime + 0.25);

            stompOsc.connect(stompGain);
            stompGain.connect(this.ctx!.destination);

            stompOsc.start(now + bTime);
            stompOsc.stop(now + bTime + 0.26);

            // Vocal chant burst ("HEY!")
            const chantOsc = this.ctx!.createOscillator();
            const chantGain = this.ctx!.createGain();
            const chantFilter = this.ctx!.createBiquadFilter();
            this.trackSource(chantOsc);

            chantOsc.type = 'sawtooth';
            chantOsc.frequency.setValueAtTime(220, now + bTime + 0.02);
            chantFilter.type = 'bandpass';
            chantFilter.frequency.setValueAtTime(480, now + bTime + 0.02);
            chantFilter.Q.setValueAtTime(2.4, now + bTime + 0.02);

            chantGain.gain.setValueAtTime(0.001, now + bTime + 0.02);
            chantGain.gain.linearRampToValueAtTime(volMultiplier * 0.42, now + bTime + 0.06);
            chantGain.gain.exponentialRampToValueAtTime(0.001, now + bTime + 0.3);

            chantOsc.connect(chantFilter);
            chantFilter.connect(chantGain);
            chantGain.connect(this.ctx!.destination);

            chantOsc.start(now + bTime + 0.02);
            chantOsc.stop(now + bTime + 0.31);
          });
          break;
        }
      }
    } catch (e) {
      // AudioContext safe fallback
    }
  }

  /**
   * Sound effect choreography for character-specific taunt motions
   */
  public playTauntMotionSfx(motion: TauntMotionChoreography) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const vol = this.volume * 0.5;

      switch (motion) {
        case 'cigar_flame':
          // Lighter flick click + fiery hiss
          this.playTone(3200, now, 0.03, 'square', vol * 0.5);
          this.playTone(2800, now + 0.04, 0.04, 'sine', vol * 0.6);
          this.playHakiThunder();
          break;
        case 'sheath_stance':
          // Blade sheath click + metallic ring
          this.playTone(1800, now, 0.04, 'triangle', vol * 0.7);
          this.playTone(3600, now + 0.03, 0.25, 'sine', vol * 0.5);
          break;
        case 'bounce_joy':
          // Cartoon spring boing + twinkle
          this.playTone(220, now, 0.08, 'sine', vol * 0.6);
          this.playTone(440, now + 0.06, 0.09, 'sine', vol * 0.7);
          this.playTone(880, now + 0.12, 0.2, 'triangle', vol * 0.8);
          break;
        case 'tremor_ground':
          // Glass air crack impulse + sub tremor
          this.playTone(85, now, 0.4, 'sawtooth', vol * 0.8);
          this.playTone(45, now + 0.05, 0.6, 'sine', vol * 0.9);
          break;
        case 'dark_vortex':
          // Gravitational black hole drone
          this.playTone(120, now, 0.35, 'sawtooth', vol * 0.6);
          this.playTone(60, now + 0.1, 0.5, 'triangle', vol * 0.7);
          break;
        case 'room_snap':
          // Room sphere spatial ping + sharp finger snap click
          this.playTone(1046.5, now, 0.06, 'sine', vol * 0.7);
          this.playTone(2093, now + 0.04, 0.15, 'triangle', vol * 0.5);
          break;
        case 'donut_snack':
          // Munch click + high observation ping
          this.playTone(700, now, 0.05, 'square', vol * 0.5);
          this.playTone(1567.98, now + 0.08, 0.22, 'sine', vol * 0.6);
          break;
        case 'puppet_dance':
          // Delicate high string pluck arpeggio
          this.playTone(784, now, 0.08, 'sine', vol * 0.4);
          this.playTone(988, now + 0.07, 0.09, 'sine', vol * 0.4);
          this.playTone(1318, now + 0.14, 0.2, 'sine', vol * 0.5);
          break;
        case 'hawk_glance':
          // Razor blade gleam chime
          this.playTone(2400, now, 0.06, 'sine', vol * 0.6);
          this.playTone(3200, now + 0.04, 0.28, 'sine', vol * 0.7);
          break;
        case 'sake_gourd':
          // Gulp slosh + dragon flame breath
          this.playTone(330, now, 0.12, 'sine', vol * 0.5);
          this.playTone(220, now + 0.15, 0.2, 'sawtooth', vol * 0.6);
          break;
        default:
          // Brassy arcade taunt flourish
          this.playTone(440, now, 0.06, 'sawtooth', vol * 0.5);
          this.playTone(659.25, now + 0.05, 0.15, 'sawtooth', vol * 0.6);
          break;
      }
    } catch (e) {
      // AudioContext safe fallback
    }
  }

  public playStanceSwitch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(520, now, 0.04, 'sine', 0.3);
    this.playTone(680, now + 0.03, 0.08, 'sine', 0.4);
  }

  public playHazardTrigger() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(110, now, 0.35, 'sawtooth', 0.4);
    this.playTone(55, now + 0.1, 0.5, 'sine', 0.6);
  }

  public playCriticalStrike() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(800, now, 0.1, 'sawtooth', 0.7);
    this.playTone(400, now + 0.05, 0.2, 'sawtooth', 0.8);
    this.playHit('crit');
  }

  public playUltimateFinisher() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(220, now, 0.4, 'triangle', 0.8);
    this.playTone(440, now + 0.2, 0.6, 'sawtooth', 0.9);
    this.playTone(880, now + 0.4, 0.8, 'sawtooth', 1.0);
    this.playHakiThunder();
  }

  /**
   * Specialized Haki Aura Activation Sounds
   */
  public playHakiAura(type: 'armament' | 'observation' | 'conqueror') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'armament':
        // Metallic cling: high frequency square with sharp decay + ringing resonance
        this.playTone(1200, now, 0.05, 'square', 0.5);
        this.playTone(2400, now + 0.02, 0.1, 'sine', 0.4);
        this.playTone(1800, now + 0.05, 0.4, 'sine', 0.2); // Shimmering ring
        break;
      case 'observation':
        // Sharp wind chime: multiple sine waves at harmonic frequencies with long decay
        const frequencies = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
        frequencies.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          this.trackSource(osc);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.03);
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(this.volume * 0.3, now + i * 0.03 + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1);
          osc.connect(g);
          g.connect(this.ctx!.destination);
          osc.start(now + i * 0.03);
          osc.stop(now + 1.2);
        });
        break;
      case 'conqueror':
        // Low-frequency hum: pulsing sub-bass + brownian-like noise pressure
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        this.trackSource(sub);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, now);
        sub.frequency.linearRampToValueAtTime(45, now + 1.0);
        subGain.gain.setValueAtTime(0, now);
        subGain.gain.linearRampToValueAtTime(this.volume * 0.9, now + 0.1);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 1.2);
        
        // Add a secondary distorted rumble
        const rumble = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        this.trackSource(rumble);
        rumble.type = 'triangle';
        rumble.frequency.setValueAtTime(30, now);
        rumble.frequency.setValueAtTime(35, now + 0.2);
        rumble.frequency.setValueAtTime(32, now + 0.4);
        rumbleGain.gain.setValueAtTime(0, now);
        rumbleGain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        rumble.connect(rumbleGain);
        rumbleGain.connect(this.ctx.destination);
        rumble.start(now);
        rumble.stop(now + 1.0);
        break;
    }
  }

  public playKO() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(392, now, 0.4, 'sawtooth', 0.6);
    this.playTone(261.63, now + 0.15, 0.7, 'triangle', 0.8);
    this.playTone(65, now + 0.1, 1.0, 'sine', 0.9);
  }

  public playInsertCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Classic arcade coin drop chime
    this.playTone(987.77, now, 0.08, 'sine', 0.6);
    this.playTone(1318.51, now + 0.08, 0.25, 'triangle', 0.8);
  }

  public playRoundStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(440, now, 0.15, 'sine', 0.5);
    this.playTone(554.37, now + 0.12, 0.15, 'sine', 0.5);
    this.playTone(659.25, now + 0.24, 0.35, 'triangle', 0.7);
  }

  public playMatchStart() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Triumphant match start fanfare
    this.playTone(392.00, now, 0.1, 'sawtooth', 0.5); // G4
    this.playTone(523.25, now + 0.1, 0.1, 'sawtooth', 0.6); // C5
    this.playTone(659.25, now + 0.2, 0.3, 'sawtooth', 0.7); // E5
    this.playRoundStart();
  }

  public playDoubleHit() {
    if (this.isMuted) return;
    this.playHit('light');
    setTimeout(() => this.playHit('medium'), 60);
  }

  public playTripleHit() {
    if (this.isMuted) return;
    this.playHit('light');
    setTimeout(() => this.playHit('medium'), 50);
    setTimeout(() => this.playHit('heavy'), 110);
  }

  public playComboHit(hits: number) {
    if (this.isMuted) return;
    const type = hits % 2 === 0 ? 'medium' : 'light';
    this.playHit(type);
  }

  private ambientCrowdSource: AudioBufferSourceNode | null = null;
  private ambientCrowdGain: GainNode | null = null;

  public playComboMilestone(hits: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const pitches = hits >= 12 ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
    pitches.forEach((freq, i) => {
      this.playTone(freq, now + i * 0.05, 0.25, 'sawtooth', 0.5);
    });
  }

  /**
   * Starts or updates the volume of a persistent ambient crowd noise loop.
   * This provides the "stadium floor" atmosphere that swells with combo intensity.
   */
  public updateAmbientCrowd(intensity: number) {
    if (this.isMuted) {
      this.stopAmbientCrowd();
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Map intensity (0-100) to a reasonable ambient volume (subtle 0.01 to noticeable 0.25)
    const targetVolume = this.volume * (0.01 + (intensity / 100) * 0.24);

    if (!this.ambientCrowdSource) {
      // Initialize the loop
      const duration = 2.0; // Loop length in seconds
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Brownian noise for deep stadium rumble
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.05;
        b1 = 0.96300 * b1 + white * 0.09;
        b2 = 0.57000 * b2 + white * 0.35;
        data[i] = (b0 + b1 + b2) * 0.3;
      }

      this.ambientCrowdSource = this.ctx.createBufferSource();
      this.ambientCrowdSource.buffer = buffer;
      this.ambientCrowdSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      this.ambientCrowdGain = this.ctx.createGain();
      this.ambientCrowdGain.gain.setValueAtTime(0, now);
      this.ambientCrowdGain.gain.linearRampToValueAtTime(targetVolume, now + 1.0);

      this.ambientCrowdSource.connect(filter);
      filter.connect(this.ambientCrowdGain);
      this.ambientCrowdGain.connect(this.ctx.destination);

      this.ambientCrowdSource.start(now);
    } else if (this.ambientCrowdGain) {
      // Smoothly interpolate to new volume
      this.ambientCrowdGain.gain.setTargetAtTime(targetVolume, now, 0.5);
    }
  }

  public stopAmbientCrowd() {
    if (this.ambientCrowdSource) {
      try {
        this.ambientCrowdSource.stop();
        this.ambientCrowdSource.disconnect();
      } catch (e) {}
      this.ambientCrowdSource = null;
    }
    if (this.ambientCrowdGain) {
      this.ambientCrowdGain.disconnect();
      this.ambientCrowdGain = null;
    }
  }

  playAchievementUnlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 triumph chime
    notes.forEach((freq, i) => {
      this.playTone(freq, now + i * 0.08, 0.35, 'triangle', 0.6);
    });
  }

  public playClashTap(intensity: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Punchy electric metallic clash pulse
    const pitch = 220 + Math.random() * 120;
    this.playTone(pitch, now, 0.09, 'sawtooth', Math.min(1.0, 0.7 * intensity));
    this.playTone(pitch * 2, now + 0.02, 0.06, 'triangle', Math.min(0.8, 0.5 * intensity));
  }

  public playClashCountdown(remainingSeconds: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Ticking heartbeat / alert synth tone
    const isCritical = remainingSeconds <= 1.5;
    const freq = isCritical ? 880 : 540;
    this.playTone(freq, now, 0.08, isCritical ? 'sawtooth' : 'sine', isCritical ? 0.6 : 0.35);
  }

  private playTone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', vol = 0.5) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    this.trackSource(osc);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(this.volume * vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  }
}

export const soundManager = new ArcadeAudioSystem();

// Japanese Character Name Dictionary for Authentic Male Voice Pronunciation
export const JAPANESE_CHARACTER_NAMES: Record<string, string> = {
  luffy: 'ルフィ',
  zoro: 'ゾロ',
  shanks: 'シャンクス',
  kaido: 'カイドウ',
  roger: 'ロジャー',
  whitebeard: '白ひげ',
  blackbeard: '黒ひげ',
  akainu: '赤犬',
  mihawk: 'ミホーク',
  kizaru: '黄猿',
  garp: 'ガープ',
  law: 'ロー',
  buggy: 'バギー',
  katakuri: 'カタクリ',
  ace: 'エース',
};

// Japanese Move Translation Dictionary for Classic Moves
export const JAPANESE_MOVE_NAMES: Record<string, string> = {
  'gomu gomu no pistol': 'ゴムゴムの銃',
  'pistol': '銃',
  'gomu gomu no jet gatling': 'JETガトリング',
  'jet gatling': 'JETガトリング',
  'gomu gomu no red roc': '業火拳銃',
  'red roc': '業火拳銃',
  'bajrang gun': '猿神銃',
  'gear 5 awakening': 'ギア5 覚醒',
  'divine departure': '神避',
  'kamusari': '神避',
  'three thousand worlds': '三千世界',
  'sanzen sekai': '三千世界',
  'conqueror of three worlds': '大威徳雷鳴八卦',
  'thunder bagua': '雷鳴八卦',
  'galaxy impact': '拳骨衝突',
  'meigo': '冥狗',
  'hellhound meigo': '冥狗',
  'great eruption': '大噴火',
  'daifunka': '大噴火',
  'room takt': 'タクト',
  'takt': 'タクト',
  'gamma knife': 'ガンマナイフ',
  'puncture wille': '穿刺波動',
  'yasakani no magatama': '八尺瓊勾玉',
  'special muggy ball': '特製マギー玉',
  'muggy ball': 'マギー玉',
  'chikara mochi': '斬・切・餅',
  'black blade yoru': '黒刀・夜',
  'sea quake': '海震',
  'black hole': '闇穴道',
  'future sight': '未来視',
  'armament guard': '武装色ガード',
  'guard stance': '防御態勢',
  'taunt': '挑発',
  'battle taunt': '挑発',
  'conqueror surge': '覇王色の覚醒',
  'decision': '判定',
};

// Clean Attack Short Name Extractor to prevent text overflow and ensure punchy cadence
export function getAttackShortName(rawMoveName: string, lang: AnnouncerLanguage = 'en'): string {
  if (!rawMoveName) return 'Attack';

  // Specific canonical overrides
  const lower = rawMoveName.toLowerCase();
  if (lower.includes('red roc')) return lang === 'ja' ? '業火拳銃' : 'Red Roc';
  if (lower.includes('bajrang')) return lang === 'ja' ? '猿神銃' : 'Bajrang Gun';
  if (lower.includes('sanzen') || lower.includes('three thousand')) return lang === 'ja' ? '三千世界' : 'Sanzen Sekai';
  if (lower.includes('shishi sonson') || lower.includes('lion song')) return lang === 'ja' ? '獅子歌歌' : 'Lion Song';
  if (lower.includes('kamusari') || lower.includes('divine departure')) return lang === 'ja' ? '神避' : 'Divine Departure';
  if (lower.includes('thunder bagua') || lower.includes('raimei')) return lang === 'ja' ? '雷鳴八卦' : 'Thunder Bagua';
  if (lower.includes('galaxy impact')) return lang === 'ja' ? '拳骨衝突' : 'Galaxy Impact';
  if (lower.includes('meigo') || lower.includes('hellhound')) return lang === 'ja' ? '冥狗' : 'Meigo';
  if (lower.includes('great eruption') || lower.includes('daifunka')) return lang === 'ja' ? '大噴火' : 'Great Eruption';
  if (lower.includes('gamma knife')) return lang === 'ja' ? 'ガンマナイフ' : 'Gamma Knife';
  if (lower.includes('puncture wille')) return lang === 'ja' ? '穿刺波動' : 'Puncture Wille';
  if (lower.includes('yasakani')) return lang === 'ja' ? '八尺瓊勾玉' : 'Yasakani';
  if (lower.includes('muggy ball')) return lang === 'ja' ? 'マギー玉' : 'Muggy Ball';
  if (lower.includes('chikara mochi')) return lang === 'ja' ? '切餅' : 'Chikara Mochi';
  if (lower.includes('future sight') || lower.includes('dodge')) return lang === 'ja' ? '未来視' : 'Future Sight';
  if (lower.includes('guard')) return lang === 'ja' ? '武装色ガード' : 'Armament Guard';
  if (lower.includes('taunt') || lower.includes('provocation')) return lang === 'ja' ? '挑発' : 'Battle Taunt';
  if (lower.includes('max mode') || lower.includes('conqueror surge')) return lang === 'ja' ? '覇王色の覚醒' : 'Conqueror Surge';

  // Strip generic anime prefixes for cleaner English/Portuguese names
  let cleaned = rawMoveName
    .replace(/^Gomu Gomu no\s+/i, '')
    .replace(/^Ope Ope:\s+/i, '')
    .replace(/^Ittoryu:\s+/i, '')
    .replace(/^Santoryu:\s+/i, '')
    .replace(/^Santoryu Ogi:\s+/i, '')
    .replace(/^Mochi Mochi:\s+/i, '')
    .replace(/^Bara Bara:\s+/i, '')
    .replace(/^Magu Magu:\s+/i, '')
    .replace(/^Yami Yami:\s+/i, '')
    .replace(/^Gura Gura:\s+/i, '')
    .replace(/^Pika Pika:\s+/i, '')
    .replace(/\(.*?\)/g, '')
    .trim();

  if ((cleaned?.length || 0) > 22) {
    cleaned = cleaned.substring(0, 20) + '...';
  }

  return cleaned || 'Strike';
}

// Clean Character Short Name Extractor
export function getCharacterShortName(fullName: string, lang: AnnouncerLanguage = 'en'): string {
  if (!fullName) return 'Fighter';
  const lower = fullName.toLowerCase();
  for (const [key, jp] of Object.entries(JAPANESE_CHARACTER_NAMES)) {
    if (lower.includes(key)) {
      return lang === 'ja' ? jp : key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
  return fullName.split(' ')[0] || fullName;
}

// Strict Template Formatter: [Character Short Name] [Action Verb] [Attack Short Name]
export function formatStrictNarration(
  actorFullName: string,
  moveFullName: string,
  moveJPName?: string,
  actionCategory: 'attack' | 'crit' | 'super' | 'dodge' | 'guard' | 'miss' | 'counter' | 'taunt' | 'ko' | 'clash' | 'guard_crush' = 'attack',
  lang: AnnouncerLanguage = 'ja'
): { text: string; actorShort: string; verb: string; moveShort: string } {
  const actorShort = getCharacterShortName(actorFullName, lang);
  const moveShort = lang === 'ja' && moveJPName ? moveJPName.split(' ')[0] : getAttackShortName(moveFullName, lang);

  let verb = '';

  if (lang === 'ja') {
    switch (actionCategory) {
      case 'ko':
        verb = '撃破';
        break;
      case 'clash':
        verb = '衝突';
        break;
      case 'dodge':
        verb = '回避';
        break;
      case 'guard':
        verb = '防御';
        break;
      case 'guard_crush':
        verb = '崩し';
        break;
      case 'miss':
        verb = '空振り';
        break;
      case 'counter':
        verb = '反撃';
        break;
      case 'taunt':
        verb = '挑発';
        break;
      case 'crit':
        verb = '会心';
        break;
      case 'super':
        verb = '必殺';
        break;
      case 'attack':
      default:
        verb = '放つ';
        break;
    }
    // Strict Template: [Character Short Name] [Action Verb] [Attack Short Name]
    const text = `${actorShort} ${verb} ${moveShort}`;
    return { text, actorShort, verb, moveShort };
  }

  if (lang === 'pt') {
    switch (actionCategory) {
      case 'ko':
        verb = 'nocauteia com';
        break;
      case 'clash':
        verb = 'colide com';
        break;
      case 'dodge':
        verb = 'desvia com';
        break;
      case 'guard':
        verb = 'bloqueia com';
        break;
      case 'guard_crush':
        verb = 'quebra guarda com';
        break;
      case 'miss':
        verb = 'erra golpe';
        break;
      case 'counter':
        verb = 'contra-ataca com';
        break;
      case 'taunt':
        verb = 'provoca com';
        break;
      case 'crit':
        verb = 'acerta crítico com';
        break;
      case 'super':
        verb = 'executa super';
        break;
      case 'attack':
      default:
        verb = 'desfere';
        break;
    }
    // Strict Template: [Character Short Name] [Action Verb] [Attack Short Name]
    const text = `${actorShort} ${verb} ${moveShort}`;
    return { text, actorShort, verb, moveShort };
  }

  // English (Strict Template: [Character Short Name] [Action Verb] [Attack Short Name])
  switch (actionCategory) {
    case 'ko':
      verb = 'defeats with';
      break;
    case 'clash':
      verb = 'clashes with';
      break;
    case 'dodge':
      verb = 'evades with';
      break;
    case 'guard':
      verb = 'blocks with';
      break;
    case 'guard_crush':
      verb = 'crushes guard with';
      break;
    case 'miss':
      verb = 'whiffs with';
      break;
    case 'counter':
      verb = 'counters with';
      break;
    case 'taunt':
      verb = 'taunts with';
      break;
    case 'crit':
      verb = 'lands critical';
      break;
    case 'super':
      verb = 'executes super';
      break;
    case 'attack':
    default:
      verb = 'unleashes';
      break;
  }

  const text = `${actorShort} ${verb} ${moveShort}`;
  return { text, actorShort, verb, moveShort };
}

// High Quality Sequential Japanese Male Battle Announcer Engine
class JapaneseMaleBattleAnnouncer {
  private selectedVoice: SpeechSynthesisVoice | null = null;
  public language: AnnouncerLanguage = 'ja';
  public isEnabled: boolean = false;
  // Sequential Promise Chain ensuring non-interrupted narration
  private narrationPromiseChain: Promise<void> = Promise.resolve();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
      this.initVoice();
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();

    if (this.language === 'ja') {
      // Prioritize authentic Japanese male voices
      const jaVoices = voices.filter((v) => v.lang.startsWith('ja'));
      const maleJa = jaVoices.find(
        (v) =>
          v.name.toLowerCase().includes('ichiro') ||
          v.name.toLowerCase().includes('kenji') ||
          v.name.toLowerCase().includes('keita') ||
          v.name.toLowerCase().includes('otoya') ||
          v.name.toLowerCase().includes('takumi') ||
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('google 日本語')
      );
      this.selectedVoice = maleJa || jaVoices[0] || null;
    } else if (this.language === 'pt') {
      const ptVoices = voices.filter((v) => v.lang.startsWith('pt'));
      this.selectedVoice = ptVoices.find((v) => v.name.toLowerCase().includes('male')) || ptVoices[0] || null;
    } else {
      const enVoices = voices.filter((v) => v.lang.startsWith('en'));
      this.selectedVoice = enVoices.find((v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david')) || enVoices[0] || null;
    }
  }

  public setLanguage(lang: AnnouncerLanguage) {
    this.language = lang;
    this.initVoice();
  }

  public getCanonicalName(name: string): string {
    return getCharacterShortName(name, this.language);
  }

  public getCanonicalMove(moveName: string, moveNameJP?: string): string {
    if (this.language === 'ja' && moveNameJP) return moveNameJP;
    return getAttackShortName(moveName, this.language);
  }

  // Speak strictly formatted [Character Short Name] [Action Verb] [Attack Short Name] sequentially
  public announceAction(
    actorName: string,
    moveName: string,
    moveNameJP?: string,
    actionCategory: 'attack' | 'crit' | 'super' | 'dodge' | 'guard' | 'miss' | 'counter' | 'taunt' | 'ko' | 'clash' | 'guard_crush' = 'attack'
  ): Promise<void> {
    const formatted = formatStrictNarration(actorName, moveName, moveNameJP, actionCategory, this.language);

    // Chain to sequential promise pipeline so earlier narration completes fully before next is spoken
    this.narrationPromiseChain = this.narrationPromiseChain
      .catch(() => {})
      .then(() => this.speakUtterance(formatted.text));

    return this.narrationPromiseChain;
  }

  // Play custom raw text sequentially if needed
  public announceText(text: string): Promise<void> {
    this.narrationPromiseChain = this.narrationPromiseChain
      .catch(() => {})
      .then(() => this.speakUtterance(text));
    return this.narrationPromiseChain;
  }

  public resetQueue() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.narrationPromiseChain = Promise.resolve();
  }

  private speakUtterance(text: string): Promise<void> {
    return new Promise<void>((resolve) => {
      // Natural cadence fallback delay when TTS is muted or unsupported
      const fallbackMs = Math.max(500, Math.min(1400, (text?.length || 0) * 55));

      if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(resolve, fallbackMs);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
          utterance.voice = this.selectedVoice;
        }

        utterance.lang = this.language === 'ja' ? 'ja-JP' : this.language === 'pt' ? 'pt-BR' : 'en-US';
        utterance.rate = this.language === 'ja' ? 1.15 : 1.10;
        utterance.pitch = 0.90; // Deep resonant masculine tone
        utterance.volume = 1.0;

        let hasResolved = false;
        const doResolve = () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve();
          }
        };

        utterance.onend = () => doResolve();
        utterance.onerror = () => doResolve();

        // Safety timeout in case browser speech engine stalls
        const maxSafetyTimeoutMs = Math.max(1200, (text?.length || 0) * 110);
        setTimeout(doResolve, maxSafetyTimeoutMs);

        window.speechSynthesis.speak(utterance);
      } catch {
        setTimeout(resolve, fallbackMs);
      }
    });
  }
}

export const battleAnnouncer = new JapaneseMaleBattleAnnouncer();
