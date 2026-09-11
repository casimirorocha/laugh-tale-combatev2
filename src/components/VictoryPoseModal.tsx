import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Lock, CheckCircle2, Sparkles, X, Swords, Play } from 'lucide-react';
import { VictoryPose } from '../types/victoryPoses';
import { victoryPoseStore } from '../utils/victoryPoseStore';
import { Fighter } from '../types/fighter';
import { soundManager } from '../utils/soundEffects';

interface VictoryPoseModalProps {
  fighter: Fighter;
  isOpen: boolean;
  onClose: () => void;
}

export const VictoryPoseModal: React.FC<VictoryPoseModalProps> = ({
  fighter,
  isOpen,
  onClose,
}) => {
  const [selectedPoseId, setSelectedPoseId] = useState<string>(
    () => victoryPoseStore.getEquippedPose(fighter.id).id
  );
  const totalWins = victoryPoseStore.getTotalWins();
  const fighterWins = victoryPoseStore.getFighterWins(fighter.id);
  const poses = victoryPoseStore.getPosesForFighter(fighter.id);

  if (!isOpen) return null;

  const handleEquip = (pose: VictoryPose) => {
    if (victoryPoseStore.isPoseUnlocked(pose, fighter.id)) {
      victoryPoseStore.setEquippedPose(fighter.id, pose.id);
      setSelectedPoseId(pose.id);
      soundManager.playEquip();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-2xl w-full rounded-2xl border border-amber-500/40 bg-zinc-950 p-6 shadow-2xl shadow-amber-500/10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold font-['Cinzel'] text-amber-300">
                Victory Poses • {fighter.name}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
              <span>Total Victories: <strong className="text-amber-400">{totalWins}</strong></span>
              <span>•</span>
              <span>Fighter Wins: <strong className="text-amber-400">{fighterWins}</strong></span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pose List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {poses.map((pose) => {
            const isUnlocked = victoryPoseStore.isPoseUnlocked(pose, fighter.id);
            const isEquipped = selectedPoseId === pose.id;

            return (
              <div
                key={pose.id}
                onClick={() => isUnlocked && handleEquip(pose)}
                className={`relative rounded-xl p-4 border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isEquipped
                    ? 'border-amber-500 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : isUnlocked
                    ? 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                    : 'border-zinc-900 bg-zinc-950/40 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{pose.badgeEmoji}</span>
                    <span className="text-sm font-bold font-['Cinzel'] text-white">
                      {pose.name}
                    </span>
                    <span className="text-xs text-amber-400 font-mono">({pose.nameJP})</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        pose.rarity === 'mythic'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700 font-black'
                          : pose.rarity === 'legendary'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : pose.rarity === 'rare'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {pose.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 italic">"{pose.quote}"</p>
                  <p className="text-[11px] text-zinc-500">{pose.description}</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                  {!isUnlocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-500/80 bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-900/50">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock at {pose.requiredWins} Wins</span>
                    </div>
                  ) : isEquipped ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Equipped</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquip(pose);
                      }}
                      className="px-4 py-1.5 text-xs font-bold font-['Cinzel'] rounded-lg bg-zinc-800 text-zinc-200 hover:bg-amber-600 hover:text-white transition-all border border-zinc-700"
                    >
                      Equip Pose
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Explore and preview full animations in the Fighter Codex Victory Gallery tab.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
