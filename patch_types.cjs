const fs = require('fs');
let content = fs.readFileSync('src/types/fighter.ts', 'utf8');

const transformationTypes = `
export type TriggerConditionType = 'HP_BELOW' | 'TURN_COUNT' | 'OPPONENT_FIGHTER_ID' | 'OPPONENT_HAS_OBSERVATION';

export interface TriggerCondition {
  type: TriggerConditionType;
  value: number | string | boolean;
}

export interface Transformation {
  id: string; // e.g., 'gear_4_boundman'
  name: string;
  triggerConditions: TriggerCondition[];
  visuals: {
    avatarUrl: string;
    themeColor: string;
    auraEffect?: 'haki_flame' | 'lightning' | 'smoke' | 'void' | 'conqueror';
    portraitOffset?: string;
  };
  statModifiers: {
    attackMultiplier: number; // 1.0 = normal
    speedMultiplier: number;
    defenseMultiplier: number;
    hpHealPercentage?: number; // 0 to 1
  };
  moveSetOverrides?: Move[];
  description?: string;
}
`;

if (!content.includes('export interface Transformation')) {
  // Insert before Fighter
  content = content.replace('export interface Fighter {', transformationTypes + '\nexport interface Fighter {');
  
  // Add to Fighter
  content = content.replace('moves: Move[];', 'moves: Move[];\n  transformations?: Transformation[];');
  
  // Add to BattleFighterState
  content = content.replace('maxStamina: number; // 100 base max', 'maxStamina: number; // 100 base max\n  currentFormId?: string;');
  
  fs.writeFileSync('src/types/fighter.ts', content);
  console.log('Types updated');
} else {
  console.log('Already updated');
}
