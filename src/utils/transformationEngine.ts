import { BattleFighterState, Transformation } from '../types/fighter';

// MINIMUM COOLDOWN TIMER between transformations: minimum 3 turns/actions since last transformation
export const MIN_TRANSFORMATION_COOLDOWN = 3;

export interface TransformationConditionTelemetry {
  type: string;
  label: string;
  isMet: boolean;
  currentValue: string | number;
  requiredValue: string | number;
}

export interface TransformationTelemetry {
  hasTransformations: boolean;
  currentFormId?: string;
  currentFormName: string;
  currentFormTier: number; // 0 = base, 1 = tier 1, etc.
  totalTiers: number;
  currentFormDurationTurns: number;
  lastTransformationTurn?: number;
  cooldownTurnsRequired: number;
  cooldownRemainingTurns: number;
  isCooldownReady: boolean;
  cooldownProgressPercentage: number;
  allForms: {
    id: string;
    name: string;
    tier: number;
    isCurrent: boolean;
    isPast: boolean;
    isNext: boolean;
    avatarUrl?: string;
    themeColor?: string;
    statModifiers?: {
      attackMultiplier: number;
      speedMultiplier: number;
      defenseMultiplier: number;
      hpHealPercentage?: number;
    };
  }[];
  nextTransformation: Transformation | null;
  canShiftNow: boolean;
  shiftConditions: TransformationConditionTelemetry[];
  verdictMessage: string;
  isApexForm: boolean;
  currentFormModifiers?: {
    attackMultiplier: number;
    speedMultiplier: number;
    defenseMultiplier: number;
    hpHealPercentage?: number;
  };
}

/**
 * Calculates real-time telemetry for active transformation cooldown,
 * current form duration, and next form shift availability.
 */
