import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Keyboard,
  Gamepad2,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Check,
  AlertCircle,
  Sliders,
  User,
  Users,
} from 'lucide-react';
import { KeyboardMapping, UserProfile } from '../types/fighter';
import {
  getUserProfile,
  saveUserProfile,
  DEFAULT_KEYBOARD_MAPPING,
  DEFAULT_P2_KEYBOARD_MAPPING,
  formatKeyLabel,
} from '../utils/storage';
import { soundManager } from '../utils/soundEffects';
import { vibrationService } from '../utils/vibrationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type SettingsTab = 'p1_controls' | 'p2_controls' | 'audio';

interface ActionKeyConfig {
  keyField: keyof KeyboardMapping;
  label: string;
  description: string;
  badge: string;
}

const ACTION_KEYS: ActionKeyConfig[] = [
  { keyField: 'move1Key', label: 'Primary Attack 1', description: 'Standard light strike / combo starter', badge: 'ATK 1' },
  { keyField: 'move2Key', label: 'Heavy Attack 2', description: 'Secondary medium slash or blast', badge: 'ATK 2' },
  { keyField: 'exMoveKey', label: 'EX / Special Move', description: 'Consumes EX meter for amplified power', badge: 'EX' },
  { keyField: 'superMoveKey', label: 'Super Move', description: 'High-damage cinematic technique', badge: 'SUPER' },
  { keyField: 'guardKey', label: 'Guard / Block', description: 'Defends against incoming damage & guard crush', badge: 'GUARD' },
  { keyField: 'dodgeKey', label: 'Future Sight Dodge', description: 'Evasion maneuver bypassing attacks', badge: 'DODGE' },
  { keyField: 'tauntKey', label: 'Provocation / Taunt', description: 'Drains enemy focus & restores meter', badge: 'TAUNT' },
  { keyField: 'finisherKey', label: 'Desperation Finisher', description: 'Devastating 3-Stock KO technique', badge: 'FINISHER' },
  { keyField: 'maxModeKey', label: 'MAX Mode Activation', description: 'Unleashes full power & unlimited EX cancels', badge: 'MAX' },
  { keyField: 'pauseKey', label: 'Pause / Menu', description: 'Opens battle pause menu', badge: 'PAUSE' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('p1_controls');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [p1Mapping, setP1Mapping] = useState<KeyboardMapping>(profile.keyboardMapping || DEFAULT_KEYBOARD_MAPPING);
  const [p2Mapping, setP2Mapping] = useState<KeyboardMapping>(profile.p2KeyboardMapping || DEFAULT_P2_KEYBOARD_MAPPING);

  // Key listening state for rebinding
  const [listeningKey, setListeningKey] = useState<{
    player: 'p1' | 'p2';
    keyField: keyof KeyboardMapping;
  } | null>(null);

  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  // Audio preferences (persisted locally)
  const [bgmMuted, setBgmMuted] = useState<boolean>(false);
  const [sfxMuted, setSfxMuted] = useState<boolean>(false);
  const [vibrationIntensity, setVibrationIntensity] = useState<number>(profile.vibrationIntensity !== undefined ? profile.vibrationIntensity : 70);

  useEffect(() => {
    if (isOpen) {
      const current = getUserProfile();
      setProfile(current);
      setP1Mapping(current.keyboardMapping || DEFAULT_KEYBOARD_MAPPING);
      setP2Mapping(current.p2KeyboardMapping || DEFAULT_P2_KEYBOARD_MAPPING);
      setVibrationIntensity(current.vibrationIntensity !== undefined ? current.vibrationIntensity : 70);
      setListeningKey(null);
      setConflictNotice(null);
    }
  }, [isOpen]);

  // Global keydown listener when in listening state
  useEffect(() => {
    if (!listeningKey) return;

    const handleRebindKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const pressedCode = e.code || e.key;

      // Ignore Escape if user wants to cancel rebinding
      if (pressedCode === 'Escape') {
        setListeningKey(null);
        soundManager.playUiClick();
        return;
      }

      const { player, keyField } = listeningKey;

      if (player === 'p1') {
        // Check for duplicates within P1 or P2
        const isUsedInP1 = Object.entries(p1Mapping).some(
          ([k, val]) => k !== keyField && val === pressedCode
        );
        const isUsedInP2 = Object.values(p2Mapping).includes(pressedCode);

        if (isUsedInP1 || isUsedInP2) {
          setConflictNotice(`Key "${formatKeyLabel(pressedCode)}" is already bound to another action. Key reassigned.`);
        } else {
          setConflictNotice(null);
        }

        const updated = { ...p1Mapping, [keyField]: pressedCode };
        setP1Mapping(updated);
        saveUserProfile({
          ...profile,
          keyboardMapping: updated,
        });
      } else {
        const isUsedInP2 = Object.entries(p2Mapping).some(
          ([k, val]) => k !== keyField && val === pressedCode
        );
        const isUsedInP1 = Object.values(p1Mapping).includes(pressedCode);

        if (isUsedInP2 || isUsedInP1) {
          setConflictNotice(`Key "${formatKeyLabel(pressedCode)}" is already bound to another action. Key reassigned.`);
        } else {
          setConflictNotice(null);
        }

        const updated = { ...p2Mapping, [keyField]: pressedCode };
        setP2Mapping(updated);
        saveUserProfile({
          ...profile,
          p2KeyboardMapping: updated,
        });
      }

      soundManager.playUiClick();
      setListeningKey(null);
      if (onSaved) onSaved();
    };

    window.addEventListener('keydown', handleRebindKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleRebindKeyDown, { capture: true });
    };
  }, [listeningKey, p1Mapping, p2Mapping, profile, onSaved]);

  const handleResetP1 = () => {
    setP1Mapping(DEFAULT_KEYBOARD_MAPPING);
    const updated = { ...profile, keyboardMapping: DEFAULT_KEYBOARD_MAPPING };
    setProfile(updated);
    saveUserProfile(updated);
    soundManager.playUiClick();
    setConflictNotice('Player 1 controls restored to default (WASD + J/K/U/I/L/Space).');
    if (onSaved) onSaved();
  };

  const handleResetP2 = () => {
    setP2Mapping(DEFAULT_P2_KEYBOARD_MAPPING);
    const updated = { ...profile, p2KeyboardMapping: DEFAULT_P2_KEYBOARD_MAPPING };
    setProfile(updated);
    saveUserProfile(updated);
    soundManager.playUiClick();
    setConflictNotice('Player 2 controls restored to default (NUMPAD 1-9 & 0).');
    if (onSaved) onSaved();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="w-full max-w-4xl bg-zinc-900 border-2 border-amber-500/50 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Cinzel'] tracking-wider text-amber-400">
                  SYSTEM SETTINGS & REBIND CONTROLS
                </h2>
                <p className="text-xs text-zinc-400">
                  Configure local 2-Player keyboard mappings on a single machine
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-4 bg-zinc-900 border-b border-zinc-800">
            <button
              onClick={() => {
                setActiveTab('p1_controls');
                soundManager.playUiClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t-2 border-x-2 ${
                activeTab === 'p1_controls'
                  ? 'bg-zinc-950 border-amber-500 text-amber-400 shadow-[0_-5px_15px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <User className="w-4 h-4 text-cyan-400" />
              PLAYER 1 CONTROLS
            </button>

            <button
              onClick={() => {
                setActiveTab('p2_controls');
                soundManager.playUiClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t-2 border-x-2 ${
                activeTab === 'p2_controls'
                  ? 'bg-zinc-950 border-amber-500 text-amber-400 shadow-[0_-5px_15px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4 text-rose-400" />
              PLAYER 2 CONTROLS (LOCAL 2P)
            </button>

            <button
              onClick={() => {
                setActiveTab('audio');
                soundManager.playUiClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs uppercase tracking-wider transition-all border-t-2 border-x-2 ${
                activeTab === 'audio'
                  ? 'bg-zinc-950 border-amber-500 text-amber-400 shadow-[0_-5px_15px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              AUDIO & HAPTICS
            </button>
          </div>

          {/* Conflict or Notice Banner */}
          {conflictNotice && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{conflictNotice}</span>
            </div>
          )}

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 space-y-6">
            {/* TAB: PLAYER 1 CONTROLS */}
            {activeTab === 'p1_controls' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <Keyboard className="w-4 h-4" /> PLAYER 1 KEYBOARD BINDINGS
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Default: J (Atk1), K (Atk2), U (EX), I (Super), L (Guard), Space (Dodge)
                    </p>
                  </div>
                  <button
                    onClick={handleResetP1}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    Reset P1 Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ACTION_KEYS.map((action) => {
                    const currentBound = p1Mapping[action.keyField];
                    const isListening =
                      listeningKey?.player === 'p1' && listeningKey?.keyField === action.keyField;

                    return (
                      <div
                        key={action.keyField}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isListening
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse'
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {action.badge}
                            </span>
                            <span className="text-xs font-bold text-zinc-200">
                              {action.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                            {action.description}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setListeningKey({ player: 'p1', keyField: action.keyField });
                            soundManager.playUiClick();
                          }}
                          className={`min-w-[100px] px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                            isListening
                              ? 'bg-cyan-500 text-zinc-950 border-cyan-300 font-black tracking-wider'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-zinc-700 shadow-inner'
                          }`}
                        >
                          {isListening ? 'PRESS KEY...' : formatKeyLabel(currentBound)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: PLAYER 2 CONTROLS */}
            {activeTab === 'p2_controls' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4" /> PLAYER 2 LOCAL KEYBOARD BINDINGS
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Default: NUM1 (Atk1), NUM2 (Atk2), NUM4 (EX), NUM5 (Super), NUM3 (Guard), NUM0 (Dodge)
                    </p>
                  </div>
                  <button
                    onClick={handleResetP2}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    Reset P2 Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ACTION_KEYS.map((action) => {
                    const currentBound = p2Mapping[action.keyField];
                    const isListening =
                      listeningKey?.player === 'p2' && listeningKey?.keyField === action.keyField;

                    return (
                      <div
                        key={action.keyField}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isListening
                            ? 'bg-rose-950/60 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              P2 {action.badge}
                            </span>
                            <span className="text-xs font-bold text-zinc-200">
                              {action.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                            {action.description}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setListeningKey({ player: 'p2', keyField: action.keyField });
                            soundManager.playUiClick();
                          }}
                          className={`min-w-[100px] px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                            isListening
                              ? 'bg-rose-500 text-zinc-950 border-rose-300 font-black tracking-wider'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-rose-300 border-zinc-700 shadow-inner'
                          }`}
                        >
                          {isListening ? 'PRESS KEY...' : formatKeyLabel(currentBound)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: AUDIO & DISPLAY */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4" /> AUDIO & HAPTICS PREFERENCES
                  </h3>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-zinc-200">BACKGROUND MUSIC (BGM)</span>
                      <p className="text-[11px] text-zinc-400">Synthesized anime battle themes & stage background music</p>
                    </div>
                    <button
                      onClick={() => {
                        setBgmMuted(!bgmMuted);
                        soundManager.playUiClick();
                      }}
                      className={`p-2.5 rounded-lg border transition-all ${
                        bgmMuted
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      }`}
                    >
                      {bgmMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-zinc-200">SOUND EFFECTS (SFX)</span>
                      <p className="text-[11px] text-zinc-400">Haki thunder clashes, impacts, and UI feedback audio</p>
                    </div>
                    <button
                      onClick={() => {
                        setSfxMuted(!sfxMuted);
                        soundManager.playUiClick();
                      }}
                      className={`p-2.5 rounded-lg border transition-all ${
                        sfxMuted
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {sfxMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-200">CONTROLLER & DEVICE VIBRATION</span>
                        <p className="text-[11px] text-zinc-400">Tactile haptic rumble intensity for gamepads & mobile combat hits</p>
                      </div>
                      <span className={`text-xs font-black tracking-wider px-2 py-1 rounded-md ${
                        vibrationIntensity === 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : vibrationIntensity <= 35
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : vibrationIntensity <= 75
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {vibrationIntensity === 0 ? 'OFF' : `${vibrationIntensity}%`}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Gamepad2 className={`w-5 h-5 ${vibrationIntensity === 0 ? 'text-zinc-600' : 'text-amber-400'}`} />
                      <input
                        id="vibration-intensity-slider"
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={vibrationIntensity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setVibrationIntensity(val);
                          // Save instantly
                          const updated = { ...profile, vibrationIntensity: val };
                          setProfile(updated);
                          saveUserProfile(updated);
                          
                          // Trigger a tactile feedback preview corresponding to the selected level
                          if (val > 0) {
                            vibrationService.vibrateGamepad('medium', val);
                          }
                          if (onSaved) onSaved();
                        }}
                        className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold px-1">
                      <span>OFF</span>
                      <span>LOW (35%)</span>
                      <span>MEDIUM (70%)</span>
                      <span>HIGH (100%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Controls auto-save instantly to local storage
            </p>

            <button
              onClick={() => {
                soundManager.playUiClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
            >
              DONE & SAVE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
