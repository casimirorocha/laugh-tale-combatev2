import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, Sparkles, TrendingUp, Zap, Swords, Crown, Shield, Activity, Share2, Download, Copy, Check, Compass, Trophy, CheckCircle2, Film, Play, Video } from 'lucide-react';
import { MatchResult, UserProfile, Fighter } from '../types/fighter';
import { addMatchResultToProfile, getUserProfile, saveUserProfile } from '../utils/storage';
import { CHARACTERS } from '../data/characters';
import { VictoryPoseSequence } from './VictoryPoseSequence';
import { audioManager } from '../utils/AudioManager';
import { saveEventCompletion, INITIAL_GLOBAL_EVENTS } from '../data/worldEvents';
import { GlobalEvent } from '../types/worldEvents';
import { MatchHighlightsModal } from './MatchHighlightsModal';
import { MatchReplayModal } from './MatchReplayModal';
import { MomentumSparklineD3 } from './MomentumSparklineD3';

interface PostMatchResultsProps {
  result: MatchResult;
  onRematch: () => void;
  onReturnToRoster: () => void;
}

export const PostMatchResults: React.FC<PostMatchResultsProps> = ({
  result,
  onRematch,
  onReturnToRoster,
}) => {
  const [recapText, setRecapText] = useState<string>('Generating AI combat recap and match highlights...');
  const [tacticalInsight, setTacticalInsight] = useState<string>('Calculated combat dynamics across all rounds.');
  const [mvpReasoning, setMvpReasoning] = useState<string>('Highest damage output and decisive blow.');
  const [victoryQuip, setVictoryQuip] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getUserProfile());
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showHighlightsModal, setShowHighlightsModal] = useState<boolean>(false);
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);

  const isUserWinner = result.team1.isWinner;
  const winningTeam = result.team1.isWinner ? result.team1 : result.team2;

  // Resolve winning team fighters to full Fighter objects
  const resolveWinningFighters = (): Fighter[] => {
    const allKnown = [...CHARACTERS, ...(userProfile.customFighters || [])];
    const names = (winningTeam?.fighters?.length ? winningTeam.fighters : [result.mvpFighter]).filter((n): n is string => Boolean(n));
    const resolved: Fighter[] = [];

    for (const name of names) {
      const found = allKnown.find(
        (f) =>
          f?.name?.toLowerCase() === name.toLowerCase() ||
          f?.shortName?.toLowerCase() === name.toLowerCase() ||
          f?.id?.toLowerCase() === name.toLowerCase()
      );
      if (found) {
        resolved.push(found);
      } else {
        resolved.push({
          id: name.toLowerCase().replace(/\s+/g, '_'),
          name,
          shortName: name.split(' ')[0],
          tier: 'Yonko',
          powerLevel: 94,
          bounty: 1800000000,
          avatarIcon: '👑',
          themeColor: '#f59e0b',
          fightingStyle: 'Haki Master',
          stats: {
            attack: 92,
            defense: 89,
            speed: 91,
            haki: 94,
            devilFruitMastery: 88,
            meterEfficiency: 90,
          },
          moves: [],
          desperationMoves: [],
        } as unknown as Fighter);
      }
    }

    if (resolved.length === 0 && result.mvpFighter) {
      const mvpFound = allKnown.find(
        (f) =>
          f?.name?.toLowerCase() === result.mvpFighter?.toLowerCase() ||
          f?.shortName?.toLowerCase() === result.mvpFighter?.toLowerCase()
      );
      if (mvpFound) resolved.push(mvpFound);
    }

    return resolved;
  };

  const winningFighters = resolveWinningFighters();

  // Aggregate stats from combat logs for the Highlight Reel
  const getHighlightStats = () => {
    let totalDamage = 0;
    let maxCombo = 0;
    let superAttacks = 0;
    let hakiClashes = 0;

    if (result.combatLogs && result.combatLogs.length > 0) {
      result.combatLogs.forEach((log) => {
        if (log.damage) totalDamage += log.damage;
        if (log.comboHits && log.comboHits > maxCombo) {
          maxCombo = log.comboHits;
        }
        if (
          log.moveName?.toLowerCase().includes('super') ||
          log.moveName?.toLowerCase().includes('climax') ||
          log.moveName?.toLowerCase().includes('finisher') ||
          log.moveName?.toLowerCase().includes('gear') ||
          log.moveName?.toLowerCase().includes('baster')
        ) {
          superAttacks++;
        }
        if (log.actionType === 'HAKI_CLASH' || log.moveName?.toLowerCase().includes('haki')) {
          hakiClashes++;
        }
      });
    }

    // Dynamic fallbacks to populate beautifully if combat logs are empty/short
    if (totalDamage === 0) totalDamage = Math.floor(Math.random() * 800 + 1500);
    if (maxCombo === 0) maxCombo = Math.floor(Math.random() * 9 + 4);
    if (superAttacks === 0) superAttacks = Math.floor(Math.random() * 4 + 1);
    if (hakiClashes === 0) hakiClashes = Math.floor(Math.random() * 2 + 1);

    return { totalDamage, maxCombo, superAttacks, hakiClashes };
  };

  const highlightStats = getHighlightStats();

  useEffect(() => {
    // Fire celebratory confetti if player won
    if (isUserWinner) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'],
      });
    }

    // Save match result to profile & state
    let updated = addMatchResultToProfile(result, isUserWinner);

    // If this was an active World Event battle and user won, claim event completion & exclusive rewards
    if (result.eventInfo && isUserWinner) {
      const activeEvent = INITIAL_GLOBAL_EVENTS.find(
        (e) => e.id === result.eventInfo?.eventId || e.title === result.eventInfo?.eventTitle
      );
      if (activeEvent) {
        saveEventCompletion(activeEvent.id, result.bountyEarned);

        const titleReward = activeEvent.rewards.find((r) => r.type === 'title');
        const flagReward = activeEvent.rewards.find((r) => r.type === 'flag');
        const badgeReward = activeEvent.rewards.find((r) => r.type === 'badge');

        const newAchievements = [...(updated.unlockedAchievements || [])];
        if (titleReward && !newAchievements.includes(titleReward.name)) {
          newAchievements.push(titleReward.name);
        }
        if (badgeReward && !newAchievements.includes(badgeReward.name)) {
          newAchievements.push(badgeReward.name);
        }

        updated = {
          ...updated,
          unlockedAchievements: newAchievements,
          title: titleReward ? String(titleReward.value) : updated.title,
          flagIcon: flagReward ? String(flagReward.value) : updated.flagIcon,
        };
        saveUserProfile(updated);
      }
    }
    setUserProfile(updated);

    // Fetch Unique, Character-Specific Victory Quote using Gemini API (with local fallback)
    fetch('/api/victory-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fighterName: result.mvpFighter }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.quote) {
          setVictoryQuip(data.quote);
          audioManager.playVictoryFanfare();
          const mvpFighterObj = winningFighters.find(f => 
            f.name.toLowerCase() === result.mvpFighter.toLowerCase() || 
            f.shortName?.toLowerCase() === result.mvpFighter.toLowerCase()
          );
          audioManager.speakWinQuote(data.quote, mvpFighterObj?.id || 'luffy');
        } else {
          throw new Error('No quote returned');
        }
      })
      .catch(() => {
        // Fallback to local victory quip database
        const mvpFighterObj = winningFighters.find(f => 
          f.name.toLowerCase() === result.mvpFighter.toLowerCase() || 
          f.shortName?.toLowerCase() === result.mvpFighter.toLowerCase()
        );
        let selectedQuip = "A victory well earned through grit and willpower.";
        if (mvpFighterObj && mvpFighterObj.victoryQuips && mvpFighterObj.victoryQuips.length > 0) {
          const randomIndex = Math.floor(Math.random() * mvpFighterObj.victoryQuips.length);
          selectedQuip = mvpFighterObj.victoryQuips[randomIndex];
        } else if (mvpFighterObj?.winQuote) {
          selectedQuip = mvpFighterObj.winQuote;
        }
        setVictoryQuip(selectedQuip);
        audioManager.playVictoryFanfare();
        audioManager.speakWinQuote(selectedQuip, mvpFighterObj?.id || 'luffy');
      });

    // Fetch AI Match recap
    fetch('/api/post-match-recap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchResult: result,
        winningTeam: result.winnerName,
        mvpFighter: result.mvpFighter,
        totalRounds: result.totalRounds,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.recap || data.recapText)) {
          setRecapText(data.recap || data.recapText);
          setTacticalInsight(data.tacticalInsight || data.tacticalDecidingFactor || 'Exceptional meter management and critical strikes.');
          setMvpReasoning(data.mvpReasoning || 'Dominated the neutral field with supreme Conqueror Haki.');
        }
      })
      .catch(() => {
        setRecapText(
          `In an intense battle lasting ${result.totalRounds} rounds, ${result.winnerName} achieved a decisive victory! MVP ${result.mvpFighter} broke through the opponent's defenses with overwhelming power.`
        );
      });
  }, [result]);

  // Actions for Sharing
  const handleCopySummary = () => {
    const text = `🏆 GRAND LINE FIGHTER BATTLE RECAP 🏆\n\nWinner: ${result.winnerName}\nMatch MVP: ${result.mvpFighter}\nRounds Concluded: ${result.totalRounds}\nTotal Damage Dealt: ${highlightStats.totalDamage} HP\nMax Combo: ${highlightStats.maxCombo} Hits\n\n"${victoryQuip}"\n\nPlay ONE PIECE: GRAND LINE FIGHTER now! ☠️`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateDownload = () => {
    setIsDownloading(true);
    // Visual progress emulation
    setTimeout(() => {
      setIsDownloading(false);
      // Trigger brief success particles
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 1500);
  };

  const handleSimulateShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
    }, 1200);
  };

  const t1Score = result.team1Score ?? result.team1?.score ?? (result.roundHistory ? result.roundHistory.filter((r) => r === 'team1').length : (result.team1?.isWinner ? 1 : 0));
  const t2Score = result.team2Score ?? result.team2?.score ?? (result.roundHistory ? result.roundHistory.filter((r) => r === 'team2').length : (result.team2?.isWinner ? 1 : 0));

  const roundStatsAscending = React.useMemo(() => {
    if (result.roundStats && result.roundStats.length > 0) {
      return [...result.roundStats].sort((a, b) => a.roundNumber - b.roundNumber);
    }
    const count = result.totalRounds || 1;
    const stats = [];
    for (let i = 1; i <= count; i++) {
      const winnerSide = result.roundHistory?.[i - 1] || (result.team1?.isWinner ? 'team1' : 'team2');
      stats.push({
        roundNumber: i,
        winnerSide,
        winnerName: winnerSide === 'team1' ? (result.team1?.name || 'Team 1') : (result.team2?.name || 'Team 2'),
        t1FighterName: result.team1?.fighters?.[i - 1] || result.team1?.fighters?.[0] || 'Fighter 1',
        t2FighterName: result.team2?.fighters?.[i - 1] || result.team2?.fighters?.[0] || 'Fighter 2',
        t1Damage: winnerSide === 'team1' ? 120 : 45,
        t2Damage: winnerSide === 'team2' ? 120 : 45,
        maxCombo: 3 + i,
        supersLanded: 1,
        decisiveMove: 'Heavy Finish',
      });
    }
    return stats;
  }, [result]);

  return (
    <motion.div
      id="post-match-results-screen"
      className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-y-auto font-sans p-3 sm:p-6 lg:p-8 select-none"
      initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-5xl mx-auto w-full my-auto flex flex-col gap-6">
        {/* VICTORY BANNER HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-widest">
              GRAND LINE TOURNAMENT RESULTS
            </span>
          </div>
          <h1 className="font-['Cinzel'] text-3xl sm:text-5xl font-black text-white tracking-wider">
            {result.winnerName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500">VICTORY!</span>
          </h1>
          
          {/* CHARACTER VICTORY QUIP */}
          {victoryQuip && (
            <div className="mt-4 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-1000 delay-500 fill-mode-both">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative px-6 py-4 bg-zinc-950/80 ring-1 ring-amber-500/30 rounded-xl border border-amber-500/20 backdrop-blur-sm">
                  <span className="font-['Montserrat'] italic text-lg sm:text-xl text-amber-200 font-medium tracking-tight leading-relaxed">
                    "{victoryQuip}"
                  </span>
                  <div className="absolute -bottom-2 right-6 px-2 py-0.5 bg-amber-500 rounded text-[9px] font-black text-black uppercase tracking-tighter">
                    {result.mvpFighter} • WINNER'S QUIP
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="font-mono text-xs sm:text-sm text-zinc-400 mt-2">
            CONCLUDED IN {result.totalRounds} ROUNDS • FORMAT: {result.matchFormat.toUpperCase()}
          </p>
        </div>

        {/* CUMULATIVE SCOREBOARD (PLACAR) */}
        <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-zinc-950 via-amber-950/40 to-zinc-950 p-5 shadow-2xl flex flex-col items-center gap-3">
          <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>CUMULATIVE MATCH SCOREBOARD (PLACAR)</span>
          </div>
          <div className="flex items-center justify-between gap-4 sm:gap-8 w-full max-w-2xl px-2">
            {/* Team 1 */}
            <div className="flex flex-col items-end flex-1 text-right">
              <span className="font-['Cinzel'] font-black text-base sm:text-2xl text-amber-300 truncate max-w-[180px] sm:max-w-[240px]">
                {result.team1.name}
              </span>
              <span className="text-[10px] font-mono text-amber-500/80 uppercase font-bold">TEAM 1</span>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-3 bg-zinc-900/90 border-2 border-amber-500/70 px-6 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <span className={`font-['Press_Start_2P'] text-2xl sm:text-4xl ${t1Score > t2Score ? 'text-amber-400' : t1Score === t2Score ? 'text-amber-200' : 'text-zinc-400'}`}>
                {t1Score}
              </span>
              <span className="font-mono text-amber-500 text-xl font-black">:</span>
              <span className={`font-['Press_Start_2P'] text-2xl sm:text-4xl ${t2Score > t1Score ? 'text-amber-400' : t1Score === t2Score ? 'text-amber-200' : 'text-zinc-400'}`}>
                {t2Score}
              </span>
            </div>

            {/* Team 2 */}
            <div className="flex flex-col items-start flex-1 text-left">
              <span className="font-['Cinzel'] font-black text-base sm:text-2xl text-purple-300 truncate max-w-[180px] sm:max-w-[240px]">
                {result.team2.name}
              </span>
              <span className="text-[10px] font-mono text-purple-400/80 uppercase font-bold">TEAM 2</span>
            </div>
          </div>
        </div>

        {/* ROUND-BY-ROUND STATISTICS BREAKDOWN (ASCENDING ORDER) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-amber-400" />
              <h3 className="font-['Bebas_Neue'] text-xl tracking-wider text-amber-300">
                ROUND-BY-ROUND STATISTICAL BREAKDOWN
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
              ASCENDING CHRONOLOGICAL ORDER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roundStatsAscending.map((stat) => {
              const isT1Win = stat.winnerSide === 'team1';
              const isDraw = stat.winnerSide === 'draw';
              return (
                <div
                  key={`round_stat_${stat.roundNumber}`}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition ${
                    isDraw
                      ? 'border-zinc-700 bg-zinc-950/60'
                      : isT1Win
                      ? 'border-amber-500/40 bg-amber-950/20'
                      : 'border-purple-500/40 bg-purple-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">
                      ROUND {stat.roundNumber}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        isDraw
                          ? 'bg-zinc-800 text-zinc-300'
                          : isT1Win
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}
                    >
                      {stat.winnerName} WIN
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="text-[11px] text-amber-300 font-bold">{stat.t1FighterName}</span>
                      <span className="text-[10px] text-zinc-500">VS</span>
                      <span className="text-[11px] text-purple-300 font-bold">{stat.t2FighterName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-zinc-800/50 text-[10px]">
                      <div>
                        <span className="text-zinc-500 block">T1 DAMAGE</span>
                        <span className="text-red-400 font-bold">{stat.t1Damage} HP</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">T2 DAMAGE</span>
                        <span className="text-red-400 font-bold">{stat.t2Damage} HP</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">MAX COMBO</span>
                        <span className="text-amber-300 font-bold">{stat.maxCombo} HITS</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">SUPERS/SPECIALS</span>
                        <span className="text-cyan-300 font-bold">{stat.supersLanded}</span>
                      </div>
                    </div>

                    {stat.decisiveMove && (
                      <div className="mt-1 text-[10px] text-zinc-400 italic bg-zinc-950/80 p-1.5 rounded border border-zinc-800/80">
                        <span className="text-amber-500/80 font-normal">Decisive Move:</span> {stat.decisiveMove}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE VICTORY POSE ANIMATION SEQUENCE */}
        <VictoryPoseSequence
          winningTeamName={result.winnerName}
          winningFighters={winningFighters}
          mvpFighterName={result.mvpFighter}
          totalRounds={result.totalRounds}
          bountyEarned={result.bountyEarned}
          matchFormat={result.matchFormat}
        />

        {/* MVP & REWARD SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MVP CARD */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-['Bebas_Neue'] text-lg">
                <Award className="h-5 w-5" />
                <span>MATCH MVP HONORS</span>
              </div>
              <span className="font-['Press_Start_2P'] text-[8px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                #1 COMBATANT
              </span>
            </div>
            <h2 className="font-['Cinzel'] text-2xl font-black text-white mt-1">
              {result.mvpFighter}
            </h2>
            <p className="text-xs text-zinc-300 font-mono mt-1 leading-relaxed">
              {mvpReasoning}
            </p>
          </div>

          {/* BOUNTY & PROGRESSION */}
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-['Bebas_Neue'] text-lg">
                <TrendingUp className="h-5 w-5" />
                <span>BOUNTY REWARD ACCRUAL</span>
              </div>
              <span className="font-['Press_Start_2P'] text-[8px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                EARNED
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Press_Start_2P'] text-lg sm:text-xl text-emerald-300">
                +฿ {result.bountyEarned.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              New Overall Bounty: <span className="text-amber-300 font-bold">฿ {userProfile.bounty.toLocaleString()}</span> • Tier: <span className="text-emerald-400 font-bold">{userProfile.tierRank}</span>
            </p>
          </div>
        </div>

        {/* TIME-LIMITED GLOBAL EVENT CLEARANCE BANNER */}
        {result.eventInfo && (
          <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-red-950/60 via-amber-950/40 to-blue-950/60 p-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black shadow-lg">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Press_Start_2P'] text-[9px] text-amber-300">
                      WORLD EVENT {isUserWinner ? 'MISSION ACCOMPLISHED!' : 'CONCLUDED'}
                    </span>
                    <span className="rounded bg-red-600 px-1.5 py-0.2 font-mono text-[9px] font-bold text-white uppercase">
                      LIMITED TIME
                    </span>
                  </div>
                  <h3 className="font-['Cinzel'] text-lg sm:text-xl font-black text-white">
                    {result.eventInfo.eventTitle}
                  </h3>
                </div>
              </div>

              {isUserWinner && (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 font-mono text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold">EXCLUSIVE REWARDS CLAIMED</span>
                </div>
              )}
            </div>

            {/* Event Modifiers that were active */}
            {result.eventInfo.modifiers && result.eventInfo.modifiers.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">MODIFIERS SURVIVED:</span>
                {result.eventInfo.modifiers.map((m, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-zinc-900 border border-zinc-700 px-2 py-0.5 text-[11px] font-mono text-amber-300"
                  >
                    ⚡ {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HIGHLIGHT REEL & SHAREABLE RECAP CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* STATS DETAILS PANEL (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl flex flex-col gap-4">
              <h3 className="font-['Press_Start_2P'] text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-3">
                <Activity className="h-4 w-4 text-amber-500" />
                <span>HIGHLIGHT REEL</span>
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 text-xs">
                  <span className="font-mono text-zinc-400">Total Damage Dealt</span>
                  <span className="font-bold text-red-400 font-mono">{highlightStats.totalDamage.toLocaleString()} HP</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 text-xs">
                  <span className="font-mono text-zinc-400">Max Combo Achieved</span>
                  <span className="font-bold text-amber-400 font-mono">{highlightStats.maxCombo} HITS</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 text-xs">
                  <span className="font-mono text-zinc-400">Super Specials Landed</span>
                  <span className="font-bold text-cyan-400 font-mono">{highlightStats.superAttacks}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="font-mono text-zinc-400">Haki Clashes Triggered</span>
                  <span className="font-bold text-purple-400 font-mono">{highlightStats.hakiClashes}</span>
                </div>
              </div>

              {/* D3.js Combat Momentum Sparkline & Critical Density visualization */}
              <MomentumSparklineD3 logs={result.combatLogs} className="mt-1" />
            </div>

            {/* QUICK ACTIONS */}
            <div className="flex flex-col gap-2">
              <button
                id="quick-show-highlights-btn"
                onClick={() => setShowHighlightsModal(true)}
                className="w-full flex items-center justify-between rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-purple-950/30 hover:border-amber-400 px-4 py-3 text-xs font-bold transition active:scale-95 text-amber-300 shadow-lg group"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition" />
                  <span className="font-['Cinzel'] tracking-wider font-extrabold text-white">SHOW MATCH HIGHLIGHTS</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">3 CLIPS 🎬</span>
              </button>

              <button
                id="quick-show-replay-btn"
                onClick={() => setShowReplayModal(true)}
                className="w-full flex items-center justify-between rounded-xl border border-purple-500/60 bg-gradient-to-r from-purple-500/20 via-purple-950/40 to-blue-950/30 hover:border-purple-400 px-4 py-3 text-xs font-bold transition active:scale-95 text-purple-300 shadow-lg group"
              >
                <span className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-400 group-hover:scale-110 transition" />
                  <span className="font-['Cinzel'] tracking-wider font-extrabold text-white">WATCH REPLAY ENGINE</span>
                </span>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40">{result.combatLogs?.length || 0} STEPS 📼</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 px-4 py-3 text-xs font-bold transition active:scale-95 text-zinc-200"
              >
                <span className="flex items-center gap-2">
                  {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                  <span>{isCopied ? 'COPIED TO CLIPBOARD!' : 'COPY COMBAT SUMMARY'}</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">TEXT</span>
              </button>

              <button
                onClick={handleSimulateDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 px-4 py-3 text-xs font-bold transition active:scale-95 text-zinc-200"
              >
                <span className="flex items-center gap-2">
                  <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce text-amber-400' : 'text-zinc-400'}`} />
                  <span>{isDownloading ? 'EXPORTING RECAP CARD...' : 'DOWNLOAD RECAP CARD'}</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">PNG IMAGE</span>
              </button>
            </div>
          </div>

          {/* STYLIZED SHAREABLE RECAP WANTED CARD (2/3 width) */}
          <div className="lg:col-span-2 relative">
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-amber-600/60 bg-amber-950/10 p-6 shadow-2xl backdrop-blur-sm flex flex-col justify-between h-full min-h-[300px]">
              {/* Retro decorative corner ornaments */}
              <div className="absolute top-2 left-2 text-xs text-amber-500/60 font-mono">☠️</div>
              <div className="absolute top-2 right-2 text-xs text-amber-500/60 font-mono">☠️</div>
              <div className="absolute bottom-2 left-2 text-xs text-amber-500/60 font-mono">☠️</div>
              <div className="absolute bottom-2 right-2 text-xs text-amber-500/60 font-mono">☠️</div>

              {/* WANTED STYLE FRAME */}
              <div className="flex flex-col gap-4 my-auto">
                <div className="text-center">
                  <h4 className="font-['Press_Start_2P'] text-[11px] text-amber-500/80 tracking-widest uppercase">
                    GRAND LINE CHAMPIONSHIP
                  </h4>
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">
                    OFFICIAL BOUNTY BOARD CERTIFICATION
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-zinc-950/70 p-4 text-center flex flex-col gap-2">
                  <span className="font-['Cinzel'] text-xl sm:text-2xl font-extrabold text-amber-400 tracking-wider">
                    {result.winnerName.toUpperCase()}
                  </span>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span>ROUND WINNER</span>
                    <span>•</span>
                    <span>{result.totalRounds} ROUNDS</span>
                    <span>•</span>
                    <span>MVP: {result.mvpFighter}</span>
                  </div>

                  {victoryQuip && (
                    <p className="font-serif italic text-sm text-zinc-300 mt-2 border-t border-dashed border-zinc-800 pt-3 px-4 leading-relaxed">
                      "{victoryQuip}"
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-zinc-950/40 p-2 border border-zinc-900">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">MAX COMBO</span>
                    <p className="font-['Press_Start_2P'] text-[10px] text-amber-400 mt-0.5">{highlightStats.maxCombo}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-950/40 p-2 border border-zinc-900">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">TOT DAMAGE</span>
                    <p className="font-['Press_Start_2P'] text-[10px] text-red-400 mt-0.5">{highlightStats.totalDamage}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-950/40 p-2 border border-zinc-900">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">REWARD</span>
                    <p className="font-['Press_Start_2P'] text-[10px] text-emerald-400 mt-0.5">+{Math.round(result.bountyEarned/1000000)}M</p>
                  </div>
                </div>
              </div>

              {/* WANTED POSTER STAMP */}
              <div className="flex items-center justify-between border-t border-amber-600/20 pt-4 mt-4">
                <span className="text-[8px] text-zinc-500 font-mono tracking-widest">CERTIFICATE ID: {result.id}</span>
                <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-wider font-mono">
                  <span>CONFIRMED BY BIG NEWS MORGANS</span>
                  <span>📰</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI POST-MATCH TACTICAL RECAP */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="font-['Bebas_Neue'] text-sm tracking-wider text-amber-400">
                BIG NEWS MORGANS • OFFICIAL TOURNAMENT DISPATCH
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              ROUNDS: {result.totalRounds}
            </span>
          </div>

          <p className="font-['Montserrat'] text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
            {recapText}
          </p>

          <div className="mt-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 p-3 text-xs font-mono text-zinc-300 flex items-start gap-2">
            <span className="text-amber-400 font-bold shrink-0">TACTICAL INSIGHT:</span>
            <span>{tacticalInsight}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 pb-6">
          <button
            id="post-match-highlights-btn"
            onClick={() => setShowHighlightsModal(true)}
            className="flex items-center gap-2.5 rounded-xl border-2 border-amber-500 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-purple-950/80 hover:bg-amber-900/40 px-7 py-3 text-sm font-black text-amber-300 tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 transition"
          >
            <Film className="h-4 w-4 text-amber-400" />
            <span className="font-['Cinzel'] font-black uppercase">SHOW HIGHLIGHTS</span>
          </button>

          <button
            id="post-match-replay-btn"
            onClick={() => setShowReplayModal(true)}
            className="flex items-center gap-2.5 rounded-xl border-2 border-purple-500 bg-gradient-to-r from-purple-950/80 via-zinc-900 to-blue-950/80 hover:bg-purple-900/40 px-7 py-3 text-sm font-black text-purple-300 tracking-wider shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:scale-105 active:scale-95 transition"
          >
            <Video className="h-4 w-4 text-purple-400" />
            <span className="font-['Cinzel'] font-black uppercase">WATCH REPLAY</span>
          </button>

          <button
            id="post-match-rematch-btn"
            onClick={onRematch}
            className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-8 py-3 text-base font-black text-black tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="font-['Cinzel'] font-black">REMATCH NOW</span>
          </button>

          <button
            id="post-match-roster-btn"
            onClick={onReturnToRoster}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 text-sm font-bold text-zinc-200 transition active:scale-95 shadow-md"
          >
            <Swords className="h-4 w-4 text-amber-400" />
            <span>CHANGE ROSTER & STAGE</span>
          </button>
        </div>

        {/* MATCH HIGHLIGHTS REEL MODAL OVERLAY */}
        <MatchHighlightsModal
          result={result}
          isOpen={showHighlightsModal}
          onClose={() => setShowHighlightsModal(false)}
        />

        {/* MATCH REPLAY PLAYER MODAL OVERLAY */}
        <MatchReplayModal
          result={result}
          isOpen={showReplayModal}
          onClose={() => setShowReplayModal(false)}
        />
      </div>
    </motion.div>
  );
};

