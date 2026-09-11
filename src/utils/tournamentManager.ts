import { Team, StageInfo } from '../types/fighter';
import { TournamentBracketState, TournamentMatch, TournamentRound } from '../types/tournament';
import { PREMADE_TEAMS } from '../data/premadeTeams';
import { BATTLE_STAGES } from '../data/stages';

const TOURNAMENT_STORAGE_KEY = 'op_kof_tournament_bracket_v1';

// Pre-defined stages for tournament rounds
const QF_STAGE = BATTLE_STAGES[0]; // Marineford
const SF_STAGE = BATTLE_STAGES[2] || BATTLE_STAGES[0]; // Egghead
const GF_STAGE = BATTLE_STAGES[1] || BATTLE_STAGES[3] || BATTLE_STAGES[0]; // Onigashima / Laugh Tale

export function generateTournamentBracket(
  userTeam: Team,
  firstOpponent?: Team,
  randomizeOpponents: boolean = false
): TournamentBracketState {
  // Select 7 rival teams distinct from userTeam
  const availableTeams = PREMADE_TEAMS.filter(
    (t) => t.id !== userTeam.id && t.name !== userTeam.name
  );

  // Shuffle available teams with a fresh random seed
  const shuffled = [...availableTeams].sort(() => Math.random() - 0.5);

  let opponent1: Team;
  if (randomizeOpponents || !firstOpponent || firstOpponent.id === userTeam.id) {
    opponent1 = shuffled.pop() || PREMADE_TEAMS[1];
  } else {
    opponent1 = firstOpponent;
    const idx = shuffled.findIndex((t) => t.id === opponent1!.id);
    if (idx >= 0) shuffled.splice(idx, 1);
  }

  // Shuffle remaining pool again to guarantee distinct pairings across brackets
  const shuffledRemaining = [...shuffled].sort(() => Math.random() - 0.5);
  const remainingOpps: Team[] = [];
  while (remainingOpps.length < 6 && shuffledRemaining.length > 0) {
    remainingOpps.push(shuffledRemaining.pop()!);
  }

  // If still fewer than 6, recycle with modified unique IDs
  let cycleCount = 1;
  while (remainingOpps.length < 6) {
    const fallback = PREMADE_TEAMS[remainingOpps.length % PREMADE_TEAMS.length];
    remainingOpps.push({
      ...fallback,
      id: `${fallback.id}_alt_${cycleCount++}`,
      name: `${fallback.name} II`,
    });
  }

  // Quarter-Finals (4 matches)
  const qfMatches: TournamentMatch[] = [
    {
      id: 'match_qf_1',
      round: 'quarter_finals',
      roundIndex: 0,
      matchIndex: 0,
      roundLabel: 'Quarter-Finals 1',
      team1: userTeam,
      team2: opponent1,
      team1Score: 0,
      team2Score: 0,
      status: 'in_progress',
      isUserMatch: true,
      stage: QF_STAGE,
    },
    {
      id: 'match_qf_2',
      round: 'quarter_finals',
      roundIndex: 0,
      matchIndex: 1,
      roundLabel: 'Quarter-Finals 2',
      team1: remainingOpps[0],
      team2: remainingOpps[1],
      team1Score: 0,
      team2Score: 0,
      status: 'scheduled',
      isUserMatch: false,
      stage: QF_STAGE,
    },
    {
      id: 'match_qf_3',
      round: 'quarter_finals',
      roundIndex: 0,
      matchIndex: 2,
      roundLabel: 'Quarter-Finals 3',
      team1: remainingOpps[2],
      team2: remainingOpps[3],
      team1Score: 0,
      team2Score: 0,
      status: 'scheduled',
      isUserMatch: false,
      stage: QF_STAGE,
    },
    {
      id: 'match_qf_4',
      round: 'quarter_finals',
      roundIndex: 0,
      matchIndex: 3,
      roundLabel: 'Quarter-Finals 4',
      team1: remainingOpps[4],
      team2: remainingOpps[5],
      team1Score: 0,
      team2Score: 0,
      status: 'scheduled',
      isUserMatch: false,
      stage: QF_STAGE,
    },
  ];

  // Placeholder for Semi-Finals (2 matches)
  const sfMatches: TournamentMatch[] = [
    {
      id: 'match_sf_1',
      round: 'semi_finals',
      roundIndex: 1,
      matchIndex: 0,
      roundLabel: 'Semi-Finals 1',
      team1: { id: 'tbd_sf1_1', name: 'Winner QF 1', fighters: [] },
      team2: { id: 'tbd_sf1_2', name: 'Winner QF 2', fighters: [] },
      team1Score: 0,
      team2Score: 0,
      status: 'scheduled',
      isUserMatch: false,
      stage: SF_STAGE,
    },
    {
      id: 'match_sf_2',
      round: 'semi_finals',
      roundIndex: 1,
      matchIndex: 1,
      roundLabel: 'Semi-Finals 2',
      team1: { id: 'tbd_sf2_1', name: 'Winner QF 3', fighters: [] },
      team2: { id: 'tbd_sf2_2', name: 'Winner QF 4', fighters: [] },
      team1Score: 0,
      team2Score: 0,
      status: 'scheduled',
      isUserMatch: false,
      stage: SF_STAGE,
    },
  ];

  // Placeholder for Grand Finals (1 match)
  const gfMatch: TournamentMatch = {
    id: 'match_gf_1',
    round: 'grand_finals',
    roundIndex: 2,
    matchIndex: 0,
    roundLabel: 'Grand Finals',
    team1: { id: 'tbd_gf_1', name: 'Winner SF 1', fighters: [] },
    team2: { id: 'tbd_gf_2', name: 'Winner SF 2', fighters: [] },
    team1Score: 0,
    team2Score: 0,
    status: 'scheduled',
    isUserMatch: false,
    stage: GF_STAGE,
  };

  const bracket: TournamentBracketState = {
    id: `tourney_${Date.now()}`,
    title: 'Grand Pirate King 3v3 Championship',
    userTeam,
    currentRoundIndex: 0,
    currentMatchId: 'match_qf_1',
    matches: [...qfMatches, ...sfMatches, gfMatch],
    isCompleted: false,
    userWonTournament: false,
    userEliminated: false,
    totalBountyPool: 3500000000,
  };

  saveTournamentState(bracket);
  return bracket;
}

