'use client';
import { useState, useEffect } from 'react';
import { signIn }   from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence }   from 'framer-motion';
import { Music2, Mail, Eye, EyeOff, Loader2, User, Lock, Check } from 'lucide-react';

// Discord icon SVG
function DiscordIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.132 18.113a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

// GitHub icon SVG
function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

const PARTICLES = [
  { width: 2.8, height: 2.8, left: 12.3, top: 78.2, duration: 18.2, delay: 3.1 },
  { width: 1.4, height: 1.4, left: 35.7, top: 22.9, duration: 14.6, delay: 0.4 },
  { width: 2.1, height: 2.1, left: 58.1, top: 45.6, duration: 19.8, delay: 7.2 },
  { width: 1.7, height: 1.7, left: 81.4, top: 11.3, duration: 12.3, delay: 2.5 },
  { width: 2.5, height: 2.5, left: 5.9, top: 55.8, duration: 16.7, delay: 5.8 },
  { width: 1.2, height: 1.2, left: 44.2, top: 88.1, duration: 20.4, delay: 1.0 },
  { width: 2.9, height: 2.9, left: 67.8, top: 33.4, duration: 15.1, delay: 8.3 },
  { width: 1.9, height: 1.9, left: 23.6, top: 64.7, duration: 17.6, delay: 4.6 },
  { width: 2.3, height: 2.3, left: 91.2, top: 77.5, duration: 13.9, delay: 6.1 },
  { width: 1.5, height: 1.5, left: 50.0, top: 5.2, duration: 21.0, delay: 9.4 },
  { width: 2.0, height: 2.0, left: 73.4, top: 60.1, duration: 11.8, delay: 0.7 },
  { width: 2.6, height: 2.6, left: 18.9, top: 38.8, duration: 16.2, delay: 3.9 },
  { width: 1.3, height: 1.3, left: 86.5, top: 20.4, duration: 18.9, delay: 7.7 },
  { width: 2.2, height: 2.2, left: 30.1, top: 92.6, duration: 14.0, delay: 5.2 },
  { width: 1.8, height: 1.8, left: 62.3, top: 14.8, duration: 22.1, delay: 2.8 },
  { width: 2.7, height: 2.7, left: 9.7, top: 44.3, duration: 13.5, delay: 8.9 },
  { width: 1.6, height: 1.6, left: 77.0, top: 83.7, duration: 17.3, delay: 6.4 },
  { width: 2.4, height: 2.4, left: 42.8, top: 29.1, duration: 15.7, delay: 1.6 },
  { width: 1.1, height: 1.1, left: 96.3, top: 51.9, duration: 20.8, delay: 4.3 },
  { width: 2.9, height: 2.9, left: 55.6, top: 70.5, duration: 12.6, delay: 9.0 },
];

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router  = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(true);
  const [loading, setLoading]   = useState<string | null>(null);
  const [error, setError]       = useState('');
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // normalized 0-1

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleOAuthSignIn = async (provider: 'discord' | 'github') => {
    setLoading(provider);
    setError('');
    // Store stay signed in preference
    if (!staySignedIn) localStorage.setItem('maina_temp_session', 'true');
    else localStorage.removeItem('maina_temp_session');
    
    await signIn(provider, { callbackUrl: '/' });
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading('credentials');

    if (mode === 'signup') {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Signup failed'); setLoading(null); return; }
    }

    // Store stay signed in preference
    if (!staySignedIn) localStorage.setItem('maina_temp_session', 'true');
    else localStorage.removeItem('maina_temp_session');

    const result = await signIn('credentials', {
      email, password, redirect: false,
    });

    setLoading(null);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden text-white cursor-default">
      
      {/* === BACKGROUND LAYERS === */}
      {/* Aurora gradient that follows mouse */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(59,130,246,0.18) 0%, transparent 70%),
                       radial-gradient(ellipse 50% 50% at ${(1 - mousePos.x) * 100}% ${(1 - mousePos.y) * 100}%, rgba(99,102,241,0.12) 0%, transparent 65%)`,
          transition: 'background 0.15s ease-out',
        }}
      />

      {/* Second slow-drifting glow */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full blur-[140px] bg-blue-700/10 pointer-events-none z-0"
        animate={{ x: mousePos.x * 200 - 100, y: mousePos.y * 200 - 100 }}
        transition={{ type: 'spring', damping: 60, stiffness: 80 }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{ width: p.width, height: p.height, left: `${p.left}%`, top: `${p.top}%` }}
            animate={{ y: [0, -80, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
          />
        ))}
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding & Features */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden md:flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Music2 size={26} className="text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight font-display">MAINA</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-display font-black leading-[1.1] tracking-tight">
            Your music.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Your world.
            </span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-md font-medium">
            Listen free, forever. Sync your heavy rotation across devices and discover what your friends are jamming to.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Check size={16} />
              </div>
              <span>No ads, zero interruptions</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Check size={16} />
              </div>
              <span>Discord Rich Presence & cloud sync</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Check size={16} />
              </div>
              <span>Free, open-source forever</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo Only */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Music2 size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight font-display">MAINA</span>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            {/* Inner dynamic glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <h2 className="text-2xl font-bold text-white mb-2 font-display">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-white/40 mb-8">
              {mode === 'login' ? 'Sign in to sync your library' : 'Join the next-gen music platform'}
            </p>

            {/* OAuth buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={() => handleOAuthSignIn('discord')}
                disabled={!!loading}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading === 'discord' ? <Loader2 size={18} className="animate-spin" /> : <DiscordIcon size={18} />}
                Continue with Discord
              </button>

              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={!!loading}
                className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {loading === 'github' ? <Loader2 size={18} className="animate-spin" /> : <GithubIcon size={18} />}
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] uppercase tracking-widest text-white/30 font-medium">or email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleCredentials} className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_]+"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/50 transition-all text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/50 transition-all text-sm"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/50 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Stay Signed In Toggle */}
              <label className="flex items-center gap-3 mt-1 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${staySignedIn ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-white/20 bg-black/20 group-hover:border-white/40'}`}>
                  {staySignedIn && <Check size={12} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={staySignedIn} 
                  onChange={(e) => setStaySignedIn(e.target.checked)} 
                />
                <span className="text-sm text-white/60 group-hover:text-white/90 transition-colors select-none">
                  Stay signed in
                </span>
              </label>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={!!loading}
                className="w-full py-3.5 mt-2 rounded-xl bg-white text-black font-bold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden"
              >
                {loading === 'credentials'
                  ? <Loader2 size={20} className="animate-spin mx-auto" />
                  : mode === 'login' ? 'Sign In' : 'Create Account'
                }
              </button>
            </form>

            {/* Toggle */}
            <p className="text-center text-sm text-white/40 mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-white font-semibold hover:underline"
              >
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
            
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => {
                  // Set a 1-day guest cookie so the proxy lets this device through
                  document.cookie = 'maina_guest=1; path=/; max-age=86400; SameSite=Lax';
                  router.push('/');
                }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors underline-offset-4 hover:underline"
              >
                Continue as Guest
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-white/20 mt-6">
            By continuing, you agree to our Terms of Service & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
