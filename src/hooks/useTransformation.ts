import React, { useState, useRef, useCallback } from 'react';
import { BattleFighterState, Transformation } from '../types/fighter';
import { checkTransformations, applyTransformation, revertTransformation } from '../utils/transformationEngine';
import { audioManager } from '../utils/AudioManager';

export interface UseTransformationResult {
  dynamicTransformation: {
    isActive: boolean;
    transformation: Transformation | null;
    side: 'team1' | 'team2' | null;
  };
  isTransformingRef: React.MutableRefObject<boolean>;
  triggerTransformation: (
    side: 'team1' | 'team2',
    transformation: Transformation,
    setFighterStates: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    fighterIdx: number,
    statesRef: React.MutableRefObject<BattleFighterState[]>,
    pauseCallback: (paused: boolean) => void,
    currentTurnCount: number
  ) => void;
  revertTransformationForm: (
    side: 'team1' | 'team2',
    setFighterStates: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    fighterIdx: number,
    statesRef: React.MutableRefObject<BattleFighterState[]>,
    currentTurnCount: number
  ) => void;
  checkAndTrigger: (
    curT1: BattleFighterState,
    curT2: BattleFighterState,
    currentRound: number,
    currentTurnCount: number,
    t1Idx: number,
    t2Idx: number,
    setT1States: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    setT2States: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    t1StatesRef: React.MutableRefObject<BattleFighterState[]>,
    t2StatesRef: React.MutableRefObject<BattleFighterState[]>,
    pauseCallback: (paused: boolean) => void
  ) => boolean;
  clearTransformation: (unpauseCallback: () => void) => void;
}

export function useTransformation(): UseTransformationResult {
  const [dynamicTransformation, setDynamicTransformation] = useState<{
    isActive: boolean;
    transformation: Transformation | null;
    side: 'team1' | 'team2' | null;
  }>({ isActive: false, transformation: null, side: null });

  const isTransformingRef = useRef<boolean>(false);

  const triggerTransformation = useCallback((
    side: 'team1' | 'team2',
    transformation: Transformation,
    setFighterStates: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    fighterIdx: number,
    statesRef: React.MutableRefObject<BattleFighterState[]>,
    pauseCallback: (paused: boolean) => void,
    currentTurnCount: number
  ) => {
    isTransformingRef.current = true;
    pauseCallback(true);
    setDynamicTransformation({
      isActive: true,
      transformation,
      side
    });

    const targetFighter = statesRef.current[fighterIdx]?.fighter;
    if (targetFighter) {
      // Trigger character-specific transformation audio & voiced quote
      audioManager.playTransformationEnter(targetFighter, transformation, side);
    }

    setFighterStates(prev => {
      const next = [...prev];
      if (next[fighterIdx]) {
        next[fighterIdx] = applyTransformation(next[fighterIdx], transformation, currentTurnCount);
        statesRef.current = next;
      }
      return next;
    });
  }, []);

  const revertTransformationForm = useCallback((
    side: 'team1' | 'team2',
    setFighterStates: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    fighterIdx: number,
    statesRef: React.MutableRefObject<BattleFighterState[]>,
    currentTurnCount: number
  ) => {
    const currentState = statesRef.current[fighterIdx];
    if (!currentState || !currentState.currentFormId) return;

    const previousFormId = currentState.currentFormId;
    const formName = currentState.fighter.transformations?.find(t => t.id === previousFormId)?.name || 'Awakened Form';

    // Trigger character-specific de-transformation audio & fatigue voice clip
    audioManager.playTransformationExit(currentState.fighter, formName, side);

    setFighterStates(prev => {
      const next = [...prev];
      if (next[fighterIdx]) {
        next[fighterIdx] = revertTransformation(next[fighterIdx], currentTurnCount);
        statesRef.current = next;
      }
      return next;
    });
  }, []);

  const checkAndTrigger = useCallback((
    curT1: BattleFighterState,
    curT2: BattleFighterState,
    currentRound: number,
    currentTurnCount: number,
    t1Idx: number,
    t2Idx: number,
    setT1States: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    setT2States: React.Dispatch<React.SetStateAction<BattleFighterState[]>>,
    t1StatesRef: React.MutableRefObject<BattleFighterState[]>,
    t2StatesRef: React.MutableRefObject<BattleFighterState[]>,
    pauseCallback: (paused: boolean) => void
  ) => {
    if (isTransformingRef.current) return false;

    const t1Transform = checkTransformations(curT1, curT2, currentTurnCount);
    if (t1Transform) {
      triggerTransformation('team1', t1Transform, setT1States, t1Idx, t1StatesRef, pauseCallback, currentTurnCount);
      return true;
    }

    const t2Transform = checkTransformations(curT2, curT1, currentTurnCount);
    if (t2Transform) {
      triggerTransformation('team2', t2Transform, setT2States, t2Idx, t2StatesRef, pauseCallback, currentTurnCount);
      return true;
    }

    return false;
  }, [triggerTransformation]);

  const clearTransformation = useCallback((unpauseCallback: () => void) => {
    setDynamicTransformation({ isActive: false, transformation: null, side: null });
    isTransformingRef.current = false;
    unpauseCallback();
  }, []);

  return {
    dynamicTransformation,
    isTransformingRef,
    triggerTransformation,
    revertTransformationForm,
    checkAndTrigger,
    clearTransformation
  };
}