export function simulateCpuMatch(match: TournamentMatch): TournamentMatch {
  if (match.status === 'completed' && match.winnerTeamId) return match;

  const t1 = match.team1;
  const t2 = match.team2;
  if (!t1 || !t2) return match;

  // Calculate rough power based on bounties / stats if available
  const getFighterBounty = (f: any): number => {
    if (!f) return 1000000000;
    if (typeof f === 'object' && typeof f.bounty === 'number') return f.bounty;
    return 1000000000;
  };

  const t1Power = t1.fighters?.reduce((acc, f) => acc + getFighterBounty(f), 0) || 3000000000;
  const t2Power = t2.fighters?.reduce((acc, f) => acc + getFighterBounty(f), 0) || 3000000000;

  const roll = Math.random();
  const t1WinProbability = t1Power / (t1Power + t2Power);
  const t1Wins = roll < t1WinProbability;

  const winner = t1Wins ? t1 : t2;
  const loser = t1Wins ? t2 : t1;
  const winnerScore = 3;
  const loserScore = Math.floor(Math.random() * 2) + 1; // 1 or 2 rounds won

  const winnerFighters = winner.fighters || [];
  const mvpFighter = (winnerFighters.length > 0
    ? (winnerFighters[Math.floor(Math.random() * winnerFighters.length)]?.name || winnerFighters[0]?.name)
    : winner.name) || winner.name || 'Champion';

  const summaryQuotes = [
    `${mvpFighter} closed the match with a devastating strike!`,
    `Overwhelming Conqueror Haki secured victory in Round ${winnerScore + loserScore}!`,
    `Fierce 3v3 team synergy broke through the defense!`,
    `A lightning-fast comeback sealed the bracket advancement!`,
  ];
  const summaryText = summaryQuotes[Math.floor(Math.random() * summaryQuotes.length)];

  return {
    ...match,
    winnerTeamId: winner.id,
    team1Score: t1Wins ? winnerScore : loserScore,
    team2Score: t1Wins ? loserScore : winnerScore,
    status: 'completed',
    summaryText: `${winner.name} won (${t1Wins ? winnerScore : loserScore}-${t1Wins ? loserScore : winnerScore}): ${summaryText}`,
  };
}

