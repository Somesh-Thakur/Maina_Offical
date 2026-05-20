import NextAuth from 'next-auth';
import Discord  from 'next-auth/providers/discord';
import GitHub   from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { getSupabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    // ── Discord OAuth ───────────────────────────────────────────
    Discord({
      clientId:     process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),

    // ── GitHub OAuth ────────────────────────────────────────────
    GitHub({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // ── Email + Password ────────────────────────────────────────
    Credentials({
      name: 'Email & Password',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const supabase = getSupabaseAdmin();
        const { data: user } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', credentials.email as string)
          .single();

        if (!user || !user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash,
        );
        if (!valid) return null;

        return {
          id:       user.id,
          email:    user.email,
          name:     user.display_name ?? user.username,
          image:    user.avatar_url,
          username: user.username,
          role:     user.role,
        };
      },
    }),
  ],

  callbacks: {
    // After OAuth sign-in: upsert profile into Supabase
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true;

      const supabase = getSupabaseAdmin();
      const baseName = (user.email?.split('@')[0] ?? `user_${Date.now()}`)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const username = `${baseName}_${randomSuffix}`;

      // Generate a deterministic UUID for OAuth accounts so Postgres doesn't complain about invalid UUIDs
      const { v5: uuidv5 } = await import('uuid');
      const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
      const dbId = uuidv5(`${account?.provider}:${account?.providerAccountId}`, NAMESPACE);

      // 1. Try to find existing user by email (if provided) or by ID
      let existingUser = null;
      
      if (user.email) {
        const { data } = await supabase.from('profiles').select('id').eq('email', user.email).single();
        if (data) existingUser = data;
      }
      
      if (!existingUser) {
        const { data } = await supabase.from('profiles').select('id').eq('id', dbId).single();
        if (data) existingUser = data;
      }

      if (existingUser) {
        // If we found them (by email or id), use THEIR existing ID so we don't duplicate emails
        user.id = existingUser.id;
        
        // Update their avatar and name since they just logged in
        await supabase.from('profiles').update({
          display_name: user.name,
          avatar_url:   user.image,
        }).eq('id', existingUser.id);
      } else {
        // Only insert if completely new
        user.id = dbId;
        const { error } = await supabase.from('profiles').insert({
          id:           dbId,
          email:        user.email,
          display_name: user.name,
          username,
          avatar_url:   user.image,
          provider:     account?.provider,
        });
        if (error) console.error('[Maina Auth] insert error:', error.message);
      }

      return true;
    },

    // Attach extra fields to the JWT
    async jwt({ token, user, account }) {
      const supabase = getSupabaseAdmin();

      if (user) {
        let dbId = user.id;
        
        // For OAuth, we need to find their actual DB ID because they might have linked accounts via email
        if (account?.provider && account.provider !== 'credentials') {
          let foundId = null;
          
          if (user.email) {
            const { data } = await supabase.from('profiles').select('id').eq('email', user.email).single();
            if (data) foundId = data.id;
          }
          
          if (!foundId) {
            const { v5: uuidv5 } = await import('uuid');
            const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
            foundId = uuidv5(`${account.provider}:${account.providerAccountId}`, NAMESPACE);
          }
          
          dbId = foundId;
        }

        token.id       = dbId;
        token.username = (user as any).username;
        token.role     = (user as any).role;
      }

      // Fetch latest profile info from DB on every session refresh
      if (token.id) {
        const { data } = await supabase
          .from('profiles')
          .select('role, username, display_name, avatar_url')
          .eq('id', token.id)
          .single();
        if (data) {
          token.role        = data.role;
          token.username    = data.username;
          token.displayName = data.display_name;
          token.image       = data.avatar_url;
        }
      }
      return token;
    },

    // Expose fields in the session object
    async session({ session, token }) {
      if (token) {
        session.user.id          = token.id as string;
        session.user.username    = token.username as string;
        session.user.role        = token.role    as string;
        session.user.displayName = token.displayName as string;
        session.user.image       = token.image as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  session: { strategy: 'jwt' },
});

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    username?:    string;
    role?:        string;
    displayName?: string;
  }
  interface Session {
    user: {
      id:           string;
      email?:       string | null;
      name?:        string | null;
      image?:       string | null;
      username:     string;
      role:         string;
      displayName?: string;
    };
  }
}
