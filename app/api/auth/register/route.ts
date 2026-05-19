import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();

  if (!email || !password || !username) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json({ error: 'Username must be 3+ chars, letters/numbers/underscore only' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check if email/username already taken
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .or(`email.eq.${email},username.eq.${username}`)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();

  const { error } = await supabase.from('profiles').insert({
    id,
    email,
    username,
    display_name: username,
    password_hash,
    provider: 'credentials',
    role: 'user',
  });

  if (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
