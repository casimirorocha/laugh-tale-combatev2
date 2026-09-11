import { Fighter, Move } from '../types/fighter';
import { ComboGuideRoute, ComboGuideStep, ComboDifficulty } from '../types/comboGuide';

// Curated combo guides for prominent roster fighters
export const CURATED_COMBO_GUIDES: Record<string, ComboGuideRoute[]> = {
  luffy: [
    {
      id: 'luffy_starter_link',
      fighterId: 'luffy',
      title: 'Rubber Gatling to Red Roc',
      titleJP: 'ゴムゴムの業火連撃',
      difficulty: 'Starter',
      archetype: 'Ryuo Brawler',
      description: 'Basic elastic starter canceling seamlessly into Gear 2nd Jet Gatling, finishing with Conqueror-infused Red Roc.',
      tags: ['Devil Fruit Link', 'Ryuo Cancel', 'Target Combo'],
      totalDamageEstimate: 555,
      meterRequired: 0,
      steps: [
        {
          stepIndex: 0,
          moveId: 'luffy_pistol',
          moveName: 'Gomu Gomu no Pistol',
          moveNameJP: 'ゴムゴムの銃',
          inputNotation: 'LP (Light Punch)',
          buttonGlyphs: ['LP'],
          category: 'starter',
          timing: {
            startupFrames: 6,
            activeWindowMs: 500,
            cancelWindowMs: 300,
            cancelOffsetMs: 200,
            timingLabel: 'Instant Target Cancel',
            difficultyRating: 'Easy',
          },
          damageEstimate: 95,
          meterCost: 0,
          executionTip: 'Press Jet Gatling immediately after Pistol stretches forward to cancel recoil.'
        },
        {
          stepIndex: 1,
          moveId: 'luffy_jet_gatling',
          moveName: 'Gomu Gomu no Jet Gatling',
          moveNameJP: 'ゴムゴムのJETガトリング',
          inputNotation: '↓ ↘ → + HP (QCF+HP)',
          buttonGlyphs: ['236', 'HP'],
          category: 'fruit_link',
          timing: {
            startupFrames: 10,
            activeWindowMs: 850,
            cancelWindowMs: 350,
            cancelOffsetMs: 450,
            timingLabel: 'Hit-Confirm On 5th Strike',
            difficultyRating: 'Moderate',
          },
          fruitSynergy: 'Gear 2nd Blood Pumping Acceleration',
          damageEstimate: 185,
          meterCost: 0,
          executionTip: 'Buffer the Red Roc input during the final rapid hits of Jet Gatling.'
        },
        {
          stepIndex: 2,
          moveId: 'luffy_red_roc',
          moveName: 'Gomu Gomu no Red Roc',
          moveNameJP: 'ゴムゴムの業火拳銃',
          inputNotation: '→ ↓ ↘ + HP (DP+HP)',
          buttonGlyphs: ['623', 'HP'],
          category: 'haki_cancel',
          timing: {
            startupFrames: 14,
            activeWindowMs: 600,
            cancelWindowMs: 250,
            cancelOffsetMs: 300,
            timingLabel: 'Advanced Ryuo Explosion',
            difficultyRating: 'Moderate',
          },
          hakiTechnique: 'Haoshoku Infusion',
          fruitSynergy: 'Gear 3rd Giant Flaming Fist',
          damageEstimate: 275,
          meterCost: 0,
          executionTip: 'Hold forward to maximize wall splat impact.'
        }
      ],
      proTips: [
        'Pistol has low hit-stun; cancel early before the rubber snaps back.',
        'Red Roc causes internal destruction (Ryuo), ignoring 30% of target defense.'
      ]
    },
    {
      id: 'luffy_master_nika',
      fighterId: 'luffy',
      title: 'Dawn Rocket to Bajrang Climax',
      titleJP: '白弾連鎖・猿神昇華',
      difficulty: 'Master',
      archetype: 'Mythical Awakening',
      description: 'Awakened Gear 5 slingshot into the terrain, canceling mid-bounce into the colossal Bajrang Gun!',
      tags: ['Awakening Surge', 'Wall Bounce', 'Supreme Conqueror', '1-Stock EX'],
      totalDamageEstimate: 1155,
      meterRequired: 3,
      steps: [
        {
          stepIndex: 0,
          moveId: 'luffy_red_roc',
          moveName: 'Gomu Gomu no Red Roc',
          moveNameJP: 'ゴムゴムの業火拳銃',
          inputNotation: '→ ↓ ↘ + HP (DP+HP)',
          buttonGlyphs: ['623', 'HP'],
          category: 'starter',
          timing: {
            startupFrames: 14,
            activeWindowMs: 600,
            cancelWindowMs: 280,
            cancelOffsetMs: 280,
            timingLabel: 'Ryuo Launch Juggle',
            difficultyRating: 'Moderate',
          },
          hakiTechnique: 'Advanced Ryuo',
          damageEstimate: 275,
          meterCost: 0,
          executionTip: 'Confirm the burning launch to guarantee the opponent is airborne.'
        },
        {
          stepIndex: 1,
          moveId: 'luffy_dawn_rocket',
          moveName: 'Gear 5: Dawn Rocket',
          moveNameJP: 'ゴムゴムの白弾',
          inputNotation: '↓ ↙ ← + EX (QCB+EX)',
          buttonGlyphs: ['214', 'EX'],
          category: 'awakening',
          timing: {
            startupFrames: 9,
            activeWindowMs: 700,
            cancelWindowMs: 200,
            cancelOffsetMs: 380,
            timingLabel: 'Ground Slingshot Sweet Spot',
            difficultyRating: 'Tight (1-2f)',
          },
          fruitSynergy: 'Nika Environment Rubberization',
          damageEstimate: 380,
          meterCost: 1,
          executionTip: 'Execute during the apex of the wall bounce for maximum hit-stun scaling.'
        },
        {
          stepIndex: 2,
          moveId: 'luffy_bajrang_gun',
          moveName: 'MAX: Bajrang Gun',
          moveNameJP: 'ゴムゴムの猿神銃',
          inputNotation: '↓ ↘ → ↓ ↘ → + SUPER',
          buttonGlyphs: ['236236', 'MAX'],
          category: 'climax',
          timing: {
            startupFrames: 18,
            activeWindowMs: 900,
            cancelWindowMs: 400,
            cancelOffsetMs: 400,
            timingLabel: 'Supreme Haoshoku Sky Drop',
            difficultyRating: 'Moderate',
          },
          hakiTechnique: 'Haoshoku Infusion',
          fruitSynergy: 'Island-Sized Awakened Fist',
          damageEstimate: 680,
          meterCost: 2,
          executionTip: 'Super-cancel during Dawn Rocket hit freeze before Luffy rebounds.'
        }
      ],
      proTips: [
        'Gear 5 Dawn Rocket gives invincibility frames during start-up.',
        'Bajrang Gun deals catastrophic guard break damage even if blocked.'
      ]
    }
  ],

  zoro_ashura: [
    {
      id: 'zoro_dragon_hell',
      fighterId: 'zoro_ashura',
      title: 'Dragon Twister to King of Hell Slash',
      titleJP: '黒縄・大龍巻〜閻王三刀流',
      difficulty: 'Intermediate',
      archetype: 'Conqueror Swordsman',
      description: 'Vortex lift into Enma Haki surge and Asura Nine-Sword finish.',
      tags: ['Blade Link', 'Enma Ryuo Infusion', 'Air Juggle'],
      totalDamageEstimate: 870,
      meterRequired: 2,
      steps: [
        {
          stepIndex: 0,
          moveId: 'zoro_oni_giri',
          moveName: 'Rengoku Oni Giri',
          moveNameJP: '煉獄鬼斬り',
          inputNotation: 'LP + HP (Command Normal)',
          buttonGlyphs: ['LP+HP'],
          category: 'starter',
          timing: {
            startupFrames: 8,
            activeWindowMs: 500,
            cancelWindowMs: 250,
            cancelOffsetMs: 220,
            timingLabel: 'Cross-Up Slash Cancel',
            difficultyRating: 'Easy',
          },
          damageEstimate: 160,
          meterCost: 0,
          executionTip: 'Input Dragon Twister as soon as Zoro dashes through the opponent.'
        },
        {
          stepIndex: 1,
          moveId: 'zoro_dragon_twister',
          moveName: 'Kokujo: O Tatsu Maki',
          moveNameJP: '黒縄・大龍巻',
          inputNotation: '↓ ↘ → + HP (QCF+HP)',
          buttonGlyphs: ['236', 'HP'],
          category: 'haki_cancel',
          timing: {
            startupFrames: 11,
            activeWindowMs: 750,
            cancelWindowMs: 300,
            cancelOffsetMs: 350,
            timingLabel: 'Tornado Vortex Lift',
            difficultyRating: 'Moderate',
          },
          hakiTechnique: 'Armament Hardening',
          damageEstimate: 260,
          meterCost: 0,
          executionTip: 'The vortex traps the dummy in mid-air; buffer the Super immediately.'
        },
        {
          stepIndex: 2,
          moveId: 'zoro_ashura_dead_mans_game',
          moveName: 'Asura: Dead Man\'s Game',
          moveNameJP: '鬼気 九刀流 阿修羅 抜剣 亡者戯',
          inputNotation: '↓ ↘ → ↓ ↘ → + SUPER',
          buttonGlyphs: ['236236', 'MAX'],
          category: 'climax',
          timing: {
            startupFrames: 15,
            activeWindowMs: 800,
            cancelWindowMs: 350,
            cancelOffsetMs: 380,
            timingLabel: 'King of Hell True Strike',
            difficultyRating: 'Tight (1-2f)',
          },
          hakiTechnique: 'Haoshoku Infusion',
          damageEstimate: 620,
          meterCost: 2,
          executionTip: 'Release as the airborne target reaches waist height.'
        }
      ],
      proTips: [
        'Enma unleashes green conqueror lightning when super meter is full.',
        'Dead Man\'s Game leaves a permanent defense debuff for 1 turn.'
      ]
    }
  ],

  kaido_dragon: [
    {
      id: 'kaido_thunder_flame',
      fighterId: 'kaido_dragon',
      title: 'Thunder Bagua to Flame Dragon Torch',
      titleJP: '雷鳴八卦・火龍大公連鎖',
      difficulty: 'Master',
      archetype: 'Berserker Overlord',
      description: 'Lightning-fast club crush canceled into Mythical Zoan Flame Dragon incineration.',
      tags: ['Super Armor', 'Haoshoku Clash', 'Awakened Zoan'],
      totalDamageEstimate: 1100,
      meterRequired: 2,
      steps: [
        {
          stepIndex: 0,
          moveId: 'kaido_kanabo_smash',
          moveName: 'Hassou Kanabo Strike',
          moveNameJP: '金棒叩きつけ',
          inputNotation: 'HP (Heavy Punch)',
          buttonGlyphs: ['HP'],
          category: 'starter',
          timing: {
            startupFrames: 12,
            activeWindowMs: 600,
            cancelWindowMs: 250,
            cancelOffsetMs: 300,
            timingLabel: 'Heavy Ground Bounce',
            difficultyRating: 'Easy',
          },
          damageEstimate: 140,
          meterCost: 0,
          executionTip: 'Has super armor on frames 4-10; ignores light pokes.'
        },
        {
          stepIndex: 1,
          moveId: 'kaido_thunder_bagua',
          moveName: 'Ragnarok: Thunder Bagua',
          moveNameJP: '大威徳雷鳴八卦',
          inputNotation: '→ ↓ ↘ + HP (DP+HP)',
          buttonGlyphs: ['623', 'HP'],
          category: 'haki_cancel',
          timing: {
            startupFrames: 10,
            activeWindowMs: 700,
            cancelWindowMs: 220,
            cancelOffsetMs: 320,
            timingLabel: 'Black Lightning Dash Cancel',
            difficultyRating: 'Tight (1-2f)',
          },
          hakiTechnique: 'Haoshoku Infusion',
          damageEstimate: 340,
          meterCost: 0,
          executionTip: 'Dash travels full-screen; time cancel on the impact shockwave.'
        },
        {
          stepIndex: 2,
          moveId: 'kaido_flame_dragon_torch',
          moveName: 'Awakened Flame Dragon Torch',
          moveNameJP: '火龍大公（かえんだいこ）',
          inputNotation: '↓ ↘ → ↓ ↘ → + SUPER',
          buttonGlyphs: ['236236', 'MAX'],
          category: 'awakening',
          timing: {
            startupFrames: 16,
            activeWindowMs: 950,
            cancelWindowMs: 400,
            cancelOffsetMs: 450,
            timingLabel: 'Mythical Magma Engulfment',
            difficultyRating: 'Moderate',
          },
          fruitSynergy: 'Uo Uo no Mi Mythical Heat',
          damageEstimate: 720,
          meterCost: 2,
          executionTip: 'Fires massive blast that engulfs the whole stage.'
        }
      ],
      proTips: [
        'Thunder Bagua causes guard crush against non-blocking opponents.',
        'Flame Dragon Torch burns 15% HP per second over time.'
      ]
    }
  ]
};

