import { NextResponse } from 'next/server';
import { runPythonClipEngine } from '../../../../lib/services/clipEngineService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get('slug') || '').trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 });
  }

  try {
    const result = await runPythonClipEngine(['--action', 'download', '--slug', slug]);
    return NextResponse.json(result);
  } catch (err) {
    console.error(`[Python Video API] Error downloading clip ${slug}:`, err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
