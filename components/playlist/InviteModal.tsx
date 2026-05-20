'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Link2, Loader2, Users } from 'lucide-react';

interface Props {
  playlistId: string;
  playlistName: string;
  onClose: () => void;
}

export function InviteModal({ playlistId, playlistName, onClose }: Props) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');

  const generate = async () => {
    setLoading(true); setError('');
    const res  = await fetch(`/api/playlists/${playlistId}/invite`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? 'Failed to generate link');
    else setInviteUrl(data.url);
    setLoading(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users size={18} className="text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Invite Collaborators</h2>
                <p className="text-xs text-white/40 truncate max-w-[200px]">{playlistName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Generate a shareable invite link. Anyone with the link can join this playlist as a collaborator and add or remove tracks.
          </p>

          {!inviteUrl ? (
            <>
              {error && <p className="text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>}
              <button
                onClick={generate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Link2 size={18} />}
                {loading ? 'Generating…' : 'Create Invite Link'}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 bg-black/30 border border-white/10 rounded-xl overflow-hidden">
                <p className="flex-1 px-4 py-3 text-sm text-white/60 truncate">{inviteUrl}</p>
                <button
                  onClick={copy}
                  className={`px-4 shrink-0 flex items-center gap-1.5 text-sm font-semibold transition-colors ${copied ? 'text-green-400' : 'text-white hover:text-white/70'}`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-white/30 text-center">Link expires in 7 days · Up to 100 uses</p>
              <button
                onClick={generate}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Generate new link
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
