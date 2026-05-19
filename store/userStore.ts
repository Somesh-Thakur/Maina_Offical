import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id:          string;
  email?:      string;
  username:    string;
  displayName: string;
  avatarUrl?:  string;
  role:        'user' | 'admin';
}

interface UserState {
  user:         UserProfile | null;
  isLoading:    boolean;
  setUser:      (user: UserProfile | null) => void;
  setLoading:   (v: boolean) => void;
  isAdmin:      () => boolean;
  isLoggedIn:   () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user:      null,
      isLoading: true,

      setUser:    (user) => set({ user }),
      setLoading: (v)    => set({ isLoading: v }),
      isAdmin:    ()     => get().user?.role === 'admin',
      isLoggedIn: ()     => !!get().user,
    }),
    {
      name:    'maina_user',
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
