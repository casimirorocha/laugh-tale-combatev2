import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ArrowDown, 
  Swords, 
  Target, 
  ChevronDown, 
  Check, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

export type DummyBehavior = 'idle' | 'block_all' | 'crouch_only' | 'random_counter';

export interface DummyBehaviorOption {
  id: DummyBehavior;
  label: string;
  shortLabel: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  themeColor: string; // Tailwind color class
  bgGradient: string;
  borderColor: string;
  textColor: string;
  indicatorDot: string;
}

export const DUMMY_BEHAVIORS: DummyBehaviorOption[] = [
  {
    id: 'idle',
    label: 'Idle (Neutral)',
    shortLabel: 'Idle',
    badge: 'STAND NEUTRAL',
    tagline: 'Standard target • Takes 100% full combo damage',
    description: 'Target stands in an upright neutral posture without defending. Ideal for testing pure combo damage, hit-stuns, and cancel timing.',
    icon: Target,
    themeColor: 'emerald',
    bgGradient: 'from-emerald-500/20 via-zinc-900 to-zinc-900',
    borderColor: 'border-emerald-500/50',
    textColor: 'text-emerald-400',
    indicatorDot: 'bg-emerald-400'
  },
  {
    id: 'block_all',
    label: 'Block All (Armament Guard)',
    shortLabel: 'Block All',
    badge: 'ARMAMENT GUARD',
    tagline: 'High/Mid Guard • 75% damage reduction & guard crush',
    description: 'Target actively holds continuous Busoshoku Armament Guard. Incoming hits are blocked with heavy damage mitigation. Tests guard gauge wear-down, chip damage, and Guard Crush punish strings.',
    icon: Shield,
    themeColor: 'cyan',
    bgGradient: 'from-cyan-500/20 via-zinc-900 to-zinc-900',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-400',
    indicatorDot: 'bg-cyan-400'
  },
  {
    id: 'crouch_only',
    label: 'Crouch Only (Low Profile)',
    shortLabel: 'Crouch Only',
    badge: 'LOW CROUCH',
    tagline: 'Ducking posture • Evades high jabs / Overheads deal +25% crush',
    description: 'Target remains in a grounded low-profile crouch. High standing jabs and thrusts miss/whiff over their head, while heavy overhead slams, jump attacks, and downward stomps deal devastating Crush Damage (+25%).',
    icon: ArrowDown,
    themeColor: 'amber',
    bgGradient: 'from-amber-500/20 via-zinc-900 to-zinc-900',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-400',
    indicatorDot: 'bg-amber-400'
  },
  {
    id: 'random_counter',
    label: 'Random Counter-Attack (Reversal)',
    shortLabel: 'Random Counter',
    badge: 'REVERSAL THREAT',
    tagline: 'Frame-trap punisher • Retaliates on string recovery gaps (~45%)',
    description: 'Target tests your combo frame-traps and hit-confirm safety by retaliating with rapid reversal counter-attacks on combo gaps or recovery delays.',
    icon: Swords,
    themeColor: 'rose',
    bgGradient: 'from-rose-500/20 via-zinc-900 to-zinc-900',
    borderColor: 'border-rose-500/50',
    textColor: 'text-rose-400',
    indicatorDot: 'bg-rose-400'
  }
];

interface DummyBehaviorDropdownProps {
  currentBehavior: DummyBehavior;
  onChange: (behavior: DummyBehavior) => void;
  guardGauge?: number;
}

export const DummyBehaviorDropdown: React.FC<DummyBehaviorDropdownProps> = ({
  currentBehavior,
  onChange,
  guardGauge = 100
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = DUMMY_BEHAVIORS.find(b => b.id === currentBehavior) || DUMMY_BEHAVIORS[0];
  const IconComponent = activeOption.icon;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${activeOption.indicatorDot} animate-pulse`} />
            DUMMY BEHAVIOR:
          </span>
          {currentBehavior === 'block_all' && (
            <span className="text-cyan-400 font-bold">GUARD: {guardGauge}%</span>
          )}
        </div>

        {/* Dropdown trigger button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-zinc-900/95 hover:bg-zinc-850 transition shadow-sm ${
            activeOption.borderColor
          }`}
          title="Switch Dummy Defensive / Reaction Behavior"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className={`p-1 rounded bg-zinc-800 ${activeOption.textColor}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-white tracking-wide">
                {activeOption.shortLabel}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border border-zinc-700 bg-zinc-800 ${activeOption.textColor}`}>
                {activeOption.badge}
              </span>
            </div>
          </div>

          <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-84 rounded-xl border border-zinc-700 bg-zinc-950/98 backdrop-blur-xl shadow-2xl p-2 z-50 overflow-hidden"
          >
            {/* Header info */}
            <div className="px-2.5 py-2 border-b border-zinc-800/80 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-400" /> Defensive Scenarios
              </span>
              <span className="text-[9px] font-mono text-zinc-500">SELECT AI PATTERN</span>
            </div>

            {/* Behavior Options List */}
            <div className="flex flex-col gap-1.5">
              {DUMMY_BEHAVIORS.map((behavior) => {
                const isSelected = behavior.id === currentBehavior;
                const ItemIcon = behavior.icon;

                return (
                  <button
                    key={behavior.id}
                    onClick={() => {
                      onChange(behavior.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all group ${
                      isSelected
                        ? `bg-gradient-to-r ${behavior.bgGradient} ${behavior.borderColor} text-white shadow-md`
                        : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800/70 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border border-zinc-800 bg-zinc-950 mt-0.5 shrink-0 ${
                      isSelected ? behavior.textColor : 'text-zinc-400 group-hover:text-white'
                    }`}>
                      <ItemIcon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold uppercase tracking-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                          {behavior.label}
                        </span>
                        {isSelected && (
                          <Check className={`h-4 w-4 shrink-0 ${behavior.textColor}`} />
                        )}
                      </div>
                      
                      <p className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                        {behavior.tagline}
                      </p>
                      
                      <p className="text-[9px] text-zinc-500 leading-snug mt-1 border-t border-zinc-800/60 pt-1">
                        {behavior.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Tip Footer */}
            <div className="mt-2 pt-2 border-t border-zinc-800/80 px-2 flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
              <Info className="h-3 w-3 text-amber-400 shrink-0" />
              <span>Tip: Use Block All to test Guard Crush & Crouch Only to test Overheads.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
