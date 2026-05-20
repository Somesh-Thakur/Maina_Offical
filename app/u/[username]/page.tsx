'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { Loader2, UserPlus, ListMusic, UserCheck, Clock } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
}

interface PlaylistData {
  id: string;
  name: string;
  description: string;
  cover_url: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useUserStore();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setProfile(d.user);
          setPlaylists(d.playlists || []);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    // If logged in and viewing someone else's profile, check friend status
    if (currentUser && profile && currentUser.id !== profile.id) {
      fetch('/api/friends')
        .then(r => r.json())
        .then(d => {
          const friends = d.friends || [];
          const friendship = friends.find((f: any) => f.user.id === profile.id);
          if (friendship) {
            setFriendStatus(friendship.status);
          }
        });
    }
  }, [currentUser, profile]);

  const handleAddFriend = async () => {
    if (!profile) return;
    setAdding(true);
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: profile.username }),
    });
    if (res.ok) {
      setFriendStatus('pending');
    }
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-white/50" size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-[#a3a3a3]">
        <h1 className="text-3xl font-bold mb-2 text-white">User not found</h1>
        <p>This profile doesn't exist or is unavailable.</p>
      </div>
    );
  }

  const isSelf = currentUser?.id === profile.id;

  return (
    <div className="flex flex-col pb-20">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-10 pt-24 md:pt-20 bg-gradient-to-b from-[#1c1c1c] to-[#0a0a0a]">
        <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 shadow-2xl rounded-full overflow-hidden border-4 border-white/10 bg-white/5 flex items-center justify-center text-6xl font-bold">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            (profile.display_name?.[0] || profile.username?.[0] || '?').toUpperCase()
          )}
        </div>
        <div className="flex flex-col flex-1 w-full">
          <span className="text-sm font-semibold tracking-widest uppercase mb-2 text-[#a3a3a3]">Profile</span>
          <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-2 tracking-tighter truncate">
            {profile.display_name || profile.username}
          </h1>
          <p className="text-lg text-white/50 mb-4">@{profile.username}</p>
          
          <div className="flex items-center gap-4">
            {isSelf ? (
              <Link href="/settings" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-semibold">
                Edit Profile
              </Link>
            ) : currentUser ? (
              friendStatus === 'accepted' ? (
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-semibold border border-green-500/30">
                  <UserCheck size={16} /> Friends
                </button>
              ) : friendStatus === 'pending' ? (
                <button disabled className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm font-semibold border border-yellow-500/30">
                  <Clock size={16} /> Request Pending
                </button>
              ) : (
                <button 
                  onClick={handleAddFriend}
                  disabled={adding}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 rounded-xl transition-colors text-sm font-bold disabled:opacity-50"
                >
                  {adding ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  Add Friend
                </button>
              )
            ) : (
              <Link href="/login" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-semibold">
                Sign in to add friend
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 flex flex-col gap-12 max-w-6xl">
        {/* Bio Section */}
        {profile.bio && (
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">About</h2>
            <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          </section>
        )}

        {/* Public Playlists */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ListMusic size={24} /> Public Playlists
          </h2>
          {playlists.length === 0 ? (
            <div className="text-[#a3a3a3] text-sm">No public playlists available.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {playlists.map(p => (
                <Link key={p.id} href={`/playlist/${p.id}`} className="group flex flex-col gap-3">
                  <div className="w-full aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden shadow-lg relative">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListMusic size={40} className="text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white truncate text-sm">{p.name}</h3>
                    {p.description && <p className="text-xs text-white/50 truncate mt-1">{p.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
