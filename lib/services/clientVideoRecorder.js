/**
 * clientVideoRecorder.js
 * In-browser client-side video compositor and recorder using HTML5 Canvas & MediaRecorder.
 * Enables 100% serverless video export directly on Vercel without requiring Python or FFmpeg!
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

  // 1. Determine output canvas dimensions
  const is16x9 = ratio === '16:9';
  const outWidth = is16x9 ? 1920 : 1080;
  const outHeight = is16x9 ? 1080 : 1920;

  const canvas = document.createElement('canvas');
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext('2d', { alpha: false });

  // 2. Setup AudioContext for capturing audio stream
  let audioCtx = null;
  let audioDest = null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      audioDest = audioCtx.createMediaStreamDestination();
    }
  } catch (e) {
    console.warn('AudioContext not available:', e);
  }

  // 3. Setup canvas stream & MediaRecorder
  const canvasStream = canvas.captureStream ? canvas.captureStream(30) : null;
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
    videoBitsPerSecond: 4500000 // 4.5 Mbps
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

  // Hidden video element for sequencing and playing clips into canvas
  const hiddenVideo = document.createElement('video');
  hiddenVideo.crossOrigin = 'anonymous';
  hiddenVideo.playsInline = true;
  hiddenVideo.muted = false; // We connect to audioCtx
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
      audioSourceNode.connect(audioCtx.destination); // optional monitor
    } catch (e) {
      console.warn('createMediaElementSource error:', e);
    }
  }

  recorder.start(100);

  let isRecordingActive = true;

  // Render loop
  const renderFrame = () => {
    if (!isRecordingActive) return;

    // 1. Draw static slide background & typography
    ctx.drawImage(slideCanvas, 0, 0, outWidth, outHeight);

    // 2. Draw live video frame inside movie-clip-box coordinates (Fitted to 16:9 box with object-fit: cover, no black bars, no rounded corners)
    if (hiddenVideo.readyState >= 2 && !hiddenVideo.paused && !hiddenVideo.ended) {
      try {
        const vidW = hiddenVideo.videoWidth || 16;
        const vidH = hiddenVideo.videoHeight || 9;
        const targetAspect = vw / vh;
        const vidAspect = vidW / vidH;

        let srcX = 0, srcY = 0, srcW = vidW, srcH = vidH;
        if (vidAspect > targetAspect) {
          // Source video is wider than target frame: crop sides
          srcW = vidH * targetAspect;
          srcX = (vidW - srcW) / 2;
        } else {
          // Source video is narrower or taller: crop top/bottom
          srcH = vidW / targetAspect;
          srcY = (vidH - srcH) / 2;
        }

        ctx.drawImage(hiddenVideo, srcX, srcY, srcW, srcH, vx, vy, vw, vh);
      } catch (err) {
        // draw error ignored
      }
    }

    requestAnimationFrame(renderFrame);
  };
  requestAnimationFrame(renderFrame);

  try {
    // Play through each clip in order
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      onProgress(i + 1, clips.length, clip.title || `Clip ${i + 1}`);

      // Resolve streamable URL: proxy through /api/cafe/stream to guarantee CORS
      const fallbackTarget = clip.videoUrl || (clip.slug ? `https://clip.cafe/videos/${clip.slug.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mp4` : null);
      const streamUrl = `/api/cafe/stream?url=${encodeURIComponent(fallbackTarget)}`;

      hiddenVideo.src = streamUrl;
      hiddenVideo.currentTime = 0;

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
          console.warn('Clip playback error:', e);
          cleanup();
        };

        hiddenVideo.addEventListener('ended', onEnded);
        hiddenVideo.addEventListener('error', onError);

        // Max safety timeout per clip (15s)
        setTimeout(() => cleanup(), 15000);

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
