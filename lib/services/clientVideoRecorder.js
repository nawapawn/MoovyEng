/**
 * clientVideoRecorder.js
 * In-browser client-side video compositor and recorder using HTML5 Canvas & MediaRecorder.
 *
 * Key architecture guarantees:
 * 1. Pre-fetches and validates every clip into an individual pre-warmed <video> element
 *    BEFORE creating canvas.captureStream() or starting MediaRecorder.
 * 2. Draws the initial composite frame onto the canvas BEFORE calling canvas.captureStream()
 *    so Chrome/Edge never drop the video track or produce an audio-only file.
 * 3. Uses explicit video/mp4 H.264 (avc1) or VP9/VP8 codec strings and validates that the
 *    stream has an active video track.
 * 4. Drives the render loop with BOTH requestAnimationFrame AND a 30fps background setInterval
 *    timer so recording never stalls or drops frames even if the browser tab is occluded.
 * 5. Maintains a persistent lastValidFrameCanvas buffer so there is zero black flash between clips,
 *    and ZERO subtitle or badge overlays in the exported video.
 */

function resolveClipStreamUrl(clip) {
  if (!clip) return null;
  if (clip.localVideoUrl && clip.localVideoUrl.startsWith('/')) {
    return clip.localVideoUrl;
  }
  const rawSlug = (clip.slug || clip.id || '').replace(/^cafe_/, '').trim();
  const directUrl =
    clip.videoUrl && (clip.videoUrl.startsWith('http://') || clip.videoUrl.startsWith('https://'))
      ? clip.videoUrl
      : rawSlug
        ? `https://clip.cafe/videos/${rawSlug.replace(/[^a-zA-Z0-9_\-]/g, '_')}.mp4`
        : null;

  if (!directUrl) return null;
  return `/api/cafe/stream?url=${encodeURIComponent(directUrl)}`;
}

async function prepareAndValidateVideoClip(clip, index, total, onProgress) {
  const title = clip.title || clip.movieTitle || `Clip ${index + 1}`;
  onProgress(index + 1, total, `กำลังโหลดและเตรียมคลิปที่ ${index + 1}/${total}: "${title}"...`);

  const streamUrl = resolveClipStreamUrl(clip);
  if (!streamUrl) return null;

  let objectUrl = null;
  try {
    const resp = await fetch(streamUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    if (blob.size < 1000) throw new Error('Video blob too small');
    const mp4Blob = blob.type && blob.type.includes('video') ? blob : new Blob([blob], { type: 'video/mp4' });
    objectUrl = URL.createObjectURL(mp4Blob);
  } catch (err) {
    console.warn(`[Recorder] Blob fetch failed for clip ${index + 1}, falling back to stream URL:`, err.message);
    objectUrl = streamUrl;
  }

  const vid = document.createElement('video');
  vid.crossOrigin = 'anonymous';
  vid.playsInline = true;
  vid.preload = 'auto';
  vid.muted = false;
  vid.volume = 1.0;
  // Keep offscreen with real dimensions so Chromium hardware video decoder always decodes frames
  vid.style.position = 'fixed';
  vid.style.left = '-9999px';
  vid.style.top = '0px';
  vid.style.width = '320px';
  vid.style.height = '180px';
  vid.style.opacity = '0';
  vid.style.pointerEvents = 'none';
  document.body.appendChild(vid);

  const isLoaded = await new Promise((resolve) => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      vid.removeEventListener('loadeddata', onLoaded);
      vid.removeEventListener('canplay', onLoaded);
      vid.removeEventListener('error', onError);
      resolve(ok);
    };
    const onLoaded = () => {
      if (vid.videoWidth > 0 && vid.videoHeight > 0) {
        finish(true);
      }
    };
    const onError = () => finish(false);

    vid.addEventListener('loadeddata', onLoaded);
    vid.addEventListener('canplay', onLoaded);
    vid.addEventListener('error', onError);

    setTimeout(() => {
      finish(vid.readyState >= 2 && vid.videoWidth > 0);
    }, 8000);

    vid.src = objectUrl;
    vid.load();
  });

  if (!isLoaded || vid.videoWidth === 0) {
    try {
      vid.pause();
      vid.removeAttribute('src');
      if (vid.parentNode) vid.parentNode.removeChild(vid);
      if (objectUrl && objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    } catch (e) {}
    return null;
  }

  // Seek slightly into the first frame (0.02s) so the decoder has a concrete non-black RGB frame ready
  await new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      vid.removeEventListener('seeked', finish);
      resolve();
    };
    vid.addEventListener('seeked', finish);
    setTimeout(finish, 800);
    try {
      vid.currentTime = 0.01;
    } catch (e) {
      finish();
    }
  });

  return {
    clip,
    title,
    vid,
    objectUrl
  };
}

