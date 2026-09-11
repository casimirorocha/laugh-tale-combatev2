const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/characters.ts');
let content = fs.readFileSync(filePath, 'utf8');

const hakiUpdates = {
  'luffy_gear4': { observation: 95, armament: 98, conqueror: 95 },
  'luffy_gear5': { observation: 95, armament: 98, conqueror: 95 },
  'zoro_king_of_hell': { observation: 75, armament: 95, conqueror: 85 },
  'shanks_yonko': { observation: 100, armament: 95, conqueror: 100 },
  'kaido_beast': { observation: 85, armament: 95, conqueror: 95 },
  'roger_pirate_king': { observation: 95, armament: 98, conqueror: 100 },
  'whitebeard_legend': { observation: 85, armament: 95, conqueror: 95 },
  'blackbeard_teach': { observation: 70, armament: 85, conqueror: 0 },
  'akainu_sakazuki': { observation: 80, armament: 95, conqueror: 0 },
  'mihawk_dracule': { observation: 95, armament: 100, conqueror: 0 },
  'kizaru_borsalino': { observation: 85, armament: 85, conqueror: 0 },
  'garp_legend': { observation: 85, armament: 100, conqueror: 95 },
  'law_trafalgar': { observation: 75, armament: 80, conqueror: 0 },
  'buggy_emperor': { observation: 20, armament: 0, conqueror: 0 },
  'katakuri_charlotte': { observation: 98, armament: 85, conqueror: 80 },
  'crocodile_sir': { observation: 50, armament: 60, conqueror: 0 },
  'doflamingo_joker': { observation: 70, armament: 75, conqueror: 75 },
  'jinbe_knight': { observation: 65, armament: 85, conqueror: 0 },
  'ace_portgas': { observation: 50, armament: 65, conqueror: 70 },
  'sanji_vinsmoke': { observation: 90, armament: 80, conqueror: 0 },
  'lucci_rob': { observation: 70, armament: 85, conqueror: 0 },
  'enel_god': { observation: 95, armament: 0, conqueror: 0 },
  'moria_gecko': { observation: 30, armament: 40, conqueror: 0 },
  'oden_kozuki': { observation: 70, armament: 95, conqueror: 90 },
  'shiki_lion': { observation: 70, armament: 80, conqueror: 85 },
  'aokiji_kuzan': { observation: 85, armament: 90, conqueror: 0 },
  'imu_sama': { observation: 100, armament: 100, conqueror: 100 },
  'king_conflagration': { observation: 60, armament: 85, conqueror: 0 },
  'big_mom_linlin': { observation: 70, armament: 90, conqueror: 95 },
  'magellan_warden': { observation: 60, armament: 70, conqueror: 0 },
  'dragon_revolutionary': { observation: 95, armament: 95, conqueror: 100 },
  'loki_elbaf': { observation: 70, armament: 90, conqueror: 85 },
  'hakuba_beautiful': { observation: 60, armament: 75, conqueror: 0 },
  'smoker_white_chase': { observation: 60, armament: 70, conqueror: 0 },
  'kuma_tyrant': { observation: 70, armament: 80, conqueror: 0 },
  'kid_magnetic': { observation: 60, armament: 80, conqueror: 80 },
  'killer_massacre': { observation: 60, armament: 75, conqueror: 0 },
  'marco_phoenix': { observation: 75, armament: 85, conqueror: 0 }
};

for (const [id, haki] of Object.entries(hakiUpdates)) {
  const regex = new RegExp(`(id:\\s*'${id}'.*?haki:\\s*\\{\\s*).*?(\\s*\\})`, 'gs');
  content = content.replace(regex, `$1 observation: ${haki.observation}, armament: ${haki.armament}, conqueror: ${haki.conqueror} $2`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Haki stats updated successfully.');
