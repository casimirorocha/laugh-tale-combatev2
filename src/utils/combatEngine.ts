// One Piece: Grand Line Fighter Arcade (KOF Edition) - Advanced Combat Engine
// Calibrated for 120-240s High-Stakes Battle Flow, Multi-Archetype Synergy, Stances & Japanese Announcer Callouts

import {
  Fighter,
  BattleFighterState,
  Move,
  ActionLog,
  StageInfo,
  CombatStance,
  CombatArchetype,
  AwakeningProfile,
} from '../types/fighter';
import { BattleTauntAnimation } from '../types/battleTaunts';
import { getCharacterAwakeningProfile } from '../data/awakeningProfiles';

// ============================================================================
// CONSTANTES DE CALIBRAÇÃO DO KENBUNSHOKU (OBSERVAÇÃO) & FOCO
// ============================================================================
export const MIN_OBSERVATION_FOCUS_THRESHOLD = 25; // Trava de segurança: Foco mínimo para acionar/sustentar Kenbunshoku
export const BASE_OBSERVATION_HAKI_COST = 40;       // Custo base de Haki (escala 0-300)

/**
 * Identifica personagens com maestria superior ou avançada de Visão do Futuro
 */
export function checkObservationMastery(fighter: Fighter): boolean {
  const name = (fighter?.name || '').toLowerCase();
  return (
    fighter.haki.observation >= 95 ||
    name.includes('katakuri') ||
    name.includes('shanks') ||
    name.includes('enel') ||
    name.includes('luffy') ||
    name.includes('imu') ||
    name.includes('rayleigh')
  );
}

/**
 * Calcula o custo dinâmico de Haki para usar o Haki da Observação.
 * Inversamente proporcional ao Foco: quanto maior o Foco, menor o custo percentual de Haki.
 */
export function calculateObservationHakiCost(focus: number, isMaster: boolean): number {
  const clampedFocus = Math.max(0, Math.min(100, focus));
  // Com Foco 100% -> multiplicador 0.70x (apenas ~28 pts)
  // Com Foco 50%  -> multiplicador 1.35x (~54 pts)
  // Com Foco 25%  -> multiplicador 1.67x (~67 pts, ou ~50 pts para mestres)
  const focusMultiplier = 0.70 + ((100 - clampedFocus) / 100) * 1.30;
  const masteryDiscount = isMaster ? 0.75 : 1.0;

  return Math.round(BASE_OBSERVATION_HAKI_COST * focusMultiplier * masteryDiscount);
}

/**
 * Verifica se o lutador cumpre os pré-requisitos de Foco e Haki para utilizar Kenbunshoku
 */
export function canUseObservationHaki(fighterState: BattleFighterState): {
  canUse: boolean;
  hakiCost: number;
  reason?: 'LOW_FOCUS' | 'INSUFFICIENT_HAKI';
} {
  const currentFocus = fighterState.focusMeter ?? 100;
  const isMaster = checkObservationMastery(fighterState.fighter);
  const requiredHaki = calculateObservationHakiCost(currentFocus, isMaster);

  // Trava de segurança: Se Foco < 25%, bloqueia mesmo que Haki esteja em 100%
  if (currentFocus < MIN_OBSERVATION_FOCUS_THRESHOLD) {
    return { canUse: false, hakiCost: requiredHaki, reason: 'LOW_FOCUS' };
  }

  // Verifica se há Haki suficiente para o débito dinâmico
  if ((fighterState.hakiMeter || 0) < requiredHaki) {
    return { canUse: false, hakiCost: requiredHaki, reason: 'INSUFFICIENT_HAKI' };
  }

  return { canUse: true, hakiCost: requiredHaki };
}

export interface CombatActionResult {
  updatedAttacker: BattleFighterState;
  updatedDefender: BattleFighterState;
  log: ActionLog;
  isGameOver: boolean;
  roundWinnerSide?: 'team1' | 'team2';
}

export function createBattleFighterState(fighter: Fighter): BattleFighterState {
  const awakeningProfile = fighter.awakeningProfile || getCharacterAwakeningProfile(fighter);
  // Inicialização com estoque básico de Haki baseado nas afinidades do lutador (mínimo de 80 pts)
  const initialHaki = Math.min(300, Math.max(80, Math.round((fighter.haki.conqueror + fighter.haki.armament + fighter.haki.observation) / 3)));

  return {
    fighter,
    currentHp: fighter.stats.maxHp,
    maxHp: fighter.stats.maxHp,
    currentStance: 'balanced',
    momentum: 0,
    recentMoves: [],
    tauntVulnerable: false,
    counterReady: false,
    superMeter: 0,
    maxModeMeter: 0,
    isMaxModeActive: false,
    guardGauge: 100,
    moveCooldowns: {},
    statusEffects: {},
    totalDamageDealt: 0,
    hitsTaken: 0,
    highestCombo: 0,
    isDefeated: false,
    focusMeter: 100,
    staminaMeter: 100,
    maxStamina: 100,
    isExhausted: false,
    hakiMeter: initialHaki,
    isHakiAwakened: false,
    hakiAwakeningTurnsLeft: 0,
    isAwakened: false,
    awakeningHasTriggered: false,
    awakeningTurnsLeft: 0,
    awakeningProfile,
    unlockedAwakeningMoves: awakeningProfile.uniqueMoves,
    actionReady: true,
    actionCooldown: 0,
    actionDuration: 0,
  };
}

export function decrementCooldowns(cooldowns: Record<string, number>): Record<string, number> {
  const nextCd: Record<string, number> = {};
  Object.entries(cooldowns || {}).forEach(([mId, cd]) => {
    nextCd[mId] = Math.max(0, cd - 1);
  });
  return nextCd;
}

export interface CalculateDamageParams {
  attackerState: BattleFighterState;
  defenderState: BattleFighterState;
  move: Move;
  stage?: StageInfo;
  comboMultiplier?: number;
  isSuddenDeath?: boolean;
  consecutiveHits?: number;
  isJustGuard?: boolean;
}

// Calibrated Combo Multiplier with diminishing returns for Speedsters to prevent infinite snowballing
export function getComboMultiplier(consecutiveHits: number): number {
  if (consecutiveHits <= 1) return 1.0;
  if (consecutiveHits <= 3) return 1.04;
  if (consecutiveHits <= 5) return 1.08;
  if (consecutiveHits <= 8) return 1.14;
  if (consecutiveHits <= 12) return 1.22;
  if (consecutiveHits <= 16) return 1.32;
  return 1.45; // Maximum +45% scaling cap
}

export interface ComboRankInfo {
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  multiplier: number;
}

export function getComboRank(hits: number): ComboRankInfo {
  const mult = getComboMultiplier(hits);
  if (hits >= 16) {
    return {
      title: 'KING OF FIGHTERS CLIMAX',
      subtitle: 'SUN GOD WILL • SUPREME DOMINANCE',
      color: 'text-amber-300',
      borderColor: 'border-amber-400',
      badgeBg: 'from-amber-500 via-rose-500 to-purple-600',
      multiplier: mult,
    };
  }
  if (hits >= 12) {
    return {
      title: 'EMPEROR OVERDRIVE',
      subtitle: 'RYUO INTERNAL DESTRUCTION',
      color: 'text-red-400',
      borderColor: 'border-red-500',
      badgeBg: 'from-red-600 to-amber-600',
      multiplier: mult,
    };
  }
  if (hits >= 8) {
    return {
      title: 'SUPERIOR RHYTHM',
      subtitle: 'WARLORD COMBAT FLOW',
      color: 'text-cyan-300',
      borderColor: 'border-cyan-400',
      badgeBg: 'from-cyan-600 to-blue-600',
      multiplier: mult,
    };
  }
  if (hits >= 5) {
    return {
      title: 'GREAT CHAIN',
      subtitle: 'GRAND LINE MOMENTUM',
      color: 'text-emerald-300',
      borderColor: 'border-emerald-400',
      badgeBg: 'from-emerald-600 to-teal-600',
      multiplier: mult,
    };
  }
  if (hits >= 2) {
    return {
      title: 'NICE COMBO',
      subtitle: 'PIRATE SYNERGY',
      color: 'text-amber-200',
      borderColor: 'border-amber-300',
      badgeBg: 'from-amber-600 to-orange-600',
      multiplier: mult,
    };
  }
  return {
    title: 'HIT',
    subtitle: 'STANDARD STRIKE',
    color: 'text-zinc-200',
    borderColor: 'border-zinc-500',
    badgeBg: 'from-zinc-700 to-zinc-800',
    multiplier: 1.0,
  };
}

