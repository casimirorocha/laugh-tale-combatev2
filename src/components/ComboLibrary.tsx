import React from 'react';
import { Trash2, Flame } from 'lucide-react';
import { SavedCombo } from '../types/fighter';

interface ComboLibraryProps {
  combos: SavedCombo[];
  onDelete: (id: string) => void;
}

export const ComboLibrary: React.FC<ComboLibraryProps> = ({ combos, onDelete }) => {
  return (
    <div className="col-span-12 bg-zinc-950/50 rounded-lg p-4 border border-zinc-800">
      <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
        <Flame className="h-3 w-3" /> Saved Combo Library
      </h4>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {combos.length === 0 && <p className="text-zinc-600 text-xs italic">No saved combos yet.</p>}
        {combos.map((combo) => (
          <div key={combo.id} className="min-w-[150px] bg-zinc-900 border border-zinc-700 rounded p-3 flex flex-col gap-1">
             <div className="flex justify-between items-start">
               <span className="text-white font-bold text-xs truncate">{combo.name}</span>
               <button onClick={() => onDelete(combo.id)} className="text-zinc-500 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
             </div>
             <span className="text-amber-500 text-[10px] font-mono">{combo.damageEstimate} DMG</span>
             <span className="text-zinc-500 text-[9px] font-mono truncate">{combo.inputSequence.join(' → ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
