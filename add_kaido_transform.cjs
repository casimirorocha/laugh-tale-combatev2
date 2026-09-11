const fs = require('fs');
let content = fs.readFileSync('src/data/characters.ts', 'utf8');

const kaidoTransforms = `
  transformations: [
    {
      id: 'kaido_hybrid',
      name: 'Hybrid Form',
      description: 'The supreme combat form of the Uo Uo no Mi.',
      triggerConditions: [
        { type: 'HP_BELOW', value: 50 },
        { type: 'OPPONENT_HAS_OBSERVATION', value: 85 } // AI trigger: adapt to fast/evasive opponent
      ],
      visuals: {
        avatarUrl: 'https://i.pinimg.com/564x/df/77/82/df77823f66cc992150117013ee42b325.jpg',
        themeColor: '#3b82f6',
        auraEffect: 'haki_flame'
      },
      statModifiers: {
        attackMultiplier: 1.3,
        speedMultiplier: 1.4,
        defenseMultiplier: 1.25,
        hpHealPercentage: 0.1
      },
      moveSetOverrides: [
        {
          id: 'kaido_shuron_hakke',
          name: 'Shuron Hakke',
          type: 'special',
          damage: 65,
          accuracy: 95,
          cooldown: 0,
          staminaCost: 35,
          description: 'Drunken fighting style unpredictability.',
          visualEffect: 'conqueror'
        },
        {
          id: 'kaido_kosanze_ragnerok',
          name: 'Kosanze Ragnerok',
          type: 'finisher',
          damage: 160,
          accuracy: 100,
          cooldown: 0,
          staminaCost: 100,
          description: 'A devastating swing from above imbued with Haoshoku Haki.',
          visualEffect: 'conqueror'
        }
      ]
    }
  ],
`;

if (content.includes("id: 'kaido_beast'")) {
  content = content.replace("id: 'kaido_beast',", "id: 'kaido_beast',\n" + kaidoTransforms);
  fs.writeFileSync('src/data/characters.ts', content);
  console.log("Transformation added to Kaido");
} else {
  console.log("Could not find kaido_beast");
}