export interface DamageCalculationOutcome {
  finalDamage: number;
  isCrit: boolean;
  isDodged: boolean;
  isFutureSightDodge?: boolean;
  isMiss: boolean;
  isBlocked: boolean;
  isGuardCrush: boolean;
  isHakiClash: boolean;
  isCounter: boolean;
  comboHits: number;
  guardDamageDealt: number;
  superMeterGained: number;
  hakiMultiplier?: number;
  isJustGuard?: boolean;
}

// 1. Determine Fighter Archetype
export function getFighterArchetype(fighter: Fighter): CombatArchetype {
  if (!fighter) return 'Specialist';
  if (fighter.archetype) return fighter.archetype;
  const id = (fighter.id || '').toLowerCase();
  if (id.includes('kaido') || id.includes('whitebeard') || id.includes('garp')) return 'Tank';
  if (id.includes('kizaru') || id.includes('katakuri') || id.includes('luffy')) return 'Speedster';
  if (id.includes('akainu') || id.includes('zoro')) return 'Berserker';
  if (id.includes('law') || id.includes('mihawk')) return 'Technician';
  if (id.includes('shanks') || id.includes('roger')) return 'Specialist';
  if (id.includes('buggy') || id.includes('blackbeard')) return 'Trickster';
  return 'Specialist';
}

// 2. Battle Phase Analysis
export type BattlePhase = 'Opening' | 'Mid' | 'Climax' | 'Desperate';
export function getBattlePhase(currentHp: number, maxHp: number): BattlePhase {
  const ratio = currentHp / maxHp;
  if (ratio > 0.75) return 'Opening';
  if (ratio > 0.50) return 'Mid';
  if (ratio > 0.25) return 'Climax';
  return 'Desperate';
}

