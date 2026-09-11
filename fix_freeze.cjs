const fs = require('fs');
let content = fs.readFileSync('src/components/ArcadeBattleArena.tsx', 'utf8');

const t1Target = `          setTimeout(() => {
             isTransformingRef.current = false;
          }, 4500); // Resume slightly after cinematic completes
          return;`;
const t1Replacement = `          setTimeout(() => {
             isTransformingRef.current = false;
          }, 4500); // Resume slightly after cinematic completes
          runCombatLoop();
          return;`;

const t2Target = `          setTimeout(() => {
             isTransformingRef.current = false;
          }, 4500);
          return;`;
const t2Replacement = `          setTimeout(() => {
             isTransformingRef.current = false;
          }, 4500);
          runCombatLoop();
          return;`;

content = content.replace(t1Target, t1Replacement);
content = content.replace(t2Target, t2Replacement);

fs.writeFileSync('src/components/ArcadeBattleArena.tsx', content);
console.log('Fixed early return bug in combat loop');
