import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import ffmpegStatic from 'ffmpeg-static';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'video/webm,video/ogg,video/*;q=0.9,*/*;q=0.5',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://clip.cafe/'
};

function resolveFfmpegPath() {
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  const candidates = [
    path.join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
    'ffmpeg'
  ];
  for (const cand of candidates) {
    if (cand === 'ffmpeg' || fs.existsSync(cand)) {
      return cand;
    }
  }
  return 'ffmpeg';
}

function makeEven(val, minimum = 2) {
  const v = Math.max(minimum, Math.round(Number(val) || 0));
  return v % 2 === 0 ? v : v - 1;
}

function resolveClipUrl(item) {
  const raw = typeof item === 'string' ? item : (item?.videoUrl || item?.slug || item?.id || '');
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanSlug = trimmed.replace(/^cafe_/, '').replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
  return `https://clip.cafe/videos/${cleanSlug}.mp4`;
}

async function downloadClipToTemp(url, destPath) {
  const resp = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(20000)
  });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for ${url}`);
  }
  const arrayBuffer = await resp.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  if (buf.length < 1000) {
    throw new Error(`Downloaded clip too small (${buf.length} bytes)`);
  }
  fs.writeFileSync(destPath, buf);
  return destPath;
}

function runFfmpeg(ffmpegBin, args, timeoutMs = 55000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBin, args, { windowsHide: true });
    let stderr = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (e) {}
      reject(new Error('FFmpeg timed out'));
    }, timeoutMs);

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stderr);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-600)}`));
      }
    });
  });
}

async function checkHasAudio(ffmpegBin, filePath) {
  try {
    const stderr = await new Promise((resolve) => {
      const proc = spawn(ffmpegBin, ['-hide_banner', '-i', filePath], { windowsHide: true });
      let errOut = '';
      proc.stderr.on('data', (c) => { errOut += c.toString(); });
      proc.on('close', () => resolve(errOut));
      proc.on('error', () => resolve(''));
    });
    return /Stream #\d+:\d+.*Audio:/i.test(stderr);
  } catch {
    return true;
  }
}

/**
 * Pure Node.js + ffmpeg-static composite video exporter.
 * Works on Vercel Serverless, Docker, Linux, macOS, and Windows without Python!
 * Produces a 100% constant 30.00 FPS H.264 + AAC MP4 buffer with ZERO stutter,
 * ZERO black borders (3% crop + cover fill), and ZERO subtitles or badges.
 */