export function getTransformationTelemetry(
  state: BattleFighterState,
  opponentState: BattleFighterState | null,
  currentTurnCount: number
): TransformationTelemetry {
  const transformations = state.fighter.transformations || [];
  const hasTransformations = transformations.length > 0;

  if (!hasTransformations) {
    return {
      hasTransformations: false,
      currentFormName: state.fighter.name,
      currentFormTier: 0,
      totalTiers: 0,
      currentFormDurationTurns: currentTurnCount,
      cooldownTurnsRequired: 0,
      cooldownRemainingTurns: 0,
      isCooldownReady: true,
      cooldownProgressPercentage: 100,
      allForms: [],
      nextTransformation: null,
      canShiftNow: false,
      shiftConditions: [],
      verdictMessage: 'Standard combat form. No multi-tier transformations configured.',
      isApexForm: true
    };
  }

  // Find index of the character's current transformation form
  const currentFormIndex = state.currentFormId
    ? transformations.findIndex((t) => t.id === state.currentFormId)
    : -1;

  const currentForm = currentFormIndex >= 0 ? transformations[currentFormIndex] : null;
  const currentFormTier = currentFormIndex >= 0 ? currentFormIndex + 1 : 0;
  const totalTiers = transformations.length;

  // Form duration in turns/actions
  const currentFormDurationTurns = state.lastTransformationTurn !== undefined
    ? Math.max(1, currentTurnCount - state.lastTransformationTurn)
    : Math.max(0, currentTurnCount);

  // Cooldown calculation
  const turnsElapsedSinceTransform = state.lastTransformationTurn !== undefined
    ? Math.max(0, currentTurnCount - state.lastTransformationTurn)
    : MIN_TRANSFORMATION_COOLDOWN;

  const cooldownRemainingTurns = Math.max(
    0,
    MIN_TRANSFORMATION_COOLDOWN - turnsElapsedSinceTransform
  );
  const isCooldownReady = cooldownRemainingTurns === 0;
  const cooldownProgressPercentage = Math.min(
    100,
    Math.round(((MIN_TRANSFORMATION_COOLDOWN - cooldownRemainingTurns) / MIN_TRANSFORMATION_COOLDOWN) * 100)
  );

  // Next transformation in progression
  const nextFormIndex = currentFormIndex + 1;
  const nextTransformation = nextFormIndex < transformations.length
    ? transformations[nextFormIndex]
    : null;

  const isApexForm = currentFormIndex >= 0 && currentFormIndex === transformations.length - 1;

  // Progression path of all forms
  const allForms = [
    {
      id: 'base',
      name: 'Base Form',
      tier: 0,
      isCurrent: currentFormIndex === -1,
      isPast: currentFormIndex >= 0,
      isNext: false,
      avatarUrl: state.fighter.avatarUrl,
      themeColor: state.fighter.themeColor
    },
    ...transformations.map((t, idx) => ({
      id: t.id,
      name: t.name,
      tier: idx + 1,
      isCurrent: idx === currentFormIndex,
      isPast: idx < currentFormIndex,
      isNext: idx === nextFormIndex,
      avatarUrl: t.visuals?.avatarUrl,
      themeColor: t.visuals?.themeColor,
      statModifiers: t.statModifiers
    }))
  ];

  // Evaluate conditions for next transformation
  const shiftConditions: TransformationConditionTelemetry[] = [];
  let triggerConditionsMet = false;

  // Add cooldown condition
  shiftConditions.push({
    type: 'COOLDOWN',
    label: 'Form Stabilization Cooldown',
    isMet: isCooldownReady,
    currentValue: isCooldownReady ? 'Ready (3/3 actions)' : `${MIN_TRANSFORMATION_COOLDOWN - cooldownRemainingTurns}/3 actions`,
    requiredValue: '3 actions since shift'
  });

  if (nextTransformation) {
    const triggerConditions = nextTransformation.triggerConditions || [];

    if (triggerConditions.length === 0) {
      triggerConditionsMet = true;
    } else {
      let metCount = 0;
      for (const condition of triggerConditions) {
        let isMet = false;
        let currentValue: string | number = '';
        let requiredValue: string | number = '';
        let label = '';

        switch (condition.type) {
          case 'HP_BELOW': {
            label = 'Critical Will (HP Threshold)';
            const hpPercentage = Math.round((state.currentHp / state.maxHp) * 100);
            isMet = hpPercentage <= (condition.value as number);
            currentValue = `${hpPercentage}%`;
            requiredValue = `≤ ${condition.value}%`;
            break;
          }
          case 'TURN_COUNT': {
            label = 'Round Actions Elapsed';
            isMet = currentTurnCount >= (condition.value as number);
            currentValue = `${currentTurnCount} actions`;
            requiredValue = `≥ ${condition.value} actions`;
            break;
          }
          case 'OPPONENT_FIGHTER_ID': {
            label = 'Opponent Rival Matchup';
            isMet = opponentState?.fighter.id === (condition.value as string);
            currentValue = opponentState?.fighter.name || 'Opponent';
            requiredValue = String(condition.value);
            break;
          }
          case 'OPPONENT_HAS_OBSERVATION': {
            label = 'Opponent Observation Mastery';
            const oppObs = opponentState?.fighter.haki.observation || 0;
            isMet = oppObs >= (condition.value as number);
            currentValue = `${oppObs} Haki`;
            requiredValue = `≥ ${condition.value}`;
            break;
          }
        }

        shiftConditions.push({
          type: condition.type,
          label,
          isMet,
          currentValue,
          requiredValue
        });

        if (isMet) {
          metCount++;
        }
      }
      triggerConditionsMet = metCount > 0;
    }
  }

  const canShiftNow = Boolean(nextTransformation && isCooldownReady && triggerConditionsMet);

  // Determine tactical verdict message
  let verdictMessage = '';
  if (isApexForm) {
    verdictMessage = '👑 Pinnacle transformation active. Ultimate power unleashed!';
  } else if (!nextTransformation) {
    verdictMessage = 'No higher transformation tier available.';
  } else if (canShiftNow) {
    verdictMessage = `✨ SHIFT READY! You can initiate ${nextTransformation.name} now.`;
  } else if (!isCooldownReady) {
    verdictMessage = `⏳ Stabilizing current form: ${cooldownRemainingTurns} action(s) remaining until next shift is permitted.`;
  } else {
    // Cooldown is ready but trigger conditions not yet met
    const unmet = shiftConditions.find((c) => !c.isMet && c.type !== 'COOLDOWN');
    if (unmet) {
      verdictMessage = `🩸 ${unmet.label} needed: requires ${unmet.requiredValue} (currently at ${unmet.currentValue}).`;
    } else {
      verdictMessage = 'Tactical conditions pending to unlock next form shift.';
    }
  }

  return {
    hasTransformations: true,
    currentFormId: state.currentFormId,
    currentFormName: currentForm?.name || 'Base Form',
    currentFormTier,
    totalTiers,
    currentFormDurationTurns,
    lastTransformationTurn: state.lastTransformationTurn,
    cooldownTurnsRequired: MIN_TRANSFORMATION_COOLDOWN,
    cooldownRemainingTurns,
    isCooldownReady,
    cooldownProgressPercentage,
    allForms,
    nextTransformation,
    canShiftNow,
    shiftConditions,
    verdictMessage,
    isApexForm,
    currentFormModifiers: currentForm?.statModifiers
  };
}

