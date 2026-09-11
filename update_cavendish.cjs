const fs = require('fs');
let content = fs.readFileSync('src/data/characters.ts', 'utf8');

const cavendishTransform = `
  transformations: [
    {
      id: 'hakuba_awakening',
      name: 'Hakuba',
      description: 'Cavendish falls asleep, awakening his bloodthirsty alter ego, Hakuba.',
      triggerConditions: [
        { type: 'HP_BELOW', value: 40 },
        { type: 'TURN_COUNT', value: 4 }
      ],
      visuals: {
        avatarUrl: 'https://i.pinimg.com/736x/88/ab/cf/88abcf134df5b91b5c46eeb3f124654b.jpg',
        themeColor: '#1e293b',
        auraEffect: 'void'
      },
      statModifiers: {
        attackMultiplier: 1.6,
        speedMultiplier: 2.0, // Insane speed
        defenseMultiplier: 0.7, // Takes more damage
        hpHealPercentage: 0
      },
      moveSetOverrides: [
        {
          id: 'hak_half_moon_glint',
          name: 'Half-Moon Glint',
          nameJP: '半月の閃光',
          type: 'special',
          baseDamage: 320,
          missRate: 5,
          critBonus: 50, // Massive crit chance
          meterCost: 0,
          meterGain: 20,
          guardDamage: 60,
          cooldown: 0,
          description: 'A terrifyingly fast slash that is almost invisible to the naked eye.',
          cutinEffect: 'void'
        }
      ]
    }
  ],
`;

if (content.includes("id: 'hakuba_beautiful'")) {
  // We'll replace the id and name
  content = content.replace("id: 'hakuba_beautiful',", "id: 'cavendish',\n" + cavendishTransform);
  content = content.replace("name: 'Hakuba (Cavendish)',", "name: 'Cavendish',");
  content = content.replace("shortName: 'Hakuba',", "shortName: 'Cavendish',");
  
  fs.writeFileSync('src/data/characters.ts', content);
  console.log("Cavendish transformations added.");
}