export function calculateCombatDamage(params: CalculateDamageParams): DamageCalculationOutcome {
  const { attackerState, defenderState, move, stage, isSuddenDeath } = params;
  const attacker = attackerState.fighter;
  const defender = defenderState.fighter;
  
  const attackerArchetype = getFighterArchetype(attacker);
  const defenderArchetype = getFighterArchetype(defender);
  const attackerPhase = getBattlePhase(attackerState.currentHp, attackerState.maxHp);
  const defenderPhase = getBattlePhase(defenderState.currentHp, defenderState.maxHp);

  // --- ADVANCED BIOGRAPHICAL / STATUS ANALYSIS ---
  
  // 1. Win Record (Confidence / Momentum)
  const attTotalGames = Math.max(1, attacker.winRecord.wins + attacker.winRecord.losses);
  const defTotalGames = Math.max(1, defender.winRecord.wins + defender.winRecord.losses);
  const attWinRate = attacker.winRecord.wins / attTotalGames;
  const defWinRate = defender.winRecord.wins / defTotalGames;
  
  // 2. Age & Experience
  const attExperience = attacker.experienceYears || (attacker.age > 40 ? 20 : 5);
  const defExperience = defender.experienceYears || (defender.age > 40 ? 20 : 5);
  const expDiff = attExperience - defExperience;
  
  // 3. Rank Pressure (Conqueror's Presence)
  const highRanks = ['Pirate King', 'Yonko (Four Emperors)', 'Fleet Admiral', 'Grand Line Legend'];
  const attHasRankPressure = highRanks.includes(attacker.rank) && !highRanks.includes(defender.rank);
  const defHasRankPressure = highRanks.includes(defender.rank) && !highRanks.includes(attacker.rank);

  // --- TECHNICAL PROFILE & HAKI MASTERY ---
  
  // 1. Pattern Detection (Evasion boost if same move is spammed)
  let patternEvadeBonus = 0;
  const recentUsesOfMove = (attackerState.recentMoves?.filter((mId) => mId === move.id)?.length || 0);
  if (recentUsesOfMove >= 2) {
    patternEvadeBonus = 25 + defExperience * 0.5; // Veterans punish patterns harder
  }

  // 2. Kenbunshoku Haki (Observation) Evasion - Strictly Dependent on Focus Level
  const baseMissRate = move.missRate || 0;
  const defenderFocus = defenderState.focusMeter ?? 100;
  const isFutureSightMaster = checkObservationMastery(defender);
  
  // Regra 1 & 3: Condição de Bloqueio e Eficiência Proporcional ao Foco
  let focusObservationEfficiency = 0;
  if (defenderFocus >= MIN_OBSERVATION_FOCUS_THRESHOLD) {
    // Normalização em curva exponencial: Foco 100% -> 1.0x; Foco 60% -> ~0.53x; Foco 25% -> 0.0x
    focusObservationEfficiency = Math.pow((defenderFocus - MIN_OBSERVATION_FOCUS_THRESHOLD) / (100 - MIN_OBSERVATION_FOCUS_THRESHOLD), 1.25);
  }

  // Evasão base de Kenbunshoku modulada diretamente pelo Foco
  let observationEvasionChance = (defender.haki.observation / 100) * 10 * focusObservationEfficiency;

  // Maestria superior (Katakuri, Shanks, Enel, etc.)
  if (isFutureSightMaster) {
    // Entre 35% e 65% de predição sob Foco total, desmoronando para 0% caso o Foco caia abaixo de 25%
    observationEvasionChance = (35 + (defender.haki.observation / 100) * 30) * focusObservationEfficiency;
  } else if (defender.haki.observation > 90) {
    observationEvasionChance *= 1.5;
  }

  const speedDiff = Math.max(0, defender.stats.speed - attacker.stats.speed) * 0.08;
  // A esquiva de Visão do Futuro ativa SOMENTE se o Foco não estiver rompido
  const isFutureSightDodging = Boolean(defenderState.statusEffects.isFutureSightActive && defenderFocus >= MIN_OBSERVATION_FOCUS_THRESHOLD);
  
  const defenderStanceEvasion = defenderState.currentStance === 'balanced' ? 5 : defenderState.currentStance === 'defensive' ? 2 : 0;
  const archetypeEvasionBonus = defenderArchetype === 'Speedster' ? 6 : 0;
  
  let totalDodgeChance = baseMissRate + observationEvasionChance + speedDiff + patternEvadeBonus + defenderStanceEvasion + archetypeEvasionBonus;
  
  // Attacker's focus deficit increases defender's evasion chance (decreased accuracy)
  if (attackerState.focusMeter !== undefined) {
    const focusEvasionBonus = (100 - attackerState.focusMeter) * 0.15;
    totalDodgeChance += focusEvasionBonus;
  }

  if (defender.devilFruit?.passivePerk?.toLowerCase().includes('evasion')) {
    totalDodgeChance += 5;
  }
  
  // Dodge spam check (penalizes repeated dodging within the last 4 actions)
  let dodgeSpamPenalty = 0;
  const recentDodges = defenderState.recentMoves?.filter((mId) => mId === 'dodge')?.length || 0;
  if (recentDodges > 0) {
    dodgeSpamPenalty = recentDodges * 20; // Deduct 20% success chance per recent dodge to deter repetitive abuse
  }

  if (isFutureSightDodging) {
    // Efficacy escalada pela eficiência do Foco
    const baseFsRate = (isFutureSightMaster ? 60 : 45) + (defender.haki.observation / 100) * (isFutureSightMaster ? 25 : 15);
    totalDodgeChance = baseFsRate * focusObservationEfficiency - dodgeSpamPenalty;
    totalDodgeChance = Math.max(isFutureSightMaster ? 15 : 5, totalDodgeChance); // Floor de 5-15% sob fadiga
  } else {
    // Evasão padrão é estritamente limitada a 25% (ou até 65% para mestres com Foco alto)
    const maxPassiveDodge = (isFutureSightMaster ? 65 : 25) * (focusObservationEfficiency > 0 ? 1 : 0.35);
    totalDodgeChance = Math.min(maxPassiveDodge, totalDodgeChance - dodgeSpamPenalty);
    totalDodgeChance = Math.max(0, totalDodgeChance);
  }
  
  // Rank pressure slightly reduces attacker accuracy
  if (defHasRankPressure) totalDodgeChance += 3;

  const rollDodge = Math.random() * 100;
  const isDodgeSuccess = rollDodge < totalDodgeChance && move.type !== 'super';

  if (isDodgeSuccess) {
    const isFsDodge = isFutureSightDodging || isFutureSightMaster;
    return {
      finalDamage: 0, isCrit: false, isDodged: true, isFutureSightDodge: isFsDodge, isMiss: false, isBlocked: false,
      isGuardCrush: false, isHakiClash: false, isCounter: false, comboHits: 0,
      guardDamageDealt: 0, superMeterGained: 5,
    };
  }

  // 3. Natural Whiff / Miss Mechanics
  const accuracyRoll = Math.random() * 100;
  const attackerAccuracyMod = attackerState.currentStance === 'offensive' ? 5 : 0;
  const naturalMissThreshold = Math.max(3, baseMissRate - attackerAccuracyMod);
  if (accuracyRoll < naturalMissThreshold && move.type !== 'super') {
    return {
      finalDamage: 0, isCrit: false, isDodged: false, isMiss: true, isBlocked: false,
      isGuardCrush: false, isHakiClash: false, isCounter: false, comboHits: 0,
      guardDamageDealt: 0, superMeterGained: 3,
    };
  }

  // 4. Haki Clash (Conqueror)
  let isHakiClash = false;
  if (
    attacker.haki.conqueror >= 70 &&
    defender.haki.conqueror >= 70 &&
    (move.type === 'super' || move.hakiInfused) &&
    Math.random() < 0.25
  ) {
    isHakiClash = true;
  }

  // --- DAMAGE CALCULATION (Game Balance) ---
  
  // Calibrated for 120-240s total match duration.
  let pacingMultiplier = 0.58; 

  let rawDamage = move.baseDamage * (attacker.stats.attack / 100) * pacingMultiplier;

  // Busoshoku (Armament) Ryuo Penetration
  let ryuoPenetration = (attacker.haki.armament / 100) * (attackerArchetype === 'Technician' ? 0.50 : 0.35);
  if (attacker.haki.armament > 90) ryuoPenetration *= 1.3; // Advanced Internal Destruction

  const effectiveDefense = defender.stats.defense * (1 - ryuoPenetration);
  const defenseFactor = Math.max(0.42, 1 - effectiveDefense / 280);
  rawDamage = rawDamage * defenseFactor;

  // Archetype & Stance Modifiers
  if (attackerArchetype === 'Berserker') rawDamage *= 1.18;
  if (attackerArchetype === 'Speedster') rawDamage *= 0.94;
  if (defenderArchetype === 'Tank') rawDamage *= 0.88;
  
  if (attackerState.currentStance === 'offensive') rawDamage *= 1.25;
  if (attackerState.currentStance === 'defensive') rawDamage *= 0.75;
  if (defenderState.currentStance === 'offensive') rawDamage *= 1.20;
  if (defenderState.currentStance === 'defensive') rawDamage *= 0.65;

  // Tactical vulnerabilities
  if (defenderState.tauntVulnerable) rawDamage *= 1.30;
  
  // Defender's focus deficit increases raw damage taken (decreased defense/composure)
  if (defenderState.focusMeter !== undefined) {
    const focusPenalty = 1 + (100 - defenderState.focusMeter) * 0.0035; // Up to +35% extra damage at 0 focus
    rawDamage *= focusPenalty;
  }

  // Attacker Stamina / Fatigue Penalties
  if (attackerState.isExhausted || (attackerState.staminaMeter !== undefined && attackerState.staminaMeter <= 0)) {
    rawDamage *= 0.75; // -25% damage penalty when exhausted
  } else if (attackerState.staminaMeter !== undefined && attackerState.staminaMeter < 25) {
    rawDamage *= 0.90; // -10% damage penalty on low stamina
  }

  // Awakening System Stat Boosts: Damage Multipliers & Defense Reduction
  if (attackerState.isAwakened) {
    const atkBoost = attackerState.awakeningProfile?.statBuffs?.attackMultiplier || 1.35;
    rawDamage *= atkBoost;
  }

  // Haki Awakening Stat Boosts: +25% Attack, +30% Defense
  if (attackerState.isHakiAwakened) {
    rawDamage *= 1.25;
  }

  if (defenderState.isAwakened) {
    const defBoost = defenderState.awakeningProfile?.statBuffs?.defenseMultiplier || 1.25;
    rawDamage *= (1 / defBoost);
  }

  if (defenderState.isHakiAwakened) {
    rawDamage *= (1 / 1.30); // 30% damage reduction when defender is in Haki Awakening state
  }

  // Defender Stamina / Exhaustion Vulnerability (Stamina Broken)
  if (defenderState.isExhausted || (defenderState.staminaMeter !== undefined && defenderState.staminaMeter <= 0)) {
    rawDamage *= 1.25; // +25% extra damage taken when exhausted / out of breath
  }
  
  let isCounter = false;
  if (attackerState.counterReady) {
    isCounter = true;
    rawDamage *= 1.35 + (attExperience * 0.01); // Experience makes counters deadlier
  }

  // Conqueror Haki Infusion boost
  if (move.hakiInfused || move.type === 'super') {
    const conquerorBonus = 1 + (attacker.haki.conqueror / 100) * (attacker.haki.conqueror > 90 ? 0.45 : 0.30);
    rawDamage *= conquerorBonus;
  }

  // Momentum & Win Rate Boost
  let momentumMultiplier = 1 + (attackerState.momentum * 0.015) + (attWinRate > 0.7 ? 0.05 : 0);
  if (attHasRankPressure) momentumMultiplier += 0.05;
  rawDamage *= Math.max(0.85, Math.min(1.25, momentumMultiplier));

  if (attackerState.isMaxModeActive) rawDamage *= 1.20;
  if (attackerPhase === 'Desperate') rawDamage *= 1.15;
  if (stage?.id === 'stage_laugh_tale') rawDamage *= 1.06;

  // Active World Event Modifiers
  if (stage?.eventModifiers && stage.eventModifiers.length > 0) {
    for (const mod of stage.eventModifiers) {
      const lower = (mod || '').toLowerCase();
      if (lower.includes('artillery') || lower.includes('buster')) {
        rawDamage *= 1.15; // Buster Call Artillery bombardment
      }
      if (lower.includes('coalescence') || lower.includes('conqueror') || lower.includes('summit')) {
        rawDamage *= 1.10; // Conqueror Summit resonance
      }
      if (lower.includes('darkness') || lower.includes('nullification')) {
        rawDamage *= 1.20; // Darkness physical/Haki surge
      }
      if (lower.includes('knights') || lower.includes('suppression')) {
        if (attackerPhase === 'Desperate') rawDamage *= 1.30; // Desperation surge
      }
    }
  }

  // Fighting Style Specific Interactions
  if (attacker.fightingStyle.includes('Sword') && defender.fightingStyle.includes('Brawler')) {
     rawDamage *= 1.05; // Slight weapon advantage
  }

  // 6. Critical Hit (Tension & Reversals)
  let totalCritRate = attacker.stats.critRate + move.critBonus;
  if (attackerState.currentStance === 'offensive') totalCritRate += 15;
  if (attackerArchetype === 'Berserker') totalCritRate += 10;
  if (attackerState.isAwakened) totalCritRate += (attackerState.awakeningProfile?.statBuffs?.critBonus || 25);
  if (attackerState.momentum > 0) totalCritRate += attackerState.momentum * 1.5;
  totalCritRate += (expDiff > 10 ? 5 : 0); // High experience gives slight crit edge
  if (stage?.eventModifiers?.some(m => (m || '').toLowerCase().includes('cross guild') || (m || '').toLowerCase().includes('skypiea'))) {
    totalCritRate += 15; // Event critical strike enhancement
  }

  const isCrit = Math.random() * 100 < totalCritRate;
  if (isCrit) {
    rawDamage *= (attackerArchetype === 'Berserker' ? 1.75 : 1.55);
  }

  // 7. Guarding & Guard Crush
  let isBlocked = false;
  let isGuardCrush = false;
  let guardDamage = move.guardDamage;
  if (attackerArchetype === 'Tank') guardDamage *= 1.4;

  const shouldBlock = defenderState.statusEffects.isGuarding || 
                      defenderState.currentStance === 'defensive' || 
                      (defenderArchetype === 'Tank' && Math.random() < 0.35);

  if (params.isJustGuard) {
    isBlocked = true;
    rawDamage = 0;
    guardDamage = 0;
  } else if (shouldBlock && !isHakiClash && move.type !== 'super') {
    isBlocked = true;
    let blockReduction = defenderArchetype === 'Tank' ? 0.22 : 0.30;
    rawDamage *= blockReduction;
    guardDamage *= 1.4;
    
    if (defenderState.guardGauge <= guardDamage) {
      isGuardCrush = true;
      rawDamage *= 1.45;
    }
  }

  // 8. Devil Fruit Specific Matchups
  if (defender?.devilFruit?.type === 'Logia' && (attacker?.haki?.armament || 0) < 60 && !move?.hakiInfused) {
    rawDamage *= 0.55;
  }
  if (defender?.id === 'buggy_emperor' && move?.element?.toLowerCase().includes('slash')) {
    rawDamage = 0;
  }
  if (defender?.id === 'luffy' && move?.element === 'lightning') {
    rawDamage = 0; // Rubber immunity to electricity
  }
  if (attacker?.id === 'enel_god' && defender?.id !== 'luffy' && move?.element === 'lightning') {
    rawDamage *= 1.25; // God's Wrath: Lightning moves are devastating to non-rubber targets
  }
  if (defender.id === 'kaido_beast' && !move.hakiInfused && attacker.haki.armament < 90) {
    rawDamage *= 0.85;
  }
  if (defender.id === 'imu_sama') {
    rawDamage *= 0.75; // Absolute Authority: Imu takes 25% less damage from everyone
  }

  // 9. Combo Multiplier
  const comboMult = params.comboMultiplier && params.comboMultiplier > 0 ? params.comboMultiplier : 1.0;
  rawDamage *= comboMult;

  // Haki Multiplier: Triggers at 5+ consecutive hits
  let hakiMultiplier = 1.0;
  const hits = params.consecutiveHits || 0;
  if (hits >= 5) {
    const highestHaki = Math.max(
      attacker.haki.observation || 0,
      attacker.haki.armament || 0,
      attacker.haki.conqueror || 0
    );
    // Provides up to +15% extra damage multiplier at 100 Haki points
    hakiMultiplier = 1.0 + (highestHaki / 100) * 0.15;
    rawDamage *= hakiMultiplier;
  }

  // 10. Random Variance (Dynamic & Unpredictable)
  const variance = Math.random() * 0.14 - 0.07;
  const finalDamage = params.isJustGuard ? 0 : Math.max(18, Math.round(rawDamage * (1 + variance)));

  // 11. Multi-hit combo estimation
  let comboHits = 1;
  if (move.type === 'special') comboHits = attackerArchetype === 'Speedster' ? 4 : 2;
  if (move.type === 'ex') comboHits = attackerArchetype === 'Speedster' ? 6 : 4;
  if (move.type === 'super') comboHits = attackerArchetype === 'Speedster' ? 10 : 6;

  // 12. Meter Gain Calibration
  let meterGain = Math.round(move.meterGain * 0.45);
  if (attackerArchetype === 'Trickster') meterGain = Math.round(meterGain * 1.3);
  if (attackerPhase === 'Desperate') meterGain = Math.round(meterGain * 1.25);
  if (attackerState.isMaxModeActive) meterGain = Math.round(meterGain * 0.5);

  return {
    finalDamage, isCrit: isCrit && !params.isJustGuard, isDodged: false, isMiss: false, isBlocked,
    isGuardCrush, isHakiClash, isCounter, comboHits, guardDamageDealt: guardDamage,
    superMeterGained: params.isJustGuard ? 15 : meterGain,
    hakiMultiplier,
    isJustGuard: params.isJustGuard,
  };
}

