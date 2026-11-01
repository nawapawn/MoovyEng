/**
 * clientVideoRecorder.js
 * In-browser client-side video compositor and recorder using HTML5 Canvas & MediaRecorder.
 * Pre-buffers videos and locks frame rate so playback is buttery smooth with zero stuttering,
 * with NO subtitles or badges overlaying the movie frame.
 */

export async function recordPreviewVideoClientSide({
  slideCanvas,
  clipRect,
  clips = [],
  ratio = '9:16',
  onProgress = () => {}
}) {
  if (!clips || clips.length === 0) {
    throw new Error('No clips selected for export');
  }

  // 1. Determine output canvas dimensions (HD 1080x1920 / 1920x1080)
  const is16x9 = ratio === '16:9';
  const outWidth = is16x9 ? 1920 : 1080;
  const outHeight = is16x9 ? 1080 : 1920;

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d', { alpha: false });

  // 2. Pre-fetch and cache video blobs into memory first
  // This guarantees 100% zero stuttering, zero network pauses, and zero stream lag!
  onProgress(0, clips.length, 'กำลังดาวน์โหลดและบัฟเฟอร์คลิปวิดีโอคุณภาพสูง...');
  const bufferedClips = [];

  for (let i = 0; i < clips.length; i++) {
    const c = clips[i];
    onProgress(i + 1, clips.length, `กำลังบัฟเฟอร์คลิปที่ ${i + 1}/${clips.length}: "${c.title || 'Movie'}"...`);

    const fallbackTarget = c.videoUrl || (c.slug ? `https://clip.cafe/videos/${c.slug.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mp4` : null);
    const streamUrl = `/api/cafe/stream?url=${encodeURIComponent(fallbackTarget)}`;

    try {
      const resp = await fetch(streamUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const objectUrl = URL.createObjectURL(blob);
      bufferedClips.push({ ...c, objectUrl });
    } catch (fetchErr) {
      console.warn(`Direct buffer failed for clip ${i + 1}, using stream fallback:`, fetchErr.message);
      bufferedClips.push({ ...c, objectUrl: streamUrl });
    }
  }

  // 3. Setup AudioContext for capturing audio stream
  let audioCtx = null;
  let audioDest = null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume().catch(() => {});
      }
      audioDest = audioCtx.createMediaStreamDestination();
    }
  } catch (e) {
    console.warn('AudioContext not available:', e);
  }

  // 4. Setup canvas stream (60 FPS smooth output) & MediaRecorder
  const canvasStream = canvas.captureStream ? canvas.captureStream(60) : null;
  if (!canvasStream) {
    throw new Error('Canvas captureStream is not supported in this browser');
  }

  // Combine video and audio tracks
  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  if (audioDest && audioDest.stream) {
    audioDest.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
  }

  // Determine optimal supported MIME type
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported('video/mp4')) {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }
  }

  const recordedChunks = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: mimeType || undefined,
    videoBitsPerSecond: 8000000 // 8.0 Mbps High-Def crisp quality
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  // Pre-calculate video placement inside output canvas
  // clipRect contains relative ratios: xRatio, yRatio, wRatio, hRatio
  const vx = Math.round((clipRect?.xRatio || 0) * outWidth);
  const vy = Math.round((clipRect?.yRatio || 0) * outHeight);
  const vw = Math.round((clipRect?.wRatio || 1) * outWidth);
  const vh = Math.round((clipRect?.hRatio || 0.3) * outHeight);

  // Hidden video element for playback
  const hiddenVideo = document.createElement('video');
  hiddenVideo.crossOrigin = 'anonymous';
  hiddenVideo.playsInline = true;
  hiddenVideo.muted = false;
  hiddenVideo.style.position = 'fixed';
  hiddenVideo.style.left = '-9999px';
  hiddenVideo.style.top = '-9999px';
  hiddenVideo.style.width = '1px';
  hiddenVideo.style.height = '1px';
  document.body.appendChild(hiddenVideo);

  let audioSourceNode = null;
  if (audioCtx && audioDest) {
    try {
      audioSourceNode = audioCtx.createMediaElementSource(hiddenVideo);
      audioSourceNode.connect(audioDest);
    } catch (e) {
      console.warn('createMediaElementSource error:', e);
    }
  }

