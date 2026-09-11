const fs = require('fs');

let content = fs.readFileSync('src/data/characters.ts', 'utf8');

// We will inject the transformation directly into the luffy_gear4 object.
// Wait, to do it cleanly, let's just find the end of the luffy_gear4 moves array and add the transformation.

const gear5Transforms = `
  transformations: [
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
        attackMultiplier: 1.4,
        speedMultiplier: 1.5,
        defenseMultiplier: 1.2,
        hpHealPercentage: 0.2 // Heals 20% max HP on activation
      },
      moveSetOverrides: [
        {
          id: 'luffy_dawn_rocket',
          name: 'Gomu Gomu no Dawn Rocket',
          type: 'special',
          damage: 55,
          accuracy: 100,
          cooldown: 0,
          staminaCost: 30,
          description: 'A reality-bending rocket strike.',
          visualEffect: 'void'
        },
        {
          id: 'luffy_bajrang_gun',
          name: 'Gomu Gomu no Bajrang Gun',
          type: 'finisher',
          damage: 180,
          accuracy: 100,
          cooldown: 0,
          staminaCost: 100,
          description: 'An island-sized punch wrapped in Supreme King Haki.',
          visualEffect: 'conqueror'
        }
      ]
    }
  ],
`;

if (content.includes("id: 'luffy_gear4'")) {
  // Find where luffy_gear4 ends (roughly after his skins or moves)
  // Let's insert it right after his skins or moves.
  
  // Actually, let's find the closing bracket for luffy_gear4's object. It's too complex to regex.
  // Instead, let's inject it into the object literal directly.
  
  content = content.replace("id: 'luffy_gear4',", "id: 'luffy_gear4',\n" + gear5Transforms);
  
  fs.writeFileSync('src/data/characters.ts', content);
  console.log("Transformation added to Luffy Gear 4");
} else {
  console.log("Could not find luffy_gear4");
}
