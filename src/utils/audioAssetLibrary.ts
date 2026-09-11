import { soundManager } from './soundEffects';
import { audioManager } from './AudioManager';
import { getAudioBlobFromDB, storeAudioBlobInDB } from './indexedDb';
import { Fighter, Move } from '../types/fighter';

export class CharacterVoiceManager {
  private cache: Map<string, AudioBuffer> = new Map();
  private audioCtx: AudioContext | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private isMuted: boolean = false;
  private resumptionPolicyAttached: boolean = false;

  /**
   * Returns the shared AudioContext, creating it lazily.
   * If the context is suspended (browser autoplay policy), attempts to resume it.
   * The context is only created here — never eagerly at module load time.
   */
  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx({ sampleRate: 24000 });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Registers one-time gesture listeners (click + touchstart) so the AudioContext
   * can be resumed as soon as the user first interacts with the page.
   * Safe to call multiple times — attaches at most once.
   */
  public setupResumptionPolicy(): void {
    if (this.resumptionPolicyAttached || typeof window === 'undefined') return;
    this.resumptionPolicyAttached = true;

    const resume = () => {
      if (this.audioCtx && (this.audioCtx.state === 'suspended' || (this.audioCtx.state as string) === 'interrupted')) {
        this.audioCtx.resume().catch(() => {});
      }
    };

    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resume();
    });
  }

  /**
   * Stops all currently playing character voices and commentary.
   */
  public stopAll(): void {
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might have already stopped
      }
    });
    this.activeSources.clear();
  }

  private async blobToAudioBuffer(blob: Blob, ctx: AudioContext): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Convert 16-bit PCM little-endian to Float32
    const float32Data = new Float32Array(bytes.length / 2);
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < bytes.length / 2; i++) {
      float32Data[i] = dataView.getInt16(i * 2, true) / 32768; // little endian
    }

    const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.copyToChannel(float32Data, 0);
    return audioBuffer;
  }

  private base64ToBlob(base64: string): Blob {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'audio/pcm' });
  }

  private async playTTSLine(text: string, cacheKey: string, character: string, fallback: () => void): Promise<void> {
    const ctx = this.getAudioContext();

    // 1. Check in-memory cache
    if (this.cache.has(cacheKey)) {
      this.playBuffer(this.cache.get(cacheKey)!, ctx);
      return;
    }

    // 2. Check IndexedDB Blob store
    try {
      const storedBlob = await getAudioBlobFromDB(cacheKey);
      if (storedBlob) {
        const audioBuffer = await this.blobToAudioBuffer(storedBlob, ctx);
        this.cache.set(cacheKey, audioBuffer);
        this.playBuffer(audioBuffer, ctx);
        return;
      }
    } catch (e) {
      console.warn("IndexedDB read failed:", e);
    }

    // Check if rate limited
    try {
      if (localStorage.getItem('announcer_tts_rate_limited') === 'true') {
        fallback();
        return;
      }
    } catch {}

    // 3. Fetch from API
    try {
      const response = await fetch('/api/character-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, character })
      });

      if (response.status === 429) {
        try { localStorage.setItem('announcer_tts_rate_limited', 'true'); } catch {}
        fallback();
        return;
      }

      if (response.status === 503) {
        audioManager.playGenericCombatBark();
        return;
      }

      if (!response.ok) {
        fallback();
        return;
      }

      const data = await response.json();

      if (data.fallback) {
        try { localStorage.setItem('announcer_tts_rate_limited', 'true'); } catch {}
        fallback();
        return;
      }

      if (data.audioBase64) {
        const blob = this.base64ToBlob(data.audioBase64);
        await storeAudioBlobInDB(cacheKey, blob);
        const audioBuffer = await this.blobToAudioBuffer(blob, ctx);
        this.cache.set(cacheKey, audioBuffer);
        this.playBuffer(audioBuffer, ctx);
      } else {
        fallback();
      }
    } catch {
      fallback();
    }
  }

  public async speakAnnouncerGemini(text: string, intensity: 'aggressive' | 'calm' | 'normal' = 'normal'): Promise<void> {
    if (this.isMuted) return;
    
    // Strip emojis
    const cleanText = text.replace(/[⚔️🥊⚡💥🔥🚨📢🛑⭐💪✨🌟!.-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const cacheKey = `announcer_${intensity}_${cleanText}`;
    
    const fallback = () => {
       // fallback to speech synthesis
       try {
         if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
           window.speechSynthesis.cancel();
         }
       } catch {}
       const utterance = new SpeechSynthesisUtterance(cleanText);
       utterance.volume = 1.0;
       utterance.rate = 0.95;
       utterance.pitch = 0.82;
       const voices = window.speechSynthesis.getVoices();
       const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))) || voices.find(v => v.lang.startsWith('en')) || voices[0];
       if (preferredVoice) utterance.voice = preferredVoice;
       window.speechSynthesis.speak(utterance);
    };

    // We can reuse playTTSLine but we need to pass intensity to fetch... wait, playTTSLine doesn't take intensity.
    // Let's copy playTTSLine logic here to pass intensity.
    const ctx = this.getAudioContext();

    if (this.cache.has(cacheKey)) {
      this.playBuffer(this.cache.get(cacheKey)!, ctx);
      return;
    }

    try {
      const storedBlob = await getAudioBlobFromDB(cacheKey);
      if (storedBlob) {
        const audioBuffer = await this.blobToAudioBuffer(storedBlob, ctx);
        this.cache.set(cacheKey, audioBuffer);
        this.playBuffer(audioBuffer, ctx);
        return;
      }
    } catch (e) {}

    try {
      if (localStorage.getItem('announcer_tts_rate_limited') === 'true') {
        fallback();
        return;
      }
    } catch {}

    try {
      const response = await fetch('/api/character-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, character: 'TournamentAnnouncer', intensity })
      });

      if (response.status === 429) {
        try { localStorage.setItem('announcer_tts_rate_limited', 'true'); } catch {}
        fallback();
        return;
      }
      if (response.status === 503) {
        audioManager.playGenericCombatBark();
        return;
      }
      if (!response.ok) { fallback(); return; }

      const data = await response.json();
      if (data.fallback) {
        try { localStorage.setItem('announcer_tts_rate_limited', 'true'); } catch {}
        fallback();
        return;
      }

      if (data.audioBase64) {
        const blob = this.base64ToBlob(data.audioBase64);
        await storeAudioBlobInDB(cacheKey, blob);
        const audioBuffer = await this.blobToAudioBuffer(blob, ctx);
        this.cache.set(cacheKey, audioBuffer);
        this.playBuffer(audioBuffer, ctx);
      } else {
        fallback();
      }
    } catch {
      fallback();
    }
  }
  public async playMoveVoice(fighter: Fighter, move: Move): Promise<void> {
    if (this.isMuted) return;

    // 1. Check for custom audio clip URL
    if (fighter.voiceProfile?.customClips?.[move.id]) {
      this.playCustomAudioUrl(fighter.voiceProfile.customClips[move.id]);
      return;
    }

    // 2. Fallback to synthesized speech based on profile language
    const profile = fighter.voiceProfile || { language: 'ja', pitch: 1, rate: 1, isSynthesized: true };
    if (profile.isSynthesized) {
      const lang = profile.language;
      const text = (lang === 'ja' && move.nameJP) ? move.nameJP : move.name;
      
      // Use localized synthesis
      this.speakSynthesized(text, lang, profile.pitch, profile.rate);
    }
  }

  /**
   * Triggers a localized taunt voice line.
   */
  public async playCharacterTaunt(fighter: Fighter): Promise<void> {
    if (this.isMuted) return;

    const profile = fighter.voiceProfile || { language: 'ja', pitch: 1, rate: 1, isSynthesized: true };
    const lang = profile.language;
    
    let text = '';
    switch (lang) {
      case 'pt': text = fighter.tauntQuotePT || fighter.tauntQuote || 'Prepare-se!'; break;
      case 'en': text = fighter.tauntQuote || 'Get ready!'; break;
      case 'ja': default: text = fighter.tauntQuoteJP || fighter.tauntQuote || '覚悟しろ！'; break;
    }

    if (profile.isSynthesized) {
      this.speakSynthesized(text, lang, profile.pitch, profile.rate);
    }
  }

  private playCustomAudioUrl(url: string) {
    try {
      const audio = new Audio(url);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  private speakSynthesized(text: string, lang: string, pitch: number, rate: number) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.isMuted ? 0 : 1.0;
    utterance.pitch = pitch;
    utterance.rate = rate;

    const langMap: Record<string, string> = { 'ja': 'ja-JP', 'en': 'en-US', 'pt': 'pt-BR' };
    const targetLang = langMap[lang] || 'ja-JP';
    utterance.lang = targetLang;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(targetLang) && v.name.includes('Google')) 
                        || voices.find(v => v.lang.startsWith(targetLang))
                        || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Triggers AI voice for character taunts.
   */
  async playTaunt(characterName: string, text: string): Promise<void> {
    const cacheKey = `${characterName.toLowerCase().replace(/\s+/g, '_')}_taunt_${text.substring(0, 32)}`;
    await this.playTTSLine(text, cacheKey, characterName, () => {
      // No specific fallback for taunts, but we could play a generic taunt SE if needed
    });
  }

  /**
   * Retrieves or generates Enel mantra prediction AI voice line.
   */
  async playEnelPrediction(moveName: string): Promise<void> {
    const text = `MANTRA: Você pretende me atacar com ${moveName}!`;
    const cacheKey = `enel_ai_voice_${text}`;
    await this.playTTSLine(text, cacheKey, 'Enel', () => soundManager.playFutureSight());
  }

  /**
   * Retrieves or generates Katakuri prediction AI voice line.
   */
  async playKatakuriPrediction(moveName: string, moveNameJP?: string): Promise<void> {
    const jpText = `${moveNameJP || moveName}を打つ気だな`;
    const cacheKey = `katakuri_ai_voice_${jpText}`;
    await this.playTTSLine(jpText, cacheKey, 'Katakuri', () => soundManager.playFutureSight());
  }

  /**
   * Automatically triggers AI Round Start announcer voice line.
   */
  async playRoundStart(roundNumber: number): Promise<void> {
    const jpText = `ラウンド ${roundNumber}、ファイート！`;
    const cacheKey = `announcer_round_${roundNumber}`;
    await this.playTTSLine(jpText, cacheKey, 'Announcer', () => soundManager.playRoundStart());
  }

  /**
   * Automatically triggers AI Match Start announcer voice line.
   */
  async playMatchStart(): Promise<void> {
    const jpText = `試合開始！`;
    const cacheKey = `announcer_match_start`;
    await this.playTTSLine(jpText, cacheKey, 'Announcer', () => {
      if (typeof soundManager.playMatchStart === 'function') {
        soundManager.playMatchStart();
      } else {
        // Fallback to round start if match start is unavailable
        (soundManager as any).playRoundStart?.();
      }
    });
  }

  /**
   * Automatically triggers AI K.O. announcer voice line.
   */
  async playKO(): Promise<void> {
    const jpText = `勝負あり！K O ！`;
    const cacheKey = `announcer_ko`;
    await this.playTTSLine(jpText, cacheKey, 'Announcer', () => soundManager.playUltimateFinisher());
  }

  /**
   * Triggers Awakening quote spoken voice for character transformations.
   */
  async speakAwakeningQuote(text: string, textJP?: string, characterName?: string): Promise<void> {
    if (this.isMuted) return;
    const spokenText = textJP || text;
    const name = characterName || 'Fighter';
    const cacheKey = `${name.toLowerCase().replace(/\s+/g, '_')}_awakening_${spokenText.substring(0, 32)}`;
    await this.playTTSLine(spokenText, cacheKey, name, () => {
      this.speakSynthesized(spokenText, textJP ? 'ja' : 'en', 1.0, 1.05);
    });
  }

  /**
   * Triggers high-energy AI voice clips for combo milestones.
   */
  async playComboMilestoneVoice(hits: number): Promise<void> {
    let jpText = '';
    if (hits >= 20) {
      jpText = '素晴らしい！20コンボ突破！究極の技だ！';
    } else if (hits >= 10) {
      jpText = 'すごい！10コンボ！ノリノリだぜ！';
    } else if (hits >= 5) {
      jpText = '5コンボ！いい調子だ！';
    } else {
      return;
    }

    const cacheKey = `announcer_combo_${hits}`;
    await this.playTTSLine(jpText, cacheKey, 'Announcer', () => {
      // Fallback to sound effect if TTS fails
      soundManager.playComboMilestone(hits);
    });
  }

  /**
   * Triggers an AI-generated voice announcement reading out the names of the finalists
   * before the final championship match begins, using the game's existing audio playback system.
   */
  async playTournamentFinalsAnnouncement(finalist1Name: string, finalist2Name: string): Promise<void> {
    const text = `Grand Finals Championship! ${finalist1Name} versus ${finalist2Name}! Let the ultimate battle begin!`;
    const cleanKey1 = finalist1Name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanKey2 = finalist2Name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cacheKey = `announcer_finals_${cleanKey1}_vs_${cleanKey2}`;

    await this.playTTSLine(text, cacheKey, 'TournamentAnnouncer', () => {
      // Fallback: use speech synthesis through the game's existing audio manager pipeline
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.volume = this.isMuted ? 0 : 1.0;
          utterance.rate = 1.12;
          utterance.pitch = 0.88;
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice =
            voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google'))) ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0];
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn('Speech synthesis fallback failed:', err);
      }
    });
  }

  /**
   * Fetches and plays dynamic AI commentary based on match events.
   */
  async playDynamicCommentary(data: {
    eventType: string;
    lastAction: any;
    comboHits?: number;
    damageDealt?: number;
    roundNumber?: number;
  }): Promise<void> {
    try {
      const response = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result.commentary) {
        const cacheKey = `commentary_${result.commentary.substring(0, 32)}`;
        // Use 'Announcer' character for commentary voice
        await this.playTTSLine(result.commentary, cacheKey, 'Announcer', () => {
          // No fallback for commentary, just let it be silent if TTS fails
        });
      }
    } catch (e) {
      console.warn("Commentary fetch failed", e);
    }
  }

  private playBuffer(buffer: AudioBuffer, ctx: AudioContext) {
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      this.activeSources.add(source);
      source.onended = () => {
        this.activeSources.delete(source);
      };
      
      source.start(0);
    } catch (e) {
      console.warn("TTS buffer playback failed", e);
    }
  }
}

export const characterVoiceManager = new CharacterVoiceManager();
