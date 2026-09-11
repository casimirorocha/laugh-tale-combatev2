import React from 'react';
import { UserProfile } from '../types/fighter';
import { saveUserProfile } from '../utils/storage';
import { Sliders } from 'lucide-react';

interface GamepadPresetSelectorProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export const GamepadPresetSelector: React.FC<GamepadPresetSelectorProps> = ({ profile, onChange }) => {
  const presets = Object.keys(profile.gamepadPresets);

  const handleSwitch = (presetName: string) => {
    const updatedProfile = {
      ...profile,
      activeGamepadPreset: presetName,
      gamepadMapping: profile.gamepadPresets[presetName],
    };
    saveUserProfile(updatedProfile);
    onChange(updatedProfile);
  };

  return (
    <div
      className="flex items-center gap-1 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-md px-2 py-1 text-xs transition"
      title={`Active Controls Preset: ${profile.activeGamepadPreset}`}
    >
      <Sliders className="h-3 w-3 text-amber-400/80 shrink-0" />
      <span className="hidden xl:inline text-[9px] font-bold text-zinc-400 uppercase tracking-wider">PRESET:</span>
      <select
        value={profile.activeGamepadPreset}
        onChange={(e) => handleSwitch(e.target.value)}
        className="bg-transparent text-amber-300 font-bold text-[11px] outline-none cursor-pointer pr-0.5"
      >
        {presets.map((preset) => (
          <option key={preset} value={preset} className="bg-zinc-950 text-zinc-200">
            {preset}
          </option>
        ))}
      </select>
    </div>
  );
};
