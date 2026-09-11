import re

with open('src/components/TeamSelect.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { useSeasonalTheme, Season } from '../utils/seasonalTheme';", "import { useArcTheme, ArcTimeTheme } from '../utils/arcTheme';")
content = content.replace("const { season, theme, isAuto, selectSeason, setAutoMode } = useSeasonalTheme();", "const { themeId, theme, isAuto, selectTheme, setAutoMode } = useArcTheme();")

# Replace select options
options = """
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-xs select-none shadow-md">
            <span className="text-[10px] font-bold text-zinc-400 font-mono hidden md:inline">TIME ARC:</span>
            <select
              value={isAuto ? 'auto' : themeId}
              onChange={(e) => {
                if (e.target.value === 'auto') {
                  setAutoMode();
                } else {
                  selectTheme(e.target.value as ArcTimeTheme);
                }
              }}
              className="bg-transparent text-amber-500 font-bold focus:outline-none cursor-pointer appearance-none px-1"
            >
              <option value="auto" className="bg-zinc-900 text-zinc-100">🔄 Auto ({theme.emoji})</option>
              <option value="east_blue_dawn" className="bg-zinc-900 text-zinc-100">🌊 East Blue Dawn</option>
              <option value="alabasta_noon" className="bg-zinc-900 text-zinc-100">☀️ Alabasta Noon</option>
              <option value="wano_dusk" className="bg-zinc-900 text-zinc-100">🌸 Wano Dusk</option>
              <option value="thriller_bark_night" className="bg-zinc-900 text-zinc-100">🦇 Thriller Bark Night</option>
            </select>
          </div>
"""

# Try to find the old select box and replace it.
content = re.sub(
    r'<div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2 py-1 text-xs select-none shadow-md">[\s\S]*?</select>\s*</div>',
    options.strip(),
    content
)

with open('src/components/TeamSelect.tsx', 'w') as f:
    f.write(content)
print("Patched TeamSelect.tsx")
