import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { runPythonClipEngine } from '../../../../lib/services/clipEngineService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let tempPayloadPath = '';
  try {
    const body = await request.json();
    const projectRoot = process.cwd();
    const cacheDir = path.join(projectRoot, 'clips_cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    tempPayloadPath = path.join(
      cacheDir,
      `export_payload_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.json`
    );
    fs.writeFileSync(tempPayloadPath, JSON.stringify(body), 'utf8');

    const result = await runPythonClipEngine(['--action', 'export', '--payload-file', tempPayloadPath]);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Python Export API] Error exporting video:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    if (tempPayloadPath && fs.existsSync(tempPayloadPath)) {
      try {
        fs.unlinkSync(tempPayloadPath);
      } catch (e) {}
    }
  }
}
