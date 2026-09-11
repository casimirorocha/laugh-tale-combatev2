import re

with open('src/utils/combatEngine.ts', 'r') as f:
    content = f.read()

new_regen = """export function regenerateFighterMeters(fighterState: BattleFighterState, deltaAmount: number = 6): BattleFighterState {
  const currentStamina = fighterState.staminaMeter ?? 100;
  // Defensive stance gains 50% more stamina recovery during downtime
  const stanceBonus = fighterState.currentStance === 'defensive' ? 1.5 : fighterState.currentStance === 'balanced' ? 1.1 : 0.85;
  const awakeningBonus = fighterState.isAwakened ? (fighterState.awakeningProfile?.statBuffs?.staminaRegenMultiplier || 2.2) : 1.0;
  const newStamina = Math.min(fighterState.maxStamina || 100, currentStamina + Math.round(deltaAmount * stanceBonus * awakeningBonus));
  
  // Haki Energy (superMeter) Regeneration based on Stance
  // Offensive stance gains more passive Haki energy to unleash attacks
  // Defensive stance focuses more on stamina and defense, generating less Haki
  const hakiRegenRate = fighterState.currentStance === 'offensive' ? 4 : fighterState.currentStance === 'defensive' ? 1 : 2;
  const currentSuper = fighterState.superMeter || 0;
  const newSuper = Math.min(300, currentSuper + hakiRegenRate);

  return {
    ...fighterState,
    staminaMeter: newStamina,
    superMeter: newSuper,
    isExhausted: fighterState.isAwakened ? false : (newStamina < 25 ? (fighterState.isExhausted && newStamina <= 0) : false),
  };
}"""

content = re.sub(
    r'export function regenerateFighterStamina.*?return \{\n.*?\n.*?\n.*?\n  \};\n\}',
    new_regen,
    content,
    flags=re.DOTALL
)

with open('src/utils/combatEngine.ts', 'w') as f:
    f.write(content)

print("Patched combatEngine.ts")
