import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, X } from 'lucide-react';
import { SavedCombo } from '../types/fighter';

interface SaveComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  damage: number;
}

export const SaveComboModal: React.FC<SaveComboModalProps> = ({ isOpen, onClose, onSave, damage }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-lg">Save Combo</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-zinc-400 text-sm mb-4">Name your {damage} damage sequence:</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., God-Tier Loop"
          className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white mb-4 outline-none focus:border-amber-500"
        />
        <button
          onClick={() => {
            if (name.trim()) {
              onSave(name);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded transition"
        >
          <Save className="h-4 w-4" /> Save to Library
        </button>
      </motion.div>
    </div>
  );
};
