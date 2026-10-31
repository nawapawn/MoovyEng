import { NextResponse } from 'next/server';
import { runPythonClipEngine } from '../../../../lib/services/clipEngineService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get('slug') || '').trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  }

  const cleanSlug = slug.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const directFallbackUrl = `https://clip.cafe/videos/${cleanSlug}.mp4`;

  try {
    const result = await runPythonClipEngine(['--action', 'download', '--slug', slug]);
    return NextResponse.json(result);
  } catch (err) {
    // On serverless environments (e.g. Vercel) where python / ffmpeg / local disk writes may not be available,
    // seamlessly fallback to streaming / proxying directly from clip.cafe
    console.warn(`[Python Video API] Local engine unavailable for ${slug} (${err.message}). Using streaming fallback.`);
    return NextResponse.json({
      success: true,
      slug: slug,
      videoUrl: directFallbackUrl,
      publicUrl: `/api/cafe/stream?url=${encodeURIComponent(directFallbackUrl)}`,
      fallback: true
    });
  }
}
