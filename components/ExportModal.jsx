'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { RATIO_META } from '../lib/utils';

export default function ExportModal() {
  const {
    isExportModalOpen,
    setIsExportModalOpen,
    clipAspectRatio,
    setClipAspectRatio,
    word,
    activeClipSequence,
    cafeClipPool,
    caption,
    bgColor1,
    showToast,
    lang
  } = useVocab();

  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);

  if (!isExportModalOpen) return null;

  const meta = RATIO_META[clipAspectRatio] || RATIO_META['9:16'];

  const closeModal = () => {
    setIsExportModalOpen(false);
    setStatusMessage('');
    setDownloadLink('');
    setDownloadFilename('');
  };

  const handleCopyCaption = async () => {
    if (!caption) {
      showToast(lang === 'th' ? 'ไม่มีแคปชั่นให้คัดลอก' : 'No caption to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(caption);
      showToast(lang === 'th' ? 'คัดลอกแคปชั่นคำศัพท์เรียบร้อยแล้ว!' : 'Caption copied!');
    } catch (e) {
      showToast('Copy failed');
    }
  };

  // Save file letting the user choose where to save via File System Access API or browser download prompt
  const saveFileToUserChoice = async (blob, defaultFilename, mimeType = 'image/png', directUrl = null) => {
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const ext = mimeType === 'video/mp4' ? '.mp4' : '.png';
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: defaultFilename,
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
        if (err.name === 'AbortError') {
          return false; // User cancelled dialog
        }
        console.warn('showSaveFilePicker fallback:', err);
      }
    }

    // Direct HTTP URL (for videos) or persistent Blob URL (for images)
    const downloadHref = directUrl || (blob ? URL.createObjectURL(blob) : null);
    if (!downloadHref) return false;

    const link = document.createElement('a');
    link.href = downloadHref;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.remove();
      if (!directUrl && downloadHref.startsWith('blob:')) {
        URL.revokeObjectURL(downloadHref);
      }
    }, 30000);
    return true;
  };

  // Helper to capture slide using html2canvas directly from preview without any layout shifting
  const capturePhoneSlide = async (forVideo = false) => {
    const html2canvas = (await import('html2canvas')).default;
    const phone = document.getElementById('phone-container');
    const clipBox = document.getElementById('movie-clip-box');

    if (!phone) throw new Error('Phone preview container not found');

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready.catch(() => {});
    }

    const phoneRect = phone.getBoundingClientRect();
    const clipRect = clipBox ? clipBox.getBoundingClientRect() : { left: 0, top: 0, width: 356, height: 200 };

    const relRect = {
      xRatio: Math.max(0, (clipRect.left - phoneRect.left) / Math.max(1, phoneRect.width)),
      yRatio: Math.max(0, (clipRect.top - phoneRect.top) / Math.max(1, phoneRect.height)),
      wRatio: Math.min(1, clipRect.width / Math.max(1, phoneRect.width)),
      hRatio: Math.min(1, clipRect.height / Math.max(1, phoneRect.height))
    };

    const canvas = await html2canvas(phone, {
      scale: forVideo ? 2 : 2.5,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: bgColor1 || '#ffffff',
      ignoreElements: (element) => element.getAttribute('data-export-ignore') === 'true'
    });

    return {
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
      clipRect: relRect
    };
  };

  // 2. Export Video via Python composite compiler (Full sequence of active clips)
  const handleExportVideo = async (fitMode = 'pad') => {
    if (isExporting) return;
    const exportClips = activeClipSequence.length > 0
      ? activeClipSequence
      : (cafeClipPool.length > 0 ? [cafeClipPool[0]] : []);

    if (exportClips.length === 0) {
      showToast(lang === 'th' ? 'ยังไม่มีคลิปในคิว กรุณาเลือกคลิปก่อน' : 'Please select a clip first');
      return;
    }

    setIsExporting(true);
    setStatusMessage(
      lang === 'th'
        ? `กำลังเรนเดอร์วิดีโอจากหน้าพรีวิวสด (${clipAspectRatio}) รวม ${exportClips.length} คลิปเล่นต่อเนื่องไร้รอยต่อ...`
        : `Exporting seamless video (${clipAspectRatio}) with ${exportClips.length} clip(s)...`
    );

    try {
      const captured = await capturePhoneSlide(true);
      const cleanWord = (word || 'vocab').replace(/[^a-zA-Z0-9]/g, '_');

      const resp = await fetch('/api/cafe/python-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clips: exportClips,
          ratio: clipAspectRatio,
          word: cleanWord,
          fitMode: fitMode,
          slideImage: captured.dataUrl,
          clipRect: captured.clipRect
        })
      });

      let data;
      const respText = await resp.text();
      try {
        data = JSON.parse(respText);
      } catch (parseErr) {
        throw new Error(
          resp.status >= 500
            ? (lang === 'th' ? 'เซิร์ฟเวอร์ประมวลผลวิดีโอไม่สำเร็จ (กรุณาลองใหม่อีกครั้ง)' : `Server error (${resp.status})`)
            : respText.slice(0, 100)
        );
      }

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Python video export failed');
      }

      const dlUrl = `${data.publicUrl}?download=1`;
      const outFilename = data.filename || `MoovyEng_${cleanWord}_${clipAspectRatio.replace(':', 'x')}.mp4`;

      setDownloadLink(dlUrl);
      setDownloadFilename(outFilename);

      // Try file picker save, with fallback to direct HTTP download
      let saved = false;
      try {
        const videoFetch = await fetch(dlUrl);
        const videoBlob = await videoFetch.blob();
        saved = await saveFileToUserChoice(videoBlob, outFilename, 'video/mp4', dlUrl);
      } catch (saveErr) {
        saved = await saveFileToUserChoice(null, outFilename, 'video/mp4', dlUrl);
      }

      if (saved) {
        setStatusMessage(lang === 'th' ? `บันทึกวิดีโอ MP4 (${clipAspectRatio}) สำเร็จ!` : `Video exported successfully!`);
        showToast(lang === 'th' ? `Export วิดีโอ MP4 (${clipAspectRatio}) สำเร็จ!` : `Exported ${outFilename}!`);

        // Automatically purge server clips_cache and exports as user has chosen and saved the file
        setTimeout(async () => {
          try {
            await fetch('/api/cafe/clean-cache?all=1', { method: 'POST' }).catch(() => {});
            const baseOrigin = 'http://localhost:3001';
            await fetch(`${baseOrigin}/api/cafe/clean-cache?all=1`, { method: 'POST', mode: 'no-cors' }).catch(() => {});
          } catch (e) {}
        }, 800);
      } else {
        setStatusMessage(lang === 'th' ? 'ยกเลิกการบันทึก' : 'Save cancelled');
      }
    } catch (err) {
      console.error('Video export error:', err);
      setStatusMessage(`${lang === 'th' ? 'เกิดข้อผิดพลาดในการบันทึกวิดีโอ' : 'Export failed'}: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="export-modal" className="fixed inset-0 z-50 bg-[#0c0a09]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1917] rounded-2xl max-w-md w-full p-5 border border-[#e7e5e4] dark:border-[#292524] shadow-xl space-y-4 transform transition-all text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f0efed] dark:border-[#292524]">
          <div className="flex items-center space-x-2.5">
            <span className="w-7 h-7 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-xs">
              <i className="fa-solid fa-cloud-arrow-down" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white">
                {lang === 'th' ? 'Export ทั้งหน้าพรีวิว (สไลด์คำศัพท์ + คลิปหนัง 16:9)' : 'Export Slide & Movie Clips'}
              </h3>
              <p className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                {lang === 'th'
                  ? 'บันทึกเนื้อหาทั้งหมดจาก AI Agent พร้อมคลิปหนังลงโซเชียลตามสัดส่วนที่เลือก'
                  : 'Save full preview with movie clips for social media'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-7 h-7 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#777169] dark:text-[#a8a29e] flex items-center justify-center text-xs"
            title={lang === 'th' ? 'ปิด' : 'Close'}
            aria-label={lang === 'th' ? 'ปิด' : 'Close'}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Aspect Ratio Dropdown Selector inside Export Modal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#0c0a09] dark:text-white">
              {lang === 'th' ? '1. สัดส่วนภาพ (Aspect Ratio)' : '1. Aspect Ratio'}
            </label>
            <span id="modal-ratio-recommend" className="text-[10px] font-semibold text-[#0c0a09] dark:text-white">
              {clipAspectRatio}
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRatioDropdownOpen(!isRatioDropdownOpen)}
              id="btn-modal-ratio-dropdown"
              className="w-full px-3 py-2 rounded-xl border border-[#d6d3d1] dark:border-[#44403c] hover:border-[#0c0a09] dark:hover:border-white bg-[#fafafa] dark:bg-[#292524] hover:bg-white dark:hover:bg-[#1c1917] transition flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  id="modal-current-ratio-brown-box"
                  className={`${meta.boxClass} rounded-[4px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold tracking-tight shadow-2xs transition-all flex-shrink-0`}
                >
                  {clipAspectRatio}
                </div>
                <span id="modal-current-ratio-label-text" className="text-xs font-semibold text-[#0c0a09] dark:text-white">
                  {meta.text}
                </span>
              </div>
              <i className="fa-solid fa-chevron-down text-[10px] text-[#777169] dark:text-[#a8a29e]" />
            </button>

            {isRatioDropdownOpen && (
              <div
                id="modal-ratio-dropdown-menu"
                className="absolute left-0 right-0 mt-1.5 p-2 bg-white dark:bg-[#1c1917] rounded-xl border border-[#e7e5e4] dark:border-[#292524] shadow-[0_10px_28px_rgba(0,0,0,0.14)] z-50 grid grid-cols-2 gap-2"
              >
                {Object.entries(RATIO_META).map(([ratioKey, ratioInfo]) => (
                  <button
                    key={ratioKey}
                    type="button"
                    onClick={() => {
                      setClipAspectRatio(ratioKey);
                      setIsRatioDropdownOpen(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[#f5f5f4] dark:hover:bg-zinc-800 flex flex-col items-center justify-center transition"
                  >
                    <div className={`${ratioInfo.boxClass} rounded-[4px] bg-[#78716c] text-white flex items-center justify-center text-[10px] font-bold`}>
                      {ratioKey}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-semibold text-[#0c0a09] dark:text-white block">
            2. {lang === 'th' ? 'เลือกรูปแบบไฟล์ที่ต้องการ Export (บันทึกทั้งหน้าพรีวิว):' : 'Select Export Format:'}
          </label>

          {/* Option 1: MP4 Fit */}
          <button
            type="button"
            id="btn-export-mp4-fit"
            onClick={() => handleExportVideo('pad')}
            disabled={isExporting}
            className="w-full p-3.5 rounded-xl border border-[#e7e5e4] dark:border-[#292524] hover:border-[#0c0a09] dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-[#201d1a] transition flex items-center justify-between group text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-sm flex-shrink-0">
                <i className="fa-solid fa-film" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0c0a09] dark:text-white">
                  {lang === 'th'
                    ? `บันทึกวิดีโอทั้งหน้าพรีวิว + รวมคลิปหนัง (MP4 ${clipAspectRatio})`
                    : `Export Video with Preview + Movie Clips (MP4 ${clipAspectRatio})`}
                </div>
                <div className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                  {lang === 'th'
                    ? `ได้ทั้งคำศัพท์ ไวยากรณ์ ตัวอย่าง และคลิปหนังเล่นต่อเนื่องในขนาด ${clipAspectRatio}`
                    : `Complete preview video in ${clipAspectRatio}`}
                </div>
              </div>
            </div>
            <i className="fa-solid fa-download text-[#a8a29e] group-hover:text-[#0c0a09] dark:group-hover:text-white text-xs transition" />
          </button>

          {/* Option 2: Copy Caption */}
          <button
            type="button"
            onClick={handleCopyCaption}
            className="w-full p-3.5 rounded-xl border border-[#e7e5e4] dark:border-[#292524] hover:border-[#0c0a09] dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-[#201d1a] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm flex-shrink-0">
                <i className="fa-solid fa-hashtag" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0c0a09] dark:text-white">
                  {lang === 'th' ? 'คัดลอกแคปชั่นคำศัพท์ + แฮชแท็กโซเชียล' : 'Copy Social Caption & Hashtags'}
                </div>
                <div className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                  {lang === 'th' ? 'แคปชั่นสอนภาษาอังกฤษล้วน พร้อมนำไปวางโพสต์ทันที' : 'Ready to paste on TikTok/Reels'}
                </div>
              </div>
            </div>
            <i className="fa-solid fa-copy text-[#a8a29e] group-hover:text-[#0c0a09] dark:group-hover:text-white text-xs transition" />
          </button>
        </div>

        {/* Export Status Feedback */}
        {statusMessage && (
          <div id="export-status" className="p-2.5 rounded-lg bg-[#f0efed] dark:bg-[#201d1a] text-[#0c0a09] dark:text-white text-[11px] text-center font-medium space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              {isExporting ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-circle-check text-emerald-600" />}
              <span>{statusMessage}</span>
            </div>
            {downloadLink && (
              <a
                href={downloadLink}
                download={downloadFilename}
                onClick={() => {
                  setTimeout(async () => {
                    try {
                      await fetch('/api/cafe/clean-cache?all=1', { method: 'POST' }).catch(() => {});
                      await fetch('http://localhost:3001/api/cafe/clean-cache?all=1', { method: 'POST', mode: 'no-cors' }).catch(() => {});
                    } catch (e) {}
                  }, 1200);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-[10px] font-semibold transition"
              >
                <i className="fa-solid fa-download text-[9px]" /> {lang === 'th' ? 'ดาวน์โหลด' : 'Download'} ({downloadFilename})
              </a>
            )}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            onClick={closeModal}
            className="w-8 h-8 bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#292524] dark:text-white rounded-full transition flex items-center justify-center"
            title={lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
            aria-label={lang === 'th' ? 'ปิด' : 'Close'}
          >
            <i className="fa-solid fa-check text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
