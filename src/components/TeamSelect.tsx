import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  User,
  Users,
  ChevronRight,
  RotateCcw,
  Sparkles,
  MapPin,
  Dumbbell,
  Compass,
  Globe,
  Cloud,
  Settings,
  CheckCircle,
  Lock,
  Shirt,
} from 'lucide-react';
import { Fighter, Team, StageInfo, MatchFormat } from '../types/fighter';
import { CHARACTERS } from '../data/characters';
import { PREMADE_TEAMS } from '../data/premadeTeams';
import { BATTLE_STAGES } from '../data/stages';
import { calculateFighterTCP, calculateTeamTCP } from '../utils/combatEngine';
import { getUserProfile, decorateFighterWithCustomAura } from '../utils/storage';
import { FighterAvatar } from './FighterAvatar';
import { VictoryPoseModal } from './VictoryPoseModal';
import { SettingsModal } from './SettingsModal';
import { SkinSelectorModal } from './SkinSelectorModal';
import { PWAInstallButton } from './PWAInstallButton';
import { WorldEventRippleD3 } from './WorldEventRippleD3';
import { Trophy, Image as ImageIcon, BookOpen } from 'lucide-react';
import { useArcTheme, ArcTimeTheme } from '../utils/arcTheme';
import { GameDocumentationModal } from './GameDocumentationModal';

interface TeamSelectProps {
  onStartMatch: (team1: Team, team2: Team, stage: StageInfo, format: MatchFormat, weather?: string) => void;
  onOpenCustomCreator: () => void;
  onOpenMatchmaking: () => void;
  onOpenWorldMap: () => void;
  onOpenLeaderboards: () => void;
  onOpenProfile: () => void;
  onOpenEncyclopedia: () => void;
  onOpenGallery: () => void;
  onStartTraining: (player: Fighter, dummy: Fighter) => void;
  onTeamConfirmed?: (team: Team) => void;
}

