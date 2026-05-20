'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCheck, UserX, Clock, Search, Users, Music2, Check, X } from 'lucide-react';

interface FriendEntry {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  isSender: boolean;
  user: { id: string; username: string; display_name: string; avatar_url?: string };
}

function Avatar({ user }: { user: FriendEntry['user'] }) {
  return (
    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 overflow-hidden shrink-0 flex items-center justify-center font-bold text-sm">
      {user.avatar_url
        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
        : (user.display_name?.[0] ?? user.username?.[0] ?? '?').toUpperCase()
      }
    </div>
  );
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [addVal, setAddVal]   = useState('');
  const [addMsg, setAddMsg]   = useState('');
  const [addErr, setAddErr]   = useState('');
  const [adding, setAdding]   = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/friends').then(r => r.json()).then(d => setFriends(d.friends ?? [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true); setAddErr(''); setAddMsg('');
    const res = await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: addVal }) });
    const d   = await res.json();
    if (!res.ok) setAddErr(d.error ?? 'Failed');
    else { setAddMsg(`Friend request sent to @${addVal}!`); setAddVal(''); load(); }
    setAdding(false);
  };

  const act = async (id: string, action: 'accept' | 'decline' | 'remove') => {
    await fetch('/api/friends', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    load();
  };

  const accepted = friends.filter(f => f.status === 'accepted');
  const pending  = friends.filter(f => f.status === 'pending' && !f.isSender);  // incoming
  const sent     = friends.filter(f => f.status === 'pending' && f.isSender);   // outgoing

  const filtered = accepted.filter(f =>
    f.user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-3xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-4xl font-display font-black tracking-tight text-white mb-1">Friends</h1>
        <p className="text-white/40 text-sm">Add friends to share songs and build playlists together.</p>
      </header>

      {/* Add friend */}
      <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><UserPlus size={18} /> Add a Friend</h2>
        <form onSubmit={sendRequest} className="flex gap-3">
          <input
            value={addVal}
            onChange={e => setAddVal(e.target.value)}
            placeholder="Enter username (e.g. somesh)"
            className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 text-sm"
          />
          <button type="submit" disabled={adding || !addVal.trim()} className="px-5 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 disabled:opacity-40 transition-all active:scale-95">
            {adding ? '…' : 'Add'}
          </button>
        </form>
        {addMsg && <p className="text-green-400 text-xs mt-2">{addMsg}</p>}
        {addErr && <p className="text-red-400 text-xs mt-2">{addErr}</p>}
      </section>

      {/* Pending incoming */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={16} className="text-yellow-400" /> Incoming Requests
              <span className="ml-1 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-bold">{pending.length}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {pending.map(f => (
                <div key={f.id} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                  <Avatar user={f.user} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{f.user.display_name || f.user.username}</p>
                    <p className="text-xs text-white/40">@{f.user.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => act(f.id, 'accept')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium transition-colors">
                      <Check size={14} /> Accept
                    </button>
                    <button onClick={() => act(f.id, 'decline')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-sm font-medium transition-colors">
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Sent requests */}
      {sent.length > 0 && (
        <section>
          <h2 className="font-semibold text-white/50 mb-3 text-sm flex items-center gap-2"><Clock size={14} /> Sent Requests</h2>
          <div className="flex flex-col gap-2">
            {sent.map(f => (
              <div key={f.id} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl">
                <Avatar user={f.user} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-white/70">{f.user.display_name || f.user.username}</p>
                  <p className="text-xs text-white/30">@{f.user.username} · Pending</p>
                </div>
                <button onClick={() => act(f.user.id, 'remove')} className="text-xs text-white/30 hover:text-red-400 transition-colors">Cancel</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2"><Users size={18} /> Friends
            <span className="text-white/40 font-normal text-sm">({accepted.length})</span>
          </h2>
          {accepted.length > 4 && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none w-36" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-white/30">
            <Music2 size={40} className="opacity-50" />
            <p className="text-sm">{accepted.length === 0 ? 'No friends yet — add someone above!' : 'No results'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(f => (
              <div key={f.id} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.05] transition-colors">
                <Avatar user={f.user} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{f.user.display_name || f.user.username}</p>
                  <p className="text-xs text-white/40">@{f.user.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400/70 flex items-center gap-1"><UserCheck size={12} /> Friends</span>
                  <button onClick={() => act(f.user.id, 'remove')} className="text-xs text-white/20 hover:text-red-400 transition-colors ml-2">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
