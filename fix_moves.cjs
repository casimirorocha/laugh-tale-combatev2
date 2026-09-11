const fs = require('fs');
let content = fs.readFileSync('src/data/characters.ts', 'utf8');

// Fix Luffy Gear 5 transformation moves
content = content.replace(/damage: 55,/g, "baseDamage: 55, nameJP: 'ゴムゴムのドーン・ロケット', missRate: 5, critBonus: 10, meterCost: 0, meterGain: 15, guardDamage: 25,");
content = content.replace(/damage: 180,/g, "baseDamage: 180, nameJP: 'ゴムゴムのバジュラング・ガン', missRate: 0, critBonus: 20, meterCost: 300, meterGain: 0, guardDamage: 100,");

// Fix Kaido Hybrid transformation moves
content = content.replace(/damage: 65,/g, "baseDamage: 65, nameJP: '酒龍八卦', missRate: 15, critBonus: 25, meterCost: 0, meterGain: 20, guardDamage: 40,");
content = content.replace(/damage: 160,/g, "baseDamage: 160, nameJP: '降三世引奈落', missRate: 0, critBonus: 15, meterCost: 200, meterGain: 0, guardDamage: 80,");

fs.writeFileSync('src/data/characters.ts', content);
console.log('Fixed moves in transformations');
