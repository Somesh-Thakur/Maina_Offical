'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVibeStore } from '@/store/vibeStore';
import { useVibeRoom } from '@/hooks/useVibeRoom';
import { useUserStore } from '@/store/userStore';
import { usePlayerStore } from '@/store/playerStore';
import { X, Users, Crown, LogOut, Copy, Check, Radio } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import toast from 'react-hot-toast';

export function VibePanel() {
  const { roomId, hostId, participants, status, reset } = useVibeStore();
  const { user } = useUserStore();
  const { broadcastTransferHost, broadcastCloseRoom } = useVibeRoom();
  const showVibePanel = usePlayerStore(state => state.showVibePanel);
  const toggleVibePanel = usePlayerStore(state => state.toggleVibePanel);
  const [copied, setCopied] = useState(false);

  const isHost = user?.id === hostId;

  const copyInvite = () => {
    const inviteText = `Vibe Togeather Inv by - ${user?.displayName || user?.username || 'Maina User'}
code : ${roomId}
Link : ${window.location.origin}/library?vibe=${roomId}
powered by maina`;

    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success('Invite copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (isHost && participants.length > 1) {
      toast.error('You must transfer host to someone else before leaving, or end the session for everyone.');
      return;
    }
    reset();
    toggleVibePanel();
  };

  const handleEndSession = () => {
    if (isHost) {
      broadcastCloseRoom();
      toggleVibePanel();
    }
  };

  return (
    <AnimatePresence>
      {showVibePanel && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-full md:w-[400px] h-[calc(100vh-80px)] bg-[#141414] border-l border-[rgba(255,255,255,0.06)] z-[70] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Radio size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  Vibe Together
                </h2>
                <p className="text-xs text-[#a3a3a3] flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {status === 'connected' ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="relative z-10">
              <IconButton icon={X} onClick={toggleVibePanel} />
            </div>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col gap-6">
            
            {/* Invite Section */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <label className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider mb-2 block">Room Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={roomId || ''}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-widest focus:outline-none"
                />
                <button
                  onClick={copyInvite}
                  title="Copy Invite"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-white flex items-center justify-center shrink-0"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
              <p className="text-xs text-[#a3a3a3] text-center mt-3">Share this code or link with friends to join.</p>
            </div>

            {/* Participants */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between px-2">
                <label className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} /> Participants ({participants.length}/10)
                </label>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pb-4">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-white/60">{p.name[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate flex items-center gap-2">
                        {p.name}
                        {p.id === user?.id && <span className="text-[10px] bg-[var(--accent)] px-2 py-0.5 rounded-full text-white font-bold tracking-wide">YOU</span>}
                      </p>
                    </div>
                    
                    {p.isHost && (
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
                        <Crown size={14} /> Host
                      </div>
                    )}

                    {isHost && !p.isHost && (
                      <button
                        onClick={() => broadcastTransferHost(p.id)}
                        className="text-xs font-medium px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                      >
                        Make Host
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 shrink-0 border-t border-[rgba(255,255,255,0.06)] bg-black/20 flex flex-col gap-3">
            {isHost ? (
              <button
                onClick={handleEndSession}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                End Session for All
              </button>
            ) : (
              <button
                onClick={handleLeave}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <LogOut size={18} /> Leave Session
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
