import fs from 'fs';
import path from 'path';
import os from 'os';
import { NextResponse } from 'next/server';
import { runPythonClipEngine, getProjectRoot } from '../../../../lib/services/clipEngineService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let tempPayloadPath = '';
  try {
    const body = await request.json();
    const projectRoot = getProjectRoot();

    // Determine safe cache directory:
    // If running in local environment where projectRoot is writable, use clips_cache/
    // If running on Vercel/Serverless where /var/task is read-only, fallback to os.tmpdir()
    let cacheDir = path.join(projectRoot, 'clips_cache');
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.accessSync(cacheDir, fs.constants.W_OK);
    } catch {
      cacheDir = path.join(os.tmpdir(), 'moovyeng_clips_cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
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
    return NextResponse.json({
      success: false,
      error: err.message.includes('No usable Python executable')
        ? 'ฟังก์ชันรวมวิดีโอ MP4 ต้องใช้ Python & FFmpeg ในเครื่องคอมพิวเตอร์ของคุณ (เมื่อรันบน Cloud Vercel แนะนำให้ Export รูปภาพ PNG หรือเปิดรันเว็บในเครื่อง Local ด้วยคำสั่ง npm run dev)'
        : err.message
    }, { status: 500 });
  } finally {
    if (tempPayloadPath && fs.existsSync(tempPayloadPath)) {
      try {
        fs.unlinkSync(tempPayloadPath);
      } catch (e) {}
    }
  }
}
