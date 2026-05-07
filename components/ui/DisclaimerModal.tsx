'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function DisclaimerModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('maina_disclaimer_seen')) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('maina_disclaimer_seen', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col gap-6"
          >
            <h2 className="text-2xl font-display font-bold text-white">Welcome to Maina! 🎶</h2>
            
            <div className="text-[#a3a3a3] leading-relaxed flex flex-col gap-4">
              <p>Before you dive into the music, there's a quick thing you should know:</p>
              <div className="bg-white/5 p-4 rounded-xl border border-[var(--accent)] border-opacity-30">
                <p className="font-medium text-white mb-1">Local Storage Only</p>
                <p className="text-sm">
                  Currently, all your playlists, liked songs, and listening history are saved directly on this device (in your browser).
                </p>
              </div>
              <ul className="text-sm list-disc pl-5 flex flex-col gap-2">
                <li>If you clear your browser cookies/data, your Maina data will be deleted.</li>
                <li>Your data will not sync to other devices.</li>
              </ul>
            </div>

            <button 
              onClick={accept} 
              className="mt-2 w-full py-3 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity font-bold shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] text-lg"
            >
              I Understand, Let's Play!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
