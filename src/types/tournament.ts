import { Team, StageInfo } from './fighter';

export type TournamentRound = 'quarter_finals' | 'semi_finals' | 'grand_finals';

export type TournamentMatchStatus = 'scheduled' | 'ready' | 'in_progress' | 'completed';

export interface TournamentMatch {
  id: string;
  round: TournamentRound;
  roundIndex: number; // 0 = Quarter-Finals, 1 = Semi-Finals, 2 = Grand Finals
  matchIndex: number; // 0..3 for QF, 0..1 for SF, 0 for GF
  roundLabel: string;
  team1: Team;
  team2: Team;
  winnerTeamId?: string;
  team1Score: number;
  team2Score: number;
  status: TournamentMatchStatus;
  isUserMatch: boolean;
  stage: StageInfo;
  summaryText?: string;
}

export interface TournamentBracketState {
  id: string;
  title: string;
  userTeam: Team;
  currentRoundIndex: number;
  currentMatchId: string;
  matches: TournamentMatch[];
  isCompleted: boolean;
  championTeam?: Team;
  userWonTournament: boolean;
  userEliminated: boolean;
  totalBountyPool: number;
}
