'use client';

import React, { useState, useRef } from 'react';
import { normalizeThumbUrl } from '../../lib/utils';

/**
 * MovieClipCard
 * Displays a single movie clip card in the 3-column clip selector.
 * Supports hover/touch preview playback with audio-free video loop.
 */
export default function MovieClipCard({ clip, seqIdx, isSelected, onToggle }) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const touchTimerRef = useRef(null);
  const thumbSrc = normalizeThumbUrl(clip.thumb, clip.slug);
  const videoSrc = clip.localVideoUrl || `/api/cafe/stream?url=${encodeURIComponent(clip.videoUrl || clip.slug)}`;

  const startPreview = () => setIsPreviewing(true);
  const stopPreview = () => setIsPreviewing(false);

  const handleTouchStart = () => {
    touchTimerRef.current = setTimeout(() => {
      startPreview();
    }, 280);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
    stopPreview();
  };

  return (
    <div
      onClick={onToggle}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onPointerEnter={startPreview}
      onPointerLeave={stopPreview}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 cursor-pointer transition select-none ${
        isSelected
          ? 'border-[#0c0a09] dark:border-white ring-2 ring-[#0c0a09]/20 shadow-xs'
          : 'border-[#e7e5e4] dark:border-[#44403c] opacity-90 hover:opacity-100 hover:shadow-md'
      }`}
    >
      {/* Video Preview on Hover / Touch-Hold */}
      {isPreviewing ? (
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      ) : (
        <img src={thumbSrc} alt={clip.title} className="w-full h-full object-cover" />
      )}

      {/* Card Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-2 pointer-events-none z-20">
        <div className="flex justify-between items-start gap-1">
          <div className="flex items-center gap-1 flex-wrap">
            {isPreviewing ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Preview
              </span>
            ) : null}
            {clip.duration && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-white font-mono font-medium">
                {clip.duration}
              </span>
            )}
          </div>
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
              isSelected
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] ring-1 ring-white/50'
                : 'bg-black/60 text-white'
            }`}
          >
            {isSelected ? seqIdx + 1 : <i className="fa-solid fa-plus text-[9px]" />}
          </div>
        </div>
        <div className="text-left space-y-0.5">
          <p className="text-[10px] font-semibold text-white truncate drop-shadow-sm">{clip.title}</p>
          {clip.quote && (
            <p className="text-[8.5px] text-amber-200/95 truncate italic" title={clip.quote}>
              {clip.quote}
            </p>
          )}
          {clip.quoteTh && (
            <p className="text-[8.5px] text-emerald-200/95 truncate font-medium" title={clip.quoteTh}>
              ({clip.quoteTh})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
