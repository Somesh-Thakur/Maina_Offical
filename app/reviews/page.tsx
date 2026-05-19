'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  profiles: { username: string; display_name: string; avatar_url?: string };
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-2xl transition-transform active:scale-110 ${
            s <= value ? 'text-yellow-400' : 'text-white/20'
          } ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useUserStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating]   = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  useEffect(() => {
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    await fetch('/api/reviews', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ rating, content }),
    });
    setSubmitted(true);
    setSubmitting(false);
    // Reload reviews
    const d = await fetch('/api/reviews').then(r => r.json());
    setReviews(d.reviews ?? []);
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">User Reviews</h1>
        <p className="text-white/40">What people are saying about Maina</p>

        {avg && (
          <div className="flex items-end gap-3 mt-4">
            <span className="text-6xl font-black text-white">{avg}</span>
            <div className="pb-2">
              <StarRating value={Math.round(Number(avg))} />
              <p className="text-sm text-white/40 mt-1">{reviews.length} reviews</p>
            </div>
          </div>
        )}
      </div>

      {/* Write review */}
      <div className="mb-10 bg-white/[0.04] border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4">Leave a Review</h2>

        {!user ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">Sign in to leave a review</p>
            <button
              onClick={() => signIn()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              Sign In <ChevronRight size={14} />
            </button>
          </div>
        ) : submitted ? (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-sm"
          >
            ✓ Thanks for your review! It&apos;s now live.
          </motion.p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-white/50 mb-2">Your rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your experience with Maina..."
              rows={4}
              required
              minLength={10}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="self-start flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex items-center gap-3 text-white/40">
          <Loader2 size={18} className="animate-spin" /> Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-white/30 text-center py-16">No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                  {r.profiles?.avatar_url
                    ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (r.profiles?.display_name?.[0] ?? r.profiles?.username?.[0] ?? '?').toUpperCase()
                  }
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-sm">{r.profiles?.display_name ?? r.profiles?.username}</span>
                    <StarRating value={r.rating} />
                    <span className="text-xs text-white/30 ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{r.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
