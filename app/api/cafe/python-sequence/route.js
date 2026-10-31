import { NextResponse } from 'next/server';
import { runPythonClipEngine } from '../../../../lib/services/clipEngineService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await runPythonClipEngine(['--action', 'sequence', '--payload', JSON.stringify(body)]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Python Sequence API] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
