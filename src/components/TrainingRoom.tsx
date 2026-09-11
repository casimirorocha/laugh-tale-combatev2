import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  RotateCcw, 
  Settings, 
  Play, 
  Activity, 
  Shield, 
  Zap, 
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Info,
  Save,
  Gamepad2,
  Flame,
  Target,
  BookOpen,
  Eye
} from 'lucide-react';
import { Fighter, BattleFighterState, Move, StageInfo } from '../types/fighter';
import { createBattleFighterState, executeMoveAction, getFighterArchetype } from '../utils/combatEngine';
import { soundManager } from '../utils/soundEffects';
import { audioManager } from '../utils/AudioManager';
import { characterVoiceManager } from '../utils/audioAssetLibrary';
import { FighterAvatar } from './FighterAvatar';
import { RealTimeComboOverlay, ActiveComboState } from './RealTimeComboOverlay';
import { FloatingComboCounter } from './FloatingComboCounter';
import { ArcadeComboCounter } from './ArcadeComboCounter';
import { FloatingDamageText, DamageType, FloatingDamageItem } from './FloatingDamageText';
import { HakiParticleEngine, ParticleBurst } from './HakiParticleEngine';
import { SaveComboModal } from './SaveComboModal';
import { ComboLibrary } from './ComboLibrary';
import { GamepadVisualizer } from './GamepadVisualizer';
import { ComboChallengeMode } from './ComboChallengeMode';
import { ComboGuideOverlay } from './ComboGuideOverlay';
import { DummyBehaviorDropdown, DummyBehavior } from './DummyBehaviorDropdown';
import { getUserProfile, saveUserProfile } from '../utils/storage';

interface TrainingRoomProps {
  playerFighter: Fighter;
  dummyFighter: Fighter;
  onExit: () => void;
}

interface DamageStats {
  lastHit: number;
  comboTotal: number;
  highestSingle: number;
  highestCombo: number;
}

