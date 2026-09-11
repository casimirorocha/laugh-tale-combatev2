import { BattleBGMPhase, battleBgmEngine } from './bgmSynthesizer';
import { getCachedAudioPath, preloadAudioUrl } from './mediaCache';
import { characterVoiceManager } from './audioAssetLibrary';
import { soundManager } from './soundEffects';
import { Fighter, Transformation, AwakeningProfile } from '../types/fighter';
import {
  CUSTOM_MOVE_AUDIO_MAP,
  CUSTOM_TAUNT_AUDIO_MAP,
  CUSTOM_HAKI_AUDIO_MAP,
  CUSTOM_TRANSFORMATION_ENTER_MAP,
  CUSTOM_TRANSFORMATION_EXIT_MAP,
  getCustomMoveAudioCandidates,
  getCustomMoveAudioPath,
  getCustomTauntAudioPath,
  getCustomHakiAudioCandidates,
  getCustomTransformationEnterCandidates,
  getCustomTransformationExitCandidates,
  getTransformationVoiceLine,
  getFighterLaughText,
  registerCustomMoveAudio,
  registerCustomTauntAudio,
} from './customAudio';

/**
 * AudioManager handles the playback of music and sound effects.
 * It specifically manages the selection and looping of battle themes and custom character move MP3s.
 */
class AudioManager {
  private musicAudio: HTMLAudioElement | null = null;
  private bgTauntAudio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.5;
  private ambientIntervalId: NodeJS.Timeout | null = null;
  private lastMoveSfxTime: number = 0;
  private isMoveSfxActive: boolean = false;
  private isSynthBgmActive: boolean = false;
  private audioCacheMap: Map<string, HTMLAudioElement> = new Map();

