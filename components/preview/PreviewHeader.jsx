'use client';

import React from 'react';
import Link from 'next/link';
import { useVocab } from '../../context/VocabContext';
import { getTextElementStyle, getTextElementClass } from '../../lib/utils';
import DraggablePreviewItem from './DraggablePreviewItem';

/**
 * PreviewHeader
 * Top brand signature header with avatar and channel name.
 */
export default function PreviewHeader({
  cfg,
  avatar,
  channel,
  fmtChannel,
  isDark,
  isMobile = false,
  setActiveFormatTarget,
  elementPositions,
  updateElementPosition,
  activeDragInfo,
  setActiveDragInfo,
  containerRef
}) {
  const { lang } = useVocab();
  return (
    <div id="preview-top-header" className={cfg?.headerClass || 'w-full flex items-center justify-between px-6 pt-5 pb-1 relative z-20'}>
      {/* Draggable Brand Signature with Custom Profile Picture */}
      <DraggablePreviewItem
        id="header"
        label={lang === 'th' ? 'โปรไฟล์ช่อง' : 'Channel Profile'}
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      >
        {/* การ์ดแสดงผลโปรไฟล์ (ไม่มีแคปซูล/ไม่มีกรอบพื้นหลัง) */}
        <div className="flex items-center space-x-4 max-w-sm w-full transition-all">
          {/* รูปอวาตาร์ (Avatar) */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100 shadow-sm">
            <img
              id="preview-top-avatar"
              crossOrigin="anonymous"
              src={avatar || 'https://placehold.co/150x150/f3f4f6/374151?text=M'}
              alt={channel ? `Avatar ${channel}` : 'Avatar move0nyoung'}
              className="w-full h-full object-cover block"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/150x150/f3f4f6/374151?text=M';
              }}
            />
          </div>

          {/* ชื่อช่อง / ยูสเซอร์เนม */}
          <div className="flex flex-col justify-center">
            <span
              id="preview-top-channel"
              data-preview-field="channel"
              onClick={() => setActiveFormatTarget?.('channel')}
              style={{
                ...getTextElementStyle(fmtChannel, false),
                fontFamily: fmtChannel?.fontFamily
                  ? getTextElementStyle(fmtChannel, false).fontFamily
                  : "'Inter', sans-serif",
                color: fmtChannel?.rawColor ? fmtChannel.textColor : '#111827',
                lineHeight: 1
              }}
              className={`text-xl font-bold text-gray-900 tracking-tight leading-none cursor-pointer transition hover:opacity-90 whitespace-nowrap select-none ${getTextElementClass(
                fmtChannel
              )}`}
              title={lang === 'th' ? 'คลิกเพื่อปรับชื่อช่อง' : 'Click to format Channel'}
              dangerouslySetInnerHTML={{ __html: channel || '@move0nyoung' }}
            />
          </div>
        </div>
      </DraggablePreviewItem>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* AI Studio Entry Icon (Visible on Mobile/Tablet to open separate page — 44x44px touch target) */}
        {!isMobile && (
          <Link
            data-export-ignore="true"
            href="/edit"
            className="lg:hidden w-11 h-11 rounded-full bg-[#292524] hover:bg-[#0c0a09] text-white flex items-center justify-center transition shadow-sm t-btn-press"
            title={lang === 'th' ? 'เครื่องมือสตูดิโอ' : 'Studio Tools'}
            aria-label="Studio"
          >
            <i className="fa-solid fa-pen-to-square text-sm" />
          </Link>
        )}
      </div>
    </div>
  );
}
