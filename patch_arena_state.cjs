const fs = require('fs');
let content = fs.readFileSync('src/components/ArcadeBattleArena.tsx', 'utf8');

const importStatement = `import { checkTransformations, applyTransformation } from '../utils/transformationEngine';\nimport { TransformationCinematic } from './TransformationCinematic';\nimport { Transformation } from '../types/fighter';`;
if (!content.includes('import { checkTransformations')) {
  content = content.replace("import { HakiAwakeningEmbers } from './HakiAwakeningEmbers';", importStatement + "\nimport { HakiAwakeningEmbers } from './HakiAwakeningEmbers';");
}

const stateVariables = `
  // Dynamic Transformation State
  const [dynamicTransformation, setDynamicTransformation] = useState<{
    isActive: boolean;
    transformation: Transformation | null;
    side: 'team1' | 'team2' | null;
  }>({ isActive: false, transformation: null, side: null });
  const isTransformingRef = useRef<boolean>(false);
`;

if (!content.includes('const [dynamicTransformation')) {
  content = content.replace("const [awakeningCinematic, setAwakeningCinematic] = useState<{", stateVariables + "\n  const [awakeningCinematic, setAwakeningCinematic] = useState<{");
}

const renderCinematic = `
      {/* Dynamic Transformation Cinematic */}
      <TransformationCinematic
        isActive={dynamicTransformation.isActive}
        transformation={dynamicTransformation.transformation}
        side={dynamicTransformation.side}
        onComplete={() => {
          setDynamicTransformation({ isActive: false, transformation: null, side: null });
          setIsPaused(false);
          isPausedRef.current = false;
        }}
      />
`;

if (!content.includes('<TransformationCinematic')) {
  content = content.replace("{/* Awakening Transformation Cinematic */}", renderCinematic + "\n      {/* Awakening Transformation Cinematic */}");
}

fs.writeFileSync('src/components/ArcadeBattleArena.tsx', content);
console.log('Arena state patched');
