import React, { useState } from 'react';
import { ArrowLeft, Trophy, Search, Shield, Zap, Flame, Crown, Activity, Swords, Users } from 'lucide-react';
import { getLeaderboards, getGlobalStats } from '../utils/storage';
import { LeaderboardEntry } from '../types/fighter';

interface LeaderboardsProps {
  onBack: () => void;
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({ onBack }) => {
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const leaderboards = getLeaderboards();
  const globalStats = getGlobalStats();

  const topFighters = Object.entries(globalStats.fighterPickCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const filtered = leaderboards.filter((entry) => {
    const matchesSearch =
      entry.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.crewName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'ALL' || entry.tier.toUpperCase() === filterTier;
    return matchesSearch && matchesTier;
  });

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
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="font-['Bebas_Neue'] text-lg tracking-wider text-amber-400">
              GLOBAL GRAND LINE LEADERBOARDS
            </span>
          </div>
        </div>

        {/* GLOBAL BATTLE STATS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Swords className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Total Battles</span>
            </div>
            <div className="text-3xl font-['Bebas_Neue'] text-white tracking-wide">
              {globalStats.totalFights.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono italic">Across all Grand Line sessions</div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Activity className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-black uppercase tracking-wider">Total Damage Dealt</span>
            </div>
            <div className="text-3xl font-['Bebas_Neue'] text-red-500 tracking-wide">
              {globalStats.totalDamage.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-600 font-mono italic">Collective Haki & Fruit output</div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-1 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-zinc-500 mb-1">
              <Users className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-wider">Most Popular Fighters</span>
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              {topFighters.map(([name, count], i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-[9px] w-3">{i + 1}.</span>
                    <span className="text-xs font-bold text-zinc-200 truncate max-w-[120px]">{name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-500/70">{count}P</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 p-1">
            {['ALL', 'PIRATE KING', 'YONKO', 'ADMIRAL', 'SUPERNOVA'].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterTier === tier
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search Captain or Crew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 gap-2 border-b border-zinc-800 bg-zinc-950/80 p-3 text-[11px] font-mono text-zinc-400 uppercase">
            <div className="col-span-1 text-center">RANK</div>
            <div className="col-span-5">PIRATE CAPTAIN / CREW</div>
            <div className="col-span-3 text-right">TOTAL BOUNTY</div>
            <div className="col-span-3 text-right">WIN RATE / MATCHES</div>
          </div>

          <div className="divide-y divide-zinc-800/60 max-h-[500px] overflow-y-auto">
            {filtered.map((entry) => (
              <div
                key={entry.playerId}
                className={`grid grid-cols-12 gap-2 p-3.5 text-xs items-center transition ${
                  entry.isUser
                    ? 'bg-amber-950/30 border-l-4 border-amber-500 font-bold'
                    : 'hover:bg-zinc-800/40'
                }`}
              >
                {/* Rank Number */}
                <div className="col-span-1 text-center font-['Press_Start_2P'] text-xs">
                  {entry.rank === 1 ? (
                    <Crown className="h-4 w-4 text-amber-400 mx-auto" />
                  ) : entry.rank === 2 ? (
                    <span className="text-zinc-300">2</span>
                  ) : entry.rank === 3 ? (
                    <span className="text-amber-600">3</span>
                  ) : (
                    <span className="text-zinc-500">{entry.rank}</span>
                  )}
                </div>

                {/* Player & Crew */}
                <div className="col-span-5 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-['Cinzel'] font-bold text-zinc-100">{entry.playerName}</span>
                    <span className="rounded bg-zinc-800 px-1 py-0.2 text-[9px] font-mono text-amber-400">
                      {entry.tier}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">{entry.crewName}</span>
                </div>

                {/* Bounty */}
                <div className="col-span-3 text-right font-mono font-bold text-amber-300">
                  ฿ {entry.bounty.toLocaleString()}
                </div>

                {/* Win Rate */}
                <div className="col-span-3 text-right font-mono text-zinc-300">
                  <span className="text-emerald-400 font-bold">{entry.winRate}%</span>{' '}
                  <span className="text-[10px] text-zinc-500">({entry.matchesPlayed}W)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
