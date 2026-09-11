import { VictoryPose, DEFAULT_VICTORY_POSES } from '../types/victoryPoses';
import { getFighterVictoryPosesList } from './victoryPoses';

const STORAGE_KEY_WINS = 'grand_line_arcade_total_wins';
const STORAGE_KEY_FIGHTER_WINS = 'grand_line_arcade_fighter_wins';
const STORAGE_KEY_EQUIPPED = 'grand_line_arcade_equipped_poses';
const STORAGE_KEY_UNLOCKED = 'grand_line_arcade_unlocked_poses';

export const victoryPoseStore = {
  getTotalWins(): number {
    if (typeof window === 'undefined') return 0;
    const val = localStorage.getItem(STORAGE_KEY_WINS);
    return val ? parseInt(val, 10) : 0;
  },

  getFighterWins(fighterId: string): number {
    if (typeof window === 'undefined') return 0;
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_FIGHTER_WINS) || '{}');
      return data[fighterId] || 0;
    } catch {
      return 0;
    }
  },

  recordWin(fighterId?: string): number {
    const current = this.getTotalWins() + 1;
    try {
      localStorage.setItem(STORAGE_KEY_WINS, current.toString());
      if (fighterId) {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY_FIGHTER_WINS) || '{}');
        data[fighterId] = (data[fighterId] || 0) + 1;
        localStorage.setItem(STORAGE_KEY_FIGHTER_WINS, JSON.stringify(data));
      }
    } catch {}
    return current;
  },

  getUnlockedPoseIds(): string[] {
    if (typeof window === 'undefined') return ['pose_default'];
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_UNLOCKED) || '[]');
      return Array.from(new Set(['pose_default', ...stored]));
    } catch {
      return ['pose_default'];
    }
  },

  isPoseUnlocked(pose: VictoryPose, fighterId?: string): boolean {
    if (pose.requiredWins === 0) return true;
    
    // Check if directly unlocked via Gallery
    const unlockedList = this.getUnlockedPoseIds();
    if (unlockedList.includes(pose.id)) return true;

    // Check total wins or fighter specific wins
    const totalWins = this.getTotalWins();
    if (totalWins >= pose.requiredWins) return true;

    if (fighterId) {
      const fWins = this.getFighterWins(fighterId);
      if (fWins >= Math.max(1, Math.floor(pose.requiredWins / 2))) return true;
    }

    return false;
  },

  unlockPose(poseId: string): void {
    try {
      const current = this.getUnlockedPoseIds();
      if (!current.includes(poseId)) {
        current.push(poseId);
        localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(current));
      }
    } catch {}
  },

  getEquippedPose(fighterId: string): VictoryPose {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPPED) || '{}');
      const poseId = all[fighterId];
      if (poseId) {
        const poses = this.getPosesForFighter(fighterId);
        const found = poses.find((p) => p.id === poseId);
        if (found && this.isPoseUnlocked(found, fighterId)) {
          return found;
        }
      }
    } catch {}
    
    // Default to fighter's signature pose if available, or universal default
    const poses = this.getPosesForFighter(fighterId);
    return poses[0] || DEFAULT_VICTORY_POSES[0];
  },

  setEquippedPose(fighterId: string, poseId: string): void {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY_EQUIPPED) || '{}');
      all[fighterId] = poseId;
      localStorage.setItem(STORAGE_KEY_EQUIPPED, JSON.stringify(all));
    } catch {}
  },

  getPosesForFighter(fighterId: string): VictoryPose[] {
    return getFighterVictoryPosesList(fighterId);
  },

  getAllPoses(): VictoryPose[] {
    return DEFAULT_VICTORY_POSES;
  },
};
