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
