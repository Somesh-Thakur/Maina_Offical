'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { category: 'Playback', items: [
    { keys: ['Space', 'K'], description: 'Play / Pause' },
    { keys: ['N', '→'], description: 'Next track' },
    { keys: ['P', '←'], description: 'Previous track' },
    { keys: ['J'], description: 'Seek back 10 seconds' },
    { keys: ['L'], description: 'Seek forward 10 seconds' },
    { keys: ['R'], description: 'Cycle repeat mode' },
    { keys: ['S'], description: 'Toggle shuffle' },
  ]},
  { category: 'Volume', items: [
    { keys: ['↑'], description: 'Volume up 10%' },
    { keys: ['↓'], description: 'Volume down 10%' },
    { keys: ['M'], description: 'Mute / Unmute' },
  ]},
  { category: 'Interface', items: [
    { keys: ['F'], description: 'Toggle fullscreen player' },
    { keys: ['Q'], description: 'Toggle queue panel' },
    { keys: ['C'], description: 'Toggle lyrics' },
    { keys: ['H', '?'], description: 'Show / hide this help' },
    { keys: ['/'], description: 'Focus search bar' },
    { keys: ['Esc'], description: 'Close panels / fullscreen' },
  ]},
];

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsOverlay({ isOpen, onClose }: KeyboardShortcutsOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="shortcuts-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
                  <Keyboard size={16} className="text-[var(--accent)]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-display">Keyboard Shortcuts</h2>
                  <p className="text-xs text-white/40">Press H or ? anytime to toggle this</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Shortcuts grid */}
            <div className="p-7 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[65vh] overflow-y-auto no-scrollbar">
              {SHORTCUTS.map(section => (
                <div key={section.category}>
                  <h3 className="text-[11px] font-bold tracking-widest uppercase text-[var(--accent)] mb-4">
                    {section.category}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {section.items.map(item => (
                      <div key={item.description} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-white/60">{item.description}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((key, i) => (
                            <span key={key} className="flex items-center gap-1">
                              {i > 0 && <span className="text-white/20 text-xs">/</span>}
                              <kbd className="inline-flex items-center justify-center px-2 py-0.5 bg-white/8 border border-white/12 rounded-md text-[11px] font-mono font-semibold text-white/80 min-w-[28px] shadow-sm">
                                {key}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-white/8 flex items-center justify-between">
              <span className="text-xs text-white/30">Shortcuts disabled when typing in search fields</span>
              <kbd className="px-2 py-0.5 bg-white/8 border border-white/12 rounded text-[11px] font-mono text-white/50">Esc</kbd>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
