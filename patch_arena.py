import re

with open('src/components/ArcadeBattleArena.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useSeasonalTheme } from '../utils/seasonalTheme';", "import { useArcTheme } from '../utils/arcTheme';")
content = content.replace("const { theme } = useSeasonalTheme();", "const { theme } = useArcTheme();")

with open('src/components/ArcadeBattleArena.tsx', 'w') as f:
    f.write(content)
print("Patched ArcadeBattleArena.tsx")