export const TeamSelect: React.FC<TeamSelectProps> = ({
  onStartMatch,
  onOpenCustomCreator,
  onOpenMatchmaking,
  onOpenWorldMap,
  onOpenLeaderboards,
  onOpenProfile,
  onOpenEncyclopedia,
  onOpenGallery,
  onStartTraining,
  onTeamConfirmed,
}) => {
  const { themeId, theme, isAuto, selectTheme, setAutoMode } = useArcTheme();
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(() => {
    try {
      const saved = localStorage.getItem('op_kof_match_format_v1');
      if (saved === '3v3_kof' || saved === '1v1_duel') {
        return saved as MatchFormat;
      }
    } catch {}
    return '3v3_kof';
  });

  const handleSetMatchFormat = (format: MatchFormat) => {
    setMatchFormat(format);
    try {
      localStorage.setItem('op_kof_match_format_v1', format);
    } catch {}
  };
  const [selectedWeather, setSelectedWeather] = useState<string>('auto');
  const [isVictoryPoseOpen, setIsVictoryPoseOpen] = useState<boolean>(false);
  const [isTeam1Confirmed, setIsTeam1Confirmed] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSkinModalOpen, setIsSkinModalOpen] = useState<boolean>(false);
  const [isDocOpen, setIsDocOpen] = useState<boolean>(false);
  const [selectedPoseFighter, setSelectedPoseFighter] = useState<Fighter>(CHARACTERS[0]);
  const userProfile = getUserProfile();

  const handleSelectSkin = (skinId: string) => {
    const skins = inspectedFighter.skins || [];
    const selectedSkin = skins.find((s) => s.id === skinId) || skins[0];
    if (!selectedSkin) return;

    const updatedFighter: Fighter = {
      ...inspectedFighter,
      activeSkinId: skinId,
      avatarUrl: selectedSkin.avatarUrl || inspectedFighter.avatarUrl,
      themeColor: selectedSkin.themeColor || inspectedFighter.themeColor,
      secondaryColor: selectedSkin.secondaryColor || inspectedFighter.secondaryColor,
    };

    setInspectedFighter(updatedFighter);

    setT1Fighters((prev) =>
      prev.map((f) => (f.id === updatedFighter.id || f.name === updatedFighter.name ? updatedFighter : f))
    );
  };

  // Combine standard roster + custom fighters
  const allAvailableFighters = [...CHARACTERS, ...userProfile.customFighters].map(decorateFighterWithCustomAura);

  // Team 1 Selection (User)
  const [t1Fighters, setT1Fighters] = useState<Fighter[]>([
    allAvailableFighters[0], // Luffy
    allAvailableFighters[1], // Zoro
    allAvailableFighters[2], // Shanks
  ]);

  // Team 2 Selection (Opponent / CPU)
  const [t2Fighters, setT2Fighters] = useState<Fighter[]>([
    allAvailableFighters[3], // Kaido
    allAvailableFighters[5], // Blackbeard
    allAvailableFighters[6], // Akainu
  ]);

  const [selectedStage, setSelectedStage] = useState<StageInfo>(BATTLE_STAGES[0]);
  const [inspectedFighter, setInspectedFighter] = useState<Fighter>(allAvailableFighters[0]);
  const [selectingSlot, setSelectingSlot] = useState<{ team: 1 | 2; slot: number } | null>({
    team: 1,
    slot: 0,
  });

  const handlePickFighter = (fighter: Fighter) => {
    setInspectedFighter(fighter);
    if (!selectingSlot) return;

    if (selectingSlot.team === 1) {
      setT1Fighters((prev) => {
        const next = [...prev];
        next[selectingSlot.slot] = fighter;
        return next;
      });
      // Advance to next slot if 3v3
      if (matchFormat === '3v3_kof' && selectingSlot.slot < 2) {
        setSelectingSlot({ team: 1, slot: selectingSlot.slot + 1 });
      }
    } else {
      setT2Fighters((prev) => {
        const next = [...prev];
        next[selectingSlot.slot] = fighter;
        return next;
      });
      if (matchFormat === '3v3_kof' && selectingSlot.slot < 2) {
        setSelectingSlot({ team: 2, slot: selectingSlot.slot + 1 });
      }
    }
  };

  const handleApplyPremadeTeam = (team: Team, targetTeam: 1 | 2) => {
    if (targetTeam === 1) {
      setT1Fighters(team.fighters);
      setIsTeam1Confirmed(true);
      onTeamConfirmed?.(team);
    } else {
      setT2Fighters(team.fighters);
    }
  };

  const t1EffectiveFighters = matchFormat === '1v1_duel' ? [t1Fighters[0]] : t1Fighters;
  const t2EffectiveFighters = matchFormat === '1v1_duel' ? [t2Fighters[0]] : t2Fighters;

  const t1TCP = calculateTeamTCP(t1EffectiveFighters);
  const t2TCP = calculateTeamTCP(t2EffectiveFighters);

  const handleConfirmTeamSelection = () => {
    const team1: Team = {
      id: 'player_team_1',
      name: `${userProfile.crewName} (${userProfile.username})`,
      fighters: t1EffectiveFighters,
      bannerColor: '#ef4444',
      crestEmoji: userProfile.flagIcon || '👒',
    };
    setIsTeam1Confirmed(true);
    onTeamConfirmed?.(team1);
  };

  const handleLaunchBattle = () => {
    const team1: Team = {
      id: 'player_team_1',
      name: `${userProfile.crewName} (${userProfile.username})`,
      fighters: t1EffectiveFighters,
      bannerColor: '#ef4444',
      crestEmoji: userProfile.flagIcon || '👒',
    };

    const team2: Team = {
      id: 'cpu_team_2',
      name: 'Grand Line Challenger Alliance',
      fighters: t2EffectiveFighters,
      bannerColor: '#7c3aed',
      crestEmoji: '👑',
    };

    setIsTeam1Confirmed(true);
    onTeamConfirmed?.(team1);
    onStartMatch(team1, team2, selectedStage, matchFormat, selectedWeather);
  };

  const handleQuickPlay = () => {
    const randomStage = BATTLE_STAGES[Math.floor(Math.random() * BATTLE_STAGES.length)];
    const shuffled = [...allAvailableFighters].sort(() => 0.5 - Math.random());
    const t1Random = shuffled.slice(0, 3);
    const remaining = allAvailableFighters.filter((f) => !t1Random.some((t1f) => t1f.id === f.id));
    const t2Random = remaining.length >= 3 
      ? remaining.sort(() => 0.5 - Math.random()).slice(0, 3) 
      : [...allAvailableFighters].sort(() => 0.5 - Math.random()).slice(0, 3);

    const team1: Team = {
      id: 'player_team_1_quick',
      name: `${userProfile.crewName || 'Supernova'} (Quick Play)`,
      fighters: t1Random,
      bannerColor: '#06b6d4',
      crestEmoji: '⚡',
    };

    const team2: Team = {
      id: 'cpu_team_2_quick',
      name: 'Grand Line Challenger Alliance',
      fighters: t2Random,
      bannerColor: '#f43f5e',
      crestEmoji: '🔥',
    };

    const formats: MatchFormat[] = ['3v3_kof', '1v1_duel'];
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];

    setIsTeam1Confirmed(true);
    onTeamConfirmed?.(team1);
    onStartMatch(team1, team2, randomStage, randomFormat, 'auto');
  };

  const handleLaunchTraining = () => {
    const player = t1Fighters[0] || allAvailableFighters[0];
    const dummy = t2Fighters[0] || allAvailableFighters[3];
    onStartTraining(player, dummy);
  };

  return (
    <div className={`relative flex h-full w-full bg-gradient-to-br ${theme.bgGradient} text-zinc-100 overflow-hidden font-sans transition-all duration-700`}>
      {/* ─── LEFT SIDEBAR NAVIGATION MENU ────────────────────────────────────────── */}
      <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/95 p-4 flex flex-col justify-between hidden xl:flex backdrop-blur-md shadow-2xl z-20">
        <div className="flex flex-col gap-6">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-red-500/20 text-2xl shadow-lg">
              ☠️
            </div>
            <div>
              <h1 className="font-['Cinzel'] text-sm font-black tracking-wider text-white">
                ONE PIECE <span className="text-amber-400">KOF ARCADE</span>
              </h1>
              <p className="font-['Bebas_Neue'] text-[10px] tracking-widest text-zinc-400">
                GRAND LINE FIGHTER EDITION
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={onOpenWorldMap}
              className="flex items-center gap-2.5 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/50 to-amber-950/40 px-3 py-2.5 text-xs font-bold text-amber-300 hover:border-amber-400 hover:text-white transition shadow-md"
            >
              <Compass className="h-4 w-4 text-amber-400 animate-[spin_12s_linear_infinite]" />
              <span className="flex-1 text-left tracking-wide">WORLD MAP</span>
              <span className="rounded bg-red-600 px-1.5 py-0.5 font-mono text-[9px] text-white font-bold animate-pulse">
                NEW
              </span>
            </button>

            <button
              onClick={onOpenMatchmaking}
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition"
            >
              <Zap className="h-4 w-4" />
              <span className="flex-1 text-left tracking-wide">MATCHMAKING</span>
            </button>

            <button
              onClick={onOpenLeaderboards}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-xs font-medium text-zinc-200 hover:border-zinc-600 transition"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="flex-1 text-left">LEADERBOARDS</span>
            </button>

            <button
              onClick={onOpenCustomCreator}
              className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="flex-1 text-left">CUSTOM FIGHTER</span>
            </button>

            <button
              onClick={() => setIsDocOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-amber-500/50 bg-amber-950/30 px-3 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-900/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition"
            >
              <BookOpen className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="flex-1 text-left">COMO FUNCIONA: GUIA</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">CORE</span>
            </button>

            <button
              onClick={onOpenEncyclopedia}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-xs font-bold text-zinc-200 hover:border-amber-500/40 hover:text-amber-300 transition"
            >
              <Swords className="h-4 w-4 text-amber-400" />
              <span className="flex-1 text-left">CODEX & COMBOS</span>
            </button>

            <button
              onClick={onOpenGallery}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-xs font-bold text-zinc-200 hover:border-amber-500/40 hover:text-amber-300 transition"
            >
              <ImageIcon className="h-4 w-4 text-amber-400" />
              <span className="flex-1 text-left">CONCEPT ART GALLERY</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-xs font-bold text-zinc-200 hover:border-amber-500/40 hover:text-amber-300 transition"
            >
              <Settings className="h-4 w-4 text-amber-400" />
              <span className="flex-1 text-left">CONTROLS & SETTINGS</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer (Profile & Season Time Arc) */}
        <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-700 bg-zinc-900/90 p-2.5 text-left hover:border-amber-400 transition"
          >
            <span className="text-xl">{userProfile.flagIcon}</span>
            <div className="flex-1 truncate">
              <p className="font-['Bebas_Neue'] text-xs text-white truncate">{userProfile.username}</p>
              <p className="font-mono text-[10px] text-amber-400">฿ {userProfile.bounty.toLocaleString()}</p>
            </div>
          </button>

          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs">
            <span className="text-[10px] font-bold text-zinc-400 font-mono">TIME ARC:</span>
            <select
              value={isAuto ? 'auto' : themeId}
              onChange={(e) => {
                if (e.target.value === 'auto') {
                  setAutoMode();
                } else {
                  selectTheme(e.target.value as ArcTimeTheme);
                }
              }}
              className="bg-transparent text-amber-500 font-bold focus:outline-none cursor-pointer appearance-none text-right"
            >
              <option value="auto" className="bg-zinc-900 text-zinc-100">🔄 Auto ({theme.emoji})</option>
              <option value="east_blue_dawn" className="bg-zinc-900 text-zinc-100">🌊 East Blue</option>
              <option value="alabasta_noon" className="bg-zinc-900 text-zinc-100">☀️ Alabasta</option>
              <option value="wano_dusk" className="bg-zinc-900 text-zinc-100">🌸 Wano</option>
              <option value="thriller_bark_night" className="bg-zinc-900 text-zinc-100">🦇 Thriller</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top Header for Mobile / Compact view */}
        <header className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-md xl:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">☠️</span>
            <h1 className="font-['Cinzel'] text-sm font-bold text-white">GRAND LINE FIGHTER</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDocOpen(true)}
              className="rounded bg-amber-950/60 border border-amber-500/50 px-2 py-1 text-[10px] font-bold text-amber-300"
            >
              📖 GUIA
            </button>
            <button
              onClick={onOpenWorldMap}
              className="rounded bg-red-950/60 border border-red-500/50 px-2 py-1 text-[10px] font-bold text-amber-300"
            >
              WORLD MAP
            </button>
            <button
              onClick={onOpenProfile}
              className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-[10px] font-bold text-amber-400"
            >
              {userProfile.username}
            </button>
          </div>
        </header>

      {/* ─── MAIN ROSTER & TEAM FORMATION SECTION ───────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: TEAM 1 & TEAM 2 FORMATION SLOTS (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Match Format Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-zinc-900/90 border border-zinc-800 p-1.5">
            <button
              onClick={() => handleSetMatchFormat('3v3_kof')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
                matchFormat === '3v3_kof'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>3v3 KOF TEAM</span>
            </button>

            <button
              onClick={() => handleSetMatchFormat('1v1_duel')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
                matchFormat === '1v1_duel'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>1v1 SINGLES</span>
            </button>
          </div>

          {/* TEAM 1 (PLAYER SQUAD) */}
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{userProfile.flagIcon}</span>
                <div>
                  <span className="font-['Bebas_Neue'] text-sm tracking-wider text-amber-400">
                    PLAYER 1: {userProfile.crewName}
                  </span>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    COMBAT POWER: <span className="text-amber-300 font-bold">{t1TCP.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Confirm Team Selection / Predictive Preload Trigger */}
              <button
                type="button"
                id="confirm-team-selection-btn"
                onClick={handleConfirmTeamSelection}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md ${
                  isTeam1Confirmed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 active:scale-95'
                }`}
                title="Confirm and lock in team selection to trigger predictive media preloading for the next opponent"
              >
                {isTeam1Confirmed ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span>LOCKED IN</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>CONFIRM CREW</span>
                  </>
                )}
              </button>
            </div>

            {/* Fighter Slots */}
            <div className={`grid ${matchFormat === '3v3_kof' ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
              {(matchFormat === '3v3_kof' ? [0, 1, 2] : [0])?.map((slotIdx) => {
                const fighter = t1Fighters[slotIdx] || allAvailableFighters[0];
                const isCurrentSlot = selectingSlot?.team === 1 && selectingSlot?.slot === slotIdx;
                const slotLabel = slotIdx === 0 ? 'POINT (1ST)' : slotIdx === 1 ? 'MIDDLE (2ND)' : 'ANCHOR (3RD)';

                return (
                  <button
                    key={slotIdx}
                    onClick={() => {
                      setSelectingSlot({ team: 1, slot: slotIdx });
                      setInspectedFighter(fighter);
                    }}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isCurrentSlot
                        ? 'border-amber-400 bg-amber-950/40 ring-2 ring-amber-500/40 scale-105'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="mb-1">
                      <FighterAvatar
                        avatarUrl={fighter.avatarUrl}
                        avatarIcon={fighter.avatarIcon}
                        name={fighter.name}
                        size="sm"
                        borderColor={fighter.themeColor}
                      />
                    </div>
                    <span className="font-['Bebas_Neue'] text-xs text-zinc-100 truncate w-full">
                      {fighter.shortName || fighter.name.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[9px] text-amber-400/90">{slotLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TEAM 2 (OPPONENT / CPU SQUAD) */}
          <div className="rounded-xl border border-purple-500/40 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <span className="font-['Bebas_Neue'] text-sm tracking-wider text-purple-400">
                    PLAYER 2 (CPU): GRAND LINE TITANS
                  </span>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    COMBAT POWER: <span className="text-purple-300 font-bold">{t2TCP.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fighter Slots */}
            <div className={`grid ${matchFormat === '3v3_kof' ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
              {(matchFormat === '3v3_kof' ? [0, 1, 2] : [0])?.map((slotIdx) => {
                const fighter = t2Fighters[slotIdx] || allAvailableFighters[0];
                const isCurrentSlot = selectingSlot?.team === 2 && selectingSlot?.slot === slotIdx;
                const slotLabel = slotIdx === 0 ? 'POINT (1ST)' : slotIdx === 1 ? 'MIDDLE (2ND)' : 'ANCHOR (3RD)';

                return (
                  <button
                    key={slotIdx}
                    onClick={() => {
                      setSelectingSlot({ team: 2, slot: slotIdx });
                      setInspectedFighter(fighter);
                    }}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isCurrentSlot
                        ? 'border-purple-400 bg-purple-950/40 ring-2 ring-purple-500/40 scale-105'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="mb-1">
                      <FighterAvatar
                        avatarUrl={fighter.avatarUrl}
                        avatarIcon={fighter.avatarIcon}
                        name={fighter.name}
                        size="sm"
                        borderColor={fighter.themeColor}
                      />
                    </div>
                    <span className="font-['Bebas_Neue'] text-xs text-zinc-100 truncate w-full">
                      {fighter.shortName || fighter.name.split(' ')[0]}
                    </span>
                    <span className="font-mono text-[9px] text-purple-400/90">{slotLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PREMADE KOF PRESET SQUADS */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
            <span className="font-['Bebas_Neue'] text-xs tracking-wider text-zinc-400 block mb-2">
              QUICK KOF TEAM PRESETS
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PREMADE_TEAMS?.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleApplyPremadeTeam(team, selectingSlot?.team || 1)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:border-amber-500/40 text-left text-xs transition truncate"
                >
                  <span>{team.crestEmoji}</span>
                  <span className="truncate text-zinc-200">{team.name.split('Team ')[1] || team.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STAGE SELECTOR */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-['Bebas_Neue'] tracking-wider">SELECT BATTLE STAGE</span>
            </div>
            <select
              value={selectedStage.id}
              onChange={(e) => {
                const s = BATTLE_STAGES.find((st) => st.id === e.target.value);
                if (s) setSelectedStage(s);
              }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs font-semibold text-zinc-100 outline-none focus:border-amber-500 mb-2"
            >
              {BATTLE_STAGES?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Interactive D3 Sector World Map Beacon Radar */}
            <WorldEventRippleD3
              selectedStage={selectedStage}
              onSelectStage={(s) => setSelectedStage(s)}
            />
          </div>

          {/* WEATHER OVERRIDE TOGGLE */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
              <Cloud className="h-3.5 w-3.5 text-sky-400" />
              <span className="font-['Bebas_Neue'] tracking-wider">ENVIRONMENTAL OVERRIDE</span>
            </div>
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs font-semibold text-zinc-100 outline-none focus:border-sky-500"
            >
              <option value="auto">🌐 ADAPTIVE (MAP DEFAULT)</option>
              <option value="none">☀️ CLEAR SKIES</option>
              <option value="lightning">⛈️ HEAVY STORM</option>
              <option value="snow">❄️ DRUM ISLAND SNOW</option>
              <option value="cherry_blossoms">🌸 SAKURA DRIFT</option>
              <option value="maple_leaves">🍁 AUTUMN FALL</option>
              <option value="cyber_grid">💾 DIGITAL GRID</option>
              <option value="clouds">✨ GOLDEN DUST</option>
            </select>
          </div>
        </div>

        {/* CENTER COLUMN: FULL CHARACTER ROSTER GRID WITH LARGER CARDS (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-['Bebas_Neue'] text-base tracking-wider text-amber-400">
              GRAND LINE FIGHTER ROSTER ({allAvailableFighters?.length || 0})
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              SELECTING: {selectingSlot?.team === 1 ? 'TEAM 1' : 'TEAM 2'} SLOT {selectingSlot ? selectingSlot.slot + 1 : 1}
            </span>
          </div>

          {/* Larger Character Cards Grid (grid-cols-2 sm:grid-cols-3 for bigger photos & names) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto p-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            {allAvailableFighters?.map((fighter) => {
              const isInspected = inspectedFighter.id === fighter.id;
              const tcp = calculateFighterTCP(fighter);

              return (
                <button
                  key={fighter.id}
                  onClick={() => handlePickFighter(fighter)}
                  className={`group relative flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all shadow-lg ${
                    isInspected
                      ? 'border-amber-400 bg-amber-950/50 ring-4 ring-amber-500/40 scale-105'
                      : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-600 hover:scale-[1.03]'
                  }`}
                  style={{ borderColor: isInspected ? '#f59e0b' : fighter.themeColor + '50' }}
                >
                  <div className="my-1 transition-transform group-hover:scale-110">
                    <FighterAvatar
                      avatarUrl={fighter.avatarUrl}
                      avatarIcon={fighter.avatarIcon}
                      name={fighter.name}
                      size="lg"
                      borderColor={fighter.themeColor}
                    />
                  </div>
                  <div className="w-full mt-2">
                    <span className="font-['Bebas_Neue'] text-sm tracking-wide text-zinc-100 block truncate w-full">
                      {fighter.shortName || fighter.name}
                    </span>
                    <span className="font-mono text-[10px] text-amber-300 font-bold block">TCP {tcp.toLocaleString()}</span>
                  </div>
                  {fighter.isCustom && (
                    <span className="absolute top-2 right-2 rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-extrabold text-black uppercase shadow">
                      CUSTOM
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: INSPECTED FIGHTER ATTRIBUTE STATS & MOVES (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 shadow-xl">
            {/* Header with Title & Bounty */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <FighterAvatar
                  avatarUrl={inspectedFighter.avatarUrl}
                  avatarIcon={inspectedFighter.avatarIcon}
                  name={inspectedFighter.name}
                  size="lg"
                  borderColor={inspectedFighter.themeColor}
                />
                <div>
                  <h2 className="font-['Cinzel'] text-lg font-bold text-white">
                    {inspectedFighter.name}
                  </h2>
                  <p className="font-mono text-xs text-amber-400/90">{inspectedFighter.epithet}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    ฿ {inspectedFighter.bounty.toLocaleString()} Berries
                  </p>
                </div>
              </div>
            </div>

            {/* Skin / Costume Selector Button */}
            <button
              onClick={() => setIsSkinModalOpen(true)}
              className="mt-3 flex items-center justify-center gap-2 w-full rounded-xl border border-amber-500/50 bg-amber-500/15 py-2 px-3 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition shadow-md"
            >
              <Shirt className="h-4 w-4" />
              <span>CUSTOMIZE COSTUME / SKIN ({inspectedFighter.skins?.length || 1})</span>
            </button>

            {/* Core Combat Attributes */}
            <div className="grid grid-cols-4 gap-2 my-3 text-center">
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-1.5">
                <span className="text-[9px] font-mono text-zinc-400">HP</span>
                <p className="font-bold text-emerald-400 text-xs">{inspectedFighter.stats.maxHp}</p>
              </div>
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-1.5">
                <span className="text-[9px] font-mono text-zinc-400">ATK</span>
                <p className="font-bold text-red-400 text-xs">{inspectedFighter.stats.attack}</p>
              </div>
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-1.5">
                <span className="text-[9px] font-mono text-zinc-400">DEF</span>
                <p className="font-bold text-blue-400 text-xs">{inspectedFighter.stats.defense}</p>
              </div>
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800 p-1.5">
                <span className="text-[9px] font-mono text-zinc-400">SPD</span>
                <p className="font-bold text-amber-400 text-xs">{inspectedFighter.stats.speed}</p>
              </div>
            </div>

            {/* Haki System Attributes */}
            <div className="space-y-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 p-2.5 my-2">
              <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block">
                HAKI PROFICIENCY SYSTEM
              </span>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-red-300">Conqueror's (Haoshoku):</span>
                <span className="font-bold">{inspectedFighter.haki.conqueror} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500"
                  style={{ width: `${inspectedFighter.haki.conqueror}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-purple-300">Armament (Busoshoku Ryuo):</span>
                <span className="font-bold">{inspectedFighter.haki.armament} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-400"
                  style={{ width: `${inspectedFighter.haki.armament}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-cyan-300">Observation (Future Sight):</span>
                <span className="font-bold">{inspectedFighter.haki.observation} / 100</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-teal-400"
                  style={{ width: `${inspectedFighter.haki.observation}%` }}
                />
              </div>
            </div>

            {/* Devil Fruit / Pure Haki Perks */}
            {inspectedFighter.devilFruit ? (
              <div className="rounded-lg bg-purple-950/30 border border-purple-800/40 p-2.5 my-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">{inspectedFighter.devilFruit.name}</span>
                  <span className="rounded bg-purple-900/80 px-1 py-0.2 text-[9px] font-mono text-purple-200">
                    {inspectedFighter.devilFruit.type} • {inspectedFighter.devilFruit.awakening}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1">{inspectedFighter.devilFruit.passivePerk}</p>
              </div>
            ) : (
              <div className="rounded-lg bg-amber-950/30 border border-amber-800/40 p-2.5 my-2">
                <span className="font-bold text-xs text-amber-300">Pure Haki Mastery (No Devil Fruit)</span>
                <p className="text-[11px] text-zinc-300 mt-1">
                  Immune to Seastone and water weaknesses. Natural critical multiplier increased by +15%.
                </p>
              </div>
            )}

            {/* Move Arsenal list */}
            <div className="mt-3">
              <span className="font-['Bebas_Neue'] text-xs tracking-wider text-zinc-400 block mb-1.5">
                COMBAT MOVE ARSENAL
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {inspectedFighter.moves?.map((move) => (
                  <div
                    key={move.id}
                    className="flex items-center justify-between rounded bg-zinc-950/80 border border-zinc-800 px-2 py-1 text-xs font-mono"
                  >
                    <span className="truncate text-zinc-200">{move.name}</span>
                    <span className="text-amber-400 font-bold shrink-0">{move.baseDamage} DMG</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LAUNCH BATTLE BUTTON */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleLaunchBattle}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-sm font-black text-black tracking-wider shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition"
              >
                <Swords className="h-4 w-4" />
                <span>START KOF GRAND LINE BATTLE</span>
              </button>

              <button
                onClick={handleQuickPlay}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 py-3 text-sm font-black text-white tracking-wider shadow-lg shadow-teal-500/30 hover:scale-[1.02] active:scale-95 transition"
              >
                <Sparkles className="h-4 w-4 text-cyan-200 animate-pulse" />
                <span>QUICK PLAY (RANDOM MATCH)</span>
              </button>
              
              <button
                onClick={handleLaunchTraining}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                <Dumbbell className="h-4 w-4" />
                <span>ENTER TRAINING ROOM</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Victory Pose Customization Modal */}
      <VictoryPoseModal
        fighter={selectedPoseFighter}
        isOpen={isVictoryPoseOpen}
        onClose={() => setIsVictoryPoseOpen(false)}
      />

      {/* Settings & Rebind Controls Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Skin / Costume Selector Modal */}
      <SkinSelectorModal
        fighter={inspectedFighter}
        isOpen={isSkinModalOpen}
        onClose={() => setIsSkinModalOpen(false)}
        onSelectSkin={handleSelectSkin}
      />

      {/* Official Game Documentation & Beginners Guide Modal */}
      <GameDocumentationModal
        isOpen={isDocOpen}
        onClose={() => setIsDocOpen(false)}
      />
      </div>
    </div>
  );
};
