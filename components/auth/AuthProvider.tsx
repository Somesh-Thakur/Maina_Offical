'use client';
import { SessionProvider } from 'next-auth/react';
import { useSession }      from 'next-auth/react';
import { useEffect }       from 'react';
import { useUserStore }    from '@/store/userStore';

/** Syncs NextAuth session → Zustand userStore */
function SessionSync() {
  const { data: session, status } = useSession();
  const { setUser, setLoading }   = useUserStore();

  useEffect(() => {
    // Temporary Session Management
    if (typeof window !== 'undefined' && status === 'authenticated') {
      if (!sessionStorage.getItem('maina_session_active')) {
        if (localStorage.getItem('maina_temp_session') === 'true') {
          // It's a temporary session and a fresh tab -> log out
          import('next-auth/react').then(({ signOut }) => {
            signOut({ redirect: false });
            localStorage.removeItem('maina_temp_session');
          });
          return;
        } else {
          sessionStorage.setItem('maina_session_active', 'true');
        }
      }
    }

    setLoading(status === 'loading');
    if (status === 'authenticated' && session?.user) {
      setUser({
        id:          session.user.id,
        email:       session.user.email ?? undefined,
        username:    session.user.username,
        displayName: session.user.displayName ?? session.user.name ?? session.user.username,
        avatarUrl:   session.user.image ?? undefined,
        role:        (session.user.role as 'user' | 'admin') ?? 'user',
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status, setUser, setLoading]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}
