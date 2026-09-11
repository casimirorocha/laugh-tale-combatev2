import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Shirt } from 'lucide-react';
import { Fighter, FighterSkin } from '../types/fighter';
import { FighterAvatar } from './FighterAvatar';

interface SkinSelectorModalProps {
  fighter: Fighter | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectSkin: (skinId: string) => void;
}

export const SkinSelectorModal: React.FC<SkinSelectorModalProps> = ({
  fighter,
  isOpen,
  onClose,
  onSelectSkin,
}) => {
  if (!isOpen || !fighter) return null;

  const defaultSkin: FighterSkin = {
    id: 'default',
    name: 'Standard Outfit',
    description: 'Default canonical battle attire and portrait.',
    avatarUrl: fighter.avatarUrl || '',
    badgeText: 'STANDARD',
  };

  const skins = fighter.skins && fighter.skins.length > 0 ? fighter.skins : [defaultSkin];
  const activeSkinId = fighter.activeSkinId || skins[0].id;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl rounded-2xl border border-amber-500/50 bg-zinc-950 p-6 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Shirt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide">
                  COSTUME & SKIN SELECTOR
                </h2>
                <p className="font-['Bebas_Neue'] text-xs text-amber-400 tracking-wider">
                  {fighter.name} — {fighter.epithet}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:border-amber-500/50 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Skins Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {skins.map((skin) => {
              const isActive = skin.id === activeSkinId;
              return (
                <div
                  key={skin.id}
                  onClick={() => {
                    onSelectSkin(skin.id);
                  }}
                  className={`group relative flex flex-col rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                    isActive
                      ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <FighterAvatar
                        avatarUrl={skin.avatarUrl || fighter.avatarUrl}
                        avatarIcon={fighter.avatarIcon}
                        name={fighter.name}
                        size="lg"
                        borderColor={isActive ? '#f59e0b' : '#3f3f46'}
                        glowEffect={isActive}
                      />
                      {skin.badgeText && (
                        <span className="absolute -bottom-2 -right-1 rounded bg-amber-500 px-1.5 py-0.5 font-mono text-[9px] font-black text-black shadow">
                          {skin.badgeText}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-['Cinzel'] text-sm font-bold text-white truncate">
                          {skin.name}
                        </h3>
                        {isActive && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-500/40">
                            <Check className="h-3 w-3" /> EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {skin.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase">
                      SKIN ID: {skin.id}
                    </span>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-800 text-zinc-300 group-hover:bg-amber-500/20 group-hover:text-amber-300'
                      }`}
                    >
                      {isActive ? 'Active Costume' : 'Equip Skin'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>✨ Alternate skins apply unique canonical artwork and victory poses.</span>
            <button
              onClick={onClose}
              className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-black hover:bg-amber-400 transition shadow-lg"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
