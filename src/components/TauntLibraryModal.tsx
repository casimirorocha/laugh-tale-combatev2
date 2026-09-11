import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BattleTauntAnimation,
  TauntCategory,
  CrowdReactionType,
} from '../types/battleTaunts';
import {
  getAllBattleTaunts,
  getFighterTaunts,
} from '../data/battleTaunts';
import { soundManager } from '../utils/soundEffects';
import { characterVoiceManager } from '../utils/audioAssetLibrary';
import {
  X,
  Volume2,
  Sparkles,
  Zap,
  Flame,
  ShieldAlert,
  Smile,
  Search,
  Check,
  Play,
  Swords,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface TauntLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFighterId?: string;
  activeFighterName?: string;
  selectedTauntId?: string;
  onSelectDefaultTaunt?: (taunt: BattleTauntAnimation) => void;
  onExecuteTaunt?: (taunt: BattleTauntAnimation) => void;
  isMidBattle?: boolean;
}

export const TauntLibraryModal: React.FC<TauntLibraryModalProps> = ({
  isOpen,
  onClose,
  activeFighterId,
  activeFighterName,
  selectedTauntId,
  onSelectDefaultTaunt,
  onExecuteTaunt,
  isMidBattle = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllFighters, setShowAllFighters] = useState<boolean>(false);
  const [playingTauntId, setPlayingTauntId] = useState<string | null>(null);

  // Filter taunt library
  const availableTaunts = useMemo(() => {
    let list = showAllFighters
      ? getAllBattleTaunts()
      : getFighterTaunts(activeFighterId);

    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.nameJP.toLowerCase().includes(q) ||
          t.quoteEN.toLowerCase().includes(q) ||
          t.quoteJP.toLowerCase().includes(q) ||
          t.badge.toLowerCase().includes(q) ||
          t.fighterId.toLowerCase().includes(q)
      );
    }

    return list;
  }, [showAllFighters, activeFighterId, selectedCategory, searchQuery]);

  // Handle audio preview (motion sfx + crowd reaction + vocal taunt)
  const handlePreviewAudio = (taunt: BattleTauntAnimation) => {
    setPlayingTauntId(taunt.id);

    // 1. Play specialized motion sound effect
    soundManager.playTauntMotionSfx(taunt.motion);

    // 2. Play procedural crowd reaction
    setTimeout(() => {
      soundManager.playCrowdReaction(taunt.crowdReaction, 85);
    }, 180);

    // 3. Play character vocal line
    try {
      characterVoiceManager.playTaunt(activeFighterName || taunt.name, taunt.quoteEN || taunt.quoteJP);
    } catch (e) {
      // Audio fallback
    }

    setTimeout(() => {
      setPlayingTauntId(null);
    }, 1800);
  };

  const getReactionBadge = (type: CrowdReactionType) => {
    switch (type) {
      case 'cheer_hype':
        return {
          label: 'CHEER & HYPE',
          icon: <Sparkles className="w-3 h-3" />,
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'gasp_shock':
        return {
          label: 'SHOCKED GASP',
          icon: <Zap className="w-3 h-3" />,
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'laughter_amused':
        return {
          label: 'AMUSED LAUGHTER',
          icon: <Smile className="w-3 h-3" />,
          color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        };
      case 'whistle_boos':
        return {
          label: 'BOOS & CATCALLS',
          icon: <ShieldAlert className="w-3 h-3" />,
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'chants_stadium':
        return {
          label: 'STADIUM CHANTS',
          icon: <Volume2 className="w-3 h-3" />,
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-950 border-2 border-amber-500/60 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
                🎭
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-wider uppercase font-serif">
                    Character Taunt & Crowd Reaction Library
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    EXPANDABLE
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {activeFighterName ? (
                    <>
                      Current Fighter:{' '}
                      <span className="text-amber-400 font-bold">
                        {activeFighterName}
                      </span>{' '}
                      • Trigger Mid-Battle for Crowd Ovations & Super Meter!
                    </>
                  ) : (
                    'Select and preview character-specific battle taunts and spectator crowd reactions'
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition"
              aria-label="Close taunt library"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Controls Bar: Search & Category Filter */}
          <div className="p-4 border-b border-stone-800/80 bg-stone-900/50 flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search taunts, quotes, or fighters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'all', label: 'All Taunts' },
                { id: 'signature', label: 'Signature' },
                { id: 'provocation', label: 'Provocation' },
                { id: 'disrespect', label: 'Disrespect' },
                { id: 'legendary', label: 'Legendary' },
                { id: 'humorous', label: 'Humorous' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 shadow-md'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {/* Toggle view all characters */}
              <button
                onClick={() => setShowAllFighters(!showAllFighters)}
                className={`text-xs px-3 py-1 rounded-md font-semibold border transition whitespace-nowrap ml-2 ${
                  showAllFighters
                    ? 'border-cyan-500 text-cyan-300 bg-cyan-950/40'
                    : 'border-stone-700 text-stone-400 hover:border-stone-500'
                }`}
              >
                {showAllFighters ? 'All Roster Taunts' : 'This Fighter Only'}
              </button>
            </div>
          </div>

          {/* Taunt Cards Grid */}
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTaunts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-500">
                <p className="text-sm">No taunt animations found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setShowAllFighters(true);
                  }}
                  className="mt-3 text-xs text-amber-400 underline hover:text-amber-300"
                >
                  Reset filters to browse entire library
                </button>
              </div>
            ) : (
              availableTaunts.map((taunt) => {
                const reactionBadge = getReactionBadge(taunt.crowdReaction);
                const isSelected = selectedTauntId === taunt.id;
                const isPlaying = playingTauntId === taunt.id;

                return (
                  <motion.div
                    key={taunt.id}
                    layout
                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-stone-900/90 shadow-lg shadow-amber-500/10'
                        : 'border-stone-800 hover:border-stone-700 bg-stone-900/40'
                    }`}
                  >
                    {/* Upper row: Prop, Titles & Badges */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl border flex-shrink-0"
                            style={{
                              backgroundColor: `${taunt.primaryColor}22`,
                              borderColor: `${taunt.primaryColor}55`,
                            }}
                          >
                            {taunt.visualProp}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="text-[10px] font-black uppercase px-2 py-0.5 rounded border"
                                style={{
                                  backgroundColor: `${taunt.primaryColor}20`,
                                  borderColor: taunt.primaryColor,
                                  color: taunt.primaryColor,
                                }}
                              >
                                {taunt.badge}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                                {taunt.category}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-white tracking-wide mt-0.5">
                              {taunt.name}
                            </h3>
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                            <Check className="w-3 h-3" /> ACTIVE [T]
                          </span>
                        )}
                      </div>

                      {/* Japanese Title & Spoken Quote */}
                      <div className="my-2 p-2.5 rounded-lg bg-stone-950/80 border border-stone-800/80">
                        <div className="text-xs font-black text-amber-200/90 font-serif mb-0.5">
                          {taunt.nameJP}
                        </div>
                        <p className="text-xs text-stone-300 italic">
                          "{taunt.quoteEN}"
                        </p>
                        {taunt.quoteJP && (
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            「{taunt.quoteJP}」
                          </p>
                        )}
                      </div>

                      {/* Crowd Reaction & Sound Effect Info */}
                      <div className="mt-2.5 p-2 rounded-lg bg-stone-900/70 border border-stone-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span
                            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ${reactionBadge.color}`}
                          >
                            {reactionBadge.icon} {reactionBadge.label}
                          </span>
                          <span className="text-[10px] text-stone-400 truncate">
                            "{taunt.crowdShoutText}"
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 flex-shrink-0">
                          +{taunt.crowdExcitementBoost}% Hype
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                      {/* Stat Gains Preview */}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="text-amber-400">+{taunt.meterGain} Meter</span>
                        <span className="text-stone-600">•</span>
                        <span className="text-rose-400">-{taunt.focusDrain} Focus</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Audio Preview Button */}
                        <button
                          onClick={() => handlePreviewAudio(taunt)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition ${
                            isPlaying
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                              : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white'
                          }`}
                          title="Preview motion SFX, character voice line, and crowd reaction"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          {isPlaying ? 'Playing...' : 'Audio'}
                        </button>

                        {/* Mid-Battle Direct Execution */}
                        {isMidBattle && onExecuteTaunt && (
                          <button
                            onClick={() => {
                              onExecuteTaunt(taunt);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-md"
                          >
                            <Swords className="w-3.5 h-3.5" />
                            Taunt Now!
                          </button>
                        )}

                        {/* Set as Default Key Action */}
                        {onSelectDefaultTaunt && !isSelected && (
                          <button
                            onClick={() => onSelectDefaultTaunt(taunt)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-semibold transition"
                          >
                            Equip [T]
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer Guide Bar */}
          <div className="px-6 py-3 border-t border-stone-800 bg-stone-900/90 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-4">
              <span>
                💡 <span className="text-stone-300 font-semibold">Pro Tip:</span> Taunts
                grant high Super Meter & trigger crowd applause, but leave you vulnerable
                for 1 turn!
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