export function executeMoveAction(
  attackerState: BattleFighterState,
  defenderState: BattleFighterState,
  move: Move,
  roundNumber: number,
  actorSide: 'team1' | 'team2',
  stage?: StageInfo,
  comboMultiplier?: number,
  isSuddenDeath?: boolean,
  consecutiveHits?: number,
  isJustGuard?: boolean
): CombatActionResult {
  const calculation = calculateCombatDamage({
    attackerState,
    defenderState,
    move,
    stage,
    comboMultiplier,
    isSuddenDeath,
    consecutiveHits,
    isJustGuard,
  });

  const nextAttacker = { ...attackerState };
  const nextDefender = { ...defenderState };

  // Append move to recent moves for pattern tracking
  nextAttacker.recentMoves = [...nextAttacker.recentMoves.slice(-4), move.id];

  // Consume counter-ready state and taunt vulnerability
  nextAttacker.counterReady = false;
  nextAttacker.tauntVulnerable = false;

  // Meter Cost Calculation (Desperate Phase reduces cost by 25%)
  const isDesperate = getBattlePhase(nextAttacker.currentHp, nextAttacker.maxHp) === 'Desperate';
  const superCost = isDesperate ? 150 : 200;

  if (move.type === 'ex') {
    nextAttacker.superMeter = Math.max(0, nextAttacker.superMeter - 100);
  } else if (move.type === 'super') {
    nextAttacker.superMeter = Math.max(0, nextAttacker.superMeter - superCost);
  } else if (move.type === 'finisher') {
    nextAttacker.superMeter = 0; // Consumes all 3 stocks
  }

  // Super Meter Gain for Attacker
  nextAttacker.superMeter = Math.min(300, nextAttacker.superMeter + calculation.superMeterGained);

  // Meter Gain for Defender when taking hits (calibrated ~10-14 on taking damage)
  if (!calculation.isDodged && !calculation.isMiss) {
    const defenderGain = Math.round(calculation.finalDamage * 0.08);
    nextDefender.superMeter = Math.min(300, nextDefender.superMeter + defenderGain);
  }

  // Decrement other move cooldowns and set current move cooldown
  const currentCds = decrementCooldowns(attackerState.moveCooldowns);
  if (move.cooldown && move.cooldown > 0) {
    currentCds[move.id] = move.cooldown;
  } else {
    currentCds[move.id] = 0;
  }
  nextAttacker.moveCooldowns = currentCds;

  // Haki Meter fills up as players land hits
  if (!calculation.isDodged && !calculation.isMiss) {
    const hakiGain = move.type === 'super' || move.type === 'finisher' ? 100 : move.type === 'special' ? 60 : 35;
    nextAttacker.hakiMeter = Math.min(300, (nextAttacker.hakiMeter || 0) + hakiGain);
  }

  // Haki Awakening turn decay
  if (nextAttacker.isHakiAwakened) {
    nextAttacker.hakiAwakeningTurnsLeft = Math.max(0, (nextAttacker.hakiAwakeningTurnsLeft || 1) - 1);
    if (nextAttacker.hakiAwakeningTurnsLeft <= 0) {
      nextAttacker.isHakiAwakened = false;
    }
  }

  // Apply Momentum Changes & Counter Opportunity
  if (calculation.isDodged || calculation.isMiss) {
    // Whiff / Miss Punish: Defender gains Momentum & becomes Counter-Ready!
    nextDefender.counterReady = true;
    nextDefender.momentum = Math.min(10, nextDefender.momentum + 2);
    nextAttacker.momentum = Math.max(-10, nextAttacker.momentum - 1);

    // Consumo dinâmico de Haki ao evadir via Kenbunshoku (Regra 2 & 4)
    if (calculation.isFutureSightDodge) {
      const defFocus = nextDefender.focusMeter ?? 100;
      const isDefMaster = checkObservationMastery(nextDefender.fighter);
      const defHakiCost = calculateObservationHakiCost(defFocus, isDefMaster);
      nextDefender.hakiMeter = Math.max(0, (nextDefender.hakiMeter || 0) - Math.round(defHakiCost * 0.75));
    }
  } else {
    // Successful Hit / Blocked Strike
    nextDefender.currentHp = Math.max(0, nextDefender.currentHp - calculation.finalDamage);
    nextAttacker.totalDamageDealt += calculation.finalDamage;
    nextDefender.hitsTaken += calculation.comboHits;

    if (calculation.comboHits > nextAttacker.highestCombo) {
      nextAttacker.highestCombo = calculation.comboHits;
    }

    // Apply Momentum shift
    if (calculation.isJustGuard) {
      nextDefender.momentum = Math.min(10, nextDefender.momentum + 3);
      nextAttacker.momentum = Math.max(-10, nextAttacker.momentum - 2);
    } else {
      nextAttacker.momentum = Math.min(10, nextAttacker.momentum + (calculation.isCrit ? 2 : 1));
      nextDefender.momentum = Math.max(-10, nextDefender.momentum - 1);
    }

    // Sovereignty Passive: Imu-sama drains HP and Meter from opponent every turn (negated on parry)
    if (attackerState.fighter.id === 'imu_sama' && !calculation.isJustGuard) {
      const drainHp = Math.round(nextDefender.maxHp * 0.01);
      const drainMeter = 6; // 2% of 300 max meter
      nextDefender.currentHp = Math.max(0, nextDefender.currentHp - drainHp);
      nextDefender.superMeter = Math.max(0, nextDefender.superMeter - drainMeter);
      nextAttacker.currentHp = Math.min(nextAttacker.maxHp, nextAttacker.currentHp + Math.round(drainHp * 0.5)); // Heals half of drain
      nextAttacker.superMeter = Math.min(300, nextAttacker.superMeter + drainMeter);
    }

    if (calculation.isJustGuard) {
      nextDefender.guardGauge = Math.min(100, nextDefender.guardGauge + 15);
      nextAttacker.statusEffects = { ...nextAttacker.statusEffects, isStunned: 1 };
    } else if (calculation.isGuardCrush) {
      nextDefender.guardGauge = 30; // Reset after crush
      nextDefender.statusEffects = { ...nextDefender.statusEffects, isStunned: 1, isGuarding: false };
      nextDefender.momentum = Math.max(-10, nextDefender.momentum - 3);
    } else if (calculation.isBlocked) {
      nextDefender.guardGauge = Math.max(0, nextDefender.guardGauge - calculation.guardDamageDealt);
    } else {
      nextDefender.guardGauge = Math.min(100, nextDefender.guardGauge + 3);
    }
  }

  // Reset transient defensive buffs
  nextDefender.statusEffects = {
    ...nextDefender.statusEffects,
    isFutureSightActive: false,
    isGuarding: false,
  };

  // Focus Meter natural recovery (+10 focus per combat turn, capped at 100)
  nextAttacker.focusMeter = Math.min(100, (nextAttacker.focusMeter ?? 100) + 10);
  nextDefender.focusMeter = Math.min(100, (nextDefender.focusMeter ?? 100) + 10);

  // Stamina System: Moves deplete stamina (specials, EX, supers cost more), forcing offensive vs defensive pacing
  let staminaCost = 10;
  if (move.type === 'special') {
    staminaCost = 22;
  } else if (move.type === 'ex') {
    staminaCost = 30;
  } else if (move.type === 'super' || move.type === 'finisher' || move.type === 'awakening') {
    staminaCost = 38;
  } else if (move.type === 'command') {
    staminaCost = 14;
  }

  // Stance impact on stamina burn
  if (attackerState.currentStance === 'offensive') {
    staminaCost = Math.round(staminaCost * 1.25);
  } else if (attackerState.currentStance === 'defensive') {
    staminaCost = Math.round(staminaCost * 0.80);
  }

  const currentAttStamina = nextAttacker.staminaMeter ?? 100;
  const newAttStamina = Math.max(0, currentAttStamina - staminaCost);
  nextAttacker.staminaMeter = newAttStamina;
  nextAttacker.isExhausted = newAttStamina <= 0;

  // Defender stamina recovery during tactical defense (taking block / hit)
  const defenderStamina = nextDefender.staminaMeter ?? 100;
  const defenderStaminaGain = nextDefender.statusEffects.isGuarding ? 16 : 8;
  const newDefStamina = Math.min(100, defenderStamina + defenderStaminaGain);
  nextDefender.staminaMeter = newDefStamina;
  if (newDefStamina >= 25) {
    nextDefender.isExhausted = false;
  }

  const isDefenderDefeated = nextDefender.currentHp <= 0;
  const isAttackerDefeated = nextAttacker.currentHp <= 0;
  if (isDefenderDefeated) {
    nextDefender.isDefeated = true;
  }
  if (isAttackerDefeated) {
    nextAttacker.isDefeated = true;
  }

  const log: ActionLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    roundNumber,
    actorSide,
    actorName: attackerState.fighter.name,
    actorShortName: attackerState.fighter.shortName || attackerState.fighter.name.split(' ')[0],
    targetName: defenderState.fighter.name,
    targetShortName: defenderState.fighter.shortName || defenderState.fighter.name.split(' ')[0],
    moveName: move.name,
    moveNameJP: move.nameJP,
    moveType: move.type,
    damage: calculation.finalDamage,
    isCrit: calculation.isCrit,
    isDodged: calculation.isDodged,
    isFutureSightDodge: calculation.isFutureSightDodge,
    isMiss: calculation.isMiss,
    isBlocked: calculation.isBlocked,
    isGuardCrush: calculation.isGuardCrush,
    isHakiClash: calculation.isHakiClash,
    isCounter: calculation.isCounter,
    isJustGuard: calculation.isJustGuard,
    stance: attackerState.currentStance,
    comboCount: calculation.comboHits,
    timestamp: Date.now(),
    hakiMultiplier: calculation.hakiMultiplier,
    hakiType: calculation.isHakiClash ? 'Conqueror' : 
              (calculation.isDodged || calculation.isFutureSightDodge) ? 'Observation' :
              (move.hakiInfused || calculation.isBlocked || calculation.isGuardCrush || attackerState.fighter.haki.armament >= 40) ? 'Armament' : 'None',
    commentaryText: '',
  };
  log.commentaryText = getActionLogDescription(log);

  return {
    updatedAttacker: nextAttacker,
    updatedDefender: nextDefender,
    log,
    isGameOver: isDefenderDefeated || isAttackerDefeated,
    roundWinnerSide:
      isDefenderDefeated && isAttackerDefeated
        ? undefined
        : isDefenderDefeated
        ? actorSide
        : isAttackerDefeated
        ? (actorSide === 'team1' ? 'team2' : 'team1')
        : undefined,
  };
}

