import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Referer': 'https://clip.cafe/'
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let rawSlug = searchParams.get('slug') || '';
  const rawUrl = searchParams.get('url') || '';

  if (!rawSlug && rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      const parts = parsed.pathname.split('/');
      const last = parts[parts.length - 1];
      rawSlug = last.replace(/\.[^/.]+$/, '');
    } catch {
      rawSlug = rawUrl.split('/').pop().replace(/\.[^/.]+$/, '');
    }
  }

  const slug = rawSlug.replace(/[^a-zA-Z0-9_\-]/g, '');

  if (!slug) {
    return new NextResponse('Missing slug or url', { status: 400 });
  }

  try {
    const targetUrl = (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')))
      ? rawUrl
      : `https://clip.cafe/img800/${slug}.jpg`;

    const imgResp = await fetch(targetUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000)
    });

    if (!imgResp.ok) {
      // Fallback to img800 if custom URL failed
      if (targetUrl !== `https://clip.cafe/img800/${slug}.jpg`) {
        const fallbackResp = await fetch(`https://clip.cafe/img800/${slug}.jpg`, {
          headers: HEADERS,
          signal: AbortSignal.timeout(8000)
        });
        if (fallbackResp.ok) {
          const arrayBuffer = await fallbackResp.arrayBuffer();
          return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=86400, s-maxage=86400',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      return new NextResponse('Thumbnail not found', { status: 404 });
    }

    const arrayBuffer = await imgResp.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': imgResp.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    console.warn(`[Thumb API] Error fetching thumbnail for ${slug}:`, err.message);
    return new NextResponse('Failed to fetch thumbnail', { status: 502 });
  }
}
