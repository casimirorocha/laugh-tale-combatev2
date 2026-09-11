import re

with open('src/components/ArcadeBattleArena.tsx', 'r') as f:
    content = f.read()

content = content.replace("regenerateFighterStamina", "regenerateFighterMeters")

# Replace Team 1 regen condition
t1_regen_old = """          const current = prev[idx].staminaMeter ?? 100;
          if (current >= 100 && !prev[idx].isExhausted) return prev;
          const updated = regenerateFighterMeters(prev[idx], 5);"""
          
t1_regen_new = """          const current = prev[idx].staminaMeter ?? 100;
          const currentHaki = prev[idx].superMeter ?? 0;
          if (current >= 100 && !prev[idx].isExhausted && currentHaki >= 300) return prev;
          const updated = regenerateFighterMeters(prev[idx], 5);"""

content = content.replace(t1_regen_old, t1_regen_new)

# Replace Team 2 regen condition
t2_regen_old = """          const current = prev[idx].staminaMeter ?? 100;
          if (current >= 100 && !prev[idx].isExhausted) return prev;
          const updated = regenerateFighterMeters(prev[idx], 5);"""

content = content.replace(t2_regen_old, t1_regen_new) # Using same string, should work if they were identical

with open('src/components/ArcadeBattleArena.tsx', 'w') as f:
    f.write(content)

print("Patched ArcadeBattleArena.tsx regen")
