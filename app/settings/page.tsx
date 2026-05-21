'use client';
import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { Loader2, Save, Link2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    avatar_url: '',
    bio: '',
  });

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setFormData({
            username: d.profile.username || '',
            display_name: d.profile.display_name || '',
            avatar_url: d.profile.avatar_url || '',
            bio: d.profile.bio || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = () => {
    if (!formData.username) return;
    const url = `${window.location.origin}/u/${formData.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-4xl mx-auto flex flex-col gap-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-2 tracking-tight">
          Settings
        </h1>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">Public Profile</h2>
        {loading ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-white/50" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden border-2 border-white/20 flex items-center justify-center text-2xl font-bold">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (formData.display_name?.[0] || formData.username?.[0] || '?').toUpperCase()
                  )}
                </div>
                {/* Profile Link Button */}
                <button
                  type="button"
                  onClick={copyProfileLink}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
                  {copied ? 'Copied' : 'Share Profile'}
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Username</label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Display Name</label>
                  <input
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    placeholder="Your actual name"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Avatar URL</label>
                  <input
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.png"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell the world about your music taste..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-green-400 text-sm">Profile updated successfully!</p>}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">Data & Storage</h2>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Clear Local Data</h3>
              <p className="text-sm text-[#a3a3a3]">Remove local cache and settings.</p>
            </div>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors font-medium text-sm">
              Clear Data
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">App Settings & Links</h2>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
          {user?.role === 'admin' && (
            <a href="/admin" className="px-4 py-3 bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 rounded-md transition-colors font-medium flex items-center justify-between">
              Admin Panel
              <span>&rarr;</span>
            </a>
          )}
          <a href="/feedback" className="px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-md transition-colors font-medium flex items-center justify-between">
            Report Bug / Feedback
            <span>&rarr;</span>
          </a>
          <a href="/download" className="px-4 py-3 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-md transition-colors font-medium flex items-center justify-between">
            Get the Desktop App (Discord RPC & more)
            <span>&rarr;</span>
          </a>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">Account Options</h2>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
          <button onClick={() => {
            document.cookie = 'maina_guest=; Max-Age=0; path=/;';
            localStorage.removeItem('maina_temp_session');
            window.location.href = '/api/auth/signout';
          }} className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors font-medium flex items-center justify-between w-full text-left">
            Sign Out
            <span>&rarr;</span>
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-display font-bold">About Maina</h2>
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-sm text-[#a3a3a3] leading-relaxed">
          <p className="mb-4">Maina is a premium, personal-use music player powered by YouTube and the Web Audio API.</p>
          <p>Version: 1.0.0</p>
        </div>
      </section>
    </div>
  );
}
