'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useVibeStore } from '@/store/vibeStore';
import { useUserStore } from '@/store/userStore';
import { usePlayerStore } from '@/store/playerStore';
import { Radio } from 'lucide-react';

export function VibeInviteHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vibeCode = searchParams.get('vibe');
  
  const [showInvite, setShowInvite] = useState(false);
  const roomId = useVibeStore(state => state.roomId);

  useEffect(() => {
    if (vibeCode && vibeCode !== roomId) {
      setShowInvite(true);
    }
  }, [vibeCode, roomId]);

  const handleAccept = () => {
    setShowInvite(false);
    useVibeStore.getState().setRoom(vibeCode!, ''); // Guest mode
    usePlayerStore.getState().toggleVibePanel();
    
    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('vibe');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const handleDecline = () => {
    setShowInvite(false);
    // Clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('vibe');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  return (
    <AnimatePresence>
      {showInvite && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleDecline} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-[#141414] border border-[var(--accent-muted)] rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/20">
              <Radio size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">Vibe Invitation</h2>
            <p className="text-[#a3a3a3] text-sm">
              You have been invited to join a Vibe Together session. Do you want to accept this invitation?
            </p>
            
            <div className="flex w-full gap-3 mt-4">
              <button 
                onClick={handleDecline} 
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Decline
              </button>
              <button 
                onClick={handleAccept} 
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg hover:opacity-90 transition-opacity"
              >
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
