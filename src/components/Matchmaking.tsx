import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Swords, ArrowLeft, Search, RefreshCw, UserCheck } from 'lucide-react';
import { Fighter, Team, StageInfo, MatchFormat } from '../types/fighter';
import { CHARACTERS } from '../data/characters';
import { BATTLE_STAGES } from '../data/stages';
import { calculateTeamTCP, calculateFighterTCP } from '../utils/combatEngine';
import { getUserProfile } from '../utils/storage';
import { FighterAvatar } from './FighterAvatar';

interface MatchmakingProps {
  onStartBattle: (team1: Team, team2: Team, stage: StageInfo, format: MatchFormat) => void;
  onBack: () => void;
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ onStartBattle, onBack }) => {
  const profile = getUserProfile();
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [matchedOpponent, setMatchedOpponent] = useState<{
    team: Team;
    playerName: string;
    bounty: number;
    tier: string;
  } | null>(null);

  const playerTeam: Team = profile.savedTeams[0] || {
    id: 'user_team',
    name: profile.crewName,
    crestEmoji: profile.flagIcon,
    bannerColor: '#ef4444',
    fighters: [CHARACTERS[0], CHARACTERS[1], CHARACTERS[2]],
  };

  const playerTCP = calculateTeamTCP(playerTeam.fighters);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  // Simulate finding an opponent within 3-4 seconds with similar power level
  useEffect(() => {
    const findTimeout = setTimeout(() => {
      // Pick 3 random fighters from roster to build a rival team
      const shuffled = [...CHARACTERS].sort(() => 0.5 - Math.random());
      const rivalFighters = shuffled.slice(0, 3);
      
      const botNames = [
        'Admiral Fujitora (Sim)',
        'Sabo of Revolutionary Army',
        'Charlotte Katakuri (Clone)',
        'Marco the Phoenix',
        'Eustass Captain Kid',
        'Benn Beckman',
        'Silvers Rayleigh (Sim)',
      ];
      const randomName = botNames[Math.floor(Math.random() * botNames?.length)];

      setMatchedOpponent({
        team: {
          id: 'matched_cpu_rival',
          name: `${randomName}'s Vanguard`,
          crestEmoji: '⚔️',
          bannerColor: '#8b5cf6',
          fighters: rivalFighters,
        },
        playerName: randomName,
        bounty: Math.round(profile.bounty * (0.85 + Math.random() * 0.3)),
        tier: profile.tierRank,
      });
      setIsSearching(false);
    }, 3200);

    return () => clearTimeout(findTimeout);
  }, []);

  const handleLaunchMatchedFight = () => {
    if (!matchedOpponent) return;
    const stage = BATTLE_STAGES[Math.floor(Math.random() * BATTLE_STAGES?.length)];
    onStartBattle(playerTeam, matchedOpponent.team, stage, '3v3_kof');
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-y-auto font-sans p-4 sm:p-8">
      <div className="max-w-3xl mx-auto w-full my-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO MENU</span>
          </button>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="font-['Bebas_Neue'] text-sm tracking-wider text-amber-400">
              GRAND LINE RANKED MATCHMAKING SYSTEM
            </span>
          </div>
        </div>

        {/* Player Status Card */}
        <div className="rounded-2xl border border-amber-500/40 bg-zinc-900/80 p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{profile.flagIcon}</span>
              <div>
                <h2 className="font-['Cinzel'] text-lg font-bold text-white">{profile.crewName}</h2>
                <p className="font-mono text-xs text-zinc-400">Captain {profile.username}</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs text-zinc-400">COMBAT POWER:</span>
              <p className="text-amber-300 font-bold text-sm">{playerTCP.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* SEARCHING VS MATCH FOUND STATUS */}
        {isSearching ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-10 text-center shadow-inner">
            <div className="relative mb-4">
              <div className="h-20 w-20 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <Search className="absolute inset-0 m-auto h-8 w-8 text-amber-400" />
            </div>
            <h3 className="font-['Cinzel'] text-xl font-bold text-white">
              Searching for Worthy Grand Line Challengers...
            </h3>
            <p className="font-mono text-xs text-zinc-400 mt-1">
              Matching based on Total Combat Power ({playerTCP.toLocaleString()}) & Tier [{profile.tierRank}]
            </p>
            <span className="mt-3 rounded bg-zinc-800 px-3 py-1 font-mono text-xs text-amber-400">
              SEARCH TIME: {searchTime}s
            </span>
          </div>
        ) : (
          matchedOpponent && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col rounded-2xl border border-purple-500/50 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-purple-400 font-['Bebas_Neue'] text-lg">
                  <UserCheck className="h-5 w-5" />
                  <span>OPPONENT MATCH FOUND!</span>
                </div>
                <span className="rounded bg-purple-950 px-2 py-0.5 font-mono text-xs text-purple-300">
                  {matchedOpponent.tier} Division
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <h3 className="font-['Cinzel'] text-xl font-bold text-white">
                    {matchedOpponent.playerName}
                  </h3>
                  <p className="font-mono text-xs text-zinc-400">{matchedOpponent.team.name}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-zinc-400">OPPONENT POWER:</span>
                  <p className="text-purple-300 font-bold text-sm">
                    {calculateTeamTCP(matchedOpponent.team.fighters).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Roster lineup preview */}
              <div className="flex items-center gap-3 mt-4">
                {matchedOpponent.team.fighters?.map((f, idx) => (
                  <div
                    key={`rival_${f.id}_${idx}`}
                    className="flex-1 flex flex-col items-center rounded-xl bg-zinc-950/80 border border-zinc-800 p-2 text-center"
                  >
                    <div className="mb-1">
                      <FighterAvatar
                        avatarUrl={f.avatarUrl}
                        avatarIcon={f.avatarIcon}
                        name={f.name}
                        size="sm"
                        borderColor={f.themeColor}
                      />
                    </div>
                    <span className="font-['Bebas_Neue'] text-xs text-zinc-200 truncate w-full">
                      {f.shortName || f.name}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">฿ {Math.round(f.bounty / 1_000_000)}M</span>
                  </div>
                ))}
              </div>

              {/* Accept Match button */}
              <button
                onClick={handleLaunchMatchedFight}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3.5 text-sm font-black text-black tracking-wider shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition"
              >
                <Swords className="h-4 w-4" />
                <span>ACCEPT MATCH & COMMENCE DUEL</span>
              </button>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
};
