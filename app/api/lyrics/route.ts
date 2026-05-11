import { NextRequest, NextResponse } from 'next/server';

// Proxy lrclib.net requests server-side to avoid CORS issues in the browser / WebView2
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const artist = searchParams.get('artist_name') ?? '';
  const track  = searchParams.get('track_name') ?? '';
  const duration = searchParams.get('duration') ?? '';
  const q      = searchParams.get('q') ?? ''; // fuzzy search query

  try {
    let targetUrl: string;

    if (q) {
      // Fuzzy search path
      const url = new URL('https://lrclib.net/api/search');
      url.searchParams.set('q', q);
      targetUrl = url.toString();
    } else {
      // Exact match path
      const url = new URL('https://lrclib.net/api/get');
      url.searchParams.set('artist_name', artist);
      url.searchParams.set('track_name', track);
      if (duration) url.searchParams.set('duration', duration);
      targetUrl = url.toString();
    }

    const upstream = await fetch(targetUrl, {
      headers: { 'Lrclib-Client': 'Maina/1.0 (https://maina-offical.vercel.app)' },
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!upstream.ok) {
      return NextResponse.json(null, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
  } catch (err) {
    console.error('[Lyrics API] upstream fetch failed:', err);
    return NextResponse.json(null, { status: 502 });
  }
}
