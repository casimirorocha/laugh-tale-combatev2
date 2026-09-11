// Match Achievement Tracking & Evaluation Engine
import { MatchAchievement, MATCH_ACHIEVEMENT_TEMPLATES } from '../types/achievements';
import { ActionLog, BattleFighterState } from '../types/fighter';

export interface AchievementTrackerState {
  hasFirstBloodClaimed: boolean;
  t1ConsecutiveBlocks: number;
  t2ConsecutiveBlocks: number;
  t1ConsecutiveDodges: number;
  t2ConsecutiveDodges: number;
  t1RoundCrits: number;
  t2RoundCrits: number;
  unlockedAchievementKeys: Set<string>;
}

export function createInitialTrackerState(): AchievementTrackerState {
  return {
    hasFirstBloodClaimed: false,
    t1ConsecutiveBlocks: 0,
    t2ConsecutiveBlocks: 0,
    t1ConsecutiveDodges: 0,
    t2ConsecutiveDodges: 0,
    t1RoundCrits: 0,
    t2RoundCrits: 0,
    unlockedAchievementKeys: new Set<string>(),
  };
}

export function evaluateCombatAchievements(
  log: ActionLog,
  attackerState: BattleFighterState,
  defenderState: BattleFighterState,
  tracker: AchievementTrackerState,
  isGameOver: boolean
): { newAchievements: MatchAchievement[]; updatedTracker: AchievementTrackerState } {
  const newAchievements: MatchAchievement[] = [];
  const updatedTracker = { ...tracker };
  const actorSide = log.actorSide;
  const defenderSide = actorSide === 'team1' ? 'team2' : 'team1';

  const unlock = (templateKey: string, side: 'team1' | 'team2', fighterName: string) => {
    const uniqueKey = `${templateKey}_${side}_${fighterName}_${Date.now()}`;
    if (!updatedTracker.unlockedAchievementKeys.has(templateKey)) {
      updatedTracker.unlockedAchievementKeys.add(templateKey);
      const template = MATCH_ACHIEVEMENT_TEMPLATES[templateKey];
      if (template) {
        newAchievements.push({
          id: uniqueKey,
          key: template.key,
          name: template.name,
          japaneseName: template.japaneseName,
          description: template.description,
          icon: template.icon,
          rarity: template.rarity,
          timestamp: Date.now(),
          awardedToSide: side,
          awardedToFighter: fighterName,
          points: template.points,
        });
      }
    }
  };

  // 1. First Blood Check
  if (!updatedTracker.hasFirstBloodClaimed && log.damage > 0 && !log.isDodged && !log.isMiss) {
    updatedTracker.hasFirstBloodClaimed = true;
    unlock('FIRST_BLOOD', actorSide, attackerState.fighter.name);
  }

  // 2. Block & Perfect Guard Tracker
  if (log.isBlocked) {
    if (defenderSide === 'team1') {
      updatedTracker.t1ConsecutiveBlocks += 1;
      if (updatedTracker.t1ConsecutiveBlocks >= 2) {
        unlock('PERFECT_GUARD', 'team1', defenderState.fighter.name);
      }
    } else {
      updatedTracker.t2ConsecutiveBlocks += 1;
      if (updatedTracker.t2ConsecutiveBlocks >= 2) {
        unlock('PERFECT_GUARD', 'team2', defenderState.fighter.name);
      }
    }
  } else if (!log.isDodged && !log.isMiss && log.damage > 0) {
    // Reset block streak on clean hit
    if (defenderSide === 'team1') updatedTracker.t1ConsecutiveBlocks = 0;
    else updatedTracker.t2ConsecutiveBlocks = 0;
  }

  // 3. Evasion & Future Sight Master Tracker
  if (log.isDodged) {
    if (defenderSide === 'team1') {
      updatedTracker.t1ConsecutiveDodges += 1;
      if (updatedTracker.t1ConsecutiveDodges >= 2) {
        unlock('UNTOUCHABLE', 'team1', defenderState.fighter.name);
      }
    } else {
      updatedTracker.t2ConsecutiveDodges += 1;
      if (updatedTracker.t2ConsecutiveDodges >= 2) {
        unlock('UNTOUCHABLE', 'team2', defenderState.fighter.name);
      }
    }
  } else if (!log.isMiss && log.damage > 0) {
    if (defenderSide === 'team1') updatedTracker.t1ConsecutiveDodges = 0;
    else updatedTracker.t2ConsecutiveDodges = 0;
  }

  // 4. Guard Crush / Guard Breaker
  if (log.isGuardCrush) {
    unlock('GUARD_BREAKER', actorSide, attackerState.fighter.name);
  }

  // 5. Critical Hits Tracker
  if (log.isCrit) {
    if (actorSide === 'team1') {
      updatedTracker.t1RoundCrits += 1;
      if (updatedTracker.t1RoundCrits >= 2) {
        unlock('CRITICAL_OVERDRIVE', 'team1', attackerState.fighter.name);
      }
    } else {
      updatedTracker.t2RoundCrits += 1;
      if (updatedTracker.t2RoundCrits >= 2) {
        unlock('CRITICAL_OVERDRIVE', 'team2', attackerState.fighter.name);
      }
    }
  }

  // 6. Conqueror Clash / Ryuo Master
  if (log.isHakiClash || attackerState.isMaxModeActive) {
    unlock('RYUO_MASTER', actorSide, attackerState.fighter.name);
  }

  // 7. Combo Maestro
  if (log.comboCount >= 6) {
    unlock('COMBO_MAESTRO', actorSide, attackerState.fighter.name);
  }

  // 8. Taunt Dominance
  if (log.isTaunt) {
    unlock('TAUNT_DOMINANCE', actorSide, attackerState.fighter.name);
  }

  // 9. K.O. specific evaluations (Comeback King & Climax Finisher)
  if (isGameOver) {
    const hpRatio = attackerState.currentHp / attackerState.maxHp;
    if (hpRatio < 0.15 && attackerState.currentHp > 0) {
      unlock('COMEBACK_KING', actorSide, attackerState.fighter.name);
    }

    if (log.moveType === 'super' || log.moveType === 'ex') {
      unlock('CLIMAX_FINISHER', actorSide, attackerState.fighter.name);
    }
  }

  return { newAchievements, updatedTracker };
}