export function advanceTournamentWithResult(
  bracket: TournamentBracketState,
  userWon: boolean,
  userScore: number = 3,
  opponentScore: number = 1
): TournamentBracketState {
  const updatedMatches = [...bracket.matches];
  const currentMatchIdx = updatedMatches.findIndex((m) => m.id === bracket.currentMatchId);
  if (currentMatchIdx < 0) return bracket;

  const currentMatch = updatedMatches[currentMatchIdx];
  const userTeam = bracket.userTeam;
  const opponentTeam = currentMatch.team1.id === userTeam.id ? currentMatch.team2 : currentMatch.team1;

  // Complete user match
  const winnerTeam = userWon ? userTeam : opponentTeam;
  updatedMatches[currentMatchIdx] = {
    ...currentMatch,
    winnerTeamId: winnerTeam.id,
    team1Score: currentMatch.team1.id === userTeam.id ? userScore : opponentScore,
    team2Score: currentMatch.team1.id === userTeam.id ? opponentScore : userScore,
    status: 'completed',
    summaryText: userWon
      ? `${userTeam.name} achieved victory (${userScore}-${opponentScore}) to advance!`
      : `${opponentTeam.name} defeated ${userTeam.name} (${opponentScore}-${userScore}).`,
  };

  if (!userWon) {
    // User was knocked out
    const updatedState: TournamentBracketState = {
      ...bracket,
      matches: updatedMatches,
      userEliminated: true,
      isCompleted: false,
    };
    saveTournamentState(updatedState);
    return updatedState;
  }

  // User won! Now auto-simulate remaining matches of current round
  const currentRound = currentMatch.round;

  for (let i = 0; i < updatedMatches.length; i++) {
    if (updatedMatches[i].round === currentRound && updatedMatches[i].status !== 'completed') {
      updatedMatches[i] = simulateCpuMatch(updatedMatches[i]);
    }
  }

  // Populate next round
  if (currentRound === 'quarter_finals') {
    // SF1: QF1 winner (user) vs QF2 winner
    const qf2Winner = getWinnerTeam(updatedMatches.find((m) => m.id === 'match_qf_2'));
    const sf1Idx = updatedMatches.findIndex((m) => m.id === 'match_sf_1');
    if (sf1Idx >= 0) {
      updatedMatches[sf1Idx] = {
        ...updatedMatches[sf1Idx],
        team1: userTeam,
        team2: qf2Winner || { id: 'cpu_sf1_opp', name: 'Rival Emperor Fleet', fighters: [] },
        status: 'ready',
        isUserMatch: true,
      };
    }

    // SF2: QF3 winner vs QF4 winner
    const qf3Winner = getWinnerTeam(updatedMatches.find((m) => m.id === 'match_qf_3'));
    const qf4Winner = getWinnerTeam(updatedMatches.find((m) => m.id === 'match_qf_4'));
    const sf2Idx = updatedMatches.findIndex((m) => m.id === 'match_sf_2');
    if (sf2Idx >= 0) {
      updatedMatches[sf2Idx] = {
        ...updatedMatches[sf2Idx],
        team1: qf3Winner || { id: 'cpu_sf2_1', name: 'Supreme Sea Warlords', fighters: [] },
        team2: qf4Winner || { id: 'cpu_sf2_2', name: 'Marine Admirals Vanguard', fighters: [] },
        status: 'scheduled',
        isUserMatch: false,
      };
    }

    const updatedState: TournamentBracketState = {
      ...bracket,
      currentRoundIndex: 1,
      currentMatchId: 'match_sf_1',
      matches: updatedMatches,
    };
    saveTournamentState(updatedState);
    return updatedState;
  }

  if (currentRound === 'semi_finals') {
    // Auto-simulate SF2 if not completed
    const sf2Idx = updatedMatches.findIndex((m) => m.id === 'match_sf_2');
    if (sf2Idx >= 0 && updatedMatches[sf2Idx].status !== 'completed') {
      updatedMatches[sf2Idx] = simulateCpuMatch(updatedMatches[sf2Idx]);
    }

    const sf2Winner = getWinnerTeam(updatedMatches.find((m) => m.id === 'match_sf_2'));
    const gfIdx = updatedMatches.findIndex((m) => m.id === 'match_gf_1');
    if (gfIdx >= 0) {
      updatedMatches[gfIdx] = {
        ...updatedMatches[gfIdx],
        team1: userTeam,
        team2: sf2Winner || { id: 'cpu_gf_opp', name: 'Old Era Pirate Legends', fighters: [] },
        status: 'ready',
        isUserMatch: true,
      };
    }

    const updatedState: TournamentBracketState = {
      ...bracket,
      currentRoundIndex: 2,
      currentMatchId: 'match_gf_1',
      matches: updatedMatches,
    };
    saveTournamentState(updatedState);
    return updatedState;
  }

  if (currentRound === 'grand_finals') {
    // User won Grand Finals!
    const updatedState: TournamentBracketState = {
      ...bracket,
      matches: updatedMatches,
      isCompleted: true,
      championTeam: userTeam,
      userWonTournament: true,
      userEliminated: false,
    };
    saveTournamentState(updatedState);
    return updatedState;
  }

  return bracket;
}

function getWinnerTeam(match?: TournamentMatch): Team | null {
  if (!match || !match.winnerTeamId) return null;
  if (match.team1.id === match.winnerTeamId) return match.team1;
  if (match.team2.id === match.winnerTeamId) return match.team2;
  return null;
}

export function saveTournamentState(bracket: TournamentBracketState): void {
  try {
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(bracket));
  } catch (e) {
    console.error('Failed to save tournament bracket', e);
  }
}

export function loadTournamentState(): TournamentBracketState | null {
  try {
    const raw = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearTournamentState(): void {
  try {
    localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
  } catch (e) {}
}

export function resetAndReseedTournament(userTeam: Team): TournamentBracketState {
  clearTournamentState();
  return generateTournamentBracket(userTeam, undefined, true);
}
