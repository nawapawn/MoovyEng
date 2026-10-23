'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';

export default function ToolStep4Social() {
  const {
    channel,
    setChannel,
    avatar,
    setAvatar,
    caption,
    setCaption,
    collapsedSections,
    toggleToolCard,
    showToast,
    lang
  } = useVocab();

  const isCollapsed = Boolean(collapsedSections['tool-sec-social']);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target.result);
      showToast(lang === 'th' ? 'อัปโหลดรูปโปรไฟล์เรียบร้อย' : 'Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleClearAvatar = () => {
    setAvatar('');
    showToast(lang === 'th' ? 'ลบรูปโปรไฟล์แล้ว' : 'Removed profile photo');
  };

  const copyCaption = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      showToast(lang === 'th' ? 'คัดลอกแคปชั่นคำศัพท์เรียบร้อยแล้ว!' : 'Caption copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast('Copy failed');
    }
  };

  return (
    <section
      id="tool-sec-social"
      data-tool-keywords="4 profile avatar channel handle caption hashtag โปรไฟล์ ช่อง แคปชั่น"
      className={`tool-section-card bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] ${
        isCollapsed ? 'is-collapsed' : ''
      }`}
    >
      <div
        className="tool-card-header flex items-center justify-between mb-3 pb-2 border-b border-[#f0efed] dark:border-[#292524] cursor-pointer select-none"
        onClick={() => toggleToolCard('tool-sec-social')}
      >
        <div className="flex items-center space-x-2 text-[#0c0a09] dark:text-white font-semibold text-sm">
          <span className="w-5 h-5 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-[10px] font-mono">
            4
          </span>
          <span>Profile & Caption</span>
        </div>
        <button
          type="button"
          className="w-6 h-6 rounded-full hover:bg-[#f0efed] dark:hover:bg-[#292524] text-[#777169] hover:text-[#0c0a09] dark:hover:text-white flex items-center justify-center transition"
          title="Collapse / Expand"
        >
          <i className="fa-solid fa-chevron-down text-[10px] tool-collapse-chevron" />
        </button>
      </div>

      <div className="tool-card-body">
        <div className="tool-card-inner space-y-2.5">
          {/* Profile Avatar Upload + URL */}
          <div className="flex items-center gap-2.5 p-2.5 bg-[#fafafa] dark:bg-[#201d1a] rounded-xl border border-[#e7e5e4] dark:border-[#292524]">
            <div className="w-10 h-10 rounded-full bg-[#292524] text-white flex items-center justify-center overflow-hidden border border-[#d6d3d1] dark:border-zinc-700 flex-shrink-0">
              {avatar ? (
                <img id="editor-avatar-preview" src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i id="editor-avatar-icon" className="fa-solid fa-user text-xs" />
              )}
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <label
                className="w-8 h-8 bg-[#292524] dark:bg-white hover:bg-[#0c0a09] text-white dark:text-[#0c0a09] rounded-full cursor-pointer transition inline-flex items-center justify-center flex-shrink-0"
                title="Upload Avatar"
                aria-label="Upload Avatar"
              >
                <i className="fa-solid fa-upload text-xs" />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              <input
                type="text"
                id="social-avatar-url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Avatar image URL..."
                className="flex-1 min-w-0 bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-2.5 py-1 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
              />

              {avatar && (
                <button
                  type="button"
                  onClick={handleClearAvatar}
                  className="w-8 h-8 rounded-full bg-white dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] text-[#777169] hover:text-[#dc2626] hover:border-[#dc2626] transition flex items-center justify-center flex-shrink-0"
                  title="Remove Avatar"
                  aria-label="Remove Avatar"
                >
                  <i className="fa-solid fa-trash-can text-xs" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e] mb-1">
              Channel (@username)
            </label>
            <input
              type="text"
              id="social-handle"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="@username"
              className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-[#777169] dark:text-[#a8a29e]">
                Social Caption
              </label>
              <button
                type="button"
                onClick={copyCaption}
                className="text-[10px] text-[#0c0a09] dark:text-white font-medium flex items-center gap-1 hover:underline"
              >
                <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`} />
                <span>{copied ? (lang === 'th' ? 'คัดลอกแล้ว' : 'Copied') : (lang === 'th' ? 'คัดลอก' : 'Copy')}</span>
              </button>
            </div>
            <textarea
              id="social-description"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Caption & hashtags..."
              className="w-full bg-white dark:bg-[#292524] border border-[#d6d3d1] dark:border-[#44403c] rounded-lg px-3 py-1.5 text-xs text-[#0c0a09] dark:text-white focus:border-[#0c0a09] dark:focus:border-white focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
