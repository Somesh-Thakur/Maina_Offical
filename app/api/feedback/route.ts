import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const DISCORD_WEBHOOK = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;

const typeEmoji: Record<string, string> = { bug: '🐛', feedback: '💬' };
const typeColor: Record<string, number> = { bug: 0xff4444, feedback: 0x3b82f6 };

async function sendToDiscord(payload: {
  type: string; title: string; content: string;
  username?: string; email?: string;
}) {
  if (!DISCORD_WEBHOOK) return;

  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username:   'Maina Feedback Bot',
      avatar_url: 'https://maina-offical.vercel.app/icon.svg',
      embeds: [{
        title:       `${typeEmoji[payload.type] ?? '📩'} ${payload.title}`,
        description: payload.content,
        color:       typeColor[payload.type] ?? 0x666666,
        fields: [
          { name: 'Type',    value: payload.type,               inline: true },
          { name: 'From',    value: payload.username ?? 'Guest', inline: true },
          { name: 'Email',   value: payload.email   ?? '—',      inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Maina Platform' },
      }],
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const { type, title, content } = await req.json();

  if (!type || !title || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  await supabase.from('feedback').insert({
    user_id: session?.user?.id ?? null,
    type,
    title,
    content,
  });

  // Send to Discord DM webhook
  await sendToDiscord({
    type, title, content,
    username: session?.user?.username ?? session?.user?.name ?? undefined,
    email:    session?.user?.email    ?? undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('feedback')
    .select('*, profiles(username, display_name, avatar_url)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ feedback: data });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id, status } = await req.json();
  const supabase = getSupabaseAdmin();
  await supabase.from('feedback').update({ status }).eq('id', id);
  return NextResponse.json({ ok: true });
}
