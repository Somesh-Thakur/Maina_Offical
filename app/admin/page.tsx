'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useRouter }   from 'next/navigation';
import { Users, Star, MessageSquare, TrendingUp, Eye, EyeOff, CheckCircle, Trash2, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Stats { totalUsers: number; activeUsers: number; totalReviews: number; totalFeedback: number; }
interface Review  { id: string; user_id: string; rating: number; content: string; is_visible: boolean; created_at: string; profiles: { username: string; display_name: string; avatar_url: string }; }
interface Feedback { id: string; type: string; title: string; content: string; status: string; created_at: string; profiles?: { username: string; display_name: string }; }
interface User    { id: string; username: string; display_name: string; email: string; role: string; created_at: string; last_active: string; }

type Tab = 'overview' | 'users' | 'reviews' | 'feedback';

export default function AdminPage() {
  const { user, isLoading } = useUserStore();
  const router = useRouter();
  const [tab, setTab]       = useState<Tab>('overview');
  const [data, setData]     = useState<{ stats: Stats; users: User[]; reviews: Review[]; feedback: Feedback[]; trending: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') router.replace('/');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [user]);

  const toggleReview = async (id: string, visible: boolean) => {
    await fetch('/api/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_visible: visible }) });
    setData(d => d ? { ...d, reviews: d.reviews.map(r => r.id === id ? { ...r, is_visible: visible } : r) } : d);
  };

  const updateFeedback = async (id: string, status: string) => {
    await fetch('/api/feedback', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setData(d => d ? { ...d, feedback: d.feedback.map(f => f.id === id ? { ...f, status } : f) } : d);
  };

  if (isLoading || loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!data) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview',  icon: Activity       },
    { id: 'users',    label: 'Users',     icon: Users          },
    { id: 'reviews',  label: 'Reviews',   icon: Star           },
    { id: 'feedback', label: 'Feedback',  icon: MessageSquare  },
  ];

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Shield size={20} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-sm text-white/40">Maina Platform Control</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users',    value: data.stats.totalUsers,    icon: Users,         color: 'blue'   },
              { label: 'Active (7 days)',value: data.stats.activeUsers,   icon: Activity,      color: 'green'  },
              { label: 'Total Reviews',  value: data.stats.totalReviews,  icon: Star,          color: 'yellow' },
              { label: 'Feedback Items', value: data.stats.totalFeedback, icon: MessageSquare, color: 'purple' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-5"
              >
                <s.icon size={18} className="text-white/40 mb-3" />
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Trending */}
          {data.trending.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} />Trending This Week</h2>
              <div className="flex flex-col gap-2">
                {data.trending.slice(0, 5).map((t: any, i: number) => (
                  <div key={t.track_id} className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-lg border border-white/5">
                    <span className="text-lg font-black text-white/20 w-6">#{i + 1}</span>
                    <img src={t.thumbnail} alt={t.title} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-white/40">{t.artist}</p>
                    </div>
                    <span className="text-xs text-white/40">{t.play_count} plays</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="flex flex-col gap-2">
          {data.users.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shrink-0">
                {u.display_name?.[0]?.toUpperCase() ?? u.username?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{u.display_name ?? u.username}</p>
                <p className="text-xs text-white/40">@{u.username} · {u.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                u.role === 'admin'
                  ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}>{u.role}</span>
              <span className="text-xs text-white/30">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="flex flex-col gap-3">
          {data.reviews.map(r => (
            <div key={r.id} className={`p-5 rounded-xl border ${r.is_visible ? 'bg-white/[0.03] border-white/10' : 'bg-white/[0.01] border-white/5 opacity-50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">{r.profiles?.display_name ?? r.profiles?.username ?? 'Unknown'}</span>
                    <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm text-white/70">{r.content}</p>
                  <p className="text-xs text-white/30 mt-2">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => toggleReview(r.id, !r.is_visible)}
                  className="shrink-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title={r.is_visible ? 'Hide review' : 'Show review'}
                >
                  {r.is_visible ? <Eye size={16} className="text-white/50" /> : <EyeOff size={16} className="text-white/30" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      {tab === 'feedback' && (
        <div className="flex flex-col gap-3">
          {data.feedback.map(f => (
            <div key={f.id} className={`p-5 rounded-xl border ${
              f.status === 'resolved' ? 'bg-green-500/5 border-green-500/20' :
              f.status === 'seen'     ? 'bg-white/[0.02] border-white/5 opacity-70' :
              'bg-white/[0.04] border-white/10'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      f.type === 'bug' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                    }`}>{f.type}</span>
                    <span className="text-sm font-semibold">{f.title}</span>
                  </div>
                  <p className="text-sm text-white/70">{f.content}</p>
                  <p className="text-xs text-white/30 mt-1">
                    From {f.profiles?.display_name ?? 'Anonymous'} · {new Date(f.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {f.status !== 'seen' && (
                    <button onClick={() => updateFeedback(f.id, 'seen')} className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Mark seen">
                      <Eye size={14} className="text-white/40" />
                    </button>
                  )}
                  {f.status !== 'resolved' && (
                    <button onClick={() => updateFeedback(f.id, 'resolved')} className="p-2 rounded-lg hover:bg-green-500/20 transition-colors" title="Mark resolved">
                      <CheckCircle size={14} className="text-green-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
