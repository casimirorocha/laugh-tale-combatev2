import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { TeamSelect } from './components/TeamSelect';
import { PreMatchIntro } from './components/PreMatchIntro';
import { ArcadeBattleArena } from './components/ArcadeBattleArena';
import { ArcadeCabinetBezel } from './components/ArcadeCabinetBezel';
import { PostMatchResults } from './components/PostMatchResults';
import { Matchmaking } from './components/Matchmaking';
import { Leaderboards } from './components/Leaderboards';
import { UserProfileView } from './components/UserProfile';
import { CustomFighterCreator } from './components/CustomFighterCreator';
import { FighterEncyclopedia } from './components/FighterEncyclopedia';
import { GalleryView } from './components/GalleryView';
import { LoadingScreen } from './components/LoadingScreen';
import { TrainingRoom } from './components/TrainingRoom';
import { GlobalChatOverlay } from './components/GlobalChatOverlay';
import { OfflineIndicator } from './components/PWAInstallButton';
import { WorldMapView } from './components/WorldMapView';

import { Team, StageInfo, MatchFormat, MatchResult, Fighter, RoundStat } from './types/fighter';
import { GlobalEvent } from './types/worldEvents';
import { BATTLE_STAGES } from './data/stages';
import { CHARACTERS } from './data/characters';
import { soundManager } from './utils/soundEffects';
import { audioManager } from './utils/AudioManager';
import { characterVoiceManager } from './utils/audioAssetLibrary';
import { batchPreloadMediaAssets } from './utils/mediaCache';
import { predictiveMediaLoader, PredictivePreloadState } from './utils/predictiveMediaLoader';
import { PredictiveMediaLoaderHUD } from './components/PredictiveMediaLoaderHUD';

