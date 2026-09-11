import re

with open('src/components/ArcadeBattleArena.tsx', 'r') as f:
    content = f.read()

# Add handleStanceChange function inside ArcadeBattleArena component
handle_stance_fn = """  const handleStanceChange = useCallback((newStance: CombatStance) => {
    if (isPaused || isMatchOverRef.current) return;
    vibrationService.vibrate('light');
    setT1FighterStates(prev => {
      const idx = t1IdxRef.current;
      const next = [...prev];
      next[idx] = { ...next[idx], currentStance: newStance };
      return next;
    });
    // Visual feedback for stance change
    const emoji = newStance === 'offensive' ? '🔥' : newStance === 'defensive' ? '🛡️' : '⚖️';
    triggerParticleBurst(25, 45, newStance === 'offensive' ? 'red' : newStance === 'defensive' ? 'blue' : 'amber', 'haki');
    soundManager.playPowerUp();
  }, [isPaused]);"""

# Find a good place to insert it (e.g., right before handleManualPlayerAction)
content = content.replace("  const handleManualPlayerAction = useCallback((", handle_stance_fn + "\n\n  const handleManualPlayerAction = useCallback((")

# Add the UI for stance toggle in the command bar
stance_ui = """                <div className="w-full flex items-center justify-center gap-2 mb-2 px-2 py-1.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold hidden sm:inline">STANCE:</span>
                  
                  <button 
                    onClick={() => handleStanceChange('offensive')}
                    className={`px-3 py-1 rounded text-xs font-black font-mono transition-all border ${activeT1State.currentStance === 'offensive' ? 'bg-red-950/80 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                  >
                    🔥 OFFENSIVE
                  </button>
                  
                  <button 
                    onClick={() => handleStanceChange('balanced')}
                    className={`px-3 py-1 rounded text-xs font-black font-mono transition-all border ${activeT1State.currentStance === 'balanced' ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                  >
                    ⚖️ BALANCED
                  </button>
                  
                  <button 
                    onClick={() => handleStanceChange('defensive')}
                    className={`px-3 py-1 rounded text-xs font-black font-mono transition-all border ${activeT1State.currentStance === 'defensive' ? 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
                  >
                    🛡️ DEFENSIVE
                  </button>
                </div>"""

# Insert it before the exhaustion penalty
content = content.replace("<>                  {isExhausted && (", "<>\n" + stance_ui + "\n                  {isExhausted && (")
# Fallback if spacing is slightly off
content = content.replace("<>\n                  {isExhausted && (", "<>\n" + stance_ui + "\n                  {isExhausted && (")

with open('src/components/ArcadeBattleArena.tsx', 'w') as f:
    f.write(content)

print("Patched ArcadeBattleArena.tsx for UI")
