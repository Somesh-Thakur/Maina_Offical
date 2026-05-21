'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVibeStore } from '@/store/vibeStore';
import { useVibeRoom } from '@/hooks/useVibeRoom';
import { useUserStore } from '@/store/userStore';
import { X, Users, Crown, LogOut, Copy, Check, Radio } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
}

export function VibeLobby({ onClose }: Props) {
  const { roomId, hostId, participants, status, reset } = useVibeStore();
  const { user } = useUserStore();
  const { broadcastTransferHost, broadcastCloseRoom } = useVibeRoom();
  const [copied, setCopied] = useState(false);

  const isHost = user?.id === hostId;

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/library?vibe=${roomId}`);
    setCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (isHost && participants.length > 1) {
      toast.error('You must transfer host to someone else before leaving, or end the session for everyone.');
      return;
    }
    reset();
    onClose();
  };

  const handleEndSession = () => {
    if (isHost) {
      broadcastCloseRoom();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Radio size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Vibe Together
                </h2>
                <p className="text-xs text-white/50 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {status === 'connected' ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors relative z-10">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-white/50 font-bold uppercase tracking-wider">Invite Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/library?vibe=${roomId}`}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
                <button
                  onClick={copyInvite}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-white flex items-center justify-center shrink-0"
                >
                  {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-white/50 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} /> Participants ({participants.length}/10)
                </label>
              </div>

              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {participants.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
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
                        {p.id === user?.id && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">You</span>}
                      </p>
                    </div>
                    
                    {p.isHost && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-md">
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

          <div className="p-6 pt-0 flex justify-between gap-3 border-t border-white/5 mt-auto bg-black/20">
            {isHost ? (
              <button
                onClick={handleEndSession}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                End Session for All
              </button>
            ) : (
              <button
                onClick={handleLeave}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <LogOut size={16} /> Leave Session
              </button>
            )}
            
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-all"
            >
              Back to Music
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
