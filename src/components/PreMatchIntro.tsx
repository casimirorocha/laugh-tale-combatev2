import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Flame,
  Globe,
  ChevronRight,
  ShieldAlert,
  ScrollText,
} from 'lucide-react';
import { Team, StageInfo, MatchFormat } from '../types/fighter';
import { calculateTeamTCP } from '../utils/combatEngine';
import { KOFTeamBanners } from './KOFTeamBanners';
import { KOFFighterDuel } from './KOFFighterDuel';
import { FighterTaleBox } from './FighterTaleBox';
import { entranceAudio } from '../utils/entranceAudio';

interface PreMatchIntroProps {
  team1: Team;
  team2: Team;
  stage: StageInfo;
  matchFormat: MatchFormat;
  onProceedToFight: () => void;
}

type IntroViewMode = 'banners' | 'point' | 'middle' | 'anchor' | 'analysis';

export const PreMatchIntro: React.FC<PreMatchIntroProps> = ({
  team1,
  team2,
  stage,
  matchFormat,
  onProceedToFight,
}) => {
  const [viewMode, setViewMode] = useState<IntroViewMode>('point');
  const [matchupIndex, setMatchupIndex] = useState<number>(0); // 0 = Point, 1 = Middle, 2 = Anchor
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  const [isMuted, setIsMuted] = useState<boolean>(entranceAudio.isMuted);

  // Taunting states
  const [isTaunting1, setIsTaunting1] = useState<boolean>(false);
  const [isTaunting2, setIsTaunting2] = useState<boolean>(false);

  // Ready... GO! transition flash
  const [isStartingFight, setIsStartingFight] = useState<boolean>(false);
  const [readyGoText, setReadyGoText] = useState<string>('');

  // AI Tactical Analysis
  const [analysisText, setAnalysisText] = useState<string>(
    'Analyzing combatant attributes and tactical matchup...'
  );
  const [keyMatchup, setKeyMatchup] = useState<string>('Clash of Grand Line Titans');
  const [winPrediction, setWinPrediction] = useState<{ team1: number; team2: number }>({
    team1: 52,
    team2: 48,
  });
  const [showAnalysisDrawer, setShowAnalysisDrawer] = useState<boolean>(false);
  const [showFighterTale, setShowFighterTale] = useState<boolean>(true);

  // Timeouts ref for sequence cleanup
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const t1TCP = calculateTeamTCP(team1.fighters);
  const t2TCP = calculateTeamTCP(team2.fighters);

  // Active fighters based on current matchup index
  const fighter1 = team1.fighters[matchupIndex] || team1.fighters[0];
  const fighter2 = team2.fighters[matchupIndex] || team2.fighters[0];

  const roleLabels = [
    { title: 'POINT (先鋒)', short: 'Point' },
    { title: 'MIDDLE (中堅)', short: 'Middle' },
    { title: 'ANCHOR (大将)', short: 'Anchor' },
  ];

  // Fetch AI Match Analysis
  useEffect(() => {
    fetch('/api/match-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team1, team2, stage, matchFormat }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.analysis || data.preMatchHype)) {
          setAnalysisText(data.analysis || data.preMatchHype);
          const firstKeyMatchup = Array.isArray(data.keyMatchups) ? data.keyMatchups[0] : null;
          setKeyMatchup(data.keyMatchupFactor || firstKeyMatchup || 'Haki Mastery vs Devil Fruit Power');
          setWinPrediction(data.winProbability || { team1: 52, team2: 48 });
        }
      })
      .catch(() => {
        setAnalysisText(
          `${team1.fighters[0]?.name || 'Team 1'} leads the charge against ${
            team2.fighters[0]?.name || 'Team 2'
          } in a high-stakes duel across ${stage.name}. Victory hinges on Conqueror Haki infusion and tactical meter management!`
        );
      });
  }, [team1, team2, stage, matchFormat]);

  // Clean up timers
  const clearSequenceTimers = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Run full cinematic KOF entrance sequence
  const playEntranceSequence = (targetMatchup = 0) => {
    clearSequenceTimers();
    setMatchupIndex(targetMatchup);
    setViewMode('banners');

    // Step 1: Banner clash audio & impact
    entranceAudio.playBannerClash();

    // Step 2: Transition to fighter portrait entrance with Mach slide & stamp
    const t1 = setTimeout(() => {
      setViewMode(targetMatchup === 0 ? 'point' : targetMatchup === 1 ? 'middle' : 'anchor');
      entranceAudio.playPortraitSlide();

      const tStamp = setTimeout(() => {
        entranceAudio.playKanjiStamp();
      }, 250);
      timeoutsRef.current.push(tStamp);

      // Step 3: Trigger Fighter 1 Taunt audio sample
      const tTaunt1 = setTimeout(() => {
        triggerFighterTaunt(1, team1.fighters[targetMatchup]);

        // Step 4: Trigger Fighter 2 Counter Taunt audio sample
        const tTaunt2 = setTimeout(() => {
          triggerFighterTaunt(2, team2.fighters[targetMatchup]);
        }, 2200);
        timeoutsRef.current.push(tTaunt2);
      }, 750);
      timeoutsRef.current.push(tTaunt1);
    }, 1500);

    timeoutsRef.current.push(t1);
  };

  // Trigger individual fighter taunt
  const triggerFighterTaunt = (side: 1 | 2, fighterToTaunt = side === 1 ? fighter1 : fighter2) => {
    const opponent = side === 1 ? fighter2 : fighter1;
    if (side === 1) {
      setIsTaunting1(true);
      entranceAudio.playVoiceTaunt(fighterToTaunt.id, fighterToTaunt.name, lang, () => {
        setIsTaunting1(false);
      }, opponent.id);
    } else {
      setIsTaunting2(true);
      entranceAudio.playVoiceTaunt(fighterToTaunt.id, fighterToTaunt.name, lang, () => {
        setIsTaunting2(false);
      }, opponent.id);
    }
  };

  // Initial mount: launch sequence automatically
  useEffect(() => {
    playEntranceSequence(0);
    return () => clearSequenceTimers();
  }, []);

  // Handle switching matchup manually
  const handleSelectMatchup = (index: number) => {
    clearSequenceTimers();
    setMatchupIndex(index);
    const mode = index === 0 ? 'point' : index === 1 ? 'middle' : 'anchor';
    setViewMode(mode);
    entranceAudio.playPortraitSlide();
    setTimeout(() => {
      entranceAudio.playKanjiStamp();
    }, 200);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    entranceAudio.isMuted = next;
  };

  // Toggle Voice Language
  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
  };

  // Start the battle with classic KOF "READY... GO!" fanfare
  const handleStartBattle = () => {
    if (isStartingFight) return;
    clearSequenceTimers();
    setIsStartingFight(true);
    setReadyGoText('ROUND 1');
    entranceAudio.playReadyGoFanfare();

    setTimeout(() => {
      setReadyGoText('READY... GO!');
      setTimeout(() => {
        onProceedToFight();
      }, 700);
    }, 800);
  };

  return (
    <div
      id="kof-prematch-intro"
      className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none"
    >
      {/* Background Stage Atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${stage.bgGradient} opacity-50 pointer-events-none`} />

      {/* TOP HEADER & KOF NAVIGATION BAR */}
      <header className="relative z-20 w-full bg-zinc-950/90 border-b border-amber-500/30 px-3 sm:px-6 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Stage & Mode Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 text-black font-black shadow-md">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Press_Start_2P'] text-[9px] sm:text-[10px] text-amber-400 uppercase tracking-widest">
                  {matchFormat === '3v3_kof' ? '★ KOF 3V3 ARCADE CLASH ★' : '★ 1V1 SUDDEN DEATH DUEL ★'}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-zinc-800 text-[9px] font-mono text-zinc-300">
                  {stage.name}
                </span>
              </div>
              <span className="font-['Cinzel'] text-sm sm:text-base font-black text-white block leading-tight">
                {stage.location}
              </span>
            </div>
          </div>

          {/* Sequence Step Tabs (Team Clash, Point, Middle, Anchor, Forecast) */}
          <nav className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              id="kof-tab-banners"
              onClick={() => {
                clearSequenceTimers();
                setViewMode('banners');
                entranceAudio.playBannerClash();
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-['Bebas_Neue'] tracking-wider transition ${
                viewMode === 'banners'
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              ★ TEAM BANNERS
            </button>

            {roleLabels.map((r, i) => {
              const isSelected =
                viewMode !== 'banners' && viewMode !== 'analysis' && matchupIndex === i;
              return (
                <button
                  key={`matchup_tab_${i}`}
                  id={`kof-tab-fighter-${i}`}
                  onClick={() => handleSelectMatchup(i)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-['Bebas_Neue'] tracking-wider transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{r.title}</span>
                </button>
              );
            })}

            <button
              id="kof-tab-analysis"
              onClick={() => setShowAnalysisDrawer(!showAnalysisDrawer)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-['Bebas_Neue'] tracking-wider transition flex items-center gap-1 ${
                showAnalysisDrawer
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>TACTICAL ODDS</span>
            </button>

            <button
              id="kof-tab-tale"
              onClick={() => setShowFighterTale(!showFighterTale)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-['Bebas_Neue'] tracking-wider transition flex items-center gap-1 ${
                showFighterTale
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-bold'
                  : 'text-amber-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ScrollText className="h-3.5 w-3.5" />
              <span>FIGHTER TALE</span>
            </button>
          </nav>

          {/* Audio Controls & Replay */}
          <div className="flex items-center gap-2">
            {/* Japanese / English Voice Language Switch */}
            <button
              id="kof-lang-toggle"
              onClick={handleToggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-xs font-mono text-zinc-200 transition"
              title="Switch Voice Taunt Language"
            >
              <Globe className="h-3.5 w-3.5 text-amber-400" />
              <span>{lang === 'ja' ? 'VOICE: JA 🇯🇵' : 'VOICE: EN 🇺🇸'}</span>
            </button>

            {/* Mute Toggle */}
            <button
              id="kof-mute-toggle"
              onClick={handleToggleMute}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-zinc-300 hover:text-white transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Replay Sequence Button */}
            <button
              id="kof-replay-sequence-btn"
              onClick={() => playEntranceSequence(matchupIndex)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-400 text-xs font-bold text-amber-300 transition"
              title="Replay Fighter Entrance sequence"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">REPLAY ENTRANCE</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN KOF STAGE VIEW AREA */}
      <main className="relative flex-1 flex flex-col justify-center items-center w-full max-w-7xl mx-auto px-2 sm:px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'banners' ? (
            <motion.div
              key="view_banners"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35 }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <KOFTeamBanners
                team1={team1}
                team2={team2}
                activeMatchupIndex={matchupIndex}
                onSelectMatchup={handleSelectMatchup}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`view_fighter_${matchupIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full flex-1 flex flex-col justify-center"
            >
              <KOFFighterDuel
                fighter1={fighter1}
                fighter2={fighter2}
                fighter1Role={roleLabels[matchupIndex]?.title || 'POINT (先鋒)'}
                fighter2Role={roleLabels[matchupIndex]?.title || 'POINT (先鋒)'}
                lang={lang}
                isTaunting1={isTaunting1}
                isTaunting2={isTaunting2}
                onTriggerTaunt1={() => triggerFighterTaunt(1, fighter1)}
                onTriggerTaunt2={() => triggerFighterTaunt(2, fighter2)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC PROCEDURAL GEMINI 'FIGHTER TALE' NARRATION BOX */}
        <AnimatePresence>
          {showFighterTale && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="w-full"
            >
              <FighterTaleBox team1={team1} team2={team2} stage={stage} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI TACTICAL MATCHUP FORECAST DRAWER */}
        <AnimatePresence>
          {showAnalysisDrawer && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-20 z-30 w-full max-w-4xl px-4"
            >
              <div className="rounded-2xl border-2 border-purple-500/80 bg-zinc-950/95 p-4 sm:p-5 shadow-[0_0_35px_rgba(147,51,234,0.3)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="font-['Press_Start_2P'] text-[9px] text-amber-400 uppercase">
                      AI TACTICAL ANALYSIS & POWER ODDS
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">
                    KEY DECIDING FACTOR: <span className="text-purple-300 font-bold">{keyMatchup}</span>
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {analysisText}
                </p>

                {/* Win Probability Bar */}
                <div className="mt-3 pt-2 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-amber-400 font-bold">
                      {team1.name}: {winPrediction.team1}% (TCP {t1TCP.toLocaleString()})
                    </span>
                    <span className="text-purple-400 font-bold">
                      {team2.name}: {winPrediction.team2}% (TCP {t2TCP.toLocaleString()})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                      style={{ width: `${winPrediction.team1}%` }}
                    />
                    <div
                      className="bg-gradient-to-l from-purple-600 to-purple-400 transition-all duration-1000"
                      style={{ width: `${winPrediction.team2}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER ACTION BAR (START BATTLE & ADVANCE MATCHUP) */}
      <footer className="relative z-20 w-full bg-zinc-950/90 border-t border-amber-500/30 px-4 py-3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Quick Matchup Cycle Indicator */}
          <div className="flex items-center gap-2">
            <span className="font-['Press_Start_2P'] text-[8px] text-zinc-400 uppercase">
              LINEUP MATCHUP:
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => (
                <button
                  key={`quick_matchup_${idx}`}
                  onClick={() => handleSelectMatchup(idx)}
                  className={`px-2 py-1 rounded text-xs font-mono transition ${
                    matchupIndex === idx && viewMode !== 'banners'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  #{idx + 1} {idx === 0 ? 'Point' : idx === 1 ? 'Middle' : 'Anchor'}
                </button>
              ))}
            </div>
          </div>

          {/* START BATTLE CTA BUTTON */}
          <div className="flex items-center gap-3">
            <button
              id="kof-view-banners-btn"
              onClick={() => {
                clearSequenceTimers();
                setViewMode(viewMode === 'banners' ? 'point' : 'banners');
                if (viewMode !== 'banners') entranceAudio.playBannerClash();
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200 transition"
            >
              {viewMode === 'banners' ? 'VIEW FIGHTER INTRO' : 'VIEW TEAM BANNERS'}
            </button>

            <button
              id="kof-start-battle-btn"
              onClick={handleStartBattle}
              disabled={isStartingFight}
              className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-7 sm:px-10 py-3 text-base sm:text-lg font-black text-black tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition"
            >
              <Swords className="h-5 w-5" />
              <span className="font-['Cinzel'] font-black">
                {isStartingFight ? 'GET READY...' : 'ENGAGE FIGHT (READY... GO!)'}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* FLASHING "READY... GO!" FULL-SCREEN ARCADE OVERLAY */}
      <AnimatePresence>
        {isStartingFight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              key={readyGoText}
              initial={{ scale: 3, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.35, type: 'spring', bounce: 0.4 }}
              className="text-center"
            >
              <div className="font-['Press_Start_2P'] text-xs sm:text-sm text-amber-400 uppercase tracking-widest mb-2">
                ★ THE KING OF FIGHTERS: GRAND LINE ★
              </div>
              <h1 className="font-['Cinzel'] text-4xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-500 to-red-600 drop-shadow-[0_0_35px_rgba(239,68,68,0.9)] tracking-widest">
                {readyGoText}
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