export async function exportCompositeVideoWithNodeFfmpeg({
  clips = [],
  ratio = '9:16',
  word = 'vocab',
  slideImage = '',
  clipRect = null
}) {
  if (!Array.isArray(clips) || clips.length === 0) {
    throw new Error('No clips provided for export');
  }

  const ffmpegBin = resolveFfmpegPath();
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moovyeng_export_'));

  try {
    const targetW = ratio === '16:9' ? 1920 : 1080;
    const targetH = ratio === '16:9' ? 1080 : 1920;

    // 1. Save slide background image if provided
    let hasSlideBg = false;
    const bgPath = path.join(workDir, 'slide_bg.png');
    if (slideImage && slideImage.includes('base64,')) {
      const b64 = slideImage.split('base64,')[1];
      const buf = Buffer.from(b64, 'base64');
      if (buf.length > 500) {
        fs.writeFileSync(bgPath, buf);
        hasSlideBg = true;
      }
    }

    // 2. Download all clips in parallel
    const downloadResults = await Promise.all(
      clips.map(async (item, idx) => {
        const url = resolveClipUrl(item);
        if (!url) return null;
        const clipPath = path.join(workDir, `clip_${idx}.mp4`);
        try {
          await downloadClipToTemp(url, clipPath);
          const hasAudio = await checkHasAudio(ffmpegBin, clipPath);
          return { index: idx, path: clipPath, hasAudio };
        } catch (err) {
          console.warn(`[NodeFFmpeg] Failed to download clip ${idx} (${url}):`, err.message);
          return null;
        }
      })
    );

    const validClips = downloadResults.filter(Boolean);
    if (validClips.length === 0) {
      throw new Error('Could not download any valid clips for export');
    }

    // 3. Calculate exact 16:9 box dimensions inside the slide canvas
    const boxW = makeEven((clipRect?.wRatio ?? 0.94) * targetW, 2);
    const boxH = makeEven((clipRect?.hRatio ?? 0.30) * targetH, 2);
    const boxX = makeEven((clipRect?.xRatio ?? 0.03) * targetW, 0);
    const boxY = makeEven((clipRect?.yRatio ?? 0.28) * targetH, 0);

    // Scale slightly larger (1.06x) and center-crop to boxW x boxH to eliminate any hardcoded movie letterbox lines
    const zoomedW = makeEven(boxW * 1.06, 2);
    const zoomedH = makeEven(boxH * 1.06, 2);

    const args = ['-y'];
    if (hasSlideBg) {
      args.push('-loop', '1', '-framerate', '30', '-i', bgPath);
    }

    for (const c of validClips) {
      args.push('-i', c.path);
    }

    const filterParts = [];
    const concatInputs = [];
    const vidOffset = hasSlideBg ? 1 : 0;

    if (hasSlideBg) {
      filterParts.push(`[0:v]scale=${targetW}:${targetH},setsar=1,fps=30,format=yuv420p[bg];`);

      for (let i = 0; i < validClips.length; i++) {
        const inIdx = i + vidOffset;
        const c = validClips[i];

        // Normalize each clip to exact boxW x boxH, constant 30fps, zero black bars, and NO text overlays!
        const vFilter =
          `[${inIdx}:v]scale=${zoomedW}:${zoomedH}:force_original_aspect_ratio=increase,` +
          `crop=${boxW}:${boxH},setsar=1,fps=30,setpts=PTS-STARTPTS,format=yuv420p[v${i}];`;

        const aFilter = c.hasAudio
          ? `[${inIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo,aresample=async=1000:min_hard_comp=0.100000:first_pts=0,asetpts=PTS-STARTPTS[a${i}];`
          : `aevalsrc=0:c=stereo:s=44100:d=5,asetpts=PTS-STARTPTS[a${i}];`;

        filterParts.push(vFilter + aFilter);
        concatInputs.push(`[v${i}][a${i}]`);
      }

      const n = validClips.length;
      const concatStr = `${concatInputs.join('')}concat=n=${n}:v=1:a=1[clipv][outa];`;
      const overlayStr = `[bg][clipv]overlay=${boxX}:${boxY}:shortest=1,format=yuv420p[outv]`;
      const fullFilter = filterParts.join('') + concatStr + overlayStr;

      args.push('-filter_complex', fullFilter);
    } else {
      for (let i = 0; i < validClips.length; i++) {
        const inIdx = i;
        const c = validClips[i];
        const vFilter =
          `[${inIdx}:v]scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,` +
          `crop=${targetW}:${targetH},setsar=1,fps=30,setpts=PTS-STARTPTS,format=yuv420p[v${i}];`;
        const aFilter = c.hasAudio
          ? `[${inIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo,aresample=async=1000:min_hard_comp=0.100000:first_pts=0,asetpts=PTS-STARTPTS[a${i}];`
          : `aevalsrc=0:c=stereo:s=44100:d=5,asetpts=PTS-STARTPTS[a${i}];`;

        filterParts.push(vFilter + aFilter);
        concatInputs.push(`[v${i}][a${i}]`);
      }
      const n = validClips.length;
      const fullFilter = `${filterParts.join('')}${concatInputs.join('')}concat=n=${n}:v=1:a=1[outv][outa]`;
      args.push('-filter_complex', fullFilter);
    }

    const safeWord = String(word || 'vocab').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 40) || 'vocab';
    const safeRatio = ratio.replace(':', 'x');
    const outFilename = `MoovyEng_${safeWord}_${safeRatio}.mp4`;
    const outPath = path.join(workDir, outFilename);

    args.push(
      '-map', '[outv]',
      '-map', '[outa]',
      '-c:v', 'libx264',
      '-preset', 'superfast',
      '-crf', '21',
      '-r', '30',
      '-vsync', 'cfr',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest',
      '-movflags', '+faststart',
      outPath
    );

    await runFfmpeg(ffmpegBin, args, 55000);

    if (!fs.existsSync(outPath) || fs.statSync(outPath).size < 5000) {
      throw new Error('FFmpeg output MP4 missing or empty');
    }

    const mp4Buffer = fs.readFileSync(outPath);
    return {
      buffer: mp4Buffer,
      filename: outFilename
    };
  } finally {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch (e) {}
  }
}
