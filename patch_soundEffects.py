import re

with open('src/utils/soundEffects.ts', 'r') as f:
    content = f.read()

new_method = """  public playCounterAttack() {
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
  }"""

content = content.replace("  public playCounterAttack() {\n    if (this.isMuted) return;\n    this.initContext();\n    if (!this.ctx) return;\n\n    const now = this.ctx.currentTime;\n    // High-pitched counter chime snap\n    this.playTone(880, now, 0.08, 'triangle', 0.6);\n    this.playTone(1320, now + 0.06, 0.15, 'sawtooth', 0.7);\n  }", new_method)

with open('src/utils/soundEffects.ts', 'w') as f:
    f.write(content)

print("Patched soundEffects.ts")
