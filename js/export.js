/**
 * ============================================================================
 * MoovyEng — Export Canvas, High-Res PNG & Python Video Engine
 * ============================================================================
 */

let isExportingNow = false;

function getBackendOrigin() {
  if (window.location.protocol.startsWith('http') && window.location.port === '3001') {
    return window.location.origin;
  }
  return 'http://127.0.0.1:3001';
}

function openExportModal() {
  const modal = document.getElementById('export-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeExportModal() {
  const modal = document.getElementById('export-modal');
  const status = document.getElementById('export-status');
  if (modal) modal.classList.add('hidden');
  if (status) status.classList.add('hidden');
}

async function captureFullPreviewSlideAndRect(forVideoExport = false) {
  const phone = document.getElementById('phone-container');
  const clipBox = document.getElementById('movie-clip-box');
  const video = document.getElementById('preview-video');

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready.catch(() => {});
  }

  const phoneRect = phone ? phone.getBoundingClientRect() : { left: 0, top: 0, width: 414, height: 736 };
  const clipRect = clipBox ? clipBox.getBoundingClientRect() : { left: 0, top: 0, width: 356, height: 200 };

  const relRect = {
    xRatio: Math.max(0, (clipRect.left - phoneRect.left) / Math.max(1, phoneRect.width)),
    yRatio: Math.max(0, (clipRect.top - phoneRect.top) / Math.max(1, phoneRect.height)),
    wRatio: Math.min(1, clipRect.width / Math.max(1, phoneRect.width)),
    hRatio: Math.min(1, clipRect.height / Math.max(1, phoneRect.height))
  };

  const wasVideoPlaying = video && !video.paused && !video.classList.contains('hidden');
  if (wasVideoPlaying) {
    video.pause();
  }

  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(phone, {
    scale: forVideoExport ? 2 : 2.5,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#fafafa',
    onclone: (clonedDoc) => {
      const clonedPhone = clonedDoc.getElementById('phone-container');
      if (!clonedPhone) return;
      clonedPhone.style.transition = 'none';
      const clonedVideo = clonedDoc.getElementById('preview-video');
      const clonedImg = clonedDoc.getElementById('preview-movie-img');
      if (clonedVideo) clonedVideo.classList.add('hidden');
      if (clonedImg && clonedImg.getAttribute('src')) {
        clonedImg.classList.remove('hidden');
      }
      clonedPhone.querySelectorAll('[data-export-ignore="true"]').forEach(el => {
        el.style.opacity = '0';
      });
    }
  });

  return {
    canvas,
    dataUrl: canvas.toDataURL('image/png'),
    clipRect: relRect
  };
}

async function triggerBlobDownload(blob, filename, mimeType = 'image/png') {
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const ext = mimeType === 'video/mp4' ? '.mp4' : '.png';
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: mimeType === 'video/mp4' ? 'MP4 Video' : 'PNG Image',
            accept: { [mimeType]: [ext] }
          }
        ]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
    }
  }

  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }, 5000);
  return true;
}

async function exportPhoneAsImage() {
  if (isExportingNow) return;
  isExportingNow = true;
  const status = document.getElementById('export-status');
  const ratio = currentClipAspectRatio || '9:16';
  if (status) {
    status.classList.remove('hidden');
    status.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>กำลังเรนเดอร์ภาพทั้งหน้าพรีวิว (${ratio}) ความละเอียดสูง...`;
  }

  try {
    const captured = await captureFullPreviewSlideAndRect(false);
    const word = (document.getElementById('preview-word')?.textContent.trim() || 'vocab').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `MoovyEng_${word}_slide_${ratio.replace(':', 'x')}.png`;

    await new Promise((resolve, reject) => {
      captured.canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas toBlob failed'));
        triggerBlobDownload(blob, filename);
        resolve();
      }, 'image/png');
    });

    if (status) status.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>บันทึกภาพสไลด์พรีวิว (${ratio}) เรียบร้อยแล้ว!`;
    showToast(`บันทึกภาพ PNG (${ratio}) สำเร็จ!`);
  } catch (e) {
    console.error('Image export error:', e);
    if (status) status.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-600 mr-1"></i>เกิดข้อผิดพลาดในการเรนเดอร์ภาพ: ${e.message || ''}`;
  } finally {
    isExportingNow = false;
  }
}

