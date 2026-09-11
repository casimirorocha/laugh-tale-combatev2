import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, ChevronRight, X, Sparkles, Shield, Eye, Smile, Flame, Zap } from 'lucide-react';
import { GamepadMapping, KeyboardMapping } from '../types/fighter';

interface GamepadVisualizerProps {
  active: boolean;
  mapping?: GamepadMapping;
  keyboardMapping?: KeyboardMapping;
}

interface ArcadeButtonConfig {
  id: string;
  label: string;
  sublabel: string;
  code: string;
  key: string;
  color: 'red' | 'blue' | 'amber' | 'emerald' | 'purple' | 'cyan' | 'pink' | 'white';
  icon?: React.ReactNode;
}

export const GamepadVisualizer: React.FC<GamepadVisualizerProps> = ({
  active,
  keyboardMapping,
}) => {
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [pressedButtons, setPressedButtons] = useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = useState(false);
  const activeTouchesRef = useRef<Map<number, string>>(new Map());

  // Default Fallback Key Bindings
  const km: KeyboardMapping = keyboardMapping || {
    move1Key: 'KeyJ',
    move2Key: 'KeyK',
    exMoveKey: 'KeyU',
    superMoveKey: 'KeyI',
    guardKey: 'KeyL',
    dodgeKey: 'Space',
    tauntKey: 'KeyT',
    finisherKey: 'KeyO',
    maxModeKey: 'KeyM',
    pauseKey: 'KeyP',
  };

  const codeToKey = (code: string) => {
    if (code === 'Space') return ' ';
    if (code.startsWith('Key')) return code.slice(3).toLowerCase();
    if (code.startsWith('Digit')) return code.slice(5);
    return code.toLowerCase();
  };

  const getCleanLabel = (code: string) => {
    if (code === 'Space') return 'SPC';
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.replace('Arrow', '↑');
    return code;
  };

  const arcadeButtons: ArcadeButtonConfig[] = [
    {
      id: 'move1',
      label: 'LP',
      sublabel: `[${getCleanLabel(km.move1Key)}]`,
      code: km.move1Key,
      key: codeToKey(km.move1Key),
      color: 'blue',
    },
    {
      id: 'move2',
      label: 'HP',
      sublabel: `[${getCleanLabel(km.move2Key)}]`,
      code: km.move2Key,
      key: codeToKey(km.move2Key),
      color: 'amber',
    },
    {
      id: 'exMove',
      label: 'EX',
      sublabel: `[${getCleanLabel(km.exMoveKey)}]`,
      code: km.exMoveKey,
      key: codeToKey(km.exMoveKey),
      color: 'purple',
      icon: <Sparkles className="h-2.5 w-2.5 inline" />,
    },
    {
      id: 'superMove',
      label: 'SUPER',
      sublabel: `[${getCleanLabel(km.superMoveKey)}]`,
      code: km.superMoveKey,
      key: codeToKey(km.superMoveKey),
      color: 'red',
      icon: <Flame className="h-2.5 w-2.5 inline" />,
    },
    {
      id: 'guard',
      label: 'GUARD',
      sublabel: `[${getCleanLabel(km.guardKey)}]`,
      code: km.guardKey,
      key: codeToKey(km.guardKey),
      color: 'cyan',
      icon: <Shield className="h-2.5 w-2.5 inline" />,
    },
    {
      id: 'dodge',
      label: 'DODGE',
      sublabel: `[${getCleanLabel(km.dodgeKey)}]`,
      code: km.dodgeKey,
      key: codeToKey(km.dodgeKey),
      color: 'pink',
      icon: <Eye className="h-2.5 w-2.5 inline" />,
    },
    {
      id: 'taunt',
      label: 'TAUNT',
      sublabel: `[${getCleanLabel(km.tauntKey)}]`,
      code: km.tauntKey,
      key: codeToKey(km.tauntKey),
      color: 'emerald',
      icon: <Smile className="h-2.5 w-2.5 inline" />,
    },
    {
      id: 'finisher',
      label: 'ULT',
      sublabel: `[${getCleanLabel(km.finisherKey)}]`,
      code: km.finisherKey,
      key: codeToKey(km.finisherKey),
      color: 'white',
      icon: <Zap className="h-2.5 w-2.5 inline" />,
    },
  ];

  const directionalButtons = [
    { id: 'up', label: '▲', code: 'ArrowUp', key: 'ArrowUp' },
    { id: 'left', label: '◀', code: 'ArrowLeft', key: 'ArrowLeft' },
    { id: 'down', label: '▼', code: 'ArrowDown', key: 'ArrowDown' },
    { id: 'right', label: '▶', code: 'ArrowRight', key: 'ArrowRight' },
  ];

  // Track physical keyboard presses
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      setPressedButtons((prev) => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });

      // Match label for history stream
      let label = '';
      if (code === 'ArrowUp') label = '↑';
      else if (code === 'ArrowDown') label = '↓';
      else if (code === 'ArrowLeft') label = '←';
      else if (code === 'ArrowRight') label = '→';
      else {
        const btn = arcadeButtons.find((b) => b.code === code);
        if (btn) label = btn.label;
        else if (code === km.maxModeKey) label = 'MAX';
        else if (e.key && e.key.length === 1) label = e.key.toUpperCase();
      }

      if (label) {
        setInputHistory((prev) => [label, ...prev.slice(0, 7)]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedButtons((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active, km]);

  // Emulate touch & pointer multi-touch inputs
  const triggerButtonPress = (code: string, key: string, label: string) => {
    setPressedButtons((prev) => new Set(prev).add(code));
    setInputHistory((prev) => [label, ...prev.slice(0, 7)]);

    // Dispatch synthetic keyboard events for the game to consume
    try {
      const kdEvent = new KeyboardEvent('keydown', {
        key,
        code,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(kdEvent);
    } catch {
      // ignore
    }
  };

  const triggerButtonRelease = (code: string, key: string) => {
    setPressedButtons((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });

    try {
      const kuEvent = new KeyboardEvent('keyup', {
        key,
        code,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(kuEvent);
    } catch {
      // ignore
    }
  };

  if (!active) return null;

  const colorStyles: Record<string, { rim: string; gradient: string; text: string; glow: string }> = {
    blue: {
      rim: 'border-blue-600/70',
      gradient: 'from-blue-400 via-blue-600 to-blue-800',
      text: 'text-white',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    },
    amber: {
      rim: 'border-amber-600/70',
      gradient: 'from-amber-300 via-amber-500 to-amber-700',
      text: 'text-zinc-950',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    },
    purple: {
      rim: 'border-purple-600/70',
      gradient: 'from-purple-400 via-purple-600 to-purple-800',
      text: 'text-white',
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    },
    red: {
      rim: 'border-red-600/70',
      gradient: 'from-red-400 via-red-600 to-red-800',
      text: 'text-white',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]',
    },
    cyan: {
      rim: 'border-cyan-600/70',
      gradient: 'from-cyan-300 via-cyan-500 to-cyan-700',
      text: 'text-zinc-950',
      glow: 'shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    },
    pink: {
      rim: 'border-pink-600/70',
      gradient: 'from-pink-400 via-pink-600 to-pink-800',
      text: 'text-white',
      glow: 'shadow-[0_0_12px_rgba(236,72,153,0.5)]',
    },
    emerald: {
      rim: 'border-emerald-600/70',
      gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
      text: 'text-zinc-950',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    },
    white: {
      rim: 'border-amber-400/80',
      gradient: 'from-yellow-200 via-amber-400 to-red-500',
      text: 'text-zinc-950 font-black',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.7)]',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-40 select-none touch-none"
    >
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-3 rounded-2xl border-2 border-zinc-700 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md max-w-sm">
        {/* Header Marquee */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
          <div className="flex items-center gap-1.5">
            <Gamepad2 className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="font-['Press_Start_2P'] text-[9px] text-amber-400 tracking-wider">
              ARCADE STICK
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[9px] font-mono text-zinc-400 transition"
            >
              {isMinimized ? 'EXPAND' : 'COLLAPSE'}
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className="space-y-3">
            {/* Input Log Streak Strip */}
            <div className="bg-black/70 border border-zinc-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                STREAM:
              </span>
              <div className="flex items-center gap-1.5 overflow-hidden font-mono text-xs">
                <AnimatePresence mode="popLayout">
                  {inputHistory.map((item, idx) => (
                    <motion.span
                      key={`${item}-${idx}`}
                      initial={{ scale: 0.6, opacity: 0, y: -4 }}
                      animate={{ scale: 1, opacity: idx === 0 ? 1 : 0.6 - idx * 0.08, y: 0 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        idx === 0
                          ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/50'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item}
                    </motion.span>
                  ))}
                  {inputHistory.length === 0 && (
                    <span className="text-zinc-600 text-[10px] italic">READY...</span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Arcade Controls Surface */}
            <div className="flex items-center gap-4">
              {/* Directional Stick (D-Pad Microswitches) */}
              <div className="relative w-20 h-20 bg-zinc-950 rounded-full border border-zinc-800 p-1 flex items-center justify-center shadow-inner">
                {/* Center Joystick Cap */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-b from-red-500 to-red-900 border border-red-400/50 shadow-[0_2px_6px_rgba(0,0,0,0.8)] flex items-center justify-center pointer-events-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                </div>

                {/* 4 Directions */}
                {directionalButtons.map((dir) => {
                  const isPressed = pressedButtons.has(dir.code);
                  let posClass = '';
                  if (dir.id === 'up') posClass = 'top-1 left-1/2 -translate-x-1/2';
                  if (dir.id === 'down') posClass = 'bottom-1 left-1/2 -translate-x-1/2';
                  if (dir.id === 'left') posClass = 'left-1 top-1/2 -translate-y-1/2';
                  if (dir.id === 'right') posClass = 'right-1 top-1/2 -translate-y-1/2';

                  return (
                    <button
                      key={dir.id}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        triggerButtonPress(dir.code, dir.key, dir.label);
                      }}
                      onPointerUp={(e) => {
                        e.preventDefault();
                        triggerButtonRelease(dir.code, dir.key);
                      }}
                      onPointerLeave={() => triggerButtonRelease(dir.code, dir.key)}
                      className={`absolute ${posClass} w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] transition-all active:scale-90 ${
                        isPressed
                          ? 'bg-amber-400 text-black shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-95'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {dir.label}
                    </button>
                  );
                })}
              </div>

              {/* Sanwa 3D Push-Buttons Grid (2 Rows x 4 Columns) */}
              <div className="grid grid-cols-4 gap-2">
                {arcadeButtons.map((btn) => {
                  const isPressed = pressedButtons.has(btn.code);
                  const style = colorStyles[btn.color];

                  return (
                    <div key={btn.id} className="flex flex-col items-center">
                      <button
                        onPointerDown={(e) => {
                          e.preventDefault();
                          triggerButtonPress(btn.code, btn.key, btn.label);
                        }}
                        onPointerUp={(e) => {
                          e.preventDefault();
                          triggerButtonRelease(btn.code, btn.key);
                        }}
                        onPointerLeave={() => triggerButtonRelease(btn.code, btn.key)}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          triggerButtonPress(btn.code, btn.key, btn.label);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          triggerButtonRelease(btn.code, btn.key);
                        }}
                        className={`arcade-sanwa-btn-outer w-10 h-10 ${style.glow}`}
                      >
                        <div
                          className={`arcade-sanwa-btn-inner ${isPressed ? 'pressed' : ''} bg-gradient-to-b ${style.gradient} ${style.text}`}
                        >
                          <div className="arcade-sanwa-btn-shine" />
                          <span className="text-[10px] font-black tracking-tighter leading-none">
                            {btn.label}
                          </span>
                        </div>
                      </button>
                      <span className="text-[8px] font-mono text-zinc-400 mt-1 font-bold">
                        {btn.sublabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
