const fs = require('fs');
let content = fs.readFileSync('src/components/ArcadeBattleArena.tsx', 'utf8');

const transformLogic = `
        // Check if a transformation is currently happening
        if (isTransformingRef.current) {
          runCombatLoop();
          return;
        }

        // Evaluate Dynamic Transformations
        const t1Transform = checkTransformations(curT1, curT2, currentRound);
        const t2Transform = checkTransformations(curT2, curT1, currentRound);

        if (t1Transform) {
          // Trigger Transformation Cinematic & Apply
          isTransformingRef.current = true;
          setIsPaused(true);
          isPausedRef.current = true;
          setDynamicTransformation({ isActive: true, transformation: t1Transform, side: 'team1' });
          
          setT1FighterStates(prev => {
            const next = [...prev];
            next[t1IdxRef.current] = applyTransformation(next[t1IdxRef.current], t1Transform);
            t1StatesRef.current = next;
            return next;
          });
          
          setTimeout(() => {
             isTransformingRef.current = false;
          }, 4500); // Resume slightly after cinematic completes
          return;
        }

        if (t2Transform) {
          isTransformingRef.current = true;
          setIsPaused(true);
          isPausedRef.current = true;
          setDynamicTransformation({ isActive: true, transformation: t2Transform, side: 'team2' });
          
          setT2FighterStates(prev => {
            const next = [...prev];
            next[t2IdxRef.current] = applyTransformation(next[t2IdxRef.current], t2Transform);
            t2StatesRef.current = next;
            return next;
          });
          
          setTimeout(() => {
             isTransformingRef.current = false;
          }, 4500);
          return;
        }
`;

const targetAnchor = `        if (!curT1 || !curT2 || curT1.currentHp <= 0 || curT2.currentHp <= 0) {
          // Heartbeat fail-safe: if any fighter reaches 0 HP and KO wasn't triggered, resolve it immediately!`;

if (!content.includes('// Evaluate Dynamic Transformations')) {
  // We insert it before the KO check or after? After KO check is better, so dead fighters don't transform.
  const injectTarget = `          runCombatLoop();
          return;
        }`;
  
  // Actually let's just find the exact block for the DYNAMIC REAL-TIME MODE and put it above it.
  content = content.replace("// --- 1. DYNAMIC REAL-TIME MODE", transformLogic + "\n        // --- 1. DYNAMIC REAL-TIME MODE");
  fs.writeFileSync('src/components/ArcadeBattleArena.tsx', content);
  console.log("Transformation logic injected");
} else {
  console.log("Transformation logic already injected");
}
