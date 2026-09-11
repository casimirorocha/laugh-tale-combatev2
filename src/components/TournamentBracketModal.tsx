import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Swords, Crown, X, Play, RefreshCw, CheckCircle2, AlertCircle, Shield, Sparkles, MapPin, Volume2 } from 'lucide-react';
import { TournamentBracketState, TournamentMatch } from '../types/tournament';
import { Team, StageInfo } from '../types/fighter';
import { soundManager } from '../utils/soundEffects';
import { characterVoiceManager } from '../utils/audioAssetLibrary';

interface TournamentBracketModalProps {
  bracket: TournamentBracketState;
  onClose: () => void;
  onStartNextMatch: (nextOpponent: Team, nextStage: StageInfo) => void;
  onSimulateRemainingMatches?: () => void;
  onResetTournament: () => void;
}

export const TournamentBracketModal: React.FC<TournamentBracketModalProps> = ({
  bracket,
  onClose,
  onStartNextMatch,
  onSimulateRemainingMatches,
  onResetTournament,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);
  const userTeam = bracket.userTeam;

  // Find user's current or upcoming match
  const activeMatch = bracket.matches.find((m) => m.id === bracket.currentMatchId);
  const isReadyToFight = activeMatch && (activeMatch.status === 'ready' || activeMatch.status === 'in_progress') && !bracket.userEliminated && !bracket.isCompleted;
  const isGrandFinals = activeMatch?.round === 'grand_finals';

  // Determine opponent for next match
  let nextOpponent: Team | null = null;
  let nextStage: StageInfo | null = null;
  if (activeMatch && isReadyToFight) {
    nextOpponent = activeMatch.team1.id === userTeam.id ? activeMatch.team2 : activeMatch.team1;
    nextStage = activeMatch.stage;
  }

  const qfMatches = bracket.matches.filter((m) => m.round === 'quarter_finals');
  const sfMatches = bracket.matches.filter((m) => m.round === 'semi_finals');
  const gfMatches = bracket.matches.filter((m) => m.round === 'grand_finals');

  const gfMatch = gfMatches[0];
  const hasFinalists = gfMatch && !gfMatch.team1.id.startsWith('tbd_') && !gfMatch.team2.id.startsWith('tbd_');

  const handleResetBracketClick = () => {
    soundManager.playUiConfirm();
    setIsResetting(true);
    onResetTournament();
    setShowResetToast(true);
    setTimeout(() => setIsResetting(false), 500);
    setTimeout(() => setShowResetToast(false), 4500);
  };

  const handleFightClick = () => {
    if (nextOpponent && nextStage) {
      if (isGrandFinals) {
        characterVoiceManager.playTournamentFinalsAnnouncement(userTeam.name, nextOpponent.name);
      }
      soundManager.playUiConfirm();
      onStartNextMatch(nextOpponent, nextStage);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden text-zinc-100"
        >
          {/* Top Decorative Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-400 to-yellow-500" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-400/30 text-amber-400 shadow-md">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Bebas_Neue'] text-xl sm:text-2xl text-amber-400 tracking-wider">
                    {bracket.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3v3 KOF Format
                  </span>
                </div>
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <span>Your Crew: <strong className="text-zinc-200">{userTeam.name}</strong></span>
                  <span>•</span>
                  <span>Prize Pool: <strong className="text-amber-400 font-mono">{bracket.totalBountyPool.toLocaleString()} Berries</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetBracketClick}
                disabled={isResetting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/30 text-amber-300 hover:text-amber-100 text-xs font-bold transition shadow-sm"
                title="Clear all current match results and re-randomize tournament seeding"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Bracket</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition border border-zinc-700"
                title="Close Bracket"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Reset Confirmation Toast Banner */}
          {showResetToast && (
            <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-bold flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Tournament bracket cleared! Seeding re-randomized for a fresh 3v3 championship!</span>
              </div>
              <button
                onClick={() => setShowResetToast(false)}
                className="text-amber-400/80 hover:text-amber-200 p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Champion Status Banner (if finished or user eliminated) */}
          {bracket.isCompleted && bracket.userWonTournament && (
            <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/60 shadow-lg flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-amber-400 animate-bounce" />
                <div>
                  <h3 className="font-['Bebas_Neue'] text-lg sm:text-xl text-amber-300 tracking-wider">
                    👑 TOURNAMENT CHAMPION: {userTeam.name}!
                  </h3>
                  <p className="text-xs text-amber-200/90">
                    You defeated all 7 rival pirate crews to claim the Grand Sea Trophy and +1,000,000,000 Bounty!
                  </p>
                </div>
              </div>
              <button
                onClick={onResetTournament}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider transition shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>START NEW TOURNAMENT</span>
              </button>
            </div>
          )}

          {bracket.userEliminated && (
            <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 shadow-lg flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-7 w-7 text-red-400" />
                <div>
                  <h3 className="font-['Bebas_Neue'] text-lg text-red-300 tracking-wider">
                    CREW ELIMINATED FROM THE TOURNAMENT
                  </h3>
                  <p className="text-xs text-red-200/80">
                    Your team was knocked out. You can reset the bracket to start a new tournament challenge!
                  </p>
                </div>
              </div>
              <button
                onClick={onResetTournament}
                className="px-4 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider transition shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>RESTART TOURNAMENT</span>
              </button>
            </div>
          )}

          {/* Bracket Tree Layout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
              {/* ROUND 1: QUARTER-FINALS */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-['Bebas_Neue'] text-lg text-zinc-300 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    QUARTER-FINALS (ROUND OF 8)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">4 MATCHES</span>
                </div>
                <div className="flex flex-col gap-3">
                  {qfMatches.map((match) => (
                    <MatchCard key={match.id} match={match} userTeamId={userTeam.id} />
                  ))}
                </div>
              </div>

              {/* ROUND 2: SEMI-FINALS */}
              <div className="flex flex-col gap-4 lg:pt-12">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-['Bebas_Neue'] text-lg text-zinc-300 tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    SEMI-FINALS (FINAL FOUR)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">2 MATCHES</span>
                </div>
                <div className="flex flex-col gap-8">
                  {sfMatches.map((match) => (
                    <MatchCard key={match.id} match={match} userTeamId={userTeam.id} />
                  ))}
                </div>
              </div>

              {/* ROUND 3: GRAND FINALS & TROPHY */}
              <div className="flex flex-col gap-4 lg:pt-28">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="font-['Bebas_Neue'] text-lg text-amber-400 tracking-wider flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-400" />
                    GRAND FINALS (CHAMPIONSHIP)
                  </span>
                  <span className="text-[10px] font-mono text-amber-500">1 MATCH</span>
                </div>
                <div className="flex flex-col gap-4">
                  {gfMatches.map((match) => (
                    <MatchCard key={match.id} match={match} userTeamId={userTeam.id} isFinals />
                  ))}

                  {/* Championship Finalists Announcement Card */}
                  {hasFinalists && (
                    <div className="p-3 rounded-xl border border-amber-400/50 bg-amber-500/10 flex flex-col gap-2 shadow-md">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        <span>Championship Finalists</span>
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Crown className="h-3 w-3 text-amber-400" />
                          Title Bout
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 flex items-center justify-between font-medium">
                        <span className="text-amber-400 font-bold truncate max-w-[120px]">{gfMatches[0].team1.name}</span>
                        <span className="text-zinc-500 font-mono text-[10px]">VS</span>
                        <span className="text-amber-400 font-bold truncate max-w-[120px]">{gfMatches[0].team2.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          soundManager.playUiConfirm();
                          characterVoiceManager.playTournamentFinalsAnnouncement(
                            gfMatches[0].team1.name,
                            gfMatches[0].team2.name
                          );
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/40 hover:to-yellow-500/40 border border-amber-400/60 text-amber-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                        title="Listen to AI voice announcement introducing the finalists"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        <span>Announce Finalists (AI Voice)</span>
                      </button>
                    </div>
                  )}

                  {/* Champion Trophy Showcase */}
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-zinc-950 flex flex-col items-center justify-center text-center gap-2">
                    <Trophy className={`h-12 w-12 ${bracket.championTeam ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Grand Champion</div>
                      <div className="font-['Bebas_Neue'] text-xl text-amber-300 tracking-wider">
                        {bracket.championTeam ? bracket.championTeam.name : 'TBD - WILL OF THE D'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="px-4 sm:px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/80 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {onSimulateRemainingMatches && !bracket.isCompleted && !bracket.userEliminated && (
                <button
                  onClick={onSimulateRemainingMatches}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white transition flex items-center gap-1.5"
                  title="Simulate all other pending CPU vs CPU bracket matches"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Simulate AI Matches</span>
                </button>
              )}
              <button
                onClick={handleResetBracketClick}
                disabled={isResetting}
                className="px-3.5 py-1.5 rounded-lg border border-amber-500/60 bg-zinc-900/90 hover:bg-amber-500/20 text-xs font-bold text-amber-300 hover:text-amber-100 transition shadow-md flex items-center gap-1.5"
                title="Instantly clear all current match results and re-randomize tournament seeding"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isResetting ? 'animate-spin' : ''}`} />
                <span>Reset Bracket</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
              >
                Back to Arena
              </button>

              {isReadyToFight && nextOpponent && nextStage && (
                <button
                  onClick={handleFightClick}
                  className={`px-6 py-2 rounded-lg ${
                    isGrandFinals
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black shadow-amber-500/50'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/30'
                  } font-extrabold text-sm tracking-wider shadow-lg transition flex items-center gap-2 animate-pulse`}
                >
                  {isGrandFinals ? <Crown className="h-4 w-4 text-black" /> : <Swords className="h-4 w-4 text-black" />}
                  <span>
                    {isGrandFinals ? '🏆 FIGHT GRAND FINALS: VS ' : 'FIGHT NEXT MATCH: VS '}
                    {nextOpponent.name.toUpperCase()}
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface MatchCardProps {
  match: TournamentMatch;
  userTeamId: string;
  isFinals?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, userTeamId, isFinals }) => {
  const isUserInvolved = match.team1.id === userTeamId || match.team2.id === userTeamId;
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'in_progress' || match.status === 'ready';

  return (
    <div
      className={`rounded-xl border transition-all duration-300 p-3 flex flex-col gap-2 relative ${
        isUserInvolved && isLive
          ? 'bg-zinc-900/90 border-amber-500/80 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50'
          : isUserInvolved
          ? 'bg-zinc-900/80 border-amber-500/40'
          : isFinals
          ? 'bg-zinc-900/60 border-yellow-500/30'
          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-zinc-400">{match.roundLabel}</span>
          {isUserInvolved && (
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
              Player
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-zinc-400 text-[10px]">
          <MapPin className="h-3 w-3 text-zinc-500" />
          <span className="truncate max-w-[120px]">{match.stage.name.split(':')[0]}</span>
        </div>
      </div>

      {/* Team 1 */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-lg transition ${
          match.winnerTeamId === match.team1.id
            ? 'bg-emerald-950/30 text-emerald-300 font-bold'
            : isCompleted
            ? 'text-zinc-500'
            : match.team1.id === userTeamId
            ? 'text-amber-300 font-bold'
            : 'text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{match.team1.crestEmoji || '⚔️'}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs truncate font-medium">{match.team1.name}</span>
            {match.team1?.fighters && match.team1.fighters.length > 0 && (
              <span className="text-[10px] text-zinc-500 truncate">
                {match.team1.fighters.map((f: any) => typeof f === 'string' ? f.split(' ')[0] : (f?.shortName || f?.name?.split(' ')[0] || '')).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {match.winnerTeamId === match.team1?.id && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          <span className="font-mono text-xs font-black">{isCompleted ? match.team1Score : '-'}</span>
        </div>
      </div>

      {/* Team 2 */}
      <div
        className={`flex items-center justify-between p-1.5 rounded-lg transition ${
          match.winnerTeamId === match.team2?.id
            ? 'bg-emerald-950/30 text-emerald-300 font-bold'
            : isCompleted
            ? 'text-zinc-500'
            : match.team2?.id === userTeamId
            ? 'text-amber-300 font-bold'
            : 'text-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{match.team2?.crestEmoji || '⚓'}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs truncate font-medium">{match.team2?.name}</span>
            {match.team2?.fighters && match.team2.fighters.length > 0 && (
              <span className="text-[10px] text-zinc-500 truncate">
                {match.team2.fighters.map((f: any) => typeof f === 'string' ? f.split(' ')[0] : (f?.shortName || f?.name?.split(' ')[0] || '')).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {match.winnerTeamId === match.team2.id && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
          <span className="font-mono text-xs font-black">{isCompleted ? match.team2Score : '-'}</span>
        </div>
      </div>

      {/* Match Summary or Live Indicator */}
      {match.summaryText && (
        <div className="text-[10px] text-zinc-400 italic bg-zinc-950/60 rounded px-2 py-1 border border-zinc-800/60">
          {match.summaryText}
        </div>
      )}

      {isLive && isUserInvolved && (
        <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 rounded border border-amber-500/30 animate-pulse">
          <Swords className="h-3 w-3" />
          <span>UP NEXT FOR YOUR CREW</span>
        </div>
      )}
    </div>
  );
};
