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

  // Helper to capture slide using html2canvas
  const capturePhoneSlide = async (forVideo = false) => {
    const html2canvas = (await import('html2canvas')).default;
    const phone = document.getElementById('phone-container');
    const clipBox = document.getElementById('movie-clip-box');

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

    const canvas = await html2canvas(phone, {
      scale: forVideo ? 2 : 2.5,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: null,
      ignoreElements: (element) => element.getAttribute('data-export-ignore') === 'true'
    });

    return {
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
      clipRect: relRect
    };
  };

  // 1. Export High-Res PNG
  const handleExportPng = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setStatusMessage(lang === 'th' ? `กำลังเรนเดอร์ภาพสไลด์ PNG (${clipAspectRatio})...` : `Rendering PNG slide (${clipAspectRatio})...`);

    try {
      const { canvas } = await capturePhoneSlide(false);
      const cleanWord = (word || 'vocab').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `movyEng_${cleanWord}_slide_${clipAspectRatio.replace(':', 'x')}.png`;

      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob creation failed');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);

        setStatusMessage(lang === 'th' ? 'บันทึกรูปภาพ PNG เรียบร้อย!' : 'PNG downloaded successfully!');
        showToast(lang === 'th' ? `บันทึกรูปภาพ ${filename} สำเร็จ!` : `Exported ${filename}!`);
      }, 'image/png');
    } catch (err) {
      console.error('PNG export error:', err);
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export Video via Python composite compiler
  const handleExportVideo = async (fitMode = 'pad') => {
    if (isExporting) return;
    const clipsToExport = activeClipSequence.length > 0 ? activeClipSequence : (cafeClipPool.length > 0 ? [cafeClipPool[0]] : []);

    if (clipsToExport.length === 0) {
      showToast(lang === 'th' ? 'ยังไม่มีคลิปในคิว กรุณาเลือกคลิปก่อน' : 'Please select clips first');
      return;
    }

    setIsExporting(true);
    setStatusMessage(
      lang === 'th'
        ? `กำลังจับภาพพื้นหลังพรีวิว (${clipAspectRatio}) และรวมคลิป 16:9 ทั้ง ${clipsToExport.length} เรื่องด้วย Python...`
        : `Exporting video (${clipAspectRatio}) with Python engine...`
    );

    try {
      const captured = await capturePhoneSlide(true);
      const cleanWord = (word || 'vocab').replace(/[^a-zA-Z0-9]/g, '_');

      const resp = await fetch('/api/cafe/python-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clips: clipsToExport,
          ratio: clipAspectRatio,
          word: cleanWord,
          fitMode: fitMode,
          slideImage: captured.dataUrl,
          clipRect: captured.clipRect
        })
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Python video export failed');
      }

      const dlUrl = `${data.publicUrl}?download=1`;
      const outFilename = data.filename || `movyEng_${cleanWord}_${clipAspectRatio.replace(':', 'x')}.mp4`;

      setDownloadLink(dlUrl);
      setDownloadFilename(outFilename);

      // Auto trigger download
      const link = document.createElement('a');
      link.href = dlUrl;
      link.download = outFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatusMessage(lang === 'th' ? `บันทึกวิดีโอ MP4 (${clipAspectRatio}) สำเร็จ!` : `Video exported successfully!`);
      showToast(lang === 'th' ? `Export วิดีโอ MP4 (${clipAspectRatio}) สำเร็จ!` : `Exported ${outFilename}!`);
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
            title="ปิด"
            aria-label="ปิด"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Aspect Ratio Dropdown Selector inside Export Modal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#0c0a09] dark:text-white">1. Aspect Ratio</label>
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
                className="absolute left-0 right-0 mt-1.5 p-2 bg-white dark:bg-[#1c1917] rounded-xl border border-[#e7e5e4] dark:border-[#292524] shadow-[0_10px_28px_rgba(0,0,0,0.14)] z-50 grid grid-cols-3 gap-1.5"
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
            onClick={() => handleExportVideo('pad')}
            disabled={isExporting}
            className="w-full p-3 rounded-xl border border-[#e7e5e4] dark:border-[#292524] hover:border-[#0c0a09] dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-[#201d1a] transition flex items-center justify-between group text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-sm flex-shrink-0">
                <i className="fa-solid fa-film" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0c0a09] dark:text-white">
                  {lang === 'th'
                    ? 'บันทึกวิดีโอทั้งหน้าพรีวิว + รวมคิวคลิปหนัง 16:9 (MP4 Fit)'
                    : 'Video with Full Preview + Movie Clips (MP4 Fit)'}
                </div>
                <div className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                  {lang === 'th'
                    ? `ได้ทั้งคำศัพท์ ไวยากรณ์ ตัวอย่าง และคลิปหนังเล่นต่อกันในขนาด ${clipAspectRatio}`
                    : `Complete preview video in ${clipAspectRatio}`}
                </div>
              </div>
            </div>
            <i className="fa-solid fa-download text-[#a8a29e] group-hover:text-[#0c0a09] dark:group-hover:text-white text-xs transition" />
          </button>

          {/* Option 2: MP4 Fill */}
          <button
            type="button"
            onClick={() => handleExportVideo('crop')}
            disabled={isExporting}
            className="w-full p-3 rounded-xl border border-[#e7e5e4] dark:border-[#292524] hover:border-[#0c0a09] dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-[#201d1a] transition flex items-center justify-between group text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm flex-shrink-0">
                <i className="fa-solid fa-crop-simple" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0c0a09] dark:text-white">
                  {lang === 'th'
                    ? 'บันทึกวิดีโอทั้งหน้าพรีวิว + คลิปหนังเต็มกรอบ 16:9 (MP4 Fill)'
                    : 'Video with Zoom-Fill 16:9 Clip (MP4 Fill)'}
                </div>
                <div className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                  {lang === 'th'
                    ? `ได้วิดีโอทั้งหน้าพรีวิวขนาด ${clipAspectRatio} พร้อมซูมคลิปเต็มกรอบ 16:9`
                    : `Zoomed 16:9 clip fill in ${clipAspectRatio}`}
                </div>
              </div>
            </div>
            <i className="fa-solid fa-download text-[#a8a29e] group-hover:text-[#0c0a09] dark:group-hover:text-white text-xs transition" />
          </button>

          {/* Option 3: PNG High-Res */}
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            id="btn-export-img"
            className="w-full p-3 rounded-xl border border-[#e7e5e4] dark:border-[#292524] hover:border-[#0c0a09] dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-[#201d1a] transition flex items-center justify-between group text-left disabled:opacity-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm flex-shrink-0">
                <i className="fa-solid fa-image" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#0c0a09] dark:text-white">
                  {lang === 'th'
                    ? `บันทึกรูปภาพทั้งหน้าพรีวิวความละเอียดสูง (PNG ${clipAspectRatio})`
                    : `High-Res Slide Image (PNG ${clipAspectRatio})`}
                </div>
                <div className="text-[10px] text-[#777169] dark:text-[#a8a29e]">
                  {lang === 'th'
                    ? `ได้ภาพสไลด์คำศัพท์ + ไวยากรณ์ + เฟรมหนัง 16:9 ตามขนาด ${clipAspectRatio}`
                    : `Sharp image card in ${clipAspectRatio}`}
                </div>
              </div>
            </div>
            <i className="fa-solid fa-download text-[#a8a29e] group-hover:text-[#0c0a09] dark:group-hover:text-white text-xs transition" />
          </button>

          {/* Option 4: Copy Caption */}
          <button
            type="button"
            onClick={handleCopyCaption}
            className="w-full p-3 rounded-xl border border-[#e7e5e4] dark:border-[#292524] hover:border-[#0c0a09] dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-[#201d1a] transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm flex-shrink-0">
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
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-[10px] font-semibold transition"
              >
                <i className="fa-solid fa-download text-[9px]" /> ดาวน์โหลด ({downloadFilename})
              </a>
            )}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            onClick={closeModal}
            className="w-8 h-8 bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#292524] dark:text-white rounded-full transition flex items-center justify-center"
            title="ปิดหน้าต่าง"
            aria-label="ปิด"
          >
            <i className="fa-solid fa-check text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