function selectSupportedVideoMimeType() {
  const candidates = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1,opus',
    'video/mp4;codecs=avc1',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/mp4',
    'video/webm'
  ];
  if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
  }
  return '';
}

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

  // Pre-calculate 16:9 movie placement inside output canvas
  const vx = Math.round((clipRect?.xRatio ?? 0.025) * outWidth);
  const vy = Math.round((clipRect?.yRatio ?? 0.285) * outHeight);
  const vw = Math.max(2, Math.round((clipRect?.wRatio ?? 0.95) * outWidth));
  const vh = Math.max(2, Math.round((clipRect?.hRatio ?? 0.30) * outHeight));

  // Offscreen buffer holding the most recent valid video frame so there is NEVER a black frame gap
  const lastFrameCanvas = document.createElement('canvas');
  lastFrameCanvas.width = vw;
  lastFrameCanvas.height = vh;
  const lastFrameCtx = lastFrameCanvas.getContext('2d', { alpha: false });
  let hasValidLastFrame = false;

  // Helper to draw a video element's current frame into lastFrameCanvas using uniform cover + 3% anti-letterbox crop
  const updateLastFrameFromVideo = (videoEl) => {
    if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      return false;
    }
    try {
      const vidW = videoEl.videoWidth;
      const vidH = videoEl.videoHeight;
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

      const cropMarginW = srcW * 0.03;
      const cropMarginH = srcH * 0.03;

      lastFrameCtx.drawImage(
        videoEl,
        srcX + cropMarginW,
        srcY + cropMarginH,
        srcW - cropMarginW * 2,
        srcH - cropMarginH * 2,
        0,
        0,
        vw,
        vh
      );
      hasValidLastFrame = true;
      return true;
    } catch (e) {
      return false;
    }
  };

  // 2. Pre-fetch, decode, and validate all clips BEFORE starting MediaRecorder
  const preparedClips = [];
  for (let i = 0; i < clips.length; i++) {
    const readyItem = await prepareAndValidateVideoClip(clips[i], i, clips.length, onProgress);
    if (readyItem) {
      preparedClips.push(readyItem);
    }
  }

  if (preparedClips.length === 0) {
    throw new Error('ไม่สามารถโหลดไฟล์วิดีโอจากเซิร์ฟเวอร์ได้ กรุณาลองกดค้นหาคลิปใหม่อีกครั้ง');
  }

  // Seed lastFrameCanvas with the very first clip's decoded first frame immediately
  updateLastFrameFromVideo(preparedClips[0].vid);

  // Draw the complete initial composite frame onto canvas BEFORE captureStream()
  const drawCompositeFrame = (activeVideoEl) => {
    ctx.drawImage(slideCanvas, 0, 0, outWidth, outHeight);
    if (activeVideoEl) {
      updateLastFrameFromVideo(activeVideoEl);
    }
    if (hasValidLastFrame) {
      ctx.drawImage(lastFrameCanvas, vx, vy, vw, vh);
    }
  };

  drawCompositeFrame(preparedClips[0].vid);

  // 3. Setup AudioContext and connect all prepared video elements
  let audioCtx = null;
  let audioDest = null;
  const audioNodes = [];

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume().catch(() => {});
      }
      audioDest = audioCtx.createMediaStreamDestination();

      // Add a silent oscillator so the audio stream always has a continuous clock even between clips
      try {
        const osc = audioCtx.createOscillator();
        const silentGain = audioCtx.createGain();
        silentGain.gain.value = 0.00001;
        osc.connect(silentGain);
        silentGain.connect(audioDest);
        osc.start();
        audioNodes.push(osc, silentGain);
      } catch (e) {}

      for (const item of preparedClips) {
        try {
          const source = audioCtx.createMediaElementSource(item.vid);
          source.connect(audioDest);
          audioNodes.push(source);
        } catch (e) {
          console.warn('[Recorder] createMediaElementSource error:', e);
        }
      }
    }
  } catch (e) {
    console.warn('[Recorder] AudioContext setup error:', e);
  }

  // 4. Create canvas captureStream right before starting MediaRecorder
  const fps = 30;
  const canvasStream = canvas.captureStream ? canvas.captureStream(fps) : null;
  if (!canvasStream || canvasStream.getVideoTracks().length === 0) {
    throw new Error('เบราว์เซอร์ไม่รองรับการบันทึกวิดีโอจากแคนวาส (Canvas captureStream)');
  }

  const combinedStream = new MediaStream();
  canvasStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));
  if (audioDest && audioDest.stream) {
    audioDest.stream.getAudioTracks().forEach((t) => combinedStream.addTrack(t));
  }

  const mimeType = selectSupportedVideoMimeType();
  const recordedChunks = [];
  const recorderOptions = {
    videoBitsPerSecond: 8000000
  };
  if (mimeType) {
    recorderOptions.mimeType = mimeType;
  }

  const recorder = new MediaRecorder(combinedStream, recorderOptions);
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  let currentActiveVideo = preparedClips[0].vid;
  let isRecordingActive = true;

  // Dual-driver render loop: requestAnimationFrame + 30fps setInterval fallback (in case tab is in background)
  const renderTick = () => {
    if (!isRecordingActive) return;
    drawCompositeFrame(currentActiveVideo);
    const track = canvasStream.getVideoTracks()[0];
    if (track && typeof track.requestFrame === 'function') {
      try { track.requestFrame(); } catch (e) {}
    }
  };

  const rafLoop = () => {
    if (!isRecordingActive) return;
    renderTick();
    requestAnimationFrame(rafLoop);
  };

  const intervalId = setInterval(renderTick, Math.round(1000 / fps));
  requestAnimationFrame(rafLoop);

  // Start recording immediately now that initial frame is drawn and stream is active
  recorder.start(100);

  try {
    for (let i = 0; i < preparedClips.length; i++) {
      const item = preparedClips[i];
      const vid = item.vid;
      currentActiveVideo = vid;

      onProgress(i + 1, preparedClips.length, item.title);

      // Ensure video starts from beginning
      try {
        if (vid.currentTime > 0.1) {
          vid.currentTime = 0;
        }
      } catch (e) {}

      await new Promise((resolveClipPlay) => {
        let finished = false;
        let lastCurrentTime = -1;
        let stallTicks = 0;

        const expectedDurationMs =
          Number.isFinite(vid.duration) && vid.duration > 0
            ? Math.min(30000, Math.ceil(vid.duration * 1000) + 2500)
            : 18000;

        const safetyTimer = setTimeout(() => {
          cleanup();
        }, expectedDurationMs);

        // Watchdog to detect if playback stalled or ended without firing event
        const watchdogInterval = setInterval(() => {
          if (vid.ended) {
            cleanup();
            return;
          }
          if (Number.isFinite(vid.duration) && vid.duration > 0 && vid.currentTime >= vid.duration - 0.08) {
            cleanup();
            return;
          }
          if (!vid.paused) {
            if (Math.abs(vid.currentTime - lastCurrentTime) < 0.001) {
              stallTicks++;
              if (stallTicks >= 12) {
                // Stalled for ~2.4 seconds -> try nudging or move to next clip
                cleanup();
              }
            } else {
              stallTicks = 0;
              lastCurrentTime = vid.currentTime;
            }
          }
        }, 200);

        const cleanup = () => {
          if (finished) return;
          finished = true;
          clearTimeout(safetyTimer);
          clearInterval(watchdogInterval);
          vid.removeEventListener('ended', onEnded);
          vid.removeEventListener('error', onError);
          try { vid.pause(); } catch (e) {}
          resolveClipPlay();
        };

        const onEnded = () => cleanup();
        const onError = () => cleanup();

        vid.addEventListener('ended', onEnded);
        vid.addEventListener('error', onError);

        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }

        vid.play().catch((err) => {
          console.warn('[Recorder] Play error on clip, attempting muted fallback:', err);
          vid.muted = true;
          vid.play().catch(() => cleanup());
        });
      });
    }
  } finally {
    isRecordingActive = false;
    clearInterval(intervalId);

    for (const item of preparedClips) {
      try {
        item.vid.pause();
        item.vid.removeAttribute('src');
        if (item.vid.parentNode) item.vid.parentNode.removeChild(item.vid);
      } catch (e) {}
      if (item.objectUrl && item.objectUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(item.objectUrl); } catch (e) {}
      }
    }

    for (const node of audioNodes) {
      try {
        if (typeof node.stop === 'function') node.stop();
        node.disconnect();
      } catch (e) {}
    }

    if (audioCtx && typeof audioCtx.close === 'function') {
      try { await audioCtx.close(); } catch (e) {}
    }
  }

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const actualMime = recorder.mimeType || mimeType || 'video/mp4';
        const finalBlob = new Blob(recordedChunks, { type: actualMime });
        const ext = actualMime.includes('mp4') ? 'mp4' : 'webm';
        resolve({ blob: finalBlob, mimeType: actualMime, ext });
      } catch (err) {
        reject(err);
      }
    };
    try {
      recorder.stop();
    } catch (err) {
      reject(err);
    }
  });
}
