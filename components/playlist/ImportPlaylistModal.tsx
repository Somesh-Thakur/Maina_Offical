'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Music, Link as LinkIcon, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
}

export function ImportPlaylistModal({ onClose }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // For loading state
  const [progressStatus, setProgressStatus] = useState('');
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Playlist URL is required');
      return;
    }
    
    setLoading(true);
    setError('');
    setProgressStatus('Extracting metadata and searching tracks...');
    
    // Estimate 20-30 seconds for Spotify imports because it searches each track
    if (url.includes('spotify.com')) {
      setEstimatedSeconds(25);
    } else {
      setEstimatedSeconds(5);
    }

    const interval = setInterval(() => {
      setEstimatedSeconds(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch('/api/playlists/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await res.json();
      clearInterval(interval);
      
      if (!res.ok) throw new Error(data.error || 'Failed to import playlist');
      
      setProgressStatus('Done! Redirecting...');
      setTimeout(() => {
        onClose();
        router.push(`/playlist/${data.playlist.id}`);
      }, 1000);
      
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        onClick={!loading ? onClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#0f1117] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10" />
            <h2 className="text-lg font-bold text-white relative z-10 flex items-center gap-2">
              <Music size={18} className="text-green-400" />
              Import Playlist
            </h2>
            {!loading && (
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors relative z-10">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="p-6 flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {!loading ? (
              <>
                <p className="text-sm text-white/50 leading-relaxed">
                  Paste a public <b>Spotify</b> or <b>YouTube Music</b> playlist URL to instantly import all of its tracks into Maina.
                </p>

                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://open.spotify.com/playlist/..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 flex gap-3 items-start border border-white/5">
                  <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/40 leading-relaxed">
                    Importing large Spotify playlists may take up to 30 seconds because we search for the best audio match for every single track.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-6">
                <Loader2 size={40} className="animate-spin text-white/50" />
                <div className="text-center flex flex-col gap-2">
                  <p className="font-medium text-white">{progressStatus}</p>
                  {estimatedSeconds !== null && estimatedSeconds > 0 && (
                    <p className="text-xs text-white/40">
                      Estimated time: <span className="text-white/80">{estimatedSeconds}s</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {!loading && (
            <div className="p-6 pt-0 mt-2 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!url.trim()}
                className="px-6 py-2.5 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
              >
                Import
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
