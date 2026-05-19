'use client';
import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Bug, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';

export default function FeedbackPage() {
  const { user } = useUserStore();
  const [type, setType] = useState<'bug' | 'feedback'>('feedback');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, content }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">Report a Bug / Feedback</h1>
        <p className="text-white/40">Help us improve Maina. Your feedback goes directly to the developers.</p>
      </div>

      {!user ? (
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-white/70 mb-4">Please sign in to submit feedback or report bugs.</p>
          <button
            onClick={() => signIn()}
            className="px-6 py-2 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-xl font-bold text-green-400 mb-2">Thank you!</h2>
          <p className="text-green-400/70 mb-6">Your {type} has been sent successfully to the developers.</p>
          <button
            onClick={() => { setSubmitted(false); setTitle(''); setContent(''); }}
            className="px-6 py-2 bg-green-500/20 text-green-400 rounded-xl font-bold hover:bg-green-500/30 transition-colors"
          >
            Submit Another
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
          {/* Type Selector */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('feedback')}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                type === 'feedback'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare size={24} />
              <span className="font-semibold">General Feedback</span>
            </button>
            <button
              type="button"
              onClick={() => setType('bug')}
              className={`flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                type === 'bug'
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bug size={24} />
              <span className="font-semibold">Report a Bug</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Title / Short Summary
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'bug' ? 'E.g. Play button not working on mobile' : 'E.g. Add a sleep timer feature'}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Details
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={type === 'bug' ? 'Describe the issue, steps to reproduce, device, browser, etc.' : 'Tell us more about your feedback...'}
              required
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
              type === 'bug' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : type === 'bug' ? <Bug size={18} /> : <MessageSquare size={18} />}
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}
