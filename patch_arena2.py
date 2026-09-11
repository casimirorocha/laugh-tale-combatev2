import re

with open('src/components/ArcadeBattleArena.tsx', 'r') as f:
    content = f.read()

# Replace block at 1452
old_block_1452 = """      } else if (result.log.isCounter) {
        setTargetHitFlinch(targetSide);
        audioManager.playCustomHakiSfx(attacker.fighter.id, 'armament', 0.85, () => soundManager.playCounterAttack());
        triggerCameraShake('light');
        triggerParticleBurst(impactX, impactY, 'amber', 'haki');
        vibrationService.vibrate('medium');
        if (result.log.isCrit) {
          speakAnnouncer("Critical Counter!");
        } else {
          speakAnnouncer("Counter!");
        }"""

new_block_1452 = """      } else if (result.log.isCounter) {
        setTargetHitFlinch(targetSide);
        const isHeavyHakiCounter = move.hakiInfused && (move.baseDamage >= 25 || move.type === 'special' || move.type === 'super' || move.type === 'ex');
        
        if (isHeavyHakiCounter) {
          audioManager.playCustomHakiSfx(attacker.fighter.id, 'armament', 1.0, () => soundManager.playHeavyCounterClash(1.0));
          triggerCameraShake('heavy');
          vibrationService.vibrate('heavy');
        } else {
          audioManager.playCustomHakiSfx(attacker.fighter.id, 'armament', 0.85, () => soundManager.playCounterAttack());
          triggerCameraShake('light');
          vibrationService.vibrate('medium');
        }
        
        triggerParticleBurst(impactX, impactY, 'amber', 'haki');
        if (result.log.isCrit) {
          speakAnnouncer("Critical Counter!");
        } else {
          speakAnnouncer("Counter!");
        }"""

content = content.replace(old_block_1452, new_block_1452)

# Replace block at 1785
old_block_1785 = """      } else if (result.log.isCounter) {
        soundManager.playCounterAttack();
        actionCat = 'counter';"""

new_block_1785 = """      } else if (result.log.isCounter) {
        const isHeavyHakiCounter = move.hakiInfused && (move.baseDamage >= 25 || move.type === 'special' || move.type === 'super' || move.type === 'ex');
        if (isHeavyHakiCounter) {
          soundManager.playHeavyCounterClash(1.0);
        } else {
          soundManager.playCounterAttack();
        }
        actionCat = 'counter';"""

content = content.replace(old_block_1785, new_block_1785)

with open('src/components/ArcadeBattleArena.tsx', 'w') as f:
    f.write(content)
print("Patched ArcadeBattleArena.tsx")
