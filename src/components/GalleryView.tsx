import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, BookOpen, Lock, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { GALLERY_ITEMS, GalleryItem } from '../data/galleryItems';
import { getUserProfile } from '../utils/storage';

interface GalleryViewProps {
  onClose: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onClose }) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'concept_art' | 'lore'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const profile = getUserProfile();
  const unlockedItems = profile.unlockedGalleryItems || [];

  const filteredItems = GALLERY_ITEMS.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const unlockedCount = GALLERY_ITEMS.filter(item => unlockedItems.includes(item.id)).length;
  const progressPercent = Math.round((unlockedCount / GALLERY_ITEMS.length) * 100);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-6xl h-full max-h-[85vh] bg-zinc-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/50">
          <div>
            <h2 className="font-['Cinzel'] text-2xl font-bold text-amber-500 tracking-wider">VICTORY GALLERY</h2>
            <p className="text-zinc-400 text-sm">Unlock concept art and lore by achieving specific feats in battle.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Top Bar / Filters */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-900 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'all' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-amber-100 hover:bg-zinc-700'
              }`}
            >
              All Unlocks
            </button>
            <button
              onClick={() => setFilter('concept_art')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'concept_art' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-amber-100 hover:bg-zinc-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Concept Art
            </button>
            <button
              onClick={() => setFilter('lore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === 'lore' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-amber-100 hover:bg-zinc-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Lore Entries
            </button>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400 whitespace-nowrap">
              <span className="font-mono">{unlockedCount} / {GALLERY_ITEMS.length}</span>
              <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
          
          {/* Grid List */}
          <div className="flex-grow p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max h-full">
            <AnimatePresence>
              {filteredItems.map(item => {
                const isUnlocked = unlockedItems.includes(item.id);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => isUnlocked && setSelectedItem(item)}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                      isUnlocked 
                        ? 'border-amber-500/20 bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer hover:border-amber-500/50' 
                        : 'border-zinc-800 bg-zinc-950/50 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {/* Thumbnail placeholder for Concept Art */}
                    <div className="aspect-[4/3] bg-zinc-900 relative">
                      {isUnlocked && item.type === 'concept_art' && item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-800">
                          {item.type === 'concept_art' ? <ImageIcon className="w-16 h-16" /> : <BookOpen className="w-16 h-16" />}
                        </div>
                      )}
                      
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                          <Lock className="w-8 h-8 text-zinc-600 mb-2" />
                          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Locked</span>
                          <span className="text-xs text-zinc-500 mt-2 line-clamp-2 px-4">{item.unlockRequirement}</span>
                        </div>
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-zinc-300">
                        {item.type === 'concept_art' ? <ImageIcon className="w-3 h-3 text-amber-400" /> : <BookOpen className="w-3 h-3 text-cyan-400" />}
                        {item.type.replace('_', ' ')}
                      </div>
                    </div>
                    
                    <div className="p-3 border-t border-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-zinc-100 truncate flex-grow text-sm">{item.title}</h3>
                        {isUnlocked && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                      </div>
                      {isUnlocked && <p className="text-xs text-zinc-500 truncate mt-1">{item.description}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No gallery items match your criteria.
              </div>
            )}
          </div>

          {/* Details Sidebar / Overlay */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0 md:relative md:inset-auto md:w-96 lg:w-[400px] shrink-0 bg-zinc-950 border-l border-white/10 flex flex-col z-20"
              >
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-wider">
                    {selectedItem.type === 'concept_art' ? <ImageIcon className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    <span>{selectedItem.type.replace('_', ' ')} Viewer</span>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                  <h3 className="text-2xl font-['Cinzel'] font-bold text-white mb-2">{selectedItem.title}</h3>
                  <p className="text-sm text-amber-400/80 mb-6 italic">{selectedItem.description}</p>
                  
                  {selectedItem.type === 'concept_art' && selectedItem.imageUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-white/10">
                      <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-auto" />
                    </div>
                  )}

                  {selectedItem.type === 'lore' && selectedItem.content && (
                    <div className="prose prose-invert prose-amber max-w-none prose-p:leading-relaxed prose-p:text-zinc-300">
                      <p>{selectedItem.content}</p>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Unlock Condition</h4>
                    <p className="text-sm text-green-400 flex items-start gap-2 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{selectedItem.unlockRequirement}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.div>
    </div>
  );
};