type AppScreen =
  | 'roster'
  | 'prematch'
  | 'battle'
  | 'loading'
  | 'results'
  | 'matchmaking'
  | 'world_map'
  | 'leaderboards'
  | 'profile'
  | 'custom_creator'
  | 'codex'
  | 'gallery'
  | 'training';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('roster');
  const [activeTeam1, setActiveTeam1] = useState<Team | null>(null);
  const [activeTeam2, setActiveTeam2] = useState<Team | null>(null);
  const [activeStage, setActiveStage] = useState<StageInfo>(BATTLE_STAGES[0]);
  const [activeFormat, setActiveFormat] = useState<MatchFormat>(() => {
    try {
      const saved = localStorage.getItem('op_kof_match_format_v1');
      if (saved === '3v3_kof' || saved === '1v1_duel') {
        return saved as MatchFormat;
      }
    } catch {}
    return '3v3_kof';
  });

  const updateActiveFormat = (format: MatchFormat) => {
    setActiveFormat(format);
    try {
      localStorage.setItem('op_kof_match_format_v1', format);
    } catch {}
  };
  const [activeWeather, setActiveWeather] = useState<string>('auto');
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);
  const [rematchSession, setRematchSession] = useState<{
    initialRound: number;
    initialRoundHistory: Array<'team1' | 'team2' | 'draw'>;
    initialRoundStats: RoundStat[];
  }>({
    initialRound: 1,
    initialRoundHistory: [],
    initialRoundStats: [],
  });
  const [trainingPair, setTrainingPair] = useState<{ player: Fighter; dummy: Fighter } | null>(null);
  const [predictiveState, setPredictiveState] = useState<PredictivePreloadState>(predictiveMediaLoader.getState());

  // Subscribe to Predictive Media Loader state changes
  useEffect(() => {
    const unsubscribe = predictiveMediaLoader.subscribe((state) => {
      setPredictiveState(state);
    });
    return unsubscribe;
  }, []);

  // Global arcade click sound listener
  useEffect(() => {
    // Initialize root-level audio resumption policy
    audioManager.setupResumptionPolicy();
    characterVoiceManager.setupResumptionPolicy();

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('button, select, input, a, [role="button"]')) {
        soundManager.playUiClick();
      }
    };
    window.addEventListener('click', handleGlobalClick);

    // Background preloading of images and core audio assets
    const imageUrls = CHARACTERS.map((c) => c.avatarUrl || c.avatarIcon).filter(
      (url): url is string => Boolean(url) && (url.startsWith('http') || url.startsWith('/'))
    );
    const audioUrls = [
      '/audio/music/overtaken.mp3',
      '/audio/music/very_strongest.mp3',
      '/audio/music/fierce_attack.mp3',
      '/audio/music/gear5.mp3',
      '/audio/haki/conquerors_haki.mp3',
      '/audio/haki/armament_haki.mp3',
      '/audio/haki/observation_haki.mp3',
      '/audio/sfx/clash.mp3',
      '/audio/sfx/ko.mp3',
    ];
    batchPreloadMediaAssets(audioUrls, imageUrls)
      .then((failures) => {
        if (failures && failures.length > 0) {
          console.warn('Initial asset preloading failed for:', failures);
        }
      })
      .catch((err) => {
        console.warn('Initial asset preloading error:', err);
      });

    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Handle Battle Music & Ambient Lifecycle
  useEffect(() => {
    if (currentScreen === 'battle') {
      audioManager.playBattleMusic();
      audioManager.startStageAmbient(activeStage.id);
    } else {
      audioManager.stopBattleMusic();
      audioManager.stopStageAmbient();
    }
  }, [currentScreen, activeStage.id]);

  /**
   * Predictive Media Loader trigger:
   * As soon as the user confirms their team selection, immediately begin
   * predicting and downloading audio and visual assets for the next logical opponent.
   */
  const handleTeamConfirmed = (team1: Team, stagedOpponent?: Team | null) => {
    setActiveTeam1(team1);
    predictiveMediaLoader.preloadForConfirmedTeam(team1, stagedOpponent || activeTeam2);
  };

  const handleStartMatchSetup = (
    team1: Team,
    team2: Team,
    stage: StageInfo,
    format: MatchFormat,
    weatherOverride: string = 'auto'
  ) => {
    setActiveTeam1(team1);
    setActiveTeam2(team2);
    setActiveStage(stage);
    updateActiveFormat(format);
    setActiveWeather(weatherOverride);
    setRematchSession({
      initialRound: 1,
      initialRoundHistory: [],
      initialRoundStats: [],
    });
    // Predictive preload for the confirmed matchup
    predictiveMediaLoader.preloadForConfirmedTeam(team1, team2);
    setCurrentScreen('prematch');
  };

  const handleStartEventBattle = (
    team1: Team,
    team2: Team,
    stage: StageInfo,
    format: MatchFormat,
    event: GlobalEvent
  ) => {
    setActiveTeam1(team1);
    setActiveTeam2(team2);
    setActiveStage(stage);
    updateActiveFormat(format);
    setRematchSession({
      initialRound: 1,
      initialRoundHistory: [],
      initialRoundStats: [],
    });
    predictiveMediaLoader.preloadForConfirmedTeam(team1, team2);
    setCurrentScreen('prematch');
  };

  const handleProceedToFight = () => {
    setCurrentScreen('loading');
  };

  const handleFinishLoading = () => {
    setCurrentScreen('battle');
  };

  const handleMatchComplete = (result: MatchResult) => {
    setLastResult(result);
    setCurrentScreen('results');
  };

  const handleRematch = () => {
    if (lastResult) {
      const nextRoundNumber = (lastResult.totalRounds || 1) + 1;
      const history = lastResult.roundHistory || [];
      const stats = lastResult.roundStats || [];
      setRematchSession({
        initialRound: nextRoundNumber,
        initialRoundHistory: history,
        initialRoundStats: stats,
      });
    } else {
      setRematchSession({
        initialRound: 1,
        initialRoundHistory: [],
        initialRoundStats: [],
      });
    }
    setCurrentScreen('loading');
  };

  const handleReturnToRoster = () => {
    setRematchSession({
      initialRound: 1,
      initialRoundHistory: [],
      initialRoundStats: [],
    });
    setCurrentScreen('roster');
  };

  const handleStartTraining = (player: Fighter, dummy: Fighter) => {
    setTrainingPair({ player, dummy });
    setCurrentScreen('training');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 flex flex-col">
      {currentScreen === 'roster' && (
        <TeamSelect
          onStartMatch={handleStartMatchSetup}
          onTeamConfirmed={handleTeamConfirmed}
          onStartTraining={handleStartTraining}
          onOpenCustomCreator={() => setCurrentScreen('custom_creator')}
          onOpenMatchmaking={() => setCurrentScreen('matchmaking')}
          onOpenWorldMap={() => setCurrentScreen('world_map')}
          onOpenLeaderboards={() => setCurrentScreen('leaderboards')}
          onOpenProfile={() => setCurrentScreen('profile')}
          onOpenEncyclopedia={() => setCurrentScreen('codex')}
          onOpenGallery={() => setCurrentScreen('gallery')}
        />
      )}

      {currentScreen === 'prematch' && activeTeam1 && activeTeam2 && (
        <PreMatchIntro
          team1={activeTeam1}
          team2={activeTeam2}
          stage={activeStage}
          matchFormat={activeFormat}
          onProceedToFight={handleProceedToFight}
        />
      )}

      {currentScreen === 'loading' && activeTeam1 && activeTeam2 && (
        <LoadingScreen
          team1={activeTeam1}
          team2={activeTeam2}
          onFinished={handleFinishLoading}
        />
      )}

      {currentScreen === 'battle' && activeTeam1 && activeTeam2 && (
        <ArcadeCabinetBezel>
          <ArcadeBattleArena
            team1={activeTeam1}
            team2={activeTeam2}
            stage={activeStage}
            matchFormat={activeFormat}
            weatherOverride={activeWeather}
            initialRound={rematchSession.initialRound}
            initialRoundHistory={rematchSession.initialRoundHistory}
            initialRoundStats={rematchSession.initialRoundStats}
            onMatchComplete={handleMatchComplete}
            onExitToMenu={handleReturnToRoster}
          />
        </ArcadeCabinetBezel>
      )}

      <AnimatePresence>
        {currentScreen === 'results' && lastResult && (
          <PostMatchResults
            key="post-match-results"
            result={lastResult}
            onRematch={handleRematch}
            onReturnToRoster={handleReturnToRoster}
          />
        )}
      </AnimatePresence>

      {currentScreen === 'matchmaking' && (
        <Matchmaking
          onStartBattle={handleStartMatchSetup}
          onBack={handleReturnToRoster}
        />
      )}

      {currentScreen === 'world_map' && (
        <WorldMapView
          onStartEventBattle={handleStartEventBattle}
          onBackToMenu={handleReturnToRoster}
        />
      )}

      {currentScreen === 'leaderboards' && (
        <Leaderboards onBack={handleReturnToRoster} />
      )}

      {currentScreen === 'profile' && (
        <UserProfileView onBack={handleReturnToRoster} />
      )}

      {currentScreen === 'custom_creator' && (
        <CustomFighterCreator
          onBack={handleReturnToRoster}
          onFighterCreated={() => setCurrentScreen('roster')}
        />
      )}

      {currentScreen === 'codex' && (
        <FighterEncyclopedia onBack={handleReturnToRoster} />
      )}

      {currentScreen === 'training' && trainingPair && (
        <TrainingRoom
          playerFighter={trainingPair.player}
          dummyFighter={trainingPair.dummy}
          onExit={handleReturnToRoster}
        />
      )}

      {/* Global Lobby chat overlay */}
      {currentScreen !== 'battle' &&
        currentScreen !== 'training' &&
        currentScreen !== 'loading' &&
        currentScreen !== 'prematch' && <GlobalChatOverlay />}

      {/* Intelligent Predictive Media Loader HUD */}
      {currentScreen !== 'battle' && <PredictiveMediaLoaderHUD state={predictiveState} />}

      {/* PWA Offline status banner */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
