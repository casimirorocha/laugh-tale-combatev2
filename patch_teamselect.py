import re

with open('src/components/TeamSelect.tsx', 'r') as f:
    content = f.read()

# Add to interface
content = content.replace("  onOpenEncyclopedia: () => void;", "  onOpenEncyclopedia: () => void;\n  onOpenGallery: () => void;")

# Add to destructured props
content = content.replace("  onOpenEncyclopedia,", "  onOpenEncyclopedia,\n  onOpenGallery,")

# Add button
button = """          <button
            onClick={onOpenEncyclopedia}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>CODEX & VICTORY GALLERY</span>
          </button>
          
          <button
            onClick={onOpenGallery}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition shadow-sm"
          >
            <Image className="h-3.5 w-3.5 text-amber-400" />
            <span>CONCEPT ART & LORE</span>
          </button>"""

content = content.replace("""          <button
            onClick={onOpenEncyclopedia}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition shadow-sm"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>CODEX & VICTORY GALLERY</span>
          </button>""", button)

# Ensure Image icon is imported from lucide-react
if "Image" not in content and "Image " not in content:
    content = content.replace("import { Users, Info, Settings, Search, CheckCircle2, XCircle, Sword, LayoutGrid, Zap, Map, Trophy, Target, Globe } from 'lucide-react';", 
                              "import { Users, Info, Settings, Search, CheckCircle2, XCircle, Sword, LayoutGrid, Zap, Map, Trophy, Target, Globe, Image } from 'lucide-react';")

with open('src/components/TeamSelect.tsx', 'w') as f:
    f.write(content)

print("Patched TeamSelect.tsx")
