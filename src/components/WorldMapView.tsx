import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Globe,
  MapPin,
  Zap,
  Shield,
  Swords,
  Clock,
  AlertTriangle,
  Crown,
  Coins,
  Flame,
  Anchor,
  ChevronRight,
  ArrowLeft,
  Radio,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search,
  Award,
  Crosshair,
  EyeOff,
  Wind,
  Skull,
  Trophy,
} from 'lucide-react';
import { Team, StageInfo, MatchFormat, Fighter } from '../types/fighter';
import {
  GlobalEvent,
  EventSector,
  StageModifier,
  ExclusiveReward,
  EventCompletionRecord,
} from '../types/worldEvents';
import {
  INITIAL_GLOBAL_EVENTS,
  getEventCompletions,
  createEventOpponentTeam,
  formatTimeRemaining,
} from '../data/worldEvents';
import { BATTLE_STAGES } from '../data/stages';
import { getUserProfile } from '../utils/storage';
import { calculateTeamTCP } from '../utils/combatEngine';
import { soundManager } from '../utils/soundEffects';
import { FighterAvatar } from './FighterAvatar';
import { CHARACTERS } from '../data/characters';

interface WorldMapViewProps {
  onStartEventBattle: (
    team1: Team,
    team2: Team,
    stage: StageInfo,
    format: MatchFormat,
    event: GlobalEvent
  ) => void;
  onBackToMenu: () => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({
  onStartEventBattle,
  onBackToMenu,
}) => {
  const profile = getUserProfile();
  const [events, setEvents] = useState<GlobalEvent[]>(INITIAL_GLOBAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_GLOBAL_EVENTS[0].id);
  const [sectorFilter, setSectorFilter] = useState<EventSector>('all');
  const [completions, setCompletions] = useState<Record<string, EventCompletionRecord>>(() =>
    getEventCompletions()
  );
  const [timeTicker, setTimeTicker] = useState<number>(Date.now());
  const [selectedMatchFormat, setSelectedMatchFormat] = useState<MatchFormat>('3v3_kof');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number>(0);

  // Matchmaking Radar Modal State
  const [isQueueing, setIsQueueing] = useState<boolean>(false);
  const [queueElapsed, setQueueElapsed] = useState<number>(0);
  const [queueStatusText, setQueueStatusText] = useState<string>('Scanning sector frequencies...');
  const [matchedEventRival, setMatchedEventRival] = useState<{
    team: Team;
    captain: string;
    tcp: number;
  } | null>(null);

  // Periodic clock update for countdown timers
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update completions on load
  useEffect(() => {
    setCompletions(getEventCompletions());
  }, []);

  // Filter events based on active sector tab
  const filteredEvents = useMemo(() => {
    if (sectorFilter === 'all') return events;
    return events.filter((evt) => evt.sector === sectorFilter);
  }, [events, sectorFilter]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  // Resolve player team from saved teams or default
  const playerTeams: Team[] = useMemo(() => {
    if (profile.savedTeams && profile.savedTeams.length > 0) {
      return profile.savedTeams;
    }
    return [
      {
        id: 'user_team_default',
        name: profile.crewName,
        bannerColor: '#ef4444',
        crestEmoji: profile.flagIcon || '👒',
        fighters: [CHARACTERS[0], CHARACTERS[1], CHARACTERS[2]],
      },
    ];
  }, [profile]);

  const activePlayerTeam = playerTeams[selectedTeamIndex] || playerTeams[0];
  const playerTCP = calculateTeamTCP(activePlayerTeam.fighters);

  // Queue simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isQueueing && !matchedEventRival) {
      interval = setInterval(() => {
        setQueueElapsed((prev) => {
          const next = prev + 1;
          if (next === 1) {
            setQueueStatusText('Intercepting Marine & Emperor transponder chatter...');
          } else if (next === 2) {
            setQueueStatusText(`Matching with sector fleet at ${selectedEvent.locationName}...`);
          } else if (next >= 3) {
            // Find rival!
            const rivalTeam = createEventOpponentTeam(selectedEvent);
            const rivalTCP = calculateTeamTCP(rivalTeam.fighters);
            setMatchedEventRival({
              team: rivalTeam,
              captain: selectedEvent.opponentTeamPreset.captainName,
              tcp: rivalTCP,
            });
            soundManager.playSuperCharge();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQueueing, matchedEventRival, selectedEvent]);

  const handleStartQueue = () => {
    setIsQueueing(true);
    setQueueElapsed(0);
    setMatchedEventRival(null);
    setQueueStatusText('Synchronizing Log Pose with Event Coordinates...');
    soundManager.playUiConfirm();
  };

  const handleCancelQueue = () => {
    setIsQueueing(false);
    setMatchedEventRival(null);
    setQueueElapsed(0);
  };

  const handleDeployToBattle = () => {
    if (!matchedEventRival) return;
    
    // Resolve matching stage
    const matchedStage =
      BATTLE_STAGES.find((s) => s.id === selectedEvent.stageId) || BATTLE_STAGES[0];

    // Enrich stage with event details
    const eventEnrichedStage: StageInfo = {
      ...matchedStage,
      eventTitle: selectedEvent.title,
      eventModifiers: selectedEvent.modifiers.map((m) => m.name),
    };

    onStartEventBattle(
      activePlayerTeam,
      matchedEventRival.team,
      eventEnrichedStage,
      selectedMatchFormat,
      selectedEvent
    );
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* ─── TOP NAUTICAL COMMAND HEADER ──────────────────────────────────────────────── */}
      <header className="relative z-20 flex flex-wrap items-center justify-between border-b border-zinc-800/90 bg-zinc-950/95 px-4 sm:px-6 py-2.5 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playUiCancel();
              onBackToMenu();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-900/90 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-amber-400 hover:text-white transition shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-amber-400" />
            <span>ROSTER</span>
          </button>

          <div className="h-5 w-[1px] bg-zinc-800" />

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-blue-500/20 text-amber-300 shadow-inner">
              <Compass className="h-5 w-5 animate-[spin_20s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Cinzel'] text-sm sm:text-base font-black tracking-wider text-white">
                  GRAND LINE <span className="text-amber-400">WORLD MAP</span>
                </h1>
                <span className="rounded border border-red-500/50 bg-red-950/50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-red-300 animate-pulse">
                  LIVE EVENTS ACTIVE
                </span>
              </div>
              <p className="font-['Bebas_Neue'] text-xs tracking-widest text-zinc-400">
                TIME-LIMITED FLEET INVASIONS • SUMMITS • EXCLUSIVE REWARDS
              </p>
            </div>
          </div>
        </div>

        {/* Center Sector Tabs */}
        <div className="flex items-center gap-1.5 my-1 sm:my-0 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setSectorFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              sectorFilter === 'all'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ALL SECTORS ({events.length})
          </button>
          <button
            onClick={() => setSectorFilter('new_world')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              sectorFilter === 'new_world'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            NEW WORLD (新世界)
          </button>
          <button
            onClick={() => setSectorFilter('paradise')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              sectorFilter === 'paradise'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            PARADISE (楽園)
          </button>
          <button
            onClick={() => setSectorFilter('red_line')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              sectorFilter === 'red_line'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            RED LINE (聖地)
          </button>
        </div>

        {/* Player Status Overview */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col text-right font-mono text-xs">
            <span className="text-[10px] text-zinc-400">CAPTAIN BOUNTY</span>
            <span className="text-amber-400 font-bold">฿ {profile.bounty.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs">
            <span className="text-base">{profile.flagIcon || '👒'}</span>
            <span className="font-bold text-zinc-200 hidden sm:inline">{profile.crewName}</span>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT: NAUTICAL CHART (LEFT/CENTER) + EVENT COMMAND PANEL (RIGHT) ────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        {/* ─── NAUTICAL MAP CANVAS (7 COLUMNS) ───────────────────────────────────────────── */}
        <div className="lg:col-span-7 xl:col-span-8 relative flex flex-col bg-slate-950 overflow-hidden border-r border-zinc-800/80">
          {/* Top Map Subheader / Sea Conditions */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 px-3 py-1.5 rounded-xl shadow-lg">
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-300">
                TRANS-OCEANIC RADAR: <span className="text-emerald-400 font-bold">ONLINE</span>
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-[11px] font-mono text-zinc-400">
                LOG POSE: <span className="text-amber-400">LOCKED</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 pointer-events-auto bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>GRAND LINE STANDARD TIME: 19:24 UTC</span>
            </div>
          </div>

          {/* Interactive Cartography Chart */}
          <div className="relative flex-1 w-full h-full bg-[#050b14] overflow-hidden">
            {/* SVG Nautical Chart Grid, Ocean Currents & Continents */}
            <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="nautical-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="60" cy="0" r="1" fill="#334155" />
                </pattern>
                <linearGradient id="redline-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#b91c1c" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="grandline-current" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Background Grid */}
              <rect width="100%" height="100%" fill="url(#nautical-grid)" />

              {/* Calm Belt Top Strip */}
              <rect x="0" y="0" width="100%" height="10%" fill="#0a1526" opacity="0.8" />
              <text x="20" y="24" fill="#475569" fontSize="11" fontFamily="Cinzel" letterSpacing="4">
                CALM BELT (NORTH) • NEST OF THE SEA KINGS
              </text>

              {/* Calm Belt Bottom Strip */}
              <rect x="0" y="90%" width="100%" height="10%" fill="#0a1526" opacity="0.8" />
              <text x="20" y="96%" fill="#475569" fontSize="11" fontFamily="Cinzel" letterSpacing="4">
                CALM BELT (SOUTH) • WINDLESS WATERS
              </text>

              {/* Central Grand Line Ocean Flow */}
              <path
                d="M 0 350 Q 300 280 500 360 T 1100 260"
                fill="none"
                stroke="url(#grandline-current)"
                strokeWidth="48"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* THE RED LINE (Gigantic Red Continental Wall at X=50%) */}
              <g>
                <rect x="49%" y="0" width="2.5%" height="100%" fill="url(#redline-grad)" />
                <line x1="49%" y1="0" x2="49%" y2="100%" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />
                <line x1="51.5%" y1="0" x2="51.5%" y2="100%" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.7" />
                <text
                  x="50.2%"
                  y="50%"
                  fill="#fecaca"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Cinzel"
                  transform="rotate(90 500 300)"
                  letterSpacing="6"
                  opacity="0.7"
                >
                  RED LINE (赤い土の大陸)
                </text>
              </g>

              {/* Sector Watermarks */}
              <text x="14%" y="48%" fill="#1e293b" fontSize="38" fontWeight="bold" fontFamily="Cinzel" letterSpacing="8" opacity="0.4">
                PARADISE (楽園)
              </text>
              <text x="64%" y="48%" fill="#1e293b" fontSize="38" fontWeight="bold" fontFamily="Cinzel" letterSpacing="8" opacity="0.4">
                NEW WORLD (新世界)
              </text>

              {/* Reverse Mountain Entry */}
              <circle cx="8%" cy="50%" r="22" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="8%" y="54%" textAnchor="middle" fill="#60a5fa" fontSize="9" fontFamily="mono">
                REVERSE MTN
              </text>

              {/* Laugh Tale Horizon at far East */}
              <circle cx="94%" cy="30%" r="26" fill="#451a03" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              <text x="94%" y="32%" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="Cinzel">
                LAUGH TALE
              </text>
            </svg>

            {/* Compass Rose Accent in Lower Left */}
            <div className="absolute bottom-12 left-4 pointer-events-none opacity-40 hidden sm:block">
              <div className="relative h-24 w-24 rounded-full border border-amber-500/30 flex items-center justify-center">
                <span className="absolute top-1 text-[9px] font-bold text-amber-400 font-mono">N</span>
                <span className="absolute bottom-1 text-[9px] font-bold text-amber-400 font-mono">S</span>
                <span className="absolute left-1 text-[9px] font-bold text-amber-400 font-mono">W</span>
                <span className="absolute right-1 text-[9px] font-bold text-amber-400 font-mono">E</span>
                <div className="h-14 w-0.5 bg-gradient-to-t from-transparent via-amber-400 to-red-500 rotate-45" />
                <div className="h-14 w-0.5 bg-gradient-to-t from-transparent via-amber-400 to-blue-500 -rotate-45" />
              </div>
            </div>

            {/* EVENT MAP NODES / RADAR FLASHPOINTS */}
            {filteredEvents.map((evt) => {
              const isSelected = evt.id === selectedEvent.id;
              const completion = completions[evt.id];
              const { formatted, isExpired } = formatTimeRemaining(evt.expiresAt);

              return (
                <div
                  key={evt.id}
                  style={{
                    left: `${evt.coordinates.x}%`,
                    top: `${evt.coordinates.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  onClick={() => {
                    setSelectedEventId(evt.id);
                    soundManager.playUiSelect();
                  }}
                >
                  {/* Radar Pulse Rings */}
                  <div
                    className={`absolute -inset-4 rounded-full pointer-events-none animate-ping opacity-25`}
                    style={{ backgroundColor: evt.accentColor }}
                  />
                  {isSelected && (
                    <div
                      className="absolute -inset-7 rounded-full border-2 border-dashed pointer-events-none animate-[spin_10s_linear_infinite]"
                      style={{ borderColor: evt.accentColor }}
                    />
                  )}

                  {/* Core Node Icon Badge */}
                  <div
                    className={`relative flex items-center justify-center h-12 w-12 rounded-2xl border-2 transition-all duration-300 shadow-xl ${
                      isSelected
                        ? 'scale-125 ring-4 ring-white/30 shadow-2xl'
                        : 'scale-100 hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: isSelected ? evt.accentColor : '#090d16',
                      borderColor: evt.accentColor,
                      color: isSelected ? '#000000' : '#ffffff',
                    }}
                  >
                    <span className="text-xl">{evt.iconEmoji}</span>

                    {/* Threat Level Badge */}
                    <span
                      className="absolute -top-2 -right-2 rounded px-1 py-0.2 font-mono text-[9px] font-black uppercase text-white shadow-md"
                      style={{ backgroundColor: evt.threatColor }}
                    >
                      {evt.threatLevel}
                    </span>

                    {/* Cleared Star Badge */}
                    {completion?.rewardsClaimed && (
                      <span className="absolute -bottom-1 -left-1 rounded-full bg-amber-400 text-black p-0.5 shadow-md">
                        <CheckCircle2 className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  {/* Label Tooltip Under Node */}
                  <div className="mt-2 flex flex-col items-center">
                    <div
                      className={`px-2.5 py-0.5 rounded-lg border backdrop-blur-md transition-all shadow-lg text-center whitespace-nowrap ${
                        isSelected
                          ? 'bg-zinc-900 border-amber-400 text-amber-300 font-bold scale-105'
                          : 'bg-zinc-950/80 border-zinc-800 text-zinc-300 group-hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-[11px] font-['Cinzel'] tracking-wide block">
                        {evt.title.split(':')[0]}
                      </span>
                      <div className="flex items-center justify-center gap-1 font-mono text-[9px] text-zinc-400">
                        <Clock className="h-2.5 w-2.5 text-amber-400" />
                        <span className={isExpired ? 'text-red-400' : 'text-amber-400'}>
                          {formatted}
                        </span>
                        <span>•</span>
                        <span className="text-zinc-400">{evt.activeQueues} queued</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Map Legend */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/90 px-4 py-2 text-xs text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                THREAT RANKS:
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-cyan-400" /> S
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-yellow-400" /> SS
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-red-500" /> CALAMITY
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full bg-purple-500" /> YONKO-CLASS
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
              <span>ACTIVE FLASHPOINTS:</span>
              <span className="text-amber-400 font-bold">{events.length}</span>
            </div>
          </div>
        </div>

        {/* ─── EVENT COMMAND DISPATCH DRAWER (5 COLUMNS) ────────────────────────────────── */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-zinc-950 overflow-y-auto border-t lg:border-t-0 border-zinc-800 p-4 sm:p-5">
          {/* Header Card */}
          <div
            className={`rounded-2xl border p-4 shadow-xl bg-gradient-to-br ${selectedEvent.bannerGradient} transition-all`}
            style={{ borderColor: `${selectedEvent.accentColor}60` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="rounded-md px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white shadow"
                style={{ backgroundColor: selectedEvent.threatColor }}
              >
                {selectedEvent.threatLevel} THREAT LEVEL
              </span>
              <div className="flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 font-mono text-xs text-amber-300 border border-amber-500/30">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>{formatTimeRemaining(selectedEvent.expiresAt).formatted}</span>
              </div>
            </div>

            <h2 className="font-['Cinzel'] text-lg sm:text-xl font-black text-white leading-tight">
              {selectedEvent.title}
            </h2>
            <p className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-300/90 mt-0.5">
              {selectedEvent.japaneseTitle}
            </p>

            <div className="mt-2.5 flex items-center gap-2 font-mono text-xs text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <span>{selectedEvent.locationName}</span>
            </div>

            {/* Transponder Snail Transmission */}
            <div className="mt-3 rounded-xl border border-zinc-700/60 bg-black/40 p-3 backdrop-blur-sm">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🐌</span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    DEN DEN MUSHI INTERCEPT
                  </span>
                  <p className="text-xs text-zinc-200 italic mt-0.5 leading-relaxed">
                    "{selectedEvent.denDenMushiCall}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Situation Briefing */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              TACTICAL SITUATION BRIEFING
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">{selectedEvent.briefing}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 font-mono">HOSTILE FACTIONS:</span>
              {selectedEvent.hostileFactions.map((f, i) => (
                <span
                  key={i}
                  className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-200 border border-zinc-700"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Active Stage Modifiers */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                UNIQUE STAGE MODIFIERS
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {selectedEvent.modifiers?.length || 0} ACTIVE RULES
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {selectedEvent.modifiers?.map((mod) => (
                <div
                  key={mod.id}
                  className={`rounded-xl border p-2.5 transition ${mod.badgeBg} ${mod.badgeBorder}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/40 text-sm">
                        {mod.mechanic === 'fire_artillery' && '🎯'}
                        {mod.mechanic === 'super_charge' && '⚡'}
                        {mod.mechanic === 'bounty_boost' && '💰'}
                        {mod.mechanic === 'low_hp_desperation' && '🔥'}
                        {mod.mechanic === 'devil_fruit_dampener' && '🌑'}
                        {mod.mechanic === 'speed_overdrive' && '💨'}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{mod.name}</h4>
                        <span className="text-[9px] text-zinc-400 font-mono">{mod.nameJP}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 border ${mod.badgeBorder} ${mod.badgeText}`}
                    >
                      +{Math.round((mod.valueMultiplier - 1) * 100)}% EFFECT
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-300 leading-snug">
                    {mod.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusive Rewards Showcase */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                EXCLUSIVE EVENT REWARDS
              </span>
              {completions[selectedEvent.id]?.rewardsClaimed && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3 w-3" />
                  CLEARED ({completions[selectedEvent.id]?.clearCount}x)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {selectedEvent.rewards.map((rwd) => (
                <div
                  key={rwd.id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 ${
                    rwd.rarity === 'mythic'
                      ? 'border-purple-500/50 bg-purple-950/20'
                      : rwd.rarity === 'legendary'
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-cyan-500/40 bg-cyan-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{rwd.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{rwd.name}</span>
                        <span
                          className={`rounded px-1 text-[8px] font-mono uppercase font-black ${
                            rwd.rarity === 'mythic'
                              ? 'bg-purple-900 text-purple-300'
                              : rwd.rarity === 'legendary'
                              ? 'bg-amber-900 text-amber-300'
                              : 'bg-cyan-900 text-cyan-300'
                          }`}
                        >
                          {rwd.rarity}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400">{rwd.description}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-amber-400 whitespace-nowrap pl-2">
                    {rwd.type === 'bounty' ? `+฿ ${Number(rwd.value).toLocaleString()}` : rwd.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Readiness & Queue Action */}
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  DEPLOYMENT SQUAD
                </span>
                <span className="text-xs font-bold text-white">{activePlayerTeam.name}</span>
              </div>

              {/* Saved Team Switcher */}
              {playerTeams.length > 1 && (
                <div className="flex items-center gap-1">
                  {playerTeams.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTeamIndex(idx)}
                      className={`h-6 w-6 rounded font-mono text-[10px] font-bold transition ${
                        selectedTeamIndex === idx
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      T{idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fighter Avatars Preview */}
            <div className="flex items-center gap-2">
              {activePlayerTeam.fighters.slice(0, 3).map((fighter, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center rounded-lg bg-zinc-950 p-1.5 border border-zinc-800 text-center"
                >
                  <FighterAvatar
                    avatarUrl={fighter.avatarUrl}
                    avatarIcon={fighter.avatarIcon}
                    name={fighter.name}
                    size="sm"
                    borderColor={fighter.themeColor}
                  />
                  <span className="mt-1 text-[10px] font-['Bebas_Neue'] text-zinc-200 truncate w-full">
                    {fighter.shortName || fighter.name}
                  </span>
                </div>
              ))}
            </div>

            {/* TCP vs Recommended TCP comparison */}
            <div className="flex items-center justify-between font-mono text-xs bg-zinc-950/60 p-2 rounded-lg border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 block">SQUAD POWER:</span>
                <span className="text-amber-300 font-bold">{playerTCP.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block">RECOMMENDED:</span>
                <span
                  className={`font-bold ${
                    playerTCP >= selectedEvent.recommendedTCP
                      ? 'text-emerald-400'
                      : 'text-orange-400'
                  }`}
                >
                  {selectedEvent.recommendedTCP.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Match Format Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMatchFormat('3v3_kof')}
                className={`flex-1 py-1 rounded text-xs font-bold transition ${
                  selectedMatchFormat === '3v3_kof'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                3v3 KOF SQUAD
              </button>
              <button
                onClick={() => setSelectedMatchFormat('1v1_duel')}
                className={`flex-1 py-1 rounded text-xs font-bold transition ${
                  selectedMatchFormat === '1v1_duel'
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                1v1 CAPTAIN DUEL
              </button>
            </div>

            {/* DEPLOY BUTTON */}
            <button
              onClick={handleStartQueue}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-sm font-black text-black tracking-wider shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition"
            >
              <Swords className="h-4 w-4" />
              <span>ENTER EVENT MATCHMAKING QUEUE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── MATCHMAKING RADAR QUEUE MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isQueueing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl overflow-hidden"
            >
              {/* Radar Grid Scanning Circle */}
              <div className="relative mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-2 border-emerald-500/40 bg-zinc-950 shadow-inner overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
                <div className="absolute inset-4 rounded-full border border-emerald-500/20" />
                <div className="absolute inset-8 rounded-full border border-emerald-500/20" />
                <div className="absolute h-full w-[1px] bg-emerald-500/20" />
                <div className="absolute w-full h-[1px] bg-emerald-500/20" />

                {/* Sweeping Radar Needle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-emerald-500/20 to-emerald-400/40 animate-[spin_2s_linear_infinite]" />

                <Crosshair className="relative z-10 h-10 w-10 text-emerald-400 animate-pulse" />
              </div>

              {!matchedEventRival ? (
                /* Scanning Queue State */
                <div className="text-center">
                  <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/40 animate-pulse">
                    TIME-LIMITED EVENT MATCHMAKING
                  </span>

                  <h3 className="font-['Cinzel'] text-xl font-bold text-white mt-2">
                    Searching for Event Adversaries...
                  </h3>
                  <p className="font-mono text-xs text-zinc-400 mt-1">{queueStatusText}</p>

                  <div className="mt-4 flex items-center justify-center gap-3 font-mono text-xs text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>QUEUE TIME: {queueElapsed}s</span>
                    <span>•</span>
                    <span className="text-zinc-400">{selectedEvent.activeQueues} Captains in Sector</span>
                  </div>

                  <button
                    onClick={handleCancelQueue}
                    className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                  >
                    CANCEL MATCHMAKING
                  </button>
                </div>
              ) : (
                /* Rival Found State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-['Bebas_Neue'] text-lg">
                      <Sparkles className="h-4 w-4" />
                      <span>EVENT RIVAL INTERCEPTED!</span>
                    </div>
                    <span className="rounded bg-red-950 px-2 py-0.5 font-mono text-xs text-red-300 border border-red-500/40 font-bold">
                      {selectedEvent.threatLevel} CLASS
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-['Cinzel'] text-lg font-bold text-white">
                        {matchedEventRival.team.name}
                      </h4>
                      <p className="font-mono text-xs text-zinc-400">
                        Flagship: {matchedEventRival.captain}
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-zinc-400">RIVAL TCP:</span>
                      <p className="text-purple-300 font-bold text-sm">
                        {matchedEventRival.tcp.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Rival Lineup */}
                  <div className="mt-4 flex items-center gap-2">
                    {matchedEventRival.team.fighters.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center rounded-xl bg-zinc-950/80 border border-zinc-800 p-2 text-center"
                      >
                        <FighterAvatar
                          avatarUrl={f.avatarUrl}
                          avatarIcon={f.avatarIcon}
                          name={f.name}
                          size="sm"
                          borderColor={f.themeColor}
                        />
                        <span className="mt-1 font-['Bebas_Neue'] text-xs text-zinc-200 truncate w-full">
                          {f.shortName || f.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Active Event Rules reminder */}
                  <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-200">
                    <span className="font-bold block text-[10px] uppercase text-amber-400">
                      ACTIVE MODIFIERS ON COMMENCEMENT:
                    </span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px] text-zinc-300">
                      {selectedEvent.modifiers.map((m) => (
                        <li key={m.id}>
                          <span className="font-bold text-amber-300">{m.name}</span>: {m.description}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deploy Action */}
                  <div className="mt-6 flex items-center gap-3">
                    <button
                      onClick={handleCancelQueue}
                      className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
                    >
                      RETREAT
                    </button>
                    <button
                      onClick={handleDeployToBattle}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-sm font-black text-black tracking-wider shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition"
                    >
                      <Swords className="h-4 w-4" />
                      <span>COMMENCE EVENT DUEL</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