async function exportClipVideo(fitMode = 'pad') {
  if (isExportingNow) return;
  // Always restrict to exactly 1 single clip
  let clipsToExport = activeClipSequence && activeClipSequence.length > 0
    ? [activeClipSequence[0]]
    : (cafeClipPool.length > 0 ? [cafeClipPool[0]] : []);

  if (clipsToExport.length === 0) {
    showToast('ยังไม่มีคลิปวิดีโอที่เลือก กรุณาค้นหาและเลือกคลิปก่อน');
    return;
  }

  isExportingNow = true;
  const status = document.getElementById('export-status');
  const ratio = currentClipAspectRatio || '9:16';
  const word = (document.getElementById('preview-word')?.textContent.trim() || 'vocab').replace(/[^a-zA-Z0-9]/g, '_');

  if (status) {
    status.classList.remove('hidden');
    status.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-1.5"></i>กำลังเรนเดอร์จากพรีวิวสด (${ratio}) สำหรับ 1 คลิปด้วย Python...`;
  }

  try {
    const captured = await captureFullPreviewSlideAndRect(true);
    const baseOrigin = getBackendOrigin();

    const resp = await fetch(`${baseOrigin}/api/cafe/python-export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clips: clipsToExport,
        ratio: ratio,
        word: word,
        fitMode: fitMode,
        slideImage: captured.dataUrl,
        clipRect: captured.clipRect
      })
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) {
      throw new Error(data.error || 'Python video export failed');
    }

    const downloadUrl = `${baseOrigin}${data.publicUrl}?download=1`;
    const outFilename = data.filename || `MoovyEng_${word}_${ratio.replace(':', 'x')}.mp4`;

    if (status) {
      status.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-1.5"></i>เรนเดอร์สำเร็จ! กำลังเปิดหน้าต่างบันทึกไฟล์ (${outFilename})...`;
    }

    try {
      const fileResp = await fetch(downloadUrl);
      if (!fileResp.ok) throw new Error(`HTTP ${fileResp.status}`);
      const videoBlob = await fileResp.blob();
      await triggerBlobDownload(videoBlob, outFilename, 'video/mp4');
    } catch (dlErr) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = outFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    if (status) {
      status.innerHTML = `
        <div class="flex flex-col items-center gap-1.5">
          <div><i class="fa-solid fa-circle-check text-emerald-600 mr-1.5"></i>บันทึกวิดีโอขนาด ${ratio} สำเร็จ!</div>
          <a href="${downloadUrl}" download="${outFilename}" onclick="setTimeout(() => { fetch('${baseOrigin}/api/cafe/clean-cache?all=1', { method: 'POST', mode: 'no-cors' }).catch(()=>{}); }, 1200);" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c0a09] text-white text-[10px] font-semibold hover:bg-[#292524] transition">
            <i class="fa-solid fa-download text-[9px]"></i> ดาวน์โหลดซ้ำ (${outFilename})
          </a>
        </div>
      `;
    }
    showToast(`Export วิดีโอ MP4 (${ratio}) สำเร็จ!`);

    // Clean clips_cache and exports on disk automatically once downloaded
    setTimeout(async () => {
      try {
        await fetch(`${baseOrigin}/api/cafe/clean-cache?all=1`, { method: 'POST', mode: 'no-cors' }).catch(() => {});
      } catch (e) {}
    }, 1000);
  } catch (err) {
    console.error('Python export error:', err);
    if (status) status.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-600 mr-1.5"></i>เกิดข้อผิดพลาดในการบันทึกวิดีโอ: ${err.message}`;
  } finally {
    isExportingNow = false;
  }
}

function copyTikTokCaption() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const textToCopy = saved.caption || document.getElementById('social-description')?.value || '';
  if (!textToCopy) {
    showToast('ยังไม่มีแคปชั่นสำหรับคัดลอก');
    return;
  }
  navigator.clipboard.writeText(textToCopy).then(() => {
    const status = document.getElementById('export-status');
    if (status) {
      status.classList.remove('hidden');
      status.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i>คัดลอกแคปชั่นลงคลิปบอร์ดแล้ว!';
    }
    showToast('คัดลอกแคปชั่นสำเร็จ!');
  });
}
