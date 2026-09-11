const fs = require('fs');
let content = fs.readFileSync('src/data/characters.ts', 'utf8');

// Find start of luffy_gear4
const l4Start = content.indexOf("    id: 'luffy_gear4',");
if (l4Start === -1) {
  console.log("Could not find luffy_gear4");
  process.exit(1);
}
// Find start of the first character AFTER luffy_gear5
const zoroStart = content.indexOf("    id: 'zoro_king_of_hell',");
if (zoroStart === -1) {
  console.log("Could not find zoro");
  process.exit(1);
}

// Find the beginning of the object for luffy_gear4
let objStart = l4Start;
while (content[objStart] !== '{' && objStart > 0) {
  objStart--;
}

// Find the beginning of the object for zoro
let zObjStart = zoroStart;
while (content[zObjStart] !== '{' && zObjStart > 0) {
  zObjStart--;
}

const beforeLuffy = content.substring(0, objStart);
const afterLuffy = content.substring(zObjStart);

const unifiedLuffy = `{
    id: 'luffy',
    name: 'Monkey D. Luffy',
    shortName: 'Luffy',
    epithet: 'Straw Hat',
    japaneseName: 'モンキー・D・ルフィ',
    affiliation: 'Straw Hat Pirates',
    rank: 'Yonko (Four Emperors)',
    role: 'Captain',
    fightingStyle: 'Advanced Ryuo Brawler',
    age: 19,
    experienceYears: 3,
    bounty: 3000000000,
    winRecord: { wins: 45, losses: 5, draws: 1 },
    stats: {
      maxHp: 2000,
      attack: 160,
      defense: 120,
      speed: 130,
      critRate: 15,
    },
    haki: {
      armament: 95,
      observation: 90,
      conqueror: 100,
    },
    devilFruit: {
      name: 'Gomu Gomu no Mi (Hito Hito no Mi, Model: Nika)',
      type: 'Mythical Zoan',
      mastery: 100,
      awakened: true,
    },
    transformations: [
      {
        id: 'gear_4_boundman',
        name: 'Gear 4: Boundman',
        description: 'Luffy inflates his muscular structure, coating it in Haki to increase tension and elasticity.',
        triggerConditions: [
          { type: 'HP_BELOW', value: 70 },
          { type: 'TURN_COUNT', value: 2 }
        ],
        visuals: {
          avatarUrl: 'https://i.pinimg.com/736x/ec/eb/f9/ecebf9214d048d0ab97072a44b80a424.jpg', // Just a placeholder, ideally the G4 image
          themeColor: '#b91c1c',
          auraEffect: 'haki_flame',
        },
        statModifiers: {
          attackMultiplier: 1.3,
          speedMultiplier: 1.2,
          defenseMultiplier: 1.4,
          hpHealPercentage: 0
        },
        moveSetOverrides: [
          {
            id: 'luffy_g4_kong_gun',
            name: 'Gomu Gomu no Kong Gun',
            nameJP: '猿王銃 (コングガン)',
            type: 'special',
            baseDamage: 280,
            missRate: 5,
            critBonus: 15,
            meterCost: 0,
            meterGain: 35,
            guardDamage: 60,
            cooldown: 1,
            description: 'A massively powerful punch fired like a cannon.',
            cutinEffect: 'armament'
          },
          {
            id: 'luffy_g4_leo_bazooka',
            name: 'Gear 4: Leo Bazooka',
            nameJP: '獅子王バズーカ (レオ・バズーカ)',
            type: 'ex',
            baseDamage: 550,
            missRate: 5,
            critBonus: 25,
            meterCost: 1,
            meterGain: 15,
            guardDamage: 90,
            cooldown: 2,
            description: 'A double-palm strike that sends the opponent flying.',
            cutinEffect: 'conqueror'
          }
        ]
      },
      {
        id: 'gear_5_awakening',
        name: 'Gear 5: Sun God Nika',
        description: 'The heartbeat of liberation. Transforms into the warrior of liberation.',
        triggerConditions: [
          { type: 'HP_BELOW', value: 35 } // Trigger when HP < 35%
        ],
        visuals: {
          avatarUrl: 'https://i.pinimg.com/736x/ec/eb/f9/ecebf9214d048d0ab97072a44b80a424.jpg',
          themeColor: '#f8fafc',
          auraEffect: 'void',
        },
        statModifiers: {
          attackMultiplier: 1.5,
          speedMultiplier: 1.6,
          defenseMultiplier: 1.2,
          hpHealPercentage: 0.2 // Heals 20% max HP on activation
        },
        moveSetOverrides: [
          {
            id: 'luffy_dawn_rocket',
            name: 'Gomu Gomu no Dawn Rocket',
            nameJP: 'ゴムゴムのドーン・ロケット',
            type: 'special',
            baseDamage: 300,
            missRate: 5,
            critBonus: 20,
            meterCost: 0,
            meterGain: 40,
            guardDamage: 75,
            cooldown: 0,
            description: 'A reality-bending rocket strike.',
            cutinEffect: 'void'
          },
          {
            id: 'luffy_bajrang_gun',
            name: 'Gomu Gomu no Bajrang Gun',
            nameJP: 'ゴムゴムのバジュラング・ガン',
            type: 'finisher',
            baseDamage: 1200,
            missRate: 0,
            critBonus: 30,
            meterCost: 2,
            meterGain: 0,
            guardDamage: 200,
            cooldown: 5,
            description: 'An island-sized punch wrapped in Supreme King Haki.',
            cutinEffect: 'conqueror'
          }
        ]
      }
    ],
    moves: [
      { id: 'luffy_pistol', name: 'Gomu Gomu no Pistol', nameJP: 'ゴムゴムの銃 (ピストル)', type: 'basic', baseDamage: 90, missRate: 3, critBonus: 5, meterCost: 0, meterGain: 35, guardDamage: 20, cooldown: 0, description: 'A rapid stretching punch.' },
      { id: 'luffy_jet_gatling', name: 'Gomu Gomu no Jet Gatling', nameJP: 'ゴムゴムのJET銃乱打', type: 'special', baseDamage: 180, missRate: 8, critBonus: 10, meterCost: 0, meterGain: 40, guardDamage: 45, cooldown: 1, description: 'A barrage of high-speed punches.' },
      { id: 'luffy_red_roc', name: 'Gomu Gomu no Red Roc', nameJP: 'ゴムゴムの業火拳銃 (レッドロック)', type: 'command', baseDamage: 250, missRate: 5, critBonus: 15, meterCost: 0, meterGain: 35, guardDamage: 50, cooldown: 2, description: 'A fiery, Haki-infused punch.' },
      { id: 'luffy_elephant_gun', name: 'Gomu Gomu no Elephant Gun', nameJP: '象銃 (エレファント・ガン)', type: 'ex', baseDamage: 450, missRate: 10, critBonus: 20, meterCost: 1, meterGain: 15, guardDamage: 80, cooldown: 2, description: 'A giant, Armament Haki coated punch.' },
      { id: 'luffy_roc_gatling', name: 'MAX: Roc Gatling', nameJP: '怪鳥銃乱打 (ロックガトリング)', type: 'super', baseDamage: 850, missRate: 2, critBonus: 30, meterCost: 2, meterGain: 0, guardDamage: 120, cooldown: 5, description: 'A devastating barrage of fiery Haki punches.' }
    ],
    clashQuote: "I'm going to be the King of the Pirates!",
    winQuote: "Shishishi! I won!",
    loseQuote: "I need... meat...",
    themeColor: '#ef4444',
    secondaryColor: '#fef08a',
    avatarIcon: '🍖',
    avatarUrl: luffyImg,
    activeSkinId: 'east_blue',
  },
`;

const newContent = beforeLuffy + unifiedLuffy + afterLuffy;
fs.writeFileSync('src/data/characters.ts', newContent);
console.log("Luffy has been rebuilt into a single character.");
