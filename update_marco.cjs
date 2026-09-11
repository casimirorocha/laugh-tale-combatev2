const fs = require('fs');
let content = fs.readFileSync('src/data/characters.ts', 'utf8');

const marcoTransform = `
  transformations: [
    {
      id: 'marco_hybrid',
      name: 'Hybrid Phoenix Form',
      description: 'Marco partially transforms, wrapping his arms and legs in the Blue Flames of Resurrection.',
      triggerConditions: [
        { type: 'HP_BELOW', value: 75 },
        { type: 'TURN_COUNT', value: 2 }
      ],
      visuals: {
        avatarUrl: 'https://i.pinimg.com/736x/88/0b/24/880b2403666b613ebbe71c99f939e602.jpg',
        themeColor: '#0ea5e9',
        auraEffect: 'haki_flame'
      },
      statModifiers: {
        attackMultiplier: 1.2,
        speedMultiplier: 1.3,
        defenseMultiplier: 1.1,
        hpHealPercentage: 0.15
      },
      moveSetOverrides: [
        {
          id: 'mar_hybrid_crane_talon',
          name: 'Crane Talon',
          nameJP: '鶴の爪 (ツルノツメ)',
          type: 'special',
          baseDamage: 275,
          missRate: 2,
          critBonus: 25,
          meterCost: 0,
          meterGain: 40,
          guardDamage: 40,
          cooldown: 1,
          description: 'A powerful slashing kick with his phoenix talons.',
          cutinEffect: 'observation'
        }
      ]
    },
    {
      id: 'marco_full_phoenix',
      name: 'Full Phoenix Form',
      description: 'Marco fully transforms into the mythical Phoenix, rendering most attacks ineffective.',
      triggerConditions: [
        { type: 'HP_BELOW', value: 35 }
      ],
      visuals: {
        avatarUrl: 'https://i.pinimg.com/736x/8f/c9/a1/8fc9a1e0506e788b9dd632d43e5ec77a.jpg',
        themeColor: '#38bdf8',
        auraEffect: 'void'
      },
      statModifiers: {
        attackMultiplier: 1.4,
        speedMultiplier: 1.5,
        defenseMultiplier: 1.3,
        hpHealPercentage: 0.25
      },
      moveSetOverrides: [
        {
          id: 'mar_phoenix_brand',
          name: 'Phoenix Brand',
          nameJP: '不死鳥の印 (フシチョウノシルシ)',
          type: 'ex',
          baseDamage: 520,
          missRate: 0,
          critBonus: 40,
          meterCost: 1,
          meterGain: 15,
          guardDamage: 80,
          cooldown: 2,
          description: 'A massive wave of regenerative and destructive blue fire.',
          cutinEffect: 'void'
        }
      ]
    }
  ],
`;

if (content.includes("id: 'marco_phoenix'")) {
  content = content.replace("id: 'marco_phoenix',", "id: 'marco_phoenix',\n" + marcoTransform);
  
  // also balance Marco's name since he's just "Marco"
  content = content.replace("name: 'Marco the Phoenix',", "name: 'Marco',");
  
  fs.writeFileSync('src/data/characters.ts', content);
  console.log("Marco transformations added.");
}
