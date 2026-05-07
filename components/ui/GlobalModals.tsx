'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useModalStore } from '@/store/modalStore';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalModals() {
  const { promptConfig, confirmConfig, closePrompt, closeConfirm } = useModalStore();

  return (
    <>
      <PromptModal config={promptConfig} onClose={closePrompt} />
      <ConfirmModal config={confirmConfig} onClose={closeConfirm} />
    </>
  );
}

function PromptModal({ config, onClose }: { config: any; onClose: (val: string | null) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (config?.isOpen) {
      setValue(config.defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [config]);

  if (!config?.isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose(value);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => onClose(null)} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-xl font-display font-bold text-white">{config.title}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              ref={inputRef}
              type="text" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="Enter text..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => onClose(null)} className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors font-medium">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity font-medium shadow-lg">
                Confirm
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ConfirmModal({ config, onClose }: { config: any; onClose: (val: boolean) => void }) {
  if (!config?.isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => onClose(false)} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-6"
        >
          <h2 className="text-xl font-display font-bold text-white leading-tight">{config.title}</h2>
          <div className="flex justify-end gap-2">
            <button onClick={() => onClose(false)} className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-colors font-medium">
              Cancel
            </button>
            <button onClick={() => onClose(true)} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 transition-colors font-medium">
              Yes, Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
