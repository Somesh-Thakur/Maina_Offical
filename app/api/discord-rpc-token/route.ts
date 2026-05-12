import { NextResponse } from 'next/server';

/**
 * POST /api/discord-rpc-token
 *
 * Exchanges a Discord OAuth2 authorization code for an access token.
 * The client_secret is kept server-side — never exposed to the browser.
 *
 * Required env var: DISCORD_CLIENT_SECRET
 */
export async function POST(request: Request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientSecret) {
    console.error('[Maina] DISCORD_CLIENT_SECRET not set');
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const body = new URLSearchParams({
    client_id: '1503459571195445449',
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code,
  });

  const discordRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!discordRes.ok) {
    const err = await discordRes.text();
    console.error('[Maina] Discord token exchange failed:', err);
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 502 });
  }

  const data = await discordRes.json();
  return NextResponse.json({ access_token: data.access_token });
}
