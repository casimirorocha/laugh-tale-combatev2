import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add 'gallery' to AppScreen
content = content.replace("  | 'codex'", "  | 'codex'\n  | 'gallery'")

# Add GalleryView import
content = content.replace("import { FighterEncyclopedia } from './components/FighterEncyclopedia';", "import { FighterEncyclopedia } from './components/FighterEncyclopedia';\nimport { GalleryView } from './components/GalleryView';")

# Add onOpenGallery prop to TeamSelect
content = content.replace("onOpenEncyclopedia={() => setCurrentScreen('codex')}", "onOpenEncyclopedia={() => setCurrentScreen('codex')}\n          onOpenGallery={() => setCurrentScreen('gallery')}")

# Render GalleryView
render_gallery = """      {currentScreen === 'codex' && (
        <FighterEncyclopedia onClose={() => setCurrentScreen('roster')} />
      )}
      
      {currentScreen === 'gallery' && (
        <GalleryView onClose={() => setCurrentScreen('roster')} />
      )}"""
content = content.replace("      {currentScreen === 'codex' && (\n        <FighterEncyclopedia onClose={() => setCurrentScreen('roster')} />\n      )}", render_gallery)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Patched App.tsx")
