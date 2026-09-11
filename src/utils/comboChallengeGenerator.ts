import { Fighter, Move } from '../types/fighter';
import { ComboChallenge, ComboChallengeStep, ChallengeDifficulty, ChallengeTheme } from '../types/comboChallenge';

export function generateFighterComboChallenge(
  fighter: Fighter,
  difficulty: ChallengeDifficulty = 'silver'
): ComboChallenge {
  const moves = fighter.moves || [];
  const fruit = fighter.devilFruit;
  const hasFruit = fruit && fruit.type !== 'None (Pure Haki)';
  
  // Categorize fighter moves
  const basicMoves = moves.filter(m => m.type === 'basic' || m.type === 'command');
  const specialMoves = moves.filter(m => m.type === 'special' || m.type === 'ex');
  const superMoves = moves.filter(m => m.type === 'super' || m.type === 'awakening' || m.type === 'finisher');
  const hakiMoves = moves.filter(m => m?.hakiInfused || (m?.name || '').toLowerCase().includes('haki') || (m?.name || '').toLowerCase().includes('ryuo') || (m?.name || '').toLowerCase().includes('conqueror'));
  
  // Determine themes
  const availableThemes: ChallengeTheme[] = hasFruit ? ['devil_fruit', 'haki', 'hybrid', 'awakening'] : ['haki', 'hybrid'];
  const theme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
  
  const steps: ComboChallengeStep[] = [];
  
  // Step length and timers based on difficulty
  let stepCount = 3;
  let timeLimitSec = 6.5;
  let rewardPoints = 250;
  
  if (difficulty === 'bronze') {
    stepCount = 2;
    timeLimitSec = 8.0;
    rewardPoints = 150;
  } else if (difficulty === 'silver') {
    stepCount = 3;
    timeLimitSec = 6.0;
    rewardPoints = 300;
  } else if (difficulty === 'gold') {
    stepCount = 4;
    timeLimitSec = 5.0;
    rewardPoints = 500;
  } else if (difficulty === 'yonko') {
    stepCount = 4;
    timeLimitSec = 4.2;
    rewardPoints = 800;
  }

  // Fallback Move in case fighter.moves is empty or missing requested move types
  const fallbackMove: Move = {
    id: 'basic_heavy_strike',
    name: 'Heavy Strike',
    nameJP: '強打',
    type: 'basic',
    baseDamage: 40,
    missRate: 5,
    critBonus: 10,
    meterCost: 0,
    meterGain: 15,
    guardDamage: 10,
    cooldown: 0,
    description: 'Standard combat strike',
  };

  // Create Step helper
  const createStepFromMove = (
    move: Move | undefined,
    category: 'devil_fruit' | 'haki' | 'move' | 'awakening',
    customInstruction?: string
  ): ComboChallengeStep => {
    const validMove = move || moves[0] || fallbackMove;
    let icon = '⚔️';
    let badgeColor = 'border-amber-500/50 bg-amber-950/40 text-amber-300';
    
    if (category === 'devil_fruit') {
      icon = fruit?.primaryElement === 'Fire' || fruit?.primaryElement === 'Magma' ? '🔥' :
             fruit?.primaryElement === 'Lightning' ? '⚡' :
             fruit?.primaryElement === 'Ice' ? '❄️' : '🌀';
      badgeColor = 'border-purple-500/60 bg-purple-950/60 text-purple-300';
    } else if (category === 'haki') {
      icon = '🛡️';
      badgeColor = 'border-red-500/60 bg-red-950/60 text-red-300';
    } else if (category === 'awakening') {
      icon = '👑';
      badgeColor = 'border-yellow-400/80 bg-yellow-950/70 text-yellow-300';
    }

    return {
      id: `step_${validMove.id}_${Math.random()}`,
      name: validMove.name,
      nameJP: validMove.nameJP,
      category,
      moveId: validMove.id,
      moveType: validMove.type,
      hakiType: validMove.hakiInfused ? 'conqueror' : 'armament',
      element: validMove.element || fruit?.primaryElement,
      instruction: customInstruction || `Execute ${validMove.name}`,
      icon,
      badgeColor
    };
  };

  // Build steps based on theme
  if (theme === 'devil_fruit' && hasFruit) {
    // 1. Starter move
    const starter = basicMoves[0] || moves[0];
    steps.push(createStepFromMove(starter, 'move', `Initiate with ${starter.name}`));

    // 2. Fruit Special
    const fruitSpecial = specialMoves[0] || moves[1] || moves[0];
    steps.push(createStepFromMove(fruitSpecial, 'devil_fruit', `Channel ${fruit.name}: ${fruitSpecial.name}`));

    if (stepCount >= 3) {
      // 3. Super / Awakening
      const finisher = superMoves[0] || specialMoves[specialMoves.length - 1] || moves[moves.length - 1];
      steps.push(createStepFromMove(finisher, 'awakening', `Awakening Climax: ${finisher.name}`));
    }

    if (stepCount >= 4) {
      const extraMove = moves.length > 2 ? moves[2] : moves[0];
      steps.splice(2, 0, createStepFromMove(extraMove, 'devil_fruit', `Rapid Link: ${extraMove.name}`));
    }
  } else if (theme === 'haki') {
    // Haki Chain
    const starter = basicMoves[0] || moves[0];
    steps.push(createStepFromMove(starter, 'haki', `Busoshoku Infusion: ${starter.name}`));

    const hakiSpecial = hakiMoves[0] || specialMoves[0] || moves[1] || moves[0];
    steps.push(createStepFromMove(hakiSpecial, 'haki', `Ryuo Internal Blast: ${hakiSpecial.name}`));

    if (stepCount >= 3) {
      const finisher = superMoves[0] || moves[moves.length - 1];
      steps.push(createStepFromMove(finisher, 'haki', `Haoshoku Conqueror Strike: ${finisher.name}`));
    }

    if (stepCount >= 4) {
      const extraMove = specialMoves[1] || moves[2] || moves[0];
      steps.splice(2, 0, createStepFromMove(extraMove, 'haki', `Haki Cancel Chain: ${extraMove.name}`));
    }
  } else {
    // Hybrid / Universal
    const m1 = moves[0];
    steps.push(createStepFromMove(m1, hasFruit ? 'devil_fruit' : 'move', `Starter: ${m1.name}`));

    const m2 = moves[1] || moves[0];
    steps.push(createStepFromMove(m2, 'haki', `Haki Surge: ${m2.name}`));

    if (stepCount >= 3) {
      const m3 = moves[moves.length - 1];
      steps.push(createStepFromMove(m3, 'awakening', `Ultimate Link: ${m3.name}`));
    }

    if (stepCount >= 4) {
      const m4 = moves.length > 2 ? moves[2] : moves[0];
      steps.splice(2, 0, createStepFromMove(m4, hasFruit ? 'devil_fruit' : 'haki', `Mid-Combo Cancel: ${m4.name}`));
    }
  }

  // Titles and descriptions
  const titleTemplates: Record<ChallengeTheme, string[]> = {
    devil_fruit: [
      `${fruit?.name || 'Devil Fruit'} Awakening Trial`,
      `${fighter.shortName || fighter.name} Fruit Mastery Sequence`,
      `Logia & Paramecia Link Challenge`,
    ],
    haki: [
      `Supreme Haoshoku & Ryuo Infusion`,
      `Busoshoku Armor Cancel Trial`,
      `Three-Color Haki Mastery Link`,
    ],
    hybrid: [
      `Grand Line Emperor Hybrid Combo`,
      `Yonko-Tier Cancel Progression`,
      `Absolute Power Synergy Trial`,
    ],
    awakening: [
      `Mythical Awakening Climax Chain`,
      `True Form Overdrive Sequence`,
      `God-Tier Climax Execution`,
    ]
  };

  const titleList = titleTemplates[theme] || titleTemplates.hybrid;
  const title = titleList[Math.floor(Math.random() * titleList.length)];

  return {
    id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title,
    titleJP: fighter.japaneseName,
    difficulty,
    theme,
    description: `Execute the exact ${stepCount}-move sequence in order before the strict timer expires!`,
    targetSteps: steps,
    timeLimitSec,
    rewardPoints
  };
}