export const TrainingRoom: React.FC<TrainingRoomProps> = ({ playerFighter, dummyFighter, onExit }) => {
  const [playerState, setPlayerState] = useState<BattleFighterState>(() => createBattleFighterState(playerFighter));
  const [dummyState, setDummyState] = useState<BattleFighterState>(() => createBattleFighterState(dummyFighter));
  const [activeCombo, setActiveCombo] = useState<ActiveComboState | null>(null);
  const [damageStats, setDamageStats] = useState<DamageStats>({
    lastHit: 0,
    comboTotal: 0,
    highestSingle: 0,
    highestCombo: 0
  });
  
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);
  const [floatingDamage, setFloatingDamage] = useState<FloatingDamageItem[]>([]);
  const [isRegening, setIsRegening] = useState(false);
  const [currentComboMoves, setCurrentComboMoves] = useState<Move[]>([]);
  const [lastExecutedMove, setLastExecutedMove] = useState<Move | null>(null);
  const [showComboChallenge, setShowComboChallenge] = useState(false);
  const [showComboGuide, setShowComboGuide] = useState(true);
  const [dummyBehavior, setDummyBehavior] = useState<DummyBehavior>('idle');
  const [isDummyCountering, setIsDummyCountering] = useState(false);
  const [counterAlert, setCounterAlert] = useState<{ moveName: string; damage: number } | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showGamepadVisualizer, setShowGamepadVisualizer] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getUserProfile());

  // Screen Edge Flash state
  const [screenEdgeFlash, setScreenEdgeFlash] = useState<{
    colorClass: string;
    id: number;
  } | null>(null);

  const triggerScreenEdgeFlash = (type: 'special' | 'ultimate', color?: 'gold' | 'red' | 'purple') => {
    const colorClass = color === 'gold' || type === 'ultimate'
      ? 'screen-edge-flash-gold'
      : color === 'purple'
      ? 'screen-edge-flash-purple'
      : 'screen-edge-flash-red';

    setScreenEdgeFlash({ colorClass, id: Date.now() + Math.random() });
    setTimeout(() => setScreenEdgeFlash(null), 850);
  };

  const comboDecayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-Regen dummy health if it gets too low
  useEffect(() => {
    if (dummyState.currentHp < dummyState.maxHp * 0.3) {
      setIsRegening(true);
      const timer = setTimeout(() => {
        setDummyState(prev => ({ 
          ...prev, 
          currentHp: prev.maxHp,
          guardGauge: 100
        }));
        setIsRegening(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dummyState.currentHp, dummyState.maxHp]);

  // Auto-Regen player health if it gets too low from counter attacks
  useEffect(() => {
    if (playerState.currentHp < playerState.maxHp * 0.3) {
      const timer = setTimeout(() => {
        setPlayerState(prev => ({ ...prev, currentHp: prev.maxHp }));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [playerState.currentHp, playerState.maxHp]);

  // Handle Dummy Behavior Change
  const handleDummyBehaviorChange = (newBehavior: DummyBehavior) => {
    setDummyBehavior(newBehavior);
    if (newBehavior === 'block_all') {
      setDummyState(prev => ({
        ...prev,
        currentStance: 'defensive',
        statusEffects: { ...prev.statusEffects, isGuarding: true },
        guardGauge: Math.max(prev.guardGauge, 80)
      }));
    } else if (newBehavior === 'crouch_only') {
      setDummyState(prev => ({
        ...prev,
        currentStance: 'defensive',
        statusEffects: { ...prev.statusEffects, isGuarding: false }
      }));
    } else if (newBehavior === 'random_counter') {
      setDummyState(prev => ({
        ...prev,
        currentStance: 'offensive',
        counterReady: true,
        statusEffects: { ...prev.statusEffects, isGuarding: false }
      }));
    } else {
      setDummyState(prev => ({
        ...prev,
        currentStance: 'balanced',
        statusEffects: { ...prev.statusEffects, isGuarding: false }
      }));
    }
  };

  const handleAction = (move: Move) => {
    // Save last executed move for Combo Challenge validation
    setLastExecutedMove(move);

    // Trigger screen edge flash for Special Moves (red/purple) and Ultimates (gold)
    if (move.type === 'super' || move.type === 'finisher' || move.type === 'awakening') {
      triggerScreenEdgeFlash('ultimate', 'gold');
    } else if (move.type === 'special' || move.type === 'ex' || move.type === 'command') {
      triggerScreenEdgeFlash('special', move.type === 'ex' ? 'purple' : 'red');
    }

    // Check Crouch Only defensive dynamics:
    // Standing high jabs/pokes have 50% chance to whiff over crouched target.
    // Heavy downward/overhead/jump attacks deal bonus +25% Crouch Crush damage.
    let isCrouchWhiff = false;
    let isCrouchCrush = false;
    const effectiveMove = { ...move };

    if (dummyBehavior === 'crouch_only') {
      const moveNameLower = move.name.toLowerCase();
      const isOverheadOrDownward = 
        moveNameLower.includes('axe') || 
        moveNameLower.includes('drop') || 
        moveNameLower.includes('overhead') || 
        moveNameLower.includes('slam') || 
        moveNameLower.includes('pound') || 
        moveNameLower.includes('smash') || 
        moveNameLower.includes('stamp') || 
        moveNameLower.includes('down') ||
        moveNameLower.includes('gatling') ||
        moveNameLower.includes('meteor') ||
        move.type === 'super' || 
        move.type === 'ex';

      const isLowOrSweep = moveNameLower.includes('sweep') || moveNameLower.includes('low') || moveNameLower.includes('trip') || moveNameLower.includes('slide');

      if (isOverheadOrDownward) {
        isCrouchCrush = true;
        effectiveMove.baseDamage = Math.round(effectiveMove.baseDamage * 1.25);
      } else if (!isLowOrSweep && (move.type === 'basic' || move.type === 'command') && Math.random() < 0.50) {
        isCrouchWhiff = true;
      }
    }

    if (isCrouchWhiff) {
      soundManager.playMiss();
      const whiffDmgItem: FloatingDamageItem = {
        id: `dmg_${Date.now()}_${Math.random()}`,
        side: 'team2',
        damage: 0,
        displayText: '💨 WHIFF! (CROUCH LOW-PROFILE)',
        damageType: 'miss',
        createdAt: Date.now(),
        xOffset: (Math.random() - 0.5) * 40
      };
      setFloatingDamage(prev => [...prev.slice(-15), whiffDmgItem]);
      return;
    }

    // Record the move in current combo
    setCurrentComboMoves(prev => [...prev, move]);
    
    // Configure defender state for current dummy behavior
    const targetDefenderState: BattleFighterState = {
      ...dummyState,
      currentStance: dummyBehavior === 'block_all' ? 'defensive' : dummyBehavior === 'random_counter' ? 'offensive' : 'balanced',
      statusEffects: {
        ...dummyState.statusEffects,
        isGuarding: dummyBehavior === 'block_all' ? true : false,
      }
    };

    const result = executeMoveAction(
      playerState,
      targetDefenderState,
      effectiveMove,
      1,
      'team1',
      undefined,
      activeCombo?.multiplier || 1.0,
      false,
      activeCombo?.hits || 0
    );

    // Keep guard status active if in Block All mode
    if (dummyBehavior === 'block_all') {
      result.updatedDefender.statusEffects.isGuarding = true;
      result.updatedDefender.currentStance = 'defensive';
    }

    // Update States
    setPlayerState(result.updatedAttacker);
    setDummyState(result.updatedDefender);

    // Character Voice & Custom Move Sound Effect
    characterVoiceManager.playMoveVoice(playerFighter, move);
    audioManager.playCustomMoveSfx(playerFighter.id, move.id, move.name, move.type);

    // Particles & Sounds
    if (isCrouchCrush) {
      soundManager.playCriticalStrike();
      triggerBurst(70, 50, 'amber', 'critical');
    } else if (result.log.isCrit) {
      soundManager.playCriticalStrike();
      triggerBurst(70, 50, 'red', 'critical');
    } else if (result.log.isBlocked) {
      soundManager.playGuardBlock();
      triggerBurst(70, 50, 'cyan', 'haki');
    } else {
      soundManager.playHit('medium');
      triggerBurst(70, 50, 'amber', 'haki');
    }

    // Floating Damage
    const dmgType: DamageType = isCrouchCrush ? 'armament_crit' :
                               result.log.isCrit || move.hakiInfused || result.log.isHakiClash ? 'haki' :
                               move.element || move.type === 'special' || move.type === 'super' || move.type === 'ex' ? 'devil_fruit' :
                               result.log.isBlocked ? 'guarded' : 'physical';

    const dmgItem: FloatingDamageItem = {
      id: `dmg_${Date.now()}_${Math.random()}`,
      side: 'team2',
      damage: result.log.damage,
      displayText: isCrouchCrush ? `💥 CROUCH CRUSH! (-${result.log.damage})` : undefined,
      damageType: dmgType,
      hakiMultiplier: result.log.hakiMultiplier,
      comboCount: (activeCombo?.hits || 0) + 1,
      createdAt: Date.now(),
      xOffset: (Math.random() - 0.5) * 40
    };
    
    setFloatingDamage(prev => [...prev.slice(-15), dmgItem]);

    // Update Damage Stats
    setDamageStats(prev => {
      const newComboTotal = (activeCombo?.accumulatedDamage || 0) + result.log.damage;
      return {
        lastHit: result.log.damage,
        comboTotal: newComboTotal,
        highestSingle: Math.max(prev.highestSingle, result.log.damage),
        highestCombo: Math.max(prev.highestCombo, newComboTotal)
      };
    });

    // Combo Logic
    const newHits = (activeCombo?.hits || 0) + (result.log.comboCount || 1);
    setActiveCombo({
      activeSide: 'team1',
      hits: newHits,
      accumulatedDamage: (activeCombo?.accumulatedDamage || 0) + result.log.damage,
      multiplier: 1.0 + (newHits * 0.02), // Simple training multiplier
      lastHitTime: Date.now(),
      recentHitIncrement: result.log.comboCount || 1,
      isEnding: false,
      actorName: playerFighter.name
    });

    if (comboDecayRef.current) clearTimeout(comboDecayRef.current);
    comboDecayRef.current = setTimeout(() => {
      setActiveCombo(null);
      setCurrentComboMoves([]); // Reset combo moves when combo ends
      setDamageStats(prev => ({ ...prev, comboTotal: 0 }));
      setFloatingDamage([]);
    }, 2000);

    // Random Counter-Attack Logic (~45% chance when in random_counter mode)
    if (dummyBehavior === 'random_counter' && Math.random() < 0.45) {
      setTimeout(() => {
        const dummyMoves = dummyFighter.moves;
        if (dummyMoves && dummyMoves.length > 0) {
          const counterMove = dummyMoves[Math.floor(Math.random() * dummyMoves.length)];
          setIsDummyCountering(true);
          soundManager.playCounterAttack();
          soundManager.playCriticalStrike();
          characterVoiceManager.playMoveVoice(dummyFighter, counterMove);
          audioManager.playCustomMoveSfx(dummyFighter.id, counterMove.id, counterMove.name, counterMove.type);

          const counterDamage = Math.round(counterMove.baseDamage * 0.85 + (dummyFighter.stats.attack / 100) * 15);
          
          setPlayerState(prev => ({
            ...prev,
            currentHp: Math.max(1, prev.currentHp - counterDamage)
          }));

          setCounterAlert({ moveName: counterMove.name, damage: counterDamage });
          triggerBurst(30, 50, 'red', 'critical');

          const counterDmgItem: FloatingDamageItem = {
            id: `dmg_counter_${Date.now()}_${Math.random()}`,
            side: 'team1',
            damage: counterDamage,
            displayText: `⚡ REVERSAL: ${counterMove.name.toUpperCase()} (-${counterDamage})`,
            damageType: 'conqueror_burst',
            createdAt: Date.now(),
            xOffset: (Math.random() - 0.5) * 40
          };
          setFloatingDamage(prev => [...prev.slice(-15), counterDmgItem]);

          setTimeout(() => {
            setIsDummyCountering(false);
          }, 450);

          setTimeout(() => {
            setCounterAlert(null);
          }, 1800);
        }
      }, 320);
    }
  };

  const triggerBurst = (x: number, y: number, color: any, type: any) => {
    setBursts(prev => [...prev, { id: `burst_${Date.now()}`, x, y, color, type }]);
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col overflow-y-auto font-sans select-none">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />
      
      {/* Top HUD */}
      <header className="relative z-10 flex flex-wrap items-center justify-between p-3 sm:p-4 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-sm gap-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onExit}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h2 className="text-amber-400 font-black tracking-tighter text-lg sm:text-xl uppercase">Damage & Combo Lab</h2>
            <p className="text-zinc-500 text-[10px] sm:text-xs font-mono">DOJO TRAINING • LIVE COMBO CHALLENGES</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
           {/* DUMMY BEHAVIOR DROPDOWN */}
           <DummyBehaviorDropdown 
             currentBehavior={dummyBehavior} 
             onChange={handleDummyBehaviorChange} 
             guardGauge={dummyState.guardGauge}
           />

           {/* COMBO GUIDE TOGGLE */}
           <button
             onClick={() => setShowComboGuide(!showComboGuide)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black tracking-wide transition shadow-sm ${
               showComboGuide
                 ? 'border-amber-400 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-black shadow-amber-500/30'
                 : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
             }`}
           >
             <BookOpen className="h-4 w-4" />
             <span>COMBO GUIDE: {showComboGuide ? 'ACTIVE' : 'VIEW'}</span>
           </button>

           {/* COMBO CHALLENGE TOGGLE */}
           <button
             onClick={() => setShowComboChallenge(!showComboChallenge)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black tracking-wide transition shadow-sm ${
               showComboChallenge
                 ? 'border-amber-400 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-amber-500/30'
                 : 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
             }`}
           >
             <Flame className="h-4 w-4 text-amber-400" />
             <span>CHALLENGE: {showComboChallenge ? 'ON' : 'OFF'}</span>
           </button>

           <div className="hidden xl:flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 font-mono">DUMMY STATUS</span>
              <div className="flex items-center gap-2">
                {isRegening && <RefreshCw className="h-3 w-3 text-cyan-400 animate-spin" />}
                <span className={`font-mono text-xs ${isRegening ? 'text-cyan-400' : 'text-zinc-300'}`}>
                  {isRegening ? 'REGENERATING...' : dummyBehavior.toUpperCase().replace('_', ' ')}
                </span>
              </div>
           </div>

           <button
             onClick={() => setShowGamepadVisualizer(!showGamepadVisualizer)}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
               showGamepadVisualizer
                 ? 'border-amber-500 bg-amber-500 text-black shadow-md shadow-amber-500/30'
                 : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
             }`}
           >
             <Gamepad2 className="h-4 w-4" />
             <span className="hidden sm:inline">ARCADE STICK:</span> {showGamepadVisualizer ? 'ON' : 'OFF'}
           </button>

           <button 
             onClick={() => {
               setDummyState(createBattleFighterState(dummyFighter));
               setPlayerState(createBattleFighterState(playerFighter));
               setDamageStats({ lastHit: 0, comboTotal: 0, highestSingle: 0, highestCombo: 0 });
               setActiveCombo(null);
               setFloatingDamage([]);
               setCounterAlert(null);
             }}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 text-xs font-bold transition"
           >
             <RotateCcw className="h-4 w-4" />
             <span>RESET</span>
           </button>
        </div>

        <GamepadVisualizer
          active={showGamepadVisualizer}
          mapping={userProfile.gamepadMapping}
          keyboardMapping={userProfile.keyboardMapping}
        />
      </header>

      {/* Screen Edge Flash Overlay for Special & Ultimate moves */}
      {screenEdgeFlash && (
        <div
          key={screenEdgeFlash.id}
          className={`fixed inset-0 z-50 pointer-events-none ${screenEdgeFlash.colorClass}`}
        />
      )}

      {/* COMBO GUIDE OVERLAY */}
      <AnimatePresence>
        {showComboGuide && (
          <div className="relative z-30 px-4 pt-3 max-w-6xl mx-auto w-full">
            <ComboGuideOverlay
              playerFighter={playerFighter}
              lastExecutedMove={lastExecutedMove}
              onExecuteMove={handleAction}
              isOpen={showComboGuide}
              onClose={() => setShowComboGuide(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* COMBO CHALLENGE MODE DOCK */}
      <AnimatePresence>
        {showComboChallenge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 px-4 pt-3 max-w-6xl mx-auto w-full"
          >
            <ComboChallengeMode
              playerFighter={playerFighter}
              lastExecutedMove={lastExecutedMove}
              onExecuteMove={handleAction}
              onClose={() => setShowComboChallenge(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Stage */}
      <div className="flex-1 relative flex items-center justify-center min-h-[260px] py-4">
        {/* Particle System */}
        <HakiParticleEngine bursts={bursts} onBurstComplete={(id) => setBursts(prev => prev.filter(b => b.id !== id))} />
        
        {/* Combo Overlay */}
        <RealTimeComboOverlay combo={activeCombo} team1Name="PLAYER" team2Name="DUMMY" />

        <FloatingComboCounter combo={activeCombo} />

        <ArcadeComboCounter
          combo={activeCombo}
          targetMaxHp={dummyFighter.maxHp || 1000}
        />

        {/* Floating Damage */}
        <FloatingDamageText items={floatingDamage} />

        {/* REVERSAL COUNTER ALERT BANNER */}
        <AnimatePresence>
          {counterAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute top-4 z-40 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-950/95 via-red-900/90 to-rose-950/95 border-2 border-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.8)] backdrop-blur-md flex items-center gap-3"
            >
              <div className="p-1.5 bg-rose-500 text-black rounded-lg font-black text-xs animate-bounce">
                REVERSAL!
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-rose-200">
                  {dummyFighter.name} Counter-Attacked!
                </div>
                <div className="text-[11px] font-mono text-amber-300">
                  Move: <span className="font-bold underline">{counterAlert.moveName}</span> (-{counterAlert.damage} Player HP)
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fighters */}
        <div className="w-full max-w-6xl grid grid-cols-2 gap-10 sm:gap-20 px-6 sm:px-10">
          <motion.div className="flex flex-col items-center gap-4">
             <div className="relative group">
               <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
               <FighterAvatar fighter={playerFighter} size="xl" />
             </div>
             <div className="text-center">
                <h3 className="text-white font-black uppercase text-xl sm:text-2xl tracking-tighter">{playerFighter.name}</h3>
                <span className="text-amber-500 text-xs font-mono">PLAYER 1</span>
             </div>
             {/* Player Health Bar */}
             <div className="w-48 sm:w-64 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>HEALTH</span>
                  <span className="text-amber-400 font-bold">{playerState.currentHp} / {playerState.maxHp} HP</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                    animate={{ width: `${(playerState.currentHp / playerState.maxHp) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
             </div>
          </motion.div>

          <motion.div 
            className="flex flex-col items-center gap-4 relative"
            animate={isDummyCountering ? { x: [-8, 8, -4, 4, 0], scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
             <div className="relative">
                {isRegening && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full z-0"
                  />
                )}

                {/* BLOCK ALL: Armament Shield Glow & Barrier Ring */}
                {dummyBehavior === 'block_all' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0.6, 0.9, 0.6], scale: [1.1, 1.18, 1.1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-3 rounded-full border-2 border-cyan-400/70 bg-cyan-500/15 shadow-[0_0_25px_rgba(34,211,238,0.5)] z-0 pointer-events-none flex items-center justify-center"
                  >
                    <Shield className="h-8 w-8 text-cyan-300 opacity-40 animate-pulse" />
                  </motion.div>
                )}

                {/* RANDOM COUNTER: Warning Electric Aura */}
                {dummyBehavior === 'random_counter' && (
                  <motion.div 
                    animate={{ opacity: [0.4, 0.85, 0.4], scale: [1.05, 1.15, 1.05] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute -inset-3 rounded-full border-2 border-rose-500/60 bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.5)] z-0 pointer-events-none"
                  />
                )}

                {/* CROUCH ONLY: Low Profile posture wrapper */}
                <div className={`transition-all duration-300 ${
                  dummyBehavior === 'crouch_only' ? 'scale-y-[0.78] scale-x-[1.08] translate-y-3 origin-bottom' : ''
                }`}>
                  <FighterAvatar fighter={dummyFighter} size="xl" />
                </div>

                {/* Crouch Ground Dust effect */}
                {dummyBehavior === 'crouch_only' && (
                  <div className="absolute -bottom-2 inset-x-0 flex justify-center pointer-events-none">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300">
                      LOW PROFILE DUCK
                    </span>
                  </div>
                )}
             </div>

             <div className="text-center">
                <h3 className="text-white font-black uppercase text-xl sm:text-2xl tracking-tighter">{dummyFighter.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-zinc-500 text-xs font-mono">TRAINING DUMMY</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    dummyBehavior === 'block_all' ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300' :
                    dummyBehavior === 'crouch_only' ? 'border-amber-500/40 bg-amber-950/60 text-amber-300' :
                    dummyBehavior === 'random_counter' ? 'border-rose-500/40 bg-rose-950/60 text-rose-300' :
                    'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                  }`}>
                    {dummyBehavior === 'block_all' ? '🛡️ BLOCK ALL' :
                     dummyBehavior === 'crouch_only' ? '🥋 CROUCH ONLY' :
                     dummyBehavior === 'random_counter' ? '⚡ REVERSAL ON' :
                     '🎯 IDLE TARGET'}
                  </span>
                </div>
             </div>

             {/* Dummy Health & Guard Bars */}
             <div className="w-48 sm:w-64 flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>HEALTH</span>
                  <span className="text-emerald-400 font-bold">{dummyState.currentHp} / {dummyState.maxHp} HP</span>
                </div>
                <div className="h-2 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    animate={{ width: `${(dummyState.currentHp / dummyState.maxHp) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                {/* Guard Gauge (especially active during Block All) */}
                {dummyBehavior === 'block_all' && (
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <div className="flex justify-between text-[9px] font-mono text-cyan-400">
                      <span>GUARD GAUGE</span>
                      <span>{dummyState.guardGauge}% {dummyState.guardGauge <= 20 ? '⚠️ DANGER' : ''}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full border border-cyan-900/60 overflow-hidden">
                      <motion.div 
                        className={`h-full ${dummyState.guardGauge <= 25 ? 'bg-red-500' : 'bg-cyan-400'}`}
                        animate={{ width: `${dummyState.guardGauge}%` }}
                      />
                    </div>
                  </div>
                )}
             </div>
          </motion.div>
        </div>
      </div>

      {/* Control Panel / Damage Readout */}
      <div className="bg-zinc-900/90 border-t border-zinc-800 backdrop-blur-md p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Move Selection */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-3 w-3" /> Command Input Deck
            </h4>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[8px] font-mono text-zinc-500 border border-zinc-700">COMBO MULTIPLIER: x{activeCombo?.multiplier.toFixed(2) || '1.00'}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {playerFighter.moves.map((move) => (
              <button
                key={move.id}
                onClick={() => handleAction(move)}
                className={`flex flex-col items-start p-3 rounded-lg border transition-all hover:scale-105 active:scale-95 group ${
                  move.type === 'super' ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500' :
                  move.type === 'special' ? 'bg-blue-950/20 border-blue-500/30 hover:border-blue-500' :
                  'bg-zinc-800/50 border-zinc-700 hover:border-amber-500'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-8">
                  <span className={`text-[10px] font-black uppercase ${
                    move.type === 'super' ? 'text-purple-400' :
                    move.type === 'special' ? 'text-blue-400' :
                    'text-zinc-400'
                  }`}>{move.type}</span>
                  {move.hakiInfused && <Shield className="h-3 w-3 text-red-500" />}
                </div>
                <span className="text-white font-bold text-sm group-hover:text-amber-400">{move.name}</span>
                <span className="text-zinc-500 text-[10px] font-mono mt-1">{move.baseDamage} BASE DMG</span>
              </button>
            ))}
          </div>
        </div>

        {/* Damage Readout */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:border-l lg:border-zinc-800 lg:pl-6">
           <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-3 w-3" /> Real-time Telemetry
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
               <span className="text-[9px] text-zinc-500 font-mono block">LAST HIT</span>
               <span className="text-xl font-black text-white">{damageStats.lastHit}</span>
            </div>
            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
               <span className="text-[9px] text-zinc-500 font-mono block">COMBO TOTAL</span>
               <span className="text-xl font-black text-amber-500">{damageStats.comboTotal}</span>
            </div>
            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
               <span className="text-[9px] text-zinc-500 font-mono block">HIGHEST SINGLE</span>
               <span className="text-xl font-black text-red-500">{damageStats.highestSingle}</span>
            </div>
            <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
               <span className="text-[9px] text-zinc-500 font-mono block">HIGHEST COMBO</span>
               <span className="text-xl font-black text-purple-500">{damageStats.highestCombo}</span>
            </div>
          </div>

          <div className="mt-2 p-3 bg-zinc-800/30 rounded border border-zinc-800 flex flex-col gap-2">
            <div className="flex items-start gap-3">
               <Info className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
               <p className="text-[10px] text-zinc-500 leading-relaxed">
                 Training dummy health regenerates automatically below 30%. Test Devil Fruit arts and Haki infusions across all difficulty ranks.
               </p>
            </div>
            
            {activeCombo && (
              <button 
                onClick={() => setIsSaveModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-2 rounded transition"
              >
                <Save className="h-3 w-3" /> SAVE COMBO
              </button>
            )}

          </div>
        </div>
      </div>

      <SaveComboModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        damage={damageStats.comboTotal}
        onSave={(name) => {
          const profile = getUserProfile();
          profile.savedCombos.push({
            id: `combo_${Date.now()}`,
            name,
            inputSequence: currentComboMoves.map(m => m.name),
            damageEstimate: damageStats.comboTotal,
            meterCost: 0,
            timestamp: Date.now()
          });
          saveUserProfile(profile);
          setUserProfile(profile);
        }}
      />

      <div className="px-6 pb-6 bg-zinc-900/90 border-t border-zinc-800">
        <ComboLibrary 
          combos={userProfile.savedCombos} 
          onDelete={(id) => {
            const profile = getUserProfile();
            profile.savedCombos = profile.savedCombos.filter(c => c.id !== id);
            saveUserProfile(profile);
            setUserProfile(profile);
          }}
        />
      </div>
    </div>
  );
};
