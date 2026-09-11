import { MoveType } from './fighter';

export type ChallengeDifficulty = 'bronze' | 'silver' | 'gold' | 'yonko';
export type ChallengeTheme = 'devil_fruit' | 'haki' | 'hybrid' | 'awakening';

export interface ComboChallengeStep {
  id: string;
  name: string;
  nameJP?: string;
  category: 'devil_fruit' | 'haki' | 'move' | 'awakening';
  moveId?: string;
  moveType?: MoveType;
  hakiType?: 'armament' | 'observation' | 'conqueror';
  element?: string;
  instruction: string;
  icon: string;
  badgeColor: string;
}

export interface ComboChallenge {
  id: string;
  title: string;
  titleJP?: string;
  difficulty: ChallengeDifficulty;
  theme: ChallengeTheme;
  description: string;
  targetSteps: ComboChallengeStep[];
  timeLimitSec: number;
  rewardPoints: number;
}

export interface ChallengeStats {
  score: number;
  streak: number;
  highestStreak: number;
  completedCount: number;
  totalAttempts: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Warlord' | 'Yonko' | 'Pirate King';
}