/**
 * Evaluates whether a fighter should transform based on their trigger conditions, and
 * uses an intelligent decision-making algorithm to select the most optimal form based on real-time telemetry.
 */
export function checkTransformations(
  state: BattleFighterState,
  opponentState: BattleFighterState,
  currentTurnCount: number
): Transformation | null {
  if (!state.fighter.transformations || state.fighter.transformations.length === 0) {
    return null;
  }

  if (
    state.lastTransformationTurn !== undefined &&
    currentTurnCount - state.lastTransformationTurn < MIN_TRANSFORMATION_COOLDOWN
  ) {
    return null;
  }

  const transformations = state.fighter.transformations;

  // GLOBAL ARCHITECTURAL FIX: No Downgrade / Loop Prevention
  // Find the index of the character's current transformation form in their defined transformations roster.
  const currentFormIndex = state.currentFormId
    ? transformations.findIndex((t) => t.id === state.currentFormId)
    : -1;

  const candidates: { transformation: Transformation; score: number }[] = [];

  // Filter and evaluate all transformations that haven't been bypassed by hierarchy or timing
  for (let i = 0; i < transformations.length; i++) {
    const transformation = transformations[i];

    // If the transformation is of a lower or equal tier index than our current form, skip it!
    // This blocks downgrades (e.g. going from Gear 5 back to Gear 4) and prevents infinite animation loops.
    if (i <= currentFormIndex) continue;

    let conditionsMet = 0;
    const triggerConditions = transformation.triggerConditions || [];

    for (const condition of triggerConditions) {
      switch (condition.type) {
        case 'HP_BELOW':
          const hpPercentage = (state.currentHp / state.maxHp) * 100;
          if (hpPercentage <= (condition.value as number)) {
            conditionsMet++;
          }
          break;
        case 'TURN_COUNT':
          if (currentTurnCount >= (condition.value as number)) {
            conditionsMet++;
          }
          break;
        case 'OPPONENT_FIGHTER_ID':
          if (opponentState.fighter.id === (condition.value as string)) {
            conditionsMet++;
          }
          break;
        case 'OPPONENT_HAS_OBSERVATION':
          if (opponentState.fighter.haki.observation >= (condition.value as number)) {
            conditionsMet++;
          }
          break;
      }
    }

    // A transformation triggers if at least one of its defined conditions is met.
    if (conditionsMet > 0) {
      // --- INTELLIGENT DECISION-MAKING SCORING ---
      const attackMult = transformation.statModifiers?.attackMultiplier ?? 1.0;
      const speedMult = transformation.statModifiers?.speedMultiplier ?? 1.0;
      const defenseMult = transformation.statModifiers?.defenseMultiplier ?? 1.0;
      const hpHeal = transformation.statModifiers?.hpHealPercentage ?? 0.0;

      // 1. Base Multiplier Score (Core Stats Weight)
      let score = attackMult * 10 + speedMult * 10 + defenseMult * 8;

      // 2. Survival & Desperation Telemetry
      const selfHpPercentage = state.currentHp / state.maxHp;
      if (selfHpPercentage < 0.4) {
        // High priority for defensive buffs & healing forms if self health is critical
        score += hpHeal * 50;
        score += defenseMult * 15;
      }

      // 3. Adaptive Combat Telemetry (Counter Opponent's Profile)
      const oppMaxHp = opponentState.maxHp;
      const oppHpPercentage = opponentState.currentHp / opponentState.maxHp;
      const oppSpeed = opponentState.fighter.stats.speed;
      const oppDefense = opponentState.fighter.stats.defense;

      // Counter high defense or heavy tanks with high attack modifiers
      if (oppDefense > 130 || oppMaxHp > 3000) {
        score += attackMult * 15;
      }

      // Counter speedsters with high speed modifiers to keep momentum and dodge rate high
      if (oppSpeed > state.fighter.stats.speed || oppSpeed > 130) {
        score += speedMult * 15;
      }

      // Aggressive finish logic: if opponent HP is extremely low, favor speed and power to deal the final blow
      if (oppHpPercentage < 0.3) {
        score += attackMult * 10 + speedMult * 10;
      }

      // 4. Momentum & Tactician Telemetry
      // If we are suffering from low momentum, favor high attack/speed forms to regain control
      if (state.momentum < 0) {
        score += attackMult * 8 + speedMult * 8;
      }

      candidates.push({ transformation, score });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Sort candidates by score descending and return the most optimal transformation
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].transformation;
}

/**
 * Applies a transformation to a fighter state, updating stats, HP proportionally, and visuals.
 */
export function applyTransformation(
  state: BattleFighterState,
  transformation: Transformation,
  currentTurn?: number
): BattleFighterState {
  // Calculate proportional HP to maintain current health percentage during max HP change
  const currentHpPercentage = state.currentHp / state.maxHp;
  
  const newMaxHp = Math.round(state.fighter.stats.maxHp * (transformation.statModifiers?.defenseMultiplier ?? 1.0));
  let newCurrentHp = Math.round(newMaxHp * currentHpPercentage);

  // Apply healing if the transformation provides it
  if (transformation.statModifiers?.hpHealPercentage) {
    newCurrentHp += Math.round(newMaxHp * transformation.statModifiers.hpHealPercentage);
  }
  
  // Cap at new max HP
  newCurrentHp = Math.min(newCurrentHp, newMaxHp);

  // Merge the new moveset with existing cooldowns
  const newMoves = transformation.moveSetOverrides || transformation.overrideMoves || transformation.moves || state.fighter.moves;
  
  // Create a deep copy of the state with modifications
  const transformedState: BattleFighterState = {
    ...state,
    currentFormId: transformation.id,
    lastTransformationTurn: currentTurn,
    maxHp: newMaxHp,
    currentHp: newCurrentHp,
    fighter: {
      ...state.fighter,
      name: `${state.fighter.name} (${transformation.name})`,
      themeColor: transformation.visuals?.themeColor ?? state.fighter.themeColor,
      avatarUrl: transformation.visuals?.avatarUrl ?? state.fighter.avatarUrl,
      // Apply stat multipliers
      stats: {
        ...state.fighter.stats,
        attack: Math.round(state.fighter.stats.attack * (transformation.statModifiers?.attackMultiplier ?? 1.0)),
        speed: Math.round(state.fighter.stats.speed * (transformation.statModifiers?.speedMultiplier ?? 1.0)),
        defense: Math.round(state.fighter.stats.defense * (transformation.statModifiers?.defenseMultiplier ?? 1.0)),
      },
      moves: newMoves
    }
  };

  return transformedState;
}

/**
 * Reverts a transformed fighter state back to their base combat form.
 * Restores original name, resets currentFormId, and calculates proportional HP.
 */
export function revertTransformation(
  state: BattleFighterState,
  currentTurn?: number
): BattleFighterState {
  if (!state.currentFormId) return state;

  // Strip appended form name e.g. "Monkey D. Luffy (Gear 5 - Sun God Nika)" -> "Monkey D. Luffy"
  const baseName = state.fighter.name.replace(/\s*\([^)]+\)$/, '');

  // Calculate proportional HP to preserve current battle attrition
  const currentHpPercentage = state.maxHp > 0 ? state.currentHp / state.maxHp : 1;
  const baseMaxHp = state.fighter.stats.maxHp;
  const newCurrentHp = Math.max(1, Math.min(baseMaxHp, Math.round(baseMaxHp * currentHpPercentage)));

  return {
    ...state,
    currentFormId: undefined,
    lastTransformationTurn: currentTurn,
    maxHp: baseMaxHp,
    currentHp: newCurrentHp,
    fighter: {
      ...state.fighter,
      name: baseName,
    }
  };
}