export function executeGuardAction(
  fighterState: BattleFighterState,
  actorSide: 'team1' | 'team2',
  roundNumber: number
): { updatedFighter: BattleFighterState; log: ActionLog } {
  const next = { ...fighterState };
  next.statusEffects = { ...next.statusEffects, isGuarding: true };
  next.focusMeter = Math.min(100, (next.focusMeter ?? 100) + 15);
  next.superMeter = Math.min(300, next.superMeter + 8);
  
  // Tactical Defensive Downtime: Guarding restores substantial stamina (+28) and clears exhaustion!
  const currentStamina = next.staminaMeter ?? 100;
  const restoredStamina = Math.min(100, currentStamina + 28);
  next.staminaMeter = restoredStamina;
  if (restoredStamina >= 25) {
    next.isExhausted = false;
  }

  next.tauntVulnerable = false;
  next.moveCooldowns = decrementCooldowns(fighterState.moveCooldowns);
  next.recentMoves = [...(fighterState.recentMoves || []).slice(-4), 'guard'];

  const log: ActionLog = {
    id: `log_${Date.now()}_guard`,
    roundNumber,
    actorSide,
    actorName: fighterState.fighter.name,
    actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    targetName: fighterState.fighter.name,
    targetShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    moveName: 'Defensive Guard Stance',
    moveNameJP: '武装色 防御態勢',
    moveType: 'command',
    damage: 0,
    isCrit: false,
    isDodged: false,
    isMiss: false,
    isBlocked: true,
    isGuardCrush: false,
    isHakiClash: false,
    comboCount: 0,
    timestamp: Date.now(),
    hakiType: 'Armament',
    commentaryText: '',
  };
  log.commentaryText = getActionLogDescription(log);

  return { updatedFighter: next, log };
}