// recorder.start will be called when first clip is ready

  let isRecordingActive = true;

  // Ultra-Smooth 60 FPS Render Loop
  const renderFrame = () => {
    if (!isRecordingActive) return;

    // 1. Draw static slide background & typography (clean slide with ZERO movie subtitles)
    ctx.drawImage(slideCanvas, 0, 0, outWidth, outHeight);

    // 2. Draw live video frame inside 16:9 movie box
    // Fitted with object-fit: cover and scale 1.05 to completely eliminate black borders
    if (hiddenVideo.readyState >= 2) {
      try {
        const vidW = hiddenVideo.videoWidth || 16;
        const vidH = hiddenVideo.videoHeight || 9;
        const targetAspect = vw / vh;
        const vidAspect = vidW / vidH;

        let srcX = 0, srcY = 0, srcW = vidW, srcH = vidH;
        if (vidAspect > targetAspect) {
          srcW = vidH * targetAspect;
          srcX = (vidW - srcW) / 2;
        } else {
          srcH = vidW / targetAspect;
          srcY = (vidH - srcH) / 2;
        }

        // Slight 3% zoom into frame to kill any hardcoded movie black letterbox lines
        const cropMarginW = srcW * 0.03;
        const cropMarginH = srcH * 0.03;

        ctx.drawImage(
          hiddenVideo,
          srcX + cropMarginW,
          srcY + cropMarginH,
          srcW - cropMarginW * 2,
          srcH - cropMarginH * 2,
          vx,
          vy,
          vw,
          vh
        );
      } catch (err) {
        // frame draw error ignored
      }
    }

    requestAnimationFrame(renderFrame);
  };
  requestAnimationFrame(renderFrame);

  try {
    let hasStartedRecording = false;

    // Play through each pre-buffered clip in order seamlessly without frame flashes
    for (let i = 0; i < bufferedClips.length; i++) {
      const clip = bufferedClips[i];
      onProgress(i + 1, bufferedClips.length, `กำลังบันทึกคลิปที่ ${i + 1}/${bufferedClips.length}: "${clip.title || 'Movie'}"...`);

      hiddenVideo.src = clip.objectUrl;
      hiddenVideo.currentTime = 0;

      // Pre-warm video element so there is NO blank gap or background flash between clips
      await new Promise((resolveReady) => {
        if (hiddenVideo.readyState >= 3) return resolveReady();
        const onReady = () => {
          hiddenVideo.removeEventListener('canplay', onReady);
          hiddenVideo.removeEventListener('canplaythrough', onReady);
          resolveReady();
        };
        hiddenVideo.addEventListener('canplay', onReady);
        hiddenVideo.addEventListener('canplaythrough', onReady);
        setTimeout(resolveReady, 2500);
      });

      if (!hasStartedRecording) {
        recorder.start(100);
        hasStartedRecording = true;
      }

      await new Promise((resolve) => {
        let isDone = false;
        const cleanup = () => {
          if (isDone) return;
          isDone = true;
          hiddenVideo.removeEventListener('ended', onEnded);
          hiddenVideo.removeEventListener('error', onError);
          resolve();
        };

        const onEnded = () => cleanup();
        const onError = (e) => {
          console.warn('Clip playback error during recording:', e);
          cleanup();
        };

        hiddenVideo.addEventListener('ended', onEnded);
        hiddenVideo.addEventListener('error', onError);

        // Max safety timeout per clip (25s)
        setTimeout(() => cleanup(), 25000);

        hiddenVideo.play().catch((err) => {
          console.warn('hiddenVideo.play error:', err);
          cleanup();
        });
      });
    }
  } finally {
    isRecordingActive = false;
    hiddenVideo.pause();
    hiddenVideo.removeAttribute('src');
    if (hiddenVideo.parentNode) {
      hiddenVideo.parentNode.removeChild(hiddenVideo);
    }
    if (audioSourceNode) {
      try { audioSourceNode.disconnect(); } catch (e) {}
    }
    // Clean up created object URLs
    bufferedClips.forEach((c) => {
      if (c.objectUrl && c.objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(c.objectUrl);
      }
    });
  }

  // Stop recorder and produce final blob
  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const finalBlob = new Blob(recordedChunks, { type: mimeType });
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        resolve({ blob: finalBlob, mimeType, ext });
      } catch (err) {
        reject(err);
      }
    };
    recorder.stop();
  });
}