  // Web Audio pooled buffer system fields
  private audioCtx: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private decodePromises: Map<string, Promise<AudioBuffer>> = new Map();
  private bgTauntSource: AudioBufferSourceNode | null = null;
  private maxConcurrentSounds: number = 24;

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public setupResumptionPolicy() {
    if (typeof window === 'undefined') return;

    const resumeAll = () => {
      this.initAudioContext();
      if (this.audioCtx && (this.audioCtx.state === 'suspended' || (this.audioCtx.state as string) === 'interrupted')) {
        this.audioCtx.resume()
          .then(() => {
            console.log('[AudioManager] Global root AudioContext resumed successfully!');
          })
          .catch((err) => console.warn('[AudioManager] Failed to resume on gesture:', err));
      }
      this.resumeAudioContext().catch(() => {});
    };

    document.addEventListener('click', resumeAll, { once: true });
    document.addEventListener('touchstart', resumeAll, { once: true });

    // Handle document visibility change to resume audio when user returns to tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.resumeAudioContext().catch(() => {});
      }
    });
  }

  /**
   * Resumes the suspended AudioContext (and BGM Synthesizer context)
   * to guarantee that browser autoplay policies do not silence the game.
   */
  public async resumeAudioContext(): Promise<void> {
    this.initAudioContext();
    const promises: Promise<void>[] = [];

    if (this.audioCtx && (this.audioCtx.state === 'suspended' || (this.audioCtx.state as string) === 'interrupted')) {
      promises.push(
        this.audioCtx.resume().then(() => {
          console.log('[AudioManager] Main AudioContext successfully resumed!');
        }).catch((err) => {
          console.warn('[AudioManager] Failed to resume main AudioContext:', err);
        })
      );
    }

    // Also resume bgmSynthesizer's context
    promises.push(battleBgmEngine.resumeContext());

    await Promise.all(promises);
  }

  private async getAudioBuffer(path: string): Promise<AudioBuffer> {
    this.initAudioContext();
    if (!this.audioCtx) {
      throw new Error('AudioContext not available');
    }

    const cached = this.audioBuffers.get(path);
    if (cached) return cached;

    let promise = this.decodePromises.get(path);
    if (!promise) {
      promise = (async () => {
        try {
          const resolvedPath = getCachedAudioPath(path);
          const response = await fetch(resolvedPath);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.statusText}`);
          }
          // Reject HTML responses — Vite's SPA fallback returns 200 + index.html for unknown paths
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('text/html')) {
            throw new Error(`Not an audio file (got ${contentType})`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await this.audioCtx!.decodeAudioData(arrayBuffer);
          this.audioBuffers.set(path, buffer);
          return buffer;
        } catch (error) {
          console.debug(`[AudioManager] Audio not available: ${path}`);
          this.decodePromises.delete(path);
          throw error;
        }
      })();
      this.decodePromises.set(path, promise);
    }

    return promise;
  }

  private playBuffer(buffer: AudioBuffer, volume: number, onEnded?: () => void): AudioBufferSourceNode | null {
    if (!this.audioCtx || this.isMuted) return null;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // Voice stealing to prevent overloading the thread if concurrent sounds exceed max
      if (this.activeSources.size >= this.maxConcurrentSounds) {
        const oldestSource = this.activeSources.values().next().value;
        if (oldestSource) {
          try {
            oldestSource.stop();
          } catch {}
          this.activeSources.delete(oldestSource);
        }
      }

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = this.audioCtx.createGain();
      gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);

      source.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      this.activeSources.add(source);
      
      source.onended = () => {
        this.activeSources.delete(source);
        if (onEnded) onEnded();
      };

      source.start(0);
      return source;
    } catch (err) {
      console.warn('[AudioManager] Failed to play buffer', err);
      return null;
    }
  }

  private getCachedAudio(path: string): HTMLAudioElement {
    const resolvedPath = getCachedAudioPath(path);
    let cached = this.audioCacheMap.get(resolvedPath);
    if (!cached) {
      cached = new Audio(resolvedPath);
      cached.preload = 'auto';
      this.audioCacheMap.set(resolvedPath, cached);
      if (resolvedPath === path) {
        preloadAudioUrl(path).catch(() => {});
      }
    }
    return cached;
  }

  private BATTLE_THEMES = [
    { id: 'overtaken', name: 'Overtaken', path: '/src/audio/music/overtaken.mp3' },
    { id: 'very_strongest', name: 'The Very Very Very Strongest', path: '/src/audio/music/very_strongest.mp3' },
    { id: 'fierce_attack', name: 'Luffy\'s Fierce Attack', path: '/src/audio/music/fierce_attack.mp3' },
    { id: 'gear5', name: 'Drums of Liberation (Gear 5)', path: '/src/audio/music/gear5.mp3' },
    { id: 'three_admirals', name: 'The Three Admirals', path: '/src/audio/music/three_admirals.mp3' }
  ];

  private VICTORY_FANFARES = [
    { id: 'victory_classic', path: '/src/audio/music/victory_fanfare.mp3' },
    { id: 'victory_heroic', path: '/src/audio/music/victory_heroic.mp3' },
    { id: 'victory_drums', path: '/src/audio/music/victory_drums.mp3' }
  ];

  private STAGE_AMBIENT_MAP: Record<string, string[]> = {
    'stage_marineford': ['ice_crack', 'water_splash', 'wind_howl'],
    'stage_onigashima': ['thunder_rumble', 'lightning_strike', 'roof_debris'],
    'stage_egghead': ['cyber_pulse', 'hologram_glitch', 'robot_hum'],
    'stage_laugh_tale': ['ancient_echo', 'gold_shimmer', 'distant_waves'],
    'stage_wholecake': ['candy_crunch', 'homie_giggle', 'syrup_bubble']
  };

  constructor() {
    if (typeof window !== 'undefined') {
      // Pre-cache standard Haki audio files immediately on load
      setTimeout(() => {
        this.preloadHakiAudio();
      }, 200);

      // Register interaction-driven resumption policy
      this.setupResumptionPolicy();
    }
  }

  /**
   * Starts periodic ambient sounds for a specific stage.
   */
  public startStageAmbient(stageId: string) {
    this.stopStageAmbient();
    
    const sounds = this.STAGE_AMBIENT_MAP[stageId];
    if (!sounds) return;

    console.log(`[AudioManager] Starting ambient sounds for stage: ${stageId}`);

    // Set an interval to play a random ambient sound every 8-15 seconds
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 7000) + 8000;
      this.ambientIntervalId = setTimeout(() => {
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        this.playSfx(randomSound, 0.3); // Lower volume for ambient
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  /**
   * Stops periodic ambient sounds.
   */
  public stopStageAmbient() {
    if (this.ambientIntervalId) {
      clearTimeout(this.ambientIntervalId);
      this.ambientIntervalId = null;
    }
  }

  /**
   * Randomly selects and plays a battle theme.
   * Falls back to Web Audio BGM Synthesizer if MP3 audio file is unavailable.
   */
  public playBattleMusic() {
    this.stopBattleMusic();

    const randomIndex = Math.floor(Math.random() * this.BATTLE_THEMES.length);
    const selectedTrack = this.BATTLE_THEMES[randomIndex];
    
    console.log(`[AudioManager] Selected track: ${selectedTrack.name}`);
    
    const audio = new Audio(selectedTrack.path);
    audio.loop = true;
    audio.volume = this.isMuted ? 0 : this.musicVolume;
    this.musicAudio = audio;
    this.currentTrackId = selectedTrack.id;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Ignore AbortError when play was interrupted by a rapid state change/pause
        if (err?.name === 'AbortError') return;
        if (this.musicAudio !== audio) return;

        console.info(`[AudioManager] Static BGM file unavailable (${selectedTrack.path}). Activating Web Audio BGM Synthesizer.`);
        this.musicAudio = null;
        this.currentTrackId = 'synth_bgm';
        this.isSynthBgmActive = true;
        battleBgmEngine.setVolume(this.musicVolume);
        if (this.isMuted) battleBgmEngine.toggleMute();
        battleBgmEngine.start('Opening');
      });
    }
  }

  /**
   * Stops the currently playing battle music or BGM synthesizer.
   */
  public stopBattleMusic() {
    if (this.musicAudio) {
      const currentAudio = this.musicAudio;
      this.musicAudio = null;
      this.currentTrackId = null;
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
    if (this.isSynthBgmActive) {
      battleBgmEngine.stop();
      this.isSynthBgmActive = false;
    }
  }

  /**
   * Pauses the currently playing battle music or BGM synthesizer.
   */
  public pauseBattleMusic() {
    if (this.musicAudio) {
      try {
        this.musicAudio.pause();
      } catch {
        // ignore
      }
    }
    if (this.isSynthBgmActive) {
      battleBgmEngine.stop();
    }
  }

  /**
   * Resumes the currently playing battle music or BGM synthesizer.
   */
  public resumeBattleMusic() {
    if (this.musicAudio) {
      this.musicAudio.play().catch(() => {});
    } else if (this.isSynthBgmActive) {
      battleBgmEngine.start(battleBgmEngine.getCurrentPhase() || 'Opening');
    }
  }

  /**
   * Sets the volume for music.
   */
  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicAudio && !this.isMuted) {
      this.musicAudio.volume = this.musicVolume;
    }
    battleBgmEngine.setVolume(this.musicVolume);
  }

  /**
   * Toggles the mute state for all audio managed by AudioManager.
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.musicAudio) {
      this.musicAudio.volume = this.isMuted ? 0 : this.musicVolume;
    }
    battleBgmEngine.toggleMute();
    return this.isMuted;
  }

  /**
   * Plays a random victory fanfare.
   */
  public playVictoryFanfare() {
    this.stopBattleMusic();
    this.stopStageAmbient();

    const randomIndex = Math.floor(Math.random() * this.VICTORY_FANFARES.length);
    const selectedFanfare = this.VICTORY_FANFARES[randomIndex];

    console.log(`[AudioManager] Playing victory fanfare: ${selectedFanfare.id}`);

    const audio = new Audio(selectedFanfare.path);
    audio.volume = this.isMuted ? 0 : this.musicVolume;
    this.musicAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        if (err?.name === 'AbortError') return;
        // If fanfare file missing, play generic sfx
        this.playSfx('match_victory', 0.8);
      });
    }
  }

  /**
   * Speaks a victory quote using Speech Synthesis.
   */
  public speakWinQuote(text: string, characterId?: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.isMuted ? 0 : 1.0;
      utterance.rate = 0.92; // Slightly slower for dramatic effect
      
      // Determine pitch based on character (simple heuristic)
      let pitch = 1.0;
      if (characterId === 'kaido' || characterId === 'whitebeard' || characterId === 'garp') {
        pitch = 0.7; // Deep voice
      } else if (characterId === 'nami' || characterId === 'robin' || characterId === 'yamato') {
        pitch = 1.2; // Higher pitch
      }
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      // Try to find a good narrator or suitable voice
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
                          || voices.find(v => v.lang.startsWith('en'))
                          || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      speak();
    }
  }

  /**
   * Speaks an announcer event with high arcade energy using Gemini TTS.
   */
  public speakAnnouncer(text: string) {
    if (this.isMuted) return;
    characterVoiceManager.speakAnnouncerGemini(text, 'aggressive');
  }

  private sfxPoolMap: Map<string, HTMLAudioElement[]> = new Map();

  private getPooledSfxAudio(path: string): HTMLAudioElement {
    let pool = this.sfxPoolMap.get(path);
    if (!pool) {
      pool = [];
      this.sfxPoolMap.set(path, pool);
    }
    let audio = pool.find((a) => a.paused || a.ended);
    if (!audio) {
      if (pool.length < 8) {
        audio = new Audio(path);
        pool.push(audio);
      } else {
        audio = pool[0];
      }
    }
    audio.src = path;
    audio.currentTime = 0;
    return audio;
  }

  private playSfxLegacy(name: string, volumeOverride?: number) {
    const sfxPath = `/audio/sfx/${name}.mp3`;
    const sfx = this.getPooledSfxAudio(sfxPath);
    const baseVolume = volumeOverride !== undefined ? volumeOverride : 0.7;
    sfx.volume = this.isMuted ? 0 : baseVolume;
    sfx.play().catch(() => {
      const wavAudio = this.getPooledSfxAudio(`/src/audio/sfx/${name}.wav`);
      wavAudio.volume = this.isMuted ? 0 : baseVolume;
      wavAudio.play().catch(() => {});
    });
  }

  /**
   * Plays a sound effect using Web Audio API pooled buffers for lowest latency.
   */
  public playSfx(name: string, volumeOverride?: number) {
    if (this.isMuted) return;

    const sfxPath = `/audio/sfx/${name}.mp3`;
    const fallbackPath = `/src/audio/sfx/${name}.wav`;
    const baseVolume = volumeOverride !== undefined ? volumeOverride : 0.7;

    this.initAudioContext();

    if (this.audioCtx) {
      this.getAudioBuffer(sfxPath)
        .then((buffer) => this.playBuffer(buffer, baseVolume))
        .catch(() => {
          this.getAudioBuffer(fallbackPath)
            .then((buffer) => this.playBuffer(buffer, baseVolume))
            .catch(() => {
              // Legacy fallback if Web Audio decoding fails
              this.playSfxLegacy(name, volumeOverride);
            });
        });
    } else {
      this.playSfxLegacy(name, volumeOverride);
    }
  }

  /**
   * Plays a custom .mp3 audio file for a fighter move trigger.
   * Tries candidates sequentially until playback succeeds.
   */
  public playCustomMoveSfx(
    fighterId?: string,
    moveId?: string,
    moveName?: string,
    moveType?: string,
    volumeOverride?: number
  ): boolean {
    this.lastMoveSfxTime = Date.now();
    this.isMoveSfxActive = true;
    const candidates = getCustomMoveAudioCandidates(fighterId, moveId, moveName, moveType);
    if (candidates.length === 0) return false;

    return this.playAudioWithFallback(candidates, volumeOverride, () => {
      this.isMoveSfxActive = false;
    });
  }

  /**
   * Loads and plays a custom move MP3 audio file directly by ID/Key (e.g. "luffy_pistol", "zoro_sanzen_sekai").
   */
  public playMoveAudioById(audioId: string, volumeOverride?: number): boolean {
    this.lastMoveSfxTime = Date.now();
    this.isMoveSfxActive = true;
    const mapped = CUSTOM_MOVE_AUDIO_MAP[audioId];
    const candidateList = Array.isArray(mapped) ? mapped : mapped ? [mapped] : [`/audio/sfx/${audioId}.mp3`, `/audio/characters/${audioId}.mp3`];
    return this.playAudioWithFallback(candidateList, volumeOverride, () => {
      this.isMoveSfxActive = false;
    });
  }

  /**
   * Registers or updates a custom MP3 audio URL path for a specific move or character key.
   */
  public registerCustomAudio(audioId: string, mp3Url: string): void {
    registerCustomMoveAudio(audioId, mp3Url);
  }

  /**
   * Plays a custom .mp3 taunt audio file for a fighter on the foreground channel.
   */
  public playCustomTauntSfx(
    fighterId?: string,
    fighterName?: string,
    volumeOverride?: number
  ): boolean {
    const tauntPath = getCustomTauntAudioPath(fighterId, fighterName);
    if (!tauntPath) return false;

    const candidateList = [
      tauntPath,
      fighterId ? `/audio/taunts/${fighterId.toLowerCase()}.mp3` : '',
      fighterId ? `/audio/taunts/${fighterId.toLowerCase()}_taunt.mp3` : '',
      fighterName ? `/audio/taunts/${fighterName.toLowerCase().replace(/\s+/g, '_')}.mp3` : '',
    ].filter(Boolean);

    return this.playAudioWithFallback(candidateList, volumeOverride);
  }

  /**
   * Plays character-specific laugh/taunt clips on a dedicated background audio channel.
   * Ensures it does NOT overlap with active move sound effects.
   */
  public playBackgroundTauntSfx(
    fighterId?: string,
    fighterName?: string,
    volumeOverride?: number
  ): boolean {
    // Prevent overlapping if move SFX is actively playing or was played in the last 600ms
    const timeSinceLastMove = Date.now() - this.lastMoveSfxTime;
    if (this.isMoveSfxActive || timeSinceLastMove < 600) {
      return false;
    }

    const tauntPath = getCustomTauntAudioPath(fighterId, fighterName);
    if (!tauntPath) return false;

    const candidateList = [
      tauntPath,
      fighterId ? `/audio/taunts/${fighterId.toLowerCase()}.mp3` : '',
      fighterId ? `/audio/taunts/${fighterId.toLowerCase()}_taunt.mp3` : '',
      fighterName ? `/audio/taunts/${fighterName.toLowerCase().replace(/\s+/g, '_')}.mp3` : '',
    ].filter(Boolean);

    // Stop previous background taunt if still playing to prevent overlap
    if (this.bgTauntAudio) {
      try {
        this.bgTauntAudio.pause();
        this.bgTauntAudio = null;
      } catch {
        // ignore
      }
    }
    if (this.bgTauntSource) {
      try {
        this.bgTauntSource.stop();
        this.bgTauntSource = null;
      } catch {
        // ignore
      }
    }

    const tryNext = (index: number) => {
      if (index >= candidateList.length) return;
      const path = candidateList[index];
      const baseVol = volumeOverride !== undefined ? volumeOverride : 0.65;

      this.initAudioContext();

      if (this.audioCtx) {
        this.getAudioBuffer(path)
          .then((buffer) => {
            if (this.bgTauntSource) {
              try { this.bgTauntSource.stop(); } catch {}
            }
            this.bgTauntSource = this.playBuffer(buffer, baseVol, () => {
              if (this.bgTauntSource?.buffer === buffer) {
                this.bgTauntSource = null;
              }
            });
          })
          .catch(() => {
            const audio = new Audio(path);
            audio.volume = this.isMuted ? 0 : baseVol;
            this.bgTauntAudio = audio;

            let hasTriedNext = false;
            const onError = () => {
              if (!hasTriedNext) {
                hasTriedNext = true;
                tryNext(index + 1);
              }
            };

            audio.addEventListener('ended', () => {
              if (this.bgTauntAudio === audio) {
                this.bgTauntAudio = null;
              }
            });
            audio.addEventListener('error', onError, { once: true });

            audio.play().catch(() => onError());
          });
      } else {
        const audio = new Audio(path);
        audio.volume = this.isMuted ? 0 : baseVol;
        this.bgTauntAudio = audio;

        let hasTriedNext = false;
        const onError = () => {
          if (!hasTriedNext) {
            hasTriedNext = true;
            tryNext(index + 1);
          }
        };

        audio.addEventListener('ended', () => {
          if (this.bgTauntAudio === audio) {
            this.bgTauntAudio = null;
          }
        });
        audio.addEventListener('error', onError, { once: true });

        audio.play().catch(() => onError());
      }
    };

    tryNext(0);
    return true;
  }

  /**
   * Plays the recorded or iconic laugh audio corresponding to the winning player.
   * Checks candidate MP3 files and falls back to character voice synthesis / synthesized laugh.
   */
  public playFighterVictoryLaugh(
    fighterId?: string,
    fighterName?: string,
    volumeOverride?: number
  ): boolean {
    const fId = fighterId ? fighterId.toLowerCase() : '';
    const cleanId = fId.replace(/_(gear\d+|v\d+|awakened|hybrid|base|young)$/g, '');
    const nameSlug = fighterName ? fighterName.toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';
    
    const candidateList = [
      `/audio/taunts/${fId}_laugh.mp3`,
      `/audio/taunts/${cleanId}_laugh.mp3`,
      `/audio/characters/${fId}_laugh.mp3`,
      `/audio/characters/${cleanId}_laugh.mp3`,
      getCustomTauntAudioPath(fId, fighterName),
      `/audio/taunts/${fId}.mp3`,
      `/audio/taunts/${cleanId}.mp3`,
      `/audio/taunts/${fId}_taunt.mp3`,
      `/audio/taunts/${cleanId}_taunt.mp3`,
      nameSlug ? `/audio/taunts/${nameSlug}.mp3` : '',
    ].filter(Boolean) as string[];

    const laughText = getFighterLaughText(fId || nameSlug);

    const onFallback = () => {
      // 1. Spoken AI/TTS laugh voice
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          const utterance = new SpeechSynthesisUtterance(laughText);
          utterance.volume = this.isMuted ? 0 : (volumeOverride || 0.95);
          utterance.rate = 1.05;
          let pitch = 1.0;
          if (fId.includes('kaido') || fId.includes('whitebeard') || fId.includes('blackbeard') || fId.includes('garp')) {
            pitch = 0.65;
          } else if (fId.includes('buggy') || fId.includes('caesar') || fId.includes('doflamingo') || fId.includes('moria')) {
            pitch = 1.25;
          } else if (fId.includes('luffy')) {
            pitch = 1.15;
          }
          utterance.pitch = pitch;
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.startsWith('ja')) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;
          window.speechSynthesis.speak(utterance);
        } catch {}
      }
    };

    return this.playAudioWithFallback(candidateList, volumeOverride || 0.9, undefined, onFallback);
  }

  /**
   * Preloads a single audio path into the in-memory cache map and triggers browser loading.
   */
  public async preloadAudioPath(path: string): Promise<void> {
    try {
      await this.getAudioBuffer(path);
    } catch {
      if (this.audioCacheMap.has(path)) {
        return;
      }

      return new Promise((resolve) => {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = path;

        const onReady = () => {
          this.audioCacheMap.set(path, audio);
          cleanup();
          resolve();
        };

        const onError = () => {
          this.audioCacheMap.set(path, audio);
          cleanup();
          resolve();
        };

        const cleanup = () => {
          audio.removeEventListener('canplaythrough', onReady);
          audio.removeEventListener('loadeddata', onReady);
          audio.removeEventListener('error', onError);
        };

        audio.addEventListener('canplaythrough', onReady, { once: true });
        audio.addEventListener('loadeddata', onReady, { once: true });
        audio.addEventListener('error', onError, { once: true });

        audio.load();
      });
    }
  }

  /**
   * Pre-caches Haki sound effects and candidates for given fighter IDs
   * to ensure buffers are fully prepared in memory before animation frames start.
   */
  public preloadHakiAudio(fighterIds: string[] = []): Promise<void[]> {
    const hakiTypes = ['conqueror', 'conquerors', 'armament', 'observation', 'clash', 'void'];
    const candidatesSet = new Set<string>();

    // Standard static Haki sound paths
    const defaultPaths = [
      '/audio/haki/conquerors_haki.mp3',
      '/audio/haki/conquerors.mp3',
      '/audio/haki/armament_haki.mp3',
      '/audio/haki/armament.mp3',
      '/audio/haki/observation_haki.mp3',
      '/audio/haki/observation.mp3',
      '/audio/haki/haki_clash.mp3',
      '/audio/haki/clash.mp3',
      '/audio/sfx/haki_burst.mp3',
      '/audio/sfx/haki_thunder.mp3',
    ];
    defaultPaths.forEach((p) => candidatesSet.add(p));

    // Fighter-specific Haki candidate paths
    fighterIds.forEach((id) => {
      hakiTypes.forEach((type) => {
        const candidates = getCustomHakiAudioCandidates(id, type);
        candidates.forEach((c) => candidatesSet.add(c));
      });
    });

    const loadPromises = Array.from(candidatesSet).map((path) => this.preloadAudioPath(path));
    return Promise.all(loadPromises);
  }

  /**
   * Plays custom Haki sound effects (Conqueror's, Armament, Observation, or Haki Clash).
   */
  public playCustomHakiSfx(
    fighterId?: string,
    hakiType?: string,
    volumeOverride?: number,
    onAllFailed?: () => void
  ): boolean {
    const candidates = getCustomHakiAudioCandidates(fighterId, hakiType);
    if (candidates.length === 0) {
      if (onAllFailed) onAllFailed();
      return false;
    }

    return this.playAudioWithFallback(candidates, volumeOverride || 0.85, undefined, onAllFailed);
  }

  /**
   * Registers or updates a custom MP3 taunt audio URL for a fighter.
   */
  public registerCustomTauntAudio(fighterId: string, mp3Url: string): void {
    registerCustomTauntAudio(fighterId, mp3Url);
  }

  /**
   * Synthesizes an anime-style transformation surge soundscape:
   * 1. Sub-bass exponential charge-up glide (55Hz -> 580Hz)
   * 2. Shimmering harmonic chord bloom (523Hz, 659Hz, 783Hz, 1046Hz) with resonant lowpass filter
   * 3. Heavy impact shockwave thud at form engagement peak
   */
  public synthesizeTransformationEnter(themeColor?: string): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // Layer 1: Sub-bass Power Glide
      const subOsc = this.audioCtx.createOscillator();
      const subGain = this.audioCtx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(55, now);
      subOsc.frequency.exponentialRampToValueAtTime(330, now + 0.5);
      subOsc.frequency.exponentialRampToValueAtTime(580, now + 1.0);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

      subOsc.connect(subGain);
      subGain.connect(this.audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.4);

      // Layer 2: Harmonic Awakening Chord (C5, E5, G5, C6)
      const chordFreqs = [523.25, 659.25, 783.99, 1046.5];
      chordFreqs.forEach((freq, idx) => {
        const chordOsc = this.audioCtx!.createOscillator();
        const chordGain = this.audioCtx!.createGain();
        chordOsc.type = 'sawtooth';
        chordOsc.frequency.setValueAtTime(freq, now + idx * 0.04);

        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(4500, now + 0.6);
        filter.Q.setValueAtTime(4, now);

        chordGain.gain.setValueAtTime(0.001, now + idx * 0.04);
        chordGain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.08);
        chordGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        chordOsc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.audioCtx!.destination);

        chordOsc.start(now + idx * 0.04);
        chordOsc.stop(now + 1.25);
      });

      // Layer 3: Impact Detonation at 0.5s
      const impactOsc = this.audioCtx.createOscillator();
      const impactGain = this.audioCtx.createGain();
      impactOsc.type = 'sine';
      impactOsc.frequency.setValueAtTime(140, now + 0.5);
      impactOsc.frequency.exponentialRampToValueAtTime(38, now + 1.1);
      impactGain.gain.setValueAtTime(0.001, now + 0.5);
      impactGain.gain.linearRampToValueAtTime(0.5, now + 0.53);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      impactOsc.connect(impactGain);
      impactGain.connect(this.audioCtx.destination);
      impactOsc.start(now + 0.5);
      impactOsc.stop(now + 1.3);
    } catch (e) {
      console.warn('[AudioManager] Failed to synthesize transformation enter sfx', e);
    }
  }

  /**
   * Synthesizes an anime-style de-transformation / exhaust soundscape:
   * 1. Descending pitch dissipation sweep (380Hz -> 70Hz)
   * 2. Filtered cooling steam / exhaust venting noise
   * 3. Exhaustion heartbeat pulses
   */
  public synthesizeTransformationExit(): void {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;

      // Layer 1: Downward Power Dissipation Sweep
      const glideOsc = this.audioCtx.createOscillator();
      const glideGain = this.audioCtx.createGain();
      glideOsc.type = 'triangle';
      glideOsc.frequency.setValueAtTime(380, now);
      glideOsc.frequency.exponentialRampToValueAtTime(70, now + 0.85);
      glideGain.gain.setValueAtTime(0.001, now);
      glideGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
      glideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      glideOsc.connect(glideGain);
      glideGain.connect(this.audioCtx.destination);
      glideOsc.start(now);
      glideOsc.stop(now + 1.0);

      // Layer 2: White Noise Steam Release Whoosh
      const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.8);
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const bandpass = this.audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1400, now);
      bandpass.frequency.exponentialRampToValueAtTime(250, now + 0.75);
      bandpass.Q.setValueAtTime(2, now);

      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

      whiteNoise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.8);

      // Layer 3: Heartbeat Thuds (Returning to human limits)
      [0.25, 0.6].forEach((delay, idx) => {
        const hbOsc = this.audioCtx!.createOscillator();
        const hbGain = this.audioCtx!.createGain();
        hbOsc.type = 'sine';
        hbOsc.frequency.setValueAtTime(idx === 0 ? 58 : 50, now + delay);
        hbOsc.frequency.exponentialRampToValueAtTime(32, now + delay + 0.15);
        hbGain.gain.setValueAtTime(0.001, now + delay);
        hbGain.gain.linearRampToValueAtTime(0.28, now + delay + 0.02);
        hbGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

        hbOsc.connect(hbGain);
        hbGain.connect(this.audioCtx!.destination);
        hbOsc.start(now + delay);
        hbOsc.stop(now + delay + 0.2);
      });
    } catch (e) {
      console.warn('[AudioManager] Failed to synthesize transformation exit sfx', e);
    }
  }

  /**
   * Triggers specific transformation sound effects and character voice clips
   * whenever a fighter enters a transformed state in the arcade arena.
   */
  public playTransformationEnter(
    fighter: Fighter,
    transformation: Transformation,
    side?: 'team1' | 'team2',
    onVoiceQuote?: (quote: string) => void
  ): boolean {
    if (this.isMuted) return false;
    this.initAudioContext();

    // 1. Synthesize high-energy transformation surge SFX immediately for zero-latency impact
    this.synthesizeTransformationEnter(transformation.visuals?.themeColor);

    // 2. Play secondary SFX / thunder / finisher boom
    try {
      soundManager.playPowerUp();
      soundManager.playHakiThunder();
    } catch {}

    // 3. Trigger candidate transformation / haki audio files
    const candidates = getCustomTransformationEnterCandidates(
      fighter.id,
      transformation.id,
      transformation.name
    );
    if (candidates.length > 0) {
      this.playAudioWithFallback(candidates, 0.95);
    }

    // 4. Trigger character voice line
    const voiceLine = getTransformationVoiceLine(
      fighter.id,
      transformation.id,
      transformation.name
    );

    // If custom audio clip exists (e.g. luffy_gear5.mp3 or kaido_beast.mp3), play it
    if (voiceLine.customClip) {
      this.playAudioByPath(voiceLine.customClip, 1.0);
    }

    // Speak voiced awakening quote (Japanese battle cry with English translation)
    characterVoiceManager.speakAwakeningQuote(
      voiceLine.enterVoiceEN,
      voiceLine.enterVoiceJP,
      fighter.name
    );

    if (onVoiceQuote) {
      onVoiceQuote(voiceLine.enterVoiceEN);
    }

    // 5. Speak arcade announcer line
    this.speakAnnouncer(`Transformation! ${transformation.name}!`);

    return true;
  }

  /**
   * Triggers specific transformation revert/exhaust sound effects and character voice clips
   * whenever a fighter exits a transformed state in the arcade arena.
   */
  public playTransformationExit(
    fighter: Fighter,
    previousFormName?: string,
    side?: 'team1' | 'team2',
    onVoiceQuote?: (quote: string) => void
  ): boolean {
    if (this.isMuted) return false;
    this.initAudioContext();

    // 1. Synthesize de-transformation exhaust / cooling steam SFX
    this.synthesizeTransformationExit();

    // 2. Play secondary power-down chime / wave SFX
    const candidates = getCustomTransformationExitCandidates(
      fighter.id,
      undefined,
      previousFormName
    );
    if (candidates.length > 0) {
      this.playAudioWithFallback(candidates, 0.85);
    }

    // 3. Trigger character fatigue / de-transformation voice line
    const voiceLine = getTransformationVoiceLine(
      fighter.id,
      undefined,
      previousFormName
    );

    if (voiceLine.customExitClip) {
      this.playAudioByPath(voiceLine.customExitClip, 0.9);
    }

    // Speak character de-transformation fatigue line
    characterVoiceManager.speakAwakeningQuote(
      voiceLine.exitVoiceEN,
      voiceLine.exitVoiceJP,
      fighter.name
    );

    if (onVoiceQuote) {
      onVoiceQuote(voiceLine.exitVoiceEN);
    }

    return true;
  }

  /**
   * Triggers awakening limit-breaker transformation sound effects and voice clip.
   */
  public playAwakeningEnter(
    fighter: Fighter,
    profile: AwakeningProfile,
    side?: 'team1' | 'team2',
    onVoiceQuote?: (quote: string) => void
  ): boolean {
    if (this.isMuted) return false;
    this.initAudioContext();

    // 1. Synthesize powerful transformation aura
    this.synthesizeTransformationEnter(profile.auraColor);

    // 2. Power-up & Haki Thunder
    try {
      soundManager.playSuperCharge();
      soundManager.playHakiThunder();
    } catch {}

    // 3. Candidate files
    const candidates = getCustomTransformationEnterCandidates(
      fighter.id,
      'awakening',
      profile.formName
    );
    if (candidates.length > 0) {
      this.playAudioWithFallback(candidates, 0.95);
    }

    // 4. Voice lines
    const quote = profile.transformationQuote;
    const quoteJP = profile.transformationQuoteJP;
    characterVoiceManager.speakAwakeningQuote(quote, quoteJP, fighter.name);

    if (onVoiceQuote) {
      onVoiceQuote(quote);
    }

    this.speakAnnouncer(`Awakening! ${profile.formName}!`);
    return true;
  }

  /**
   * Triggers awakening exit / cooldown exhaustion sound effects and fatigue voice clip.
   */
  public playAwakeningExit(
    fighter: Fighter,
    profileOrName?: AwakeningProfile | string,
    side?: 'team1' | 'team2',
    onVoiceQuote?: (quote: string) => void
  ): boolean {
    const formName = typeof profileOrName === 'string' ? profileOrName : profileOrName?.formName || 'Awakening';
    return this.playTransformationExit(fighter, formName, side, onVoiceQuote);
  }

  /**
   * Preloads transformation sound effects for the active roster.
   */
  public preloadTransformationAudio(fighterIds: string[] = []): Promise<void[]> {
    const pathsToPreload: string[] = [
      '/audio/sfx/haki_burst.mp3',
      '/audio/sfx/cyber_pulse.mp3',
      '/audio/sfx/distant_waves.mp3',
      '/audio/taunts/luffy_gear5.mp3',
      '/audio/taunts/kaido_beast.mp3',
      '/audio/taunts/doflamingo_joker.mp3',
    ];

    fighterIds.forEach((id) => {
      const enterCandidates = getCustomTransformationEnterCandidates(id);
      const exitCandidates = getCustomTransformationExitCandidates(id);
      pathsToPreload.push(...enterCandidates, ...exitCandidates);
    });

    return Promise.all(pathsToPreload.map((p) => this.preloadAudioPath(p)));
  }

  private playHTML5AudioFallback(
    path: string,
    volume: number,
    onEnded?: () => void,
    onError?: () => void
  ) {
    try {
      const baseAudio = this.getCachedAudio(path);
      const audio = baseAudio.cloneNode(true) as HTMLAudioElement;
      audio.volume = this.isMuted ? 0 : volume;

      let hasEndedOrFailed = false;
      const handleEnded = () => {
        if (!hasEndedOrFailed) {
          hasEndedOrFailed = true;
          if (onEnded) onEnded();
        }
      };

      const handleFailed = () => {
        if (!hasEndedOrFailed) {
          hasEndedOrFailed = true;
          if (onError) onError();
        }
      };

      audio.addEventListener('ended', handleEnded, { once: true });
      audio.addEventListener('error', handleFailed, { once: true });

      audio.play().catch(() => {
        handleFailed();
      });
    } catch {
      if (onError) onError();
    }
  }

  /**
   * Helper method to try playing a list of candidate audio URLs in order.
   */
  public playAudioWithFallback(
    candidatePaths: string[],
    volumeOverride?: number,
    onEnded?: () => void,
    onAllFailed?: () => void
  ): boolean {
    if (this.isMuted || !candidatePaths || candidatePaths.length === 0) {
      if (onAllFailed) onAllFailed();
      return false;
    }

    this.initAudioContext();

    const tryNext = (index: number) => {
      if (index >= candidatePaths.length) {
        if (onEnded) onEnded();
        if (onAllFailed) onAllFailed();
        return;
      }

      const path = candidatePaths[index];
      const baseVolume = volumeOverride !== undefined ? volumeOverride : 0.85;

      if (this.audioCtx) {
        this.getAudioBuffer(path)
          .then((buffer) => {
            this.playBuffer(buffer, baseVolume, onEnded);
          })
          .catch(() => {
            // Web Audio failed, try HTML5 Audio fallback
            this.playHTML5AudioFallback(path, baseVolume, onEnded, () => {
              tryNext(index + 1);
            });
          });
      } else {
        // No AudioContext, fallback to HTML5 Audio
        this.playHTML5AudioFallback(path, baseVolume, onEnded, () => {
          tryNext(index + 1);
        });
      }
    };

    tryNext(0);
    return true;
  }

  public playGenericCombatBark(): boolean {
    const barks = [
      '/audio/sfx/hit.mp3',
      '/audio/sfx/clash.mp3',
    ];
    const path = barks[Math.floor(Math.random() * barks.length)];
    return this.playAudioByPath(path, 0.5);
  }

  /**
   * Helper method to play audio by path with error handling and volume check.
   */
  public playAudioByPath(path: string, volumeOverride?: number): boolean {
    return this.playAudioWithFallback([path], volumeOverride);
  }
}

export const audioManager = new AudioManager();