export function executeFutureSightDodge(
  fighterState: BattleFighterState,
  actorSide: 'team1' | 'team2',
  roundNumber: number
): { updatedFighter: BattleFighterState; log: ActionLog; success: boolean; reason?: 'LOW_FOCUS' | 'INSUFFICIENT_HAKI' } {
  const next = { ...fighterState };
  const currentFocus = next.focusMeter ?? 100;
  const check = canUseObservationHaki(fighterState);

  // 1. Condição de Bloqueio (Regra 3 & 4): Foco insuficiente (< 25%) quebra o Kenbunshoku
  if (!check.canUse && check.reason === 'LOW_FOCUS') {
    next.recentMoves = [...(fighterState.recentMoves || []).slice(-4), 'dodge_failed'];
    next.moveCooldowns = decrementCooldowns(fighterState.moveCooldowns);
    next.moveCooldowns['dodge_action'] = 2;

    const log: ActionLog = {
      id: `log_${Date.now()}_dodge_fail`,
      roundNumber,
      actorSide,
      actorName: fighterState.fighter.name,
      actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
      targetName: fighterState.fighter.name,
      targetShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
      moveName: 'Foco Rompido: Kenbunshoku Falhou!',
      moveNameJP: '動揺・見聞色無効',
      moveType: 'command',
      damage: 0,
      isCrit: false,
      isDodged: false,
      isMiss: false,
      isBlocked: false,
      isGuardCrush: false,
      isHakiClash: false,
      comboCount: 0,
      timestamp: Date.now(),
      hakiType: 'Observation',
      commentaryText: `${fighterState.fighter.shortName || fighterState.fighter.name} perdeu a calma (${Math.round(currentFocus)}% Foco)! Kenbunshoku Haki foi rompido.`,
    };

    return { updatedFighter: next, log, success: false, reason: 'LOW_FOCUS' };
  }

  // 2. Falha por falta de Haki
  if (!check.canUse && check.reason === 'INSUFFICIENT_HAKI') {
    next.recentMoves = [...(fighterState.recentMoves || []).slice(-4), 'dodge_failed'];
    next.moveCooldowns = decrementCooldowns(fighterState.moveCooldowns);
    next.moveCooldowns['dodge_action'] = 2;

    const log: ActionLog = {
      id: `log_${Date.now()}_dodge_fail_haki`,
      roundNumber,
      actorSide,
      actorName: fighterState.fighter.name,
      actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
      targetName: fighterState.fighter.name,
      targetShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
      moveName: 'Haki Insuficiente: Kenbunshoku Falhou!',
      moveNameJP: '覇気不足・見聞色不発',
      moveType: 'command',
      damage: 0,
      isCrit: false,
      isDodged: false,
      isMiss: false,
      isBlocked: false,
      isGuardCrush: false,
      isHakiClash: false,
      comboCount: 0,
      timestamp: Date.now(),
      hakiType: 'Observation',
      commentaryText: `${fighterState.fighter.shortName || fighterState.fighter.name} não possui Haki suficiente (${Math.round(next.hakiMeter)}/${check.hakiCost}⚡).`,
    };

    return { updatedFighter: next, log, success: false, reason: 'INSUFFICIENT_HAKI' };
  }

  // 3. Sucesso: Consumo Dinâmico de Haki (Regra 2) e Estamina
  next.hakiMeter = Math.max(0, (next.hakiMeter || 0) - check.hakiCost);
  const currentStamina = next.staminaMeter ?? 100;
  const nextStamina = Math.max(0, currentStamina - 20);
  next.staminaMeter = nextStamina;
  next.isExhausted = nextStamina <= 0;

  // 4. Ativação de Status de Visão do Futuro & Recuperação Tática de Foco
  next.statusEffects = { ...next.statusEffects, isFutureSightActive: true };
  next.focusMeter = Math.min(100, currentFocus + 15);
  next.superMeter = Math.min(300, next.superMeter + 12);
  next.counterReady = true; // dodging primes counter-attack!

  next.tauntVulnerable = false;
  next.moveCooldowns = decrementCooldowns(fighterState.moveCooldowns);
  next.moveCooldowns['dodge_action'] = 3; // 3-turn cooldown
  next.recentMoves = [...(fighterState.recentMoves || []).slice(-4), 'dodge'];

  const log: ActionLog = {
    id: `log_${Date.now()}_dodge`,
    roundNumber,
    actorSide,
    actorName: fighterState.fighter.name,
    actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    targetName: fighterState.fighter.name,
    targetShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    moveName: `Kenbunshoku Future Sight (-${check.hakiCost}⚡ Haki)`,
    moveNameJP: '見聞色 未来視 回避',
    moveType: 'command',
    damage: 0,
    isCrit: false,
    isDodged: true,
    isMiss: false,
    isBlocked: false,
    isGuardCrush: false,
    isHakiClash: false,
    comboCount: 0,
    timestamp: Date.now(),
    hakiType: 'Observation',
    commentaryText: '',
  };
  log.commentaryText = getActionLogDescription(log);

  return { updatedFighter: next, log, success: true };
}

export function executeTauntAction(
  fighterState: BattleFighterState,
  actorSide: 'team1' | 'team2',
  roundNumber: number,
  selectedTaunt?: BattleTauntAnimation
): { updatedFighter: BattleFighterState; log: ActionLog } {
  const next = { ...fighterState };
  const archetype = getFighterArchetype(fighterState.fighter);
  const meterGain = selectedTaunt?.meterGain ?? (archetype === 'Trickster' ? 55 : 40);

  next.superMeter = Math.min(300, next.superMeter + meterGain);
  next.momentum = Math.min(10, next.momentum + 3);

  // Taunt consumes minor stamina (10)
  const currentStamina = next.staminaMeter ?? 100;
  const nextStamina = Math.max(0, currentStamina - 10);
  next.staminaMeter = nextStamina;
  next.isExhausted = nextStamina <= 0;

  next.tauntVulnerable = true; // vulnerable to +30% damage if hit next turn!
  next.moveCooldowns = decrementCooldowns(fighterState.moveCooldowns);
  next.recentMoves = [...(fighterState.recentMoves || []).slice(-4), 'taunt'];

  const moveName = selectedTaunt
    ? `${selectedTaunt.name} [${selectedTaunt.badge}]`
    : 'Battle Taunt (Provocation)';
  const moveNameJP = selectedTaunt?.nameJP || '挑発';

  const log: ActionLog = {
    id: `log_${Date.now()}_taunt`,
    roundNumber,
    actorSide,
    actorName: fighterState.fighter.name,
    actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    targetName: fighterState.fighter.name,
    targetShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    moveName,
    moveNameJP,
    moveType: 'command',
    damage: 0,
    isCrit: false,
    isDodged: false,
    isMiss: false,
    isBlocked: false,
    isGuardCrush: false,
    isHakiClash: false,
    isTaunt: true,
    comboCount: 0,
    commentaryText: selectedTaunt ? `「${selectedTaunt.quoteJP}」 "${selectedTaunt.quoteEN}"` : undefined,
    timestamp: Date.now(),
  };

  return { updatedFighter: next, log };
}

export function executeActivateMaxMode(
  fighterState: BattleFighterState,
  actorSide: 'team1' | 'team2',
  roundNumber: number
): { updatedFighter: BattleFighterState; log: ActionLog } | null {
  if (fighterState.superMeter < 100 || fighterState.isMaxModeActive) {
    return null;
  }

  const next = { ...fighterState };
  next.superMeter -= 100;
  next.isMaxModeActive = true;
  next.maxModeMeter = 100;
  // MAX Mode surges stamina back to full!
  next.staminaMeter = 100;
  next.isExhausted = false;
  next.momentum = Math.min(10, next.momentum + 4);
  next.moveCooldowns = decrementCooldowns(fighterState.moveCooldowns);

  const log: ActionLog = {
    id: `log_${Date.now()}_maxmode`,
    roundNumber,
    actorSide,
    actorName: fighterState.fighter.name,
    actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    targetName: fighterState.fighter.name,
    targetShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    moveName: 'MAX MODE ACTIVATION (Conqueror Surge)',
    moveNameJP: 'MAX発動 覇王色の覚醒',
    moveType: 'ex',
    damage: 0,
    isCrit: false,
    isDodged: false,
    isMiss: false,
    isBlocked: false,
    isGuardCrush: false,
    isHakiClash: true,
    comboCount: 0,
    timestamp: Date.now(),
    hakiType: 'Conqueror',
  };

  return { updatedFighter: next, log };
}

