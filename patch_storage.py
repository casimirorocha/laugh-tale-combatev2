import re

with open('src/utils/storage.ts', 'r') as f:
    content = f.read()

patch = """
  profile.matchHistory = [result, ...profile.matchHistory.filter((m) => m.id !== result.id).slice(0, 19)]; // Keep last 20 unique
  
  // Check Gallery Unlocks
  if (!profile.unlockedGalleryItems) profile.unlockedGalleryItems = [];
  let newlyUnlockedGallery = false;
  GALLERY_ITEMS.forEach(item => {
    if (!profile.unlockedGalleryItems!.includes(item.id)) {
      if (item.checkUnlock(result, isUserWinner, profile)) {
        profile.unlockedGalleryItems!.push(item.id);
        newlyUnlockedGallery = true;
      }
    }
  });

  updateGlobalStats(result);
"""

content = content.replace("  profile.matchHistory = [result, ...profile.matchHistory.filter((m) => m.id !== result.id).slice(0, 19)]; // Keep last 20 unique\n  updateGlobalStats(result);", patch)

with open('src/utils/storage.ts', 'w') as f:
    f.write(content)

print("Patched storage.ts")
