import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Shield, Trophy, Swords, Zap, Edit3, Check, Save, Gamepad, Keyboard, RefreshCw } from 'lucide-react';
import { UserProfile, GamepadMapping, KeyboardMapping } from '../types/fighter';
import { getUserProfile, saveUserProfile, DEFAULT_GAMEPAD_MAPPING, DEFAULT_KEYBOARD_MAPPING, formatKeyLabel } from '../utils/storage';

interface UserProfileProps {
  onBack: () => void;
  onSelectFighterToEdit?: (fighterId: string) => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfile());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(profile.username);
  const [crewName, setCrewName] = useState<string>(profile.crewName);
  const [title, setTitle] = useState<string>(profile.title);
  const [flagIcon, setFlagIcon] = useState<string>(profile.flagIcon);

  // Gamepad Connection & Live Polling State
  const [activeControlTab, setActiveControlTab] = useState<'keyboard' | 'gamepad'>('keyboard');
  const [connectedGamepad, setConnectedGamepad] = useState<Gamepad | null>(null);
  const [activePressedButtons, setActivePressedButtons] = useState<number[]>([]);
  const [bindingAction, setBindingAction] = useState<keyof GamepadMapping | null>(null);
  const [bindingKeyAction, setBindingKeyAction] = useState<keyof KeyboardMapping | null>(null);

  const FLAGS = ['☠️', '👒', '⚔️', '👑', '🔥', '⚡', '🐉', '🤡', '⚓', '🌊'];

  const KEYBOARD_ACTIONS_TO_MAP: { key: keyof KeyboardMapping; label: string; desc: string }[] = [
    { key: 'move1Key', label: 'Light Attack (Move 1)', desc: 'Primary physical strike or basic skill' },
    { key: 'move2Key', label: 'Medium Attack (Move 2)', desc: 'Secondary physical strike or skill' },
    { key: 'exMoveKey', label: 'EX / Special Move', desc: 'Enhanced special attack requiring 100% meter or MAX Mode' },
    { key: 'superMoveKey', label: 'Super Special Move', desc: 'Devastating super attack (Cost: 150-200 Super Meter)' },
    { key: 'guardKey', label: 'Guard / Block (ガード)', desc: 'Brace for enemy attacks & reduce focus damage' },
    { key: 'dodgeKey', label: 'Future Sight Dodge', desc: 'Pre-dodge incoming strikes using Kenbunshoku Haki' },
    { key: 'tauntKey', label: 'Taunt (挑発)', desc: 'Triggers character voice line & reduces opponent focus' },
    { key: 'finisherKey', label: 'Combo Finisher', desc: 'Perform high-tier devastation finisher' },
    { key: 'maxModeKey', label: 'MAX Mode Toggle', desc: 'Activate state for unlimited EX power' },
    { key: 'pauseKey', label: 'Pause / Battle Menu', desc: 'Toggle in-match pause menu' },
  ];

  // Keyboard rebind keydown listener
  useEffect(() => {
    if (!bindingKeyAction) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newKey = e.code || e.key;
      const currentMapping = profile.keyboardMapping || DEFAULT_KEYBOARD_MAPPING;
      const updatedMapping: KeyboardMapping = {
        ...currentMapping,
        [bindingKeyAction]: newKey,
      };

      const updatedProfile: UserProfile = {
        ...profile,
        keyboardMapping: updatedMapping,
      };

      saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setBindingKeyAction(null);
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [bindingKeyAction, profile]);

  const handleResetKeyboardMapping = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      keyboardMapping: DEFAULT_KEYBOARD_MAPPING,
    };
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    setBindingKeyAction(null);
  };

  // Gamepad Detection and Real-Time Calibration Loop
  useEffect(() => {
    let animFrameId: number;
    let prevGpId: string | null = null;
    let prevPressedStr = '';

    const pollGamepad = () => {
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
      const gps = navigator.getGamepads();
      const activeGp = Array.from(gps).find((g) => g !== null);

      if (activeGp) {
        const currentGpId = activeGp.id || 'gamepad-0';
        if (prevGpId !== currentGpId) {
          prevGpId = currentGpId;
          setConnectedGamepad(activeGp);
        }

        // Find which buttons are currently pressed
        const pressed: number[] = [];
        activeGp.buttons.forEach((btn, index) => {
          if (btn.pressed) {
            pressed.push(index);
          }
        });
        const currentPressedStr = pressed.join(',');
        if (prevPressedStr !== currentPressedStr) {
          prevPressedStr = currentPressedStr;
          setActivePressedButtons(pressed);
        }

        // If we are actively binding a button and detect a press
        if (bindingAction && pressed.length > 0) {
          const pressedIndex = pressed[0];

          const currentMapping = profile.gamepadMapping || DEFAULT_GAMEPAD_MAPPING;
          const updatedMapping: GamepadMapping = {
            ...currentMapping,
            [bindingAction]: pressedIndex,
          };

          const updatedProfile: UserProfile = {
            ...profile,
            gamepadMapping: updatedMapping,
          };

          saveUserProfile(updatedProfile);
          setProfile(updatedProfile);
          setBindingAction(null);
        }
      } else {
        if (prevGpId !== null) {
          prevGpId = null;
          prevPressedStr = '';
          setConnectedGamepad(null);
          setActivePressedButtons([]);
        }
      }

      animFrameId = requestAnimationFrame(pollGamepad);
    };

    animFrameId = requestAnimationFrame(pollGamepad);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [bindingAction, profile]);

  const ACTIONS_TO_MAP: { key: keyof GamepadMapping; label: string; desc: string }[] = [
    { key: 'guardButton', label: 'Guard (ガード)', desc: 'Brace for enemy attacks & reduce focus damage' },
    { key: 'dodgeButton', label: 'Future Sight Dodge', desc: 'Pre-dodge upcoming strikes' },
    { key: 'tauntButton', label: 'Taunt (挑発)', desc: 'Triggers character voice line & reduces opponent focus' },
    { key: 'exMoveButton', label: 'EX / Special Move', desc: 'Perform enhanced physical specials' },
    { key: 'superMoveButton', label: 'Super Move', desc: 'Unleash standard special skills' },
    { key: 'finisherButton', label: 'Combo Finisher', desc: 'Perform high-tier devastation finisher' },
    { key: 'maxModeButton', label: 'MAX Mode Toggle', desc: 'Activate state for unlimited EX power' },
    { key: 'menuConfirmButton', label: 'Menu Confirm', desc: 'Navigate menu screens & select items' },
    { key: 'menuBackButton', label: 'Menu Cancel/Back', desc: 'Close menus & go back' },
  ];

  const getButtonLabel = (btnIndex: number) => {
    const map: Record<number, string> = {
      0: 'A / Cross (Button 0)',
      1: 'B / Circle (Button 1)',
      2: 'X / Square (Button 2)',
      3: 'Y / Triangle (Button 3)',
      4: 'LB / L1 (Button 4)',
      5: 'RB / R1 (Button 5)',
      6: 'LT / L2 (Button 6)',
      7: 'RT / R2 (Button 7)',
      8: 'Select / Back (Button 8)',
      9: 'Start / Options (Button 9)',
      10: 'L3 Click (Button 10)',
      11: 'R3 Click (Button 11)',
      12: 'D-Pad Up (Button 12)',
      13: 'D-Pad Down (Button 13)',
      14: 'D-Pad Left (Button 14)',
      15: 'D-Pad Right (Button 15)',
    };
    return map[btnIndex] || `Button ${btnIndex}`;
  };

  const handleResetMapping = () => {
    const updated: UserProfile = {
      ...profile,
      gamepadMapping: DEFAULT_GAMEPAD_MAPPING,
    };
    saveUserProfile(updated);
    setProfile(updated);
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      username,
      crewName,
      title,
      flagIcon,
    };
    saveUserProfile(updated);
    setProfile(updated);
    setIsEditing(false);
  };

  const winRate =
    profile.stats.matchesPlayed > 0
      ? ((profile.stats.matchesWon / profile.stats.matchesPlayed) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-y-auto font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto w-full my-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ROSTER</span>
          </button>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-400" />
            <span className="font-['Bebas_Neue'] text-lg tracking-wider text-amber-400">
              CAPTAIN PROFILE & MATCH DOSSIER
            </span>
          </div>
        </div>

        {/* PROFILE PASSPORT CARD */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-950 p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-amber-400/60 bg-zinc-950 text-4xl shadow-inner">
                {flagIcon}
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Captain Name"
                      className="rounded bg-zinc-950 border border-zinc-700 px-2 py-0.5 text-sm font-bold text-white"
                    />
                    <input
                      type="text"
                      value={crewName}
                      onChange={(e) => setCrewName(e.target.value)}
                      placeholder="Crew Name"
                      className="rounded bg-zinc-950 border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300 block"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white">
                      {profile.username}
                    </h2>
                    <p className="font-mono text-xs text-zinc-400">{profile.crewName}</p>
                    <p className="font-mono text-xs text-amber-400 mt-0.5">{profile.title}</p>
                  </>
                )}
              </div>
            </div>

            {/* Bounty & Tier */}
            <div className="text-left sm:text-right">
              <span className="font-['Bebas_Neue'] text-xs tracking-wider text-zinc-400">
                OFFICIAL WORLD GOVERNMENT BOUNTY
              </span>
              <p className="font-['Press_Start_2P'] text-lg sm:text-xl text-amber-400">
                ฿ {profile.bounty.toLocaleString()}
              </p>
              <span className="inline-block mt-1 rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                {profile.tierRank} RANK
              </span>
            </div>
          </div>

          {/* Edit Flag Selection */}
          {isEditing && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Flag Crest:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {FLAGS?.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlagIcon(f)}
                    className={`h-8 w-8 rounded-lg border text-lg flex items-center justify-center ${
                      flagIcon === f ? 'border-amber-400 bg-amber-950/60' : 'border-zinc-800 bg-zinc-950'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save / Edit Profile Button */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-end">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>SAVE PROFILE</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>EDIT DOSSIER</span>
              </button>
            )}
          </div>
        </div>

        {/* COMBAT STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center">
            <span className="font-mono text-[10px] text-zinc-400">WIN RATE</span>
            <p className="font-['Press_Start_2P'] text-base text-emerald-400 mt-1">{winRate}%</p>
            <span className="text-[10px] text-zinc-500 font-mono">
              {profile.stats.matchesWon}W / {profile.stats.matchesLost}L
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center">
            <span className="font-mono text-[10px] text-zinc-400">TOTAL K.O.s</span>
            <p className="font-['Press_Start_2P'] text-base text-amber-400 mt-1">
              {profile.stats.totalKOs}
            </p>
            <span className="text-[10px] text-zinc-500 font-mono">Fighters Defeated</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center">
            <span className="font-mono text-[10px] text-zinc-400">MAX COMBO</span>
            <p className="font-['Press_Start_2P'] text-base text-purple-400 mt-1">
              {profile.stats.highestDamageCombo}
            </p>
            <span className="text-[10px] text-zinc-500 font-mono">Hits Connected</span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center">
            <span className="font-mono text-[10px] text-zinc-400">HAKI CLASHES</span>
            <p className="font-['Press_Start_2P'] text-base text-red-400 mt-1">
              {profile.stats.hakiClashesWon}
            </p>
            <span className="text-[10px] text-zinc-500 font-mono">Conqueror Wins</span>
          </div>
        </div>

        {/* CONTROLS & BINDINGS CONFIGURATION PANEL */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 flex flex-col gap-4 shadow-xl">
          {/* Header & Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-3">
            <div>
              <h3 className="font-['Bebas_Neue'] text-xl tracking-wider text-amber-400 flex items-center gap-2">
                {activeControlTab === 'keyboard' ? <Keyboard className="h-5 w-5 text-amber-400" /> : <Gamepad className="h-5 w-5 text-amber-500 animate-pulse" />}
                BATTLE CONTROL CONFIGURATION
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {activeControlTab === 'keyboard' ? 'Configure hotkeys for instant combat moves & actions in battle' : 'Map your arcade stick or physical gamepad buttons'}
              </p>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  setActiveControlTab('keyboard');
                  setBindingAction(null);
                  setBindingKeyAction(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  activeControlTab === 'keyboard'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span>KEYBOARD</span>
              </button>
              <button
                onClick={() => {
                  setActiveControlTab('gamepad');
                  setBindingAction(null);
                  setBindingKeyAction(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  activeControlTab === 'gamepad'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Gamepad className="h-3.5 w-3.5" />
                <span>GAMEPAD</span>
              </button>
            </div>
          </div>

          {/* KEYBOARD CONTROLS CONFIGURATION PANEL */}
          {activeControlTab === 'keyboard' && (
            <div className="flex flex-col gap-4">
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs font-mono text-amber-300">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 flex-shrink-0 text-amber-400" />
                  <span>Click <strong className="text-white">REBIND</strong> next to any command, then press the desired key on your keyboard to save.</span>
                </div>
                {bindingKeyAction && (
                  <span className="animate-pulse font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/50">
                    LISTENING FOR KEYPRESS...
                  </span>
                )}
              </div>

              {/* Keyboard Mapping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KEYBOARD_ACTIONS_TO_MAP.map((action) => {
                  const mapping = profile.keyboardMapping || DEFAULT_KEYBOARD_MAPPING;
                  const currentBoundKey = mapping[action.key] || '';
                  const isRebindingThisKey = bindingKeyAction === action.key;

                  return (
                    <div
                      key={action.key}
                      className={`rounded-xl p-3 border transition flex items-center justify-between gap-3 ${
                        isRebindingThisKey
                          ? 'bg-red-950/40 border-red-500/60 animate-pulse'
                          : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-zinc-200 block truncate">{action.label}</span>
                        <span className="text-[10px] text-zinc-400 block truncate font-mono">{action.desc}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Assigned Key Badge Display */}
                        <div className="font-mono text-xs font-black bg-zinc-900 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-lg min-w-[70px] text-center shadow-inner">
                          {isRebindingThisKey ? (
                            <span className="text-red-400 font-bold animate-pulse text-[10px]">PRESS KEY</span>
                          ) : (
                            <span>[{formatKeyLabel(currentBoundKey)}]</span>
                          )}
                        </div>

                        {/* Rebind Key Button */}
                        <button
                          onClick={() => {
                            setBindingAction(null);
                            setBindingKeyAction(action.key);
                          }}
                          disabled={isRebindingThisKey}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition ${
                            isRebindingThisKey
                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-amber-500 text-black hover:bg-amber-400'
                          }`}
                        >
                          REBIND
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Toolbar */}
              <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-1">
                <p className="text-[10px] text-zinc-400 font-mono italic">
                  Keyboard shortcuts are active in manual battle mode and menu screens.
                </p>
                <button
                  onClick={handleResetKeyboardMapping}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[10px] font-bold font-mono text-zinc-300 hover:bg-zinc-800 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" /> RESET KEYBOARD DEFAULTS
                </button>
              </div>
            </div>
          )}

          {/* GAMEPAD CONTROLS CONFIGURATION PANEL */}
          {activeControlTab === 'gamepad' && (
            <div className="flex flex-col gap-4">
              {/* Connection Status Badge */}
              <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-xs font-mono text-zinc-300 font-bold">CONTROLLER STATUS:</span>
                <div className="flex items-center gap-1.5">
                  <div className={`h-2.5 w-2.5 rounded-full ${connectedGamepad ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="font-mono text-xs font-semibold">
                    {connectedGamepad ? (
                      <span className="text-emerald-400">CONNECTED: {connectedGamepad.id.slice(0, 22)}...</span>
                    ) : (
                      <span className="text-amber-500">SEARCHING... PRESS ANY BUTTON ON YOUR GAMEPAD</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Interactive Button Live Monitor (Visible if gamepad connected) */}
              {connectedGamepad && (
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] font-mono text-zinc-400 block mb-2">LIVE GAMEPAD INPUT MONITOR (PRESS BUTTONS TO TEST LATENCY):</span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 16 }).map((_, i) => {
                      const isPressed = activePressedButtons.includes(i);
                      return (
                        <div
                          key={i}
                          className={`h-7 px-2.5 rounded-lg font-mono text-[10px] font-bold flex items-center justify-center transition border ${
                            isPressed
                              ? 'bg-amber-500 text-black border-amber-400 scale-95 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-zinc-900 text-zinc-500 border-zinc-800/60'
                          }`}
                        >
                          B{i}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mapping Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ACTIONS_TO_MAP.map((action) => {
                  const mapping = profile.gamepadMapping || DEFAULT_GAMEPAD_MAPPING;
                  const mappedButtonIndex = mapping[action.key];
                  const isRebindingThis = bindingAction === action.key;

                  return (
                    <div
                      key={action.key}
                      className={`rounded-xl p-3 border transition flex items-center justify-between gap-4 ${
                        isRebindingThis
                          ? 'bg-red-950/40 border-red-500/60 animate-pulse'
                          : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-xs text-zinc-200 block truncate">{action.label}</span>
                        <span className="text-[10px] text-zinc-400 block truncate font-mono">{action.desc}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Assigned Button Display */}
                        <div className="font-mono text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg">
                          {isRebindingThis ? (
                            <span className="text-red-400 font-bold animate-pulse">PRESS BUTTON...</span>
                          ) : (
                            <span>{getButtonLabel(mappedButtonIndex)}</span>
                          )}
                        </div>

                        {/* Rebind Button */}
                        <button
                          onClick={() => {
                            setBindingKeyAction(null);
                            setBindingAction(action.key);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition ${
                            isRebindingThis
                              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                              : 'bg-amber-500 text-black hover:bg-amber-400'
                          }`}
                          disabled={isRebindingThis}
                        >
                          REBIND
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calibration Control Toolbar */}
              <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-1">
                <p className="text-[10px] text-zinc-400 font-mono italic">
                  Mappings are saved to your profile and active in matches.
                </p>
                <button
                  onClick={handleResetMapping}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[10px] font-bold font-mono text-zinc-300 hover:bg-zinc-800 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" /> RESET GAMEPAD LAYOUT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MATCH HISTORY LOG */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
          <span className="font-['Bebas_Neue'] text-sm tracking-wider text-amber-400 block mb-3">
            RECENT DUEL HISTORIES ({profile.matchHistory?.length})
          </span>

          {profile.matchHistory?.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono text-center py-4">
              No battle records logged yet. Enter the Arena to build your Grand Line legacy!
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {profile.matchHistory?.map((m, idx) => (
                <div
                  key={`${m.id || 'match'}-${idx}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 font-bold ${
                        m.team1.isWinner
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {m.team1.isWinner ? 'WIN' : 'LOSS'}
                    </span>
                    <span className="text-zinc-200">vs {m.team2.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 hidden sm:inline">{m.totalRounds} Rounds</span>
                    <span className="text-amber-400 font-bold">MVP: {m.mvpFighter}</span>
                    <span className="text-emerald-400">+฿ {m.bountyEarned.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
