import { NextResponse } from 'next/server';
import { exportCompositeVideoWithNodeFfmpeg } from '../../../../lib/services/nodeFfmpegExportService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();

    // Render 100% constant 30fps H.264 + AAC MP4 using Node.js + ffmpeg-static
    const { buffer, filename } = await exportCompositeVideoWithNodeFfmpeg({
      clips: body.clips || [],
      ratio: body.ratio || '9:16',
      word: body.word || 'vocab',
      slideImage: body.slideImage || '',
      clipRect: body.clipRect || null
    });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(buffer.length),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Filename': filename,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('[FFmpeg Export API] Error exporting video:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