/**
 * Regenerates stamina naturally during combat downtime or active defensive posture.
 */
export function regenerateFighterMeters(fighterState: BattleFighterState, deltaAmount: number = 6): BattleFighterState {
  const currentStamina = fighterState.staminaMeter ?? 100;
  // Defensive stance gains 50% more stamina recovery during downtime
  const stanceBonus = fighterState.currentStance === 'defensive' ? 1.5 : fighterState.currentStance === 'balanced' ? 1.1 : 0.85;
  const awakeningBonus = fighterState.isAwakened ? (fighterState.awakeningProfile?.statBuffs?.staminaRegenMultiplier || 2.2) : 1.0;
  const newStamina = Math.min(fighterState.maxStamina || 100, currentStamina + Math.round(deltaAmount * stanceBonus * awakeningBonus));
  
  // Haki Energy (superMeter) Regeneration based on Stance
  // Offensive stance gains more passive Haki energy to unleash attacks
  // Defensive stance focuses more on stamina and defense, generating less Haki
  const hakiRegenRate = fighterState.currentStance === 'offensive' ? 4 : fighterState.currentStance === 'defensive' ? 1 : 2;
  const currentSuper = fighterState.superMeter || 0;
  const newSuper = Math.min(300, currentSuper + hakiRegenRate);

  return {
    ...fighterState,
    staminaMeter: newStamina,
    superMeter: newSuper,
    isExhausted: fighterState.isAwakened ? false : (newStamina < 25 ? (fighterState.isExhausted && newStamina <= 0) : false),
  };
}

/**
 * Checks if a fighter should awaken (HP <= 25%) and returns the updated state and trigger event
 */
export function checkAwakeningTrigger(fighterState: BattleFighterState): {
  didTrigger: boolean;
  updatedState: BattleFighterState;
  awakeningProfile?: AwakeningProfile;
} {
  if (
    fighterState.currentHp > 0 &&
    fighterState.currentHp <= fighterState.maxHp * 0.25 &&
    !fighterState.isAwakened &&
    !fighterState.awakeningHasTriggered
  ) {
    const profile = fighterState.awakeningProfile || getCharacterAwakeningProfile(fighterState.fighter);
    const updated: BattleFighterState = {
      ...fighterState,
      isAwakened: true,
      awakeningHasTriggered: true,
      awakeningTurnsLeft: profile.durationTurns || 99,
      awakeningProfile: profile,
      unlockedAwakeningMoves: profile.uniqueMoves,
      staminaMeter: 100, // full stamina surge on Awakening
      isExhausted: false,
      momentum: Math.min(10, fighterState.momentum + 5),
    };
    return {
      didTrigger: true,
      updatedState: updated,
      awakeningProfile: profile,
    };
  }
  return {
    didTrigger: false,
    updatedState: fighterState,
  };
}

// Smart Dynamic AI Decision Logic with Anti-Repetition and Tactical Variety
export function getSmartAiMoveChoice(
  aiState: BattleFighterState,
  opponentState: BattleFighterState,
  difficulty: 'normal' | 'hard' | 'emperor' = 'hard'
): { action: 'move' | 'guard' | 'dodge' | 'max_mode' | 'taunt'; selectedMove?: Move; desiredStance?: CombatStance } {
  const archetype = getFighterArchetype(aiState.fighter);
  const phase = getBattlePhase(aiState.currentHp, aiState.maxHp);
  const oppPhase = getBattlePhase(opponentState.currentHp, opponentState.maxHp);

  // Dynamic Stance Switching based on Battle Phase & HP
  let desiredStance: CombatStance = aiState.currentStance;
  const currentStamina = aiState.staminaMeter ?? 100;
  if (aiState.isAwakened) {
    desiredStance = 'offensive'; // Awakened fighters unleash ferocious aggression
  } else if (currentStamina < 25 || aiState.isExhausted) {
    desiredStance = 'defensive';
  } else if (phase === 'Desperate') {
    desiredStance = archetype === 'Tank' ? 'defensive' : 'offensive';
  } else if (opponentState.superMeter >= 200) {
    desiredStance = 'defensive';
  } else if (oppPhase === 'Desperate' || aiState.momentum >= 5) {
    desiredStance = 'offensive';
  }

  // Tactical Defensive Downtime on Low Stamina (Regains Stamina & Guards, unless Awakened)
  if (!aiState.isAwakened && (currentStamina < 22 || aiState.isExhausted) && Math.random() < 0.75) {
    return { action: 'guard', desiredStance: 'defensive' };
  }

  // AWAKENED MOVES PRIORITY (When Awakened, high chance to immediately execute unique Awakening moves!)
  if (aiState.isAwakened && aiState.unlockedAwakeningMoves && aiState.unlockedAwakeningMoves.length > 0) {
    const validAwakeningMoves = aiState.unlockedAwakeningMoves.filter((m) => {
      if ((aiState.moveCooldowns[m.id] || 0) > 0) return false;
      const meterCostPoints = m.meterCost * 100;
      if (meterCostPoints > 0 && aiState.superMeter < meterCostPoints) return false;
      return true;
    });

    if (validAwakeningMoves.length > 0 && Math.random() < (difficulty === 'emperor' ? 0.90 : 0.75)) {
      const chosenAwakeningMove = validAwakeningMoves[Math.floor(Math.random() * validAwakeningMoves.length)];
      return { action: 'move', selectedMove: chosenAwakeningMove, desiredStance: 'offensive' };
    }
  }

  // 1. MAX Mode Activation
  if (
    !aiState.isMaxModeActive &&
    aiState.superMeter >= 100 &&
    (aiState.currentHp < aiState.maxHp * 0.50 || difficulty === 'emperor') &&
    Math.random() < 0.35
  ) {
    return { action: 'max_mode', desiredStance };
  }

  // 2. Tactical Taunt (if safe, needs meter, and hasn't taunted recently)
  const recentlyTaunted = aiState.recentMoves.slice(-2).includes('taunt');
  if (
    !recentlyTaunted &&
    !aiState.isAwakened &&
    aiState.superMeter < 160 &&
    opponentState.superMeter < 120 &&
    aiState.currentHp > aiState.maxHp * 0.55 &&
    Math.random() < (archetype === 'Trickster' ? 0.30 : 0.12)
  ) {
    return { action: 'taunt', desiredStance };
  }

  // 3. Counter defensive maneuver against opponent Super
  if (opponentState.superMeter >= 200 && Math.random() < (difficulty === 'emperor' ? 0.45 : 0.30)) {
    const isDodgeOnCd = (aiState.moveCooldowns?.['dodge_action'] || 0) > 0;
    const canDodgeObs = canUseObservationHaki(aiState).canUse;
    if (aiState.fighter.haki.observation >= 85 && !isDodgeOnCd && canDodgeObs && Math.random() < 0.65) {
      return { action: 'dodge', desiredStance: 'balanced' };
    }
    return { action: 'guard', desiredStance: 'defensive' };
  }

  // 4. Move Selection with Strict Anti-Repetition
  const baseMoves = aiState.fighter?.moves || [];
  const allMoves = aiState.isAwakened && aiState.unlockedAwakeningMoves
    ? [...baseMoves, ...aiState.unlockedAwakeningMoves]
    : baseMoves;

  const availableMoves = allMoves.filter((m) => {
    if ((aiState.moveCooldowns[m.id] || 0) > 0) return false;
    const isDesperate = phase === 'Desperate';
    const superCost = isDesperate ? 150 : 200;
    if (m.type === 'super' && aiState.superMeter < superCost) return false;
    if (m.type === 'ex' && aiState.superMeter < 100 && !aiState.isMaxModeActive) return false;
    if (m.type === 'awakening' && aiState.superMeter < m.meterCost * 100) return false;
    return true;
  });

  if (availableMoves?.length === 0) {
    return { action: 'guard', desiredStance: 'defensive' };
  }

  // Filter out recent moves (last 2 turns) to guarantee diverse animations and fighting variety
  const recentTwoMoves = aiState.recentMoves.slice(-2);

  // 1. Finisher Priority (The ultimate "Combo Finisher" logic)
  const finisherMove = allMoves.find((m) => m.type === 'finisher');
  if (finisherMove && aiState.superMeter >= 300 && (opponentState.currentHp < 1200 || phase === 'Climax' || phase === 'Desperate' || Math.random() < 0.65)) {
    return { action: 'move', selectedMove: finisherMove, desiredStance: 'offensive' };
  }

  const freshMoves = availableMoves.filter((m) => !recentTwoMoves.includes(m.id));
  const candidatePool = freshMoves?.length > 0 ? freshMoves : availableMoves;

  // Awakening move if available in candidate pool
  const awakeningMove = candidatePool.find((m) => m.type === 'awakening');
  if (awakeningMove && Math.random() < 0.70) {
    return { action: 'move', selectedMove: awakeningMove, desiredStance: 'offensive' };
  }

  // Super move priority when opponent HP is low or in Climax/Desperate
  const superMove = candidatePool.find((m) => m.type === 'super');
  if (superMove && (opponentState.currentHp < 750 || phase === 'Climax' || phase === 'Desperate' || Math.random() < 0.55)) {
    return { action: 'move', selectedMove: superMove, desiredStance: 'offensive' };
  }

  // EX move priority if MAX Mode is active or high meter
  const exMoves = candidatePool.filter((m) => m.type === 'ex');
  if (exMoves?.length > 0 && (aiState.isMaxModeActive || aiState.superMeter >= 150) && Math.random() < 0.50) {
    const chosenEx = exMoves[Math.floor(Math.random() * exMoves?.length)];
    return { action: 'move', selectedMove: chosenEx, desiredStance };
  }

  // Diverse rotation between command, special, and basic strikes
  const commandAndSpecialMoves = candidatePool.filter((m) => m.type === 'command' || m.type === 'special');
  if (commandAndSpecialMoves?.length > 0 && Math.random() < 0.65) {
    // Pick randomly among diverse special/command attacks
    const chosen = commandAndSpecialMoves[Math.floor(Math.random() * commandAndSpecialMoves?.length)];
    return { action: 'move', selectedMove: chosen, desiredStance };
  }

  // Basic strike as solid fundamentals
  const basicMoves = candidatePool.filter((m) => m.type === 'basic');
  const chosenBasic = basicMoves?.length > 0 ? basicMoves[Math.floor(Math.random() * basicMoves?.length)] : candidatePool[0];
  return { action: 'move', selectedMove: chosenBasic, desiredStance };
}

