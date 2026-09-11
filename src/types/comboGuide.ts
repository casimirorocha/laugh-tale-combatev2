export type ComboDifficulty = 'Starter' | 'Intermediate' | 'Master' | 'Yonko Climax';

export type ComboStepCategory = 
  | 'starter' 
  | 'fruit_link' 
  | 'haki_cancel' 
  | 'juggle' 
  | 'awakening' 
  | 'climax';

export interface ComboTimingWindow {
  startupFrames: number;
  activeWindowMs: number;  // Duration where hit is active (e.g. 600ms)
  cancelWindowMs: number;  // Golden cancel/chain window duration (e.g. 350ms)
  cancelOffsetMs: number;  // Offset from move start to cancel sweet spot (e.g. 250ms)
  timingLabel: string;     // e.g. "Hit-Confirm into EX", "Instant Ryuo Cancel", "Jump-Cancel Link"
  difficultyRating: 'Easy' | 'Moderate' | 'Tight (1-2f)' | 'Frame-Perfect';
}

export interface ComboGuideStep {
  stepIndex: number;
  moveId: string;
  moveName: string;
  moveNameJP?: string;
  inputNotation: string;    // e.g. "↓ ↘ → + HP (QCF+HP)" or "LP > MP"
  buttonGlyphs: string[];   // e.g. ['236', 'HP'] or ['LP', 'HAKI']
  category: ComboStepCategory;
  timing: ComboTimingWindow;
  hakiTechnique?: 'Armament Hardening' | 'Advanced Ryuo' | 'Future Sight' | 'Haoshoku Infusion' | 'Awakening Surge';
  fruitSynergy?: string;    // e.g. "Rubber Elasticity Extension", "Magma Floor Melt", "Room Shambles Warp"
  damageEstimate: number;
  meterCost: number;
  executionTip: string;
}

export interface ComboGuideRoute {
  id: string;
  fighterId?: string;
  title: string;
  titleJP?: string;
  difficulty: ComboDifficulty;
  archetype: string;
  description: string;
  tags: string[];           // e.g. ['Devil Fruit Link', 'Ryuo Cancel', 'Wall Bounce', 'Overdrive']
  totalDamageEstimate: number;
  meterRequired: number;
  steps: ComboGuideStep[];
  proTips: string[];
}

export interface TimingEvaluationResult {
  rating: 'PERFECT' | 'GREAT' | 'EARLY' | 'LATE' | 'MISS';
  accuracyPercent: number;
  message: string;
  deltaMs: number;
}