// Generate dynamic advanced combo routes for ANY fighter
export function getCharacterComboGuides(fighter: Fighter): ComboGuideRoute[] {
  if (!fighter) return [];

  // Check if character already has curated handcrafted guides
  const curated = CURATED_COMBO_GUIDES[fighter.id];
  if (curated && curated.length > 0) {
    return curated;
  }

  const fallbackMove: Move = {
    id: `${fighter.id || 'fighter'}_strike`,
    name: 'Heavy Strike',
    nameJP: '強打',
    type: 'basic',
    baseDamage: 120,
    meterGain: 15,
    meterCost: 0,
    guardDamage: 10,
    cooldown: 0,
    critBonus: 10,
    missRate: 5,
    description: 'Standard powerful strike',
  };

  const rawMoves = fighter.moves || [];
  const moves = rawMoves.length > 0 ? rawMoves : [fallbackMove];
  const fruit = fighter.devilFruit;
  const hasFruit = Boolean(fruit && fruit.type !== 'None (Pure Haki)');
  
  const mBasic = moves.find(m => m.type === 'basic') || moves[0] || fallbackMove;
  const mCommand = moves.find(m => m.type === 'command') || moves[1] || moves[0] || fallbackMove;
  const mSpecial = moves.find(m => m.type === 'special' || m.type === 'ex') || moves[1] || moves[0] || fallbackMove;
  const mSuper = moves.find(m => m.type === 'super' || m.type === 'awakening') || moves[moves.length - 1] || fallbackMove;
  const mFinisher = moves.find(m => m.type === 'finisher') || moves[moves.length - 1] || fallbackMove;

  const routes: ComboGuideRoute[] = [];

  // ROUTE 1: STARTER LINK (2 Steps)
  routes.push({
    id: `${fighter.id}_guide_starter`,
    fighterId: fighter.id,
    title: `${fighter.shortName || fighter.name || 'Fighter'} Quick Target Link`,
    titleJP: `${fighter.japaneseName || ''} 基礎連鎖`,
    difficulty: 'Starter',
    archetype: fighter.archetype || 'Brawler',
    description: `Fundamental 2-hit confirmation linking normal strike into ${mSpecial?.name || 'Special'}.`,
    tags: [hasFruit ? 'Devil Fruit Link' : 'Haki Link', 'Hit-Confirm', 'Low Risk'],
    totalDamageEstimate: (mBasic?.baseDamage || 100) + (mSpecial?.baseDamage || 200),
    meterRequired: mSpecial?.meterCost || 0,
    steps: [
      {
        stepIndex: 0,
        moveId: mBasic?.id || 'm0',
        moveName: mBasic?.name || 'Light Attack',
        moveNameJP: mBasic?.nameJP,
        inputNotation: 'LP (Light Strike)',
        buttonGlyphs: ['LP'],
        category: 'starter',
        timing: {
          startupFrames: 6,
          activeWindowMs: 450,
          cancelWindowMs: 250,
          cancelOffsetMs: 180,
          timingLabel: 'Starter Cancel Window',
          difficultyRating: 'Easy',
        },
        damageEstimate: mBasic?.baseDamage || 100,
        meterCost: 0,
        executionTip: `Start with ${mBasic?.name} from mid-range to establish frame priority.`
      },
      {
        stepIndex: 1,
        moveId: mSpecial?.id || 'm1',
        moveName: mSpecial?.name || 'Special Technique',
        moveNameJP: mSpecial?.nameJP,
        inputNotation: '↓ ↘ → + HP (QCF+HP)',
        buttonGlyphs: ['236', 'HP'],
        category: hasFruit ? 'fruit_link' : 'haki_cancel',
        timing: {
          startupFrames: 10,
          activeWindowMs: 650,
          cancelWindowMs: 300,
          cancelOffsetMs: 300,
          timingLabel: 'Special Link Sweet Spot',
          difficultyRating: 'Moderate',
        },
        fruitSynergy: hasFruit ? `${fruit?.name} Power Burst` : undefined,
        hakiTechnique: (fighter.haki?.armament || 0) > 80 ? 'Advanced Ryuo' : 'Armament Hardening',
        damageEstimate: mSpecial?.baseDamage || 220,
        meterCost: mSpecial?.meterCost || 0,
        executionTip: `Buffer the directional motion during the initial strike animation.`
      }
    ],
    proTips: [
      'Confirm on counter-hit for +15% bonus stagger frames.',
      'Safe on block if spaced properly.'
    ]
  });

  // ROUTE 2: INTERMEDIATE HAKI CANCEL (3 Steps)
  routes.push({
    id: `${fighter.id}_guide_intermediate`,
    fighterId: fighter.id,
    title: `${hasFruit ? fruit.name : 'Supreme Haki'} Rhythm Burst`,
    titleJP: '覇気連環撃',
    difficulty: 'Intermediate',
    archetype: fighter.fightingStyle || 'Grand Line Master',
    description: `3-tier pressure string utilizing frame traps and Haki infusion to break guard.`,
    tags: ['Busoshoku Armor', 'Juggle State', 'Guard Pressure'],
    totalDamageEstimate: (mBasic?.baseDamage || 100) + (mCommand?.baseDamage || 180) + (mSpecial?.baseDamage || 250),
    meterRequired: (mSpecial?.meterCost || 0),
    steps: [
      {
        stepIndex: 0,
        moveId: mBasic?.id || 'm0',
        moveName: mBasic?.name || 'Light Attack',
        moveNameJP: mBasic?.nameJP,
        inputNotation: 'LP > MP (Target String)',
        buttonGlyphs: ['LP', 'MP'],
        category: 'starter',
        timing: {
          startupFrames: 7,
          activeWindowMs: 500,
          cancelWindowMs: 250,
          cancelOffsetMs: 200,
          timingLabel: 'Target Confirmation',
          difficultyRating: 'Easy',
        },
        damageEstimate: mBasic?.baseDamage || 110,
        meterCost: 0,
        executionTip: 'Double-tap to ensure smooth chain into command normal.'
      },
      {
        stepIndex: 1,
        moveId: mCommand?.id || 'm1',
        moveName: mCommand?.name || 'Command Normal',
        moveNameJP: mCommand?.nameJP,
        inputNotation: '→ + HP (Forward Heavy)',
        buttonGlyphs: ['6', 'HP'],
        category: 'haki_cancel',
        timing: {
          startupFrames: 11,
          activeWindowMs: 600,
          cancelWindowMs: 240,
          cancelOffsetMs: 280,
          timingLabel: 'Ryuo Armor Penetration',
          difficultyRating: 'Moderate',
        },
        hakiTechnique: 'Advanced Ryuo',
        damageEstimate: mCommand?.baseDamage || 200,
        meterCost: 0,
        executionTip: 'Launches opponent into vulnerable juggle state.'
      },
      {
        stepIndex: 2,
        moveId: mSpecial?.id || 'm2',
        moveName: mSpecial?.name || 'Special Assault',
        moveNameJP: mSpecial?.nameJP,
        inputNotation: '↓ ↙ ← + EX (QCB+EX)',
        buttonGlyphs: ['214', 'EX'],
        category: hasFruit ? 'fruit_link' : 'haki_cancel',
        timing: {
          startupFrames: 13,
          activeWindowMs: 700,
          cancelWindowMs: 260,
          cancelOffsetMs: 320,
          timingLabel: 'Apex Juggle Catch',
          difficultyRating: 'Tight (1-2f)',
        },
        fruitSynergy: hasFruit ? `${fruit?.name} Elemental Surge` : undefined,
        damageEstimate: mSpecial?.baseDamage || 280,
        meterCost: mSpecial?.meterCost || 0,
        executionTip: 'Time execution just as the falling opponent crosses shoulder height.'
      }
    ],
    proTips: [
      'Leaves opponent in hard knockdown.',
      'Can be metered for additional wall-bounce juggle.'
    ]
  });

  // ROUTE 3: YONKO CLIMAX AWAKENING (3-4 Steps)
  if (mSuper) {
    routes.push({
      id: `${fighter.id}_guide_climax`,
      fighterId: fighter.id,
      title: `${fighter.epithet || 'Emperor'} Supreme Overdrive`,
      titleJP: '神域・究極覚醒奥義',
      difficulty: 'Yonko Climax',
      archetype: 'Emperor Tier',
      description: `High-execution Emperor climax converting mid-screen hit into devastating Awakened finisher!`,
      tags: ['Supreme Conqueror', 'Awakening Climax', 'High Damage', 'Max Meter'],
      totalDamageEstimate: (mCommand?.baseDamage || 180) + (mSpecial?.baseDamage || 260) + (mSuper?.baseDamage || 650),
      meterRequired: mSuper?.meterCost || 2,
      steps: [
        {
          stepIndex: 0,
          moveId: mCommand?.id || 'm0',
          moveName: mCommand?.name || 'Starter Strike',
          moveNameJP: mCommand?.nameJP,
          inputNotation: '→ ↓ ↘ + HP (DP+HP)',
          buttonGlyphs: ['623', 'HP'],
          category: 'starter',
          timing: {
            startupFrames: 10,
            activeWindowMs: 550,
            cancelWindowMs: 220,
            cancelOffsetMs: 260,
            timingLabel: 'Anti-Air / Counter Confirm',
            difficultyRating: 'Moderate',
          },
          hakiTechnique: 'Haoshoku Infusion',
          damageEstimate: mCommand?.baseDamage || 200,
          meterCost: 0,
          executionTip: 'Look for counter-hit flash to immediately confirm super link.'
        },
        {
          stepIndex: 1,
          moveId: mSpecial?.id || 'm1',
          moveName: mSpecial?.name || 'EX Link',
          moveNameJP: mSpecial?.nameJP,
          inputNotation: '↓ ↘ → + EX (QCF+EX)',
          buttonGlyphs: ['236', 'EX'],
          category: hasFruit ? 'fruit_link' : 'haki_cancel',
          timing: {
            startupFrames: 9,
            activeWindowMs: 650,
            cancelWindowMs: 190,
            cancelOffsetMs: 310,
            timingLabel: 'Micro-Dash Link (Strict)',
            difficultyRating: 'Frame-Perfect',
          },
          fruitSynergy: hasFruit ? `${fruit?.name} Maximum Output` : undefined,
          damageEstimate: mSpecial?.baseDamage || 300,
          meterCost: 1,
          executionTip: 'Execute instant micro-dash forward during hit-stop.'
        },
        {
          stepIndex: 2,
          moveId: mSuper?.id || 'm2',
          moveName: mSuper?.name || 'MAX: Super Climax',
          moveNameJP: mSuper?.nameJP,
          inputNotation: '↓ ↘ → ↓ ↘ → + SUPER',
          buttonGlyphs: ['236236', 'MAX'],
          category: 'climax',
          timing: {
            startupFrames: 16,
            activeWindowMs: 900,
            cancelWindowMs: 350,
            cancelOffsetMs: 400,
            timingLabel: 'Grand Line Climax Detonation',
            difficultyRating: 'Moderate',
          },
          hakiTechnique: 'Haoshoku Infusion',
          damageEstimate: mSuper?.baseDamage || 680,
          meterCost: mSuper?.meterCost || 2,
          executionTip: 'Super-cancel during the first impact frame of the EX special.'
        }
      ],
      proTips: [
        'Requires minimum 2-3 super stocks.',
        'Unblockable if opponent is caught in counter-hit state.'
      ]
    });
  }

  return routes;
}