// Dynamic Randomized Interval Calculation for Realistic Human & Arcade Cadence
export function getRandomizedTurnInterval(battleSpeed: number, fighterSpeed: number = 100): number {
  const baseMs = 3300 / battleSpeed; // Increased baseMs from 1750 to 3300 for a much more comfortable, readable, non-frenetic flow
  // Speed-based initiative variance (faster fighters act slightly quicker, plus ±350ms natural hesitation/burst variance)
  const speedBonus = Math.max(-200, Math.min(200, (110 - fighterSpeed) * 3));
  const humanVariance = (Math.random() * 700 - 350) / battleSpeed;
  return Math.max(1400, Math.round(baseMs + speedBonus + humanVariance));
}


export function calculateFighterTCP(fighter: Fighter): number {
  const statSum = fighter.stats.maxHp / 10 + fighter.stats.attack * 8 + fighter.stats.defense * 7 + fighter.stats.speed * 8;
  const hakiSum = (fighter.haki.conqueror * 12) + (fighter.haki.armament * 10) + (fighter.haki.observation * 9);
  const fruitBonus = fighter.devilFruit ? (fighter.devilFruit.awakening === 'Awakened' ? 600 : 350) : 400;
  const bountyScore = Math.min(2500, Math.round(fighter.bounty / 2_000_000));
  const expScore = fighter.experienceYears * 15;

  return Math.round(statSum + hakiSum + fruitBonus + bountyScore + expScore);
}

export function calculateTeamTCP(teamFighters: Fighter[]): number {
  return teamFighters.reduce((sum, f) => sum + calculateFighterTCP(f), 0);
}

export function executeHakiAwakeningAction(
  fighterState: BattleFighterState,
  actorSide: 'team1' | 'team2',
  roundNumber: number
): { updatedFighter: BattleFighterState; log: ActionLog } {
  const next = { ...fighterState };
  const cost = 100; // 1 segment cost
  if ((next.hakiMeter || 0) >= cost && !next.isHakiAwakened) {
    next.hakiMeter = Math.max(0, next.hakiMeter - cost);
    next.isHakiAwakened = true;
    next.hakiAwakeningTurnsLeft = 8;
  }

  const log: ActionLog = {
    id: `log_haki_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    roundNumber,
    actorSide,
    actorName: fighterState.fighter.name,
    actorShortName: fighterState.fighter.shortName || fighterState.fighter.name.split(' ')[0],
    targetName: 'Self',
    moveName: 'Haki Awakening',
    moveNameJP: '覇気覚醒',
    moveType: 'special',
    damage: 0,
    isCrit: false,
    isDodged: false,
    isBlocked: false,
    isGuardCrush: false,
    isHakiClash: false,
    stance: fighterState.currentStance,
    comboCount: 0,
    commentaryText: `${fighterState.fighter.name} awakened their supreme Haki, surging with black lightning and heightened attack speed and defense!`,
    timestamp: Date.now(),
    hakiType: 'Conqueror',
  };

  return { updatedFighter: next, log };
}

export function getMoveShortName(moveName: string): string {
  if (!moveName) return 'Strike';
  let cleaned = moveName
    .replace(/^COMBO FINISHER:\s*/i, '')
    .replace(/^MAX:\s*/i, '')
    .replace(/^Gomu Gomu no\s*/i, '')
    .replace(/^Gear \d+:\s*/i, '')
    .replace(/^Kenbunshoku\s*/i, '')
    .replace(/^Defensive\s*/i, '');
  
  const parts = cleaned.split(/\s+no\s+|\s+-\s+/i);
  const core = parts[parts.length - 1].trim();
  return core || moveName;
}

export function getActionLogDescription(log: ActionLog): string {
  const actor = log.actorShortName || log.actorName.split(' ')[0];
  const target = log.targetShortName || log.targetName.split(' ')[0];
  const move = getMoveShortName(log.moveName);

  if (log.isHakiClash) {
    return `${actor} & ${target} clashed Haki!`;
  }
  if (log.isDodged) {
    return log.isFutureSightDodge 
      ? `${actor} pre-dodged ${target}'s strike with Future Sight!` 
      : `${actor} dodged ${target}'s ${move}!`;
  }
  if (log.isCounter) {
    return `${actor} counterattacks ${target}'s strike with ${move}!`;
  }
  if (log.isGuardCrush) {
    return `${actor} guard crushed ${target} using ${move}!`;
  }
  if (log.isBlocked) {
    return log.damage === 0 
      ? `${target} perfectly blocked ${actor}'s ${move}!` 
      : `${target} guarded against ${actor}'s ${move} (-${log.damage} HP)`;
  }
  if (log.isCrit) {
    return `${actor} landed a critical strike on ${target} with ${move} (-${log.damage} HP)!`;
  }
  if (log.isTaunt) {
    return `${actor} taunts ${target} to provoke a reaction!`;
  }
  if (log.moveName.includes('Guard')) {
    return `${actor} assumes a Defensive Armament Guard stance.`;
  }
  if (log.moveName.includes('Future Sight Evasion')) {
    return `${actor} activated Kenbunshoku Future Sight evasion!`;
  }
  if (log.moveName.includes('MAX MODE')) {
    return `${actor} surged into MAX Mode with Conqueror's Haki!`;
  }
  return `${actor} strikes ${target} with ${move} (-${log.damage} HP)`;
}
