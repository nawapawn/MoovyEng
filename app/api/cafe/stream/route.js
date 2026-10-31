import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get('slug') || '';
  const rawUrl = searchParams.get('url') || '';

  const cleanSlug = (rawSlug || path.basename(rawUrl, '.mp4')).replace(/[^a-zA-Z0-9_\-]/g, '_');

  if (!cleanSlug) {
    return new NextResponse('Missing slug or url', { status: 400 });
  }

  const projectRoot = process.cwd();
  const localCandidates = [
    path.join(projectRoot, 'clips_cache', `${cleanSlug}_crop16x9.mp4`),
    path.join(projectRoot, 'clips_cache', `${cleanSlug}_raw.mp4`),
    path.join(projectRoot, 'clips_cache', `${cleanSlug}.mp4`)
  ];

  for (const cand of localCandidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).size > 5000) {
      const stat = fs.statSync(cand);
      const range = request.headers.get('range');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunkSize = (end - start) + 1;

        const stream = fs.createReadStream(cand, { start, end });
        const webStream = new ReadableStream({
          start(controller) {
            stream.on('data', chunk => controller.enqueue(chunk));
            stream.on('end', () => controller.close());
            stream.on('error', err => controller.error(err));
          },
          cancel() {
            stream.destroy();
          }
        });

        return new Response(webStream, {
          status: 206,
          headers: {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': String(chunkSize),
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else {
        const stream = fs.createReadStream(cand);
        const webStream = new ReadableStream({
          start(controller) {
            stream.on('data', chunk => controller.enqueue(chunk));
            stream.on('end', () => controller.close());
            stream.on('error', err => controller.error(err));
          },
          cancel() {
            stream.destroy();
          }
        });

        return new Response(webStream, {
          status: 200,
          headers: {
            'Content-Length': String(stat.size),
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }
  }

  // Proxy directly from clip.cafe
  const targetUrl = (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
    ? rawUrl
    : `https://clip.cafe/videos/${cleanSlug}.mp4`;

  try {
    const rangeHeader = request.headers.get('range');
    const proxyHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Referer': 'https://clip.cafe/',
      'Accept': 'video/webm,video/ogg,video/*;q=0.9,*/*;q=0.5'
    };
    if (rangeHeader) {
      proxyHeaders['Range'] = rangeHeader;
    }

    const upstreamResp = await fetch(targetUrl, {
      headers: proxyHeaders,
      signal: AbortSignal.timeout(15000)
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstreamResp.headers.get('content-type') || 'video/mp4');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    if (upstreamResp.headers.has('content-length')) {
      responseHeaders.set('Content-Length', upstreamResp.headers.get('content-length'));
    }
    if (upstreamResp.headers.has('content-range')) {
      responseHeaders.set('Content-Range', upstreamResp.headers.get('content-range'));
    }

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: responseHeaders
    });
  } catch (err) {
    console.warn(`[Stream API] Error streaming video for ${cleanSlug}:`, err.message);
    return new NextResponse('Error streaming video', { status: 502 });
  }
}
