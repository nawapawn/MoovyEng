'use client';

import React, { useState, useEffect } from 'react';
import { useVocab } from '../../context/VocabContext';
import DraggablePreviewItem from './DraggablePreviewItem';

/**
 * PreviewMovieBox
 * 16:9 movie clip container with HTML5 video player,
 * static image thumbnail, watermark title, play/pause controls,
 * progress bar, and draggable support.
 */
export default function PreviewMovieBox({
  isWide = false,
  cfg,
  videoRef,
  isPlayingVideo,
  togglePlay,
  handleVideoEnded,
  handleTimeUpdate,
  thumbUrl,
  imgError,
  setImgError,
  currentClip,
  activeClipSequence = [],
  currentSequenceIndex = 0,
  elementPositions,
  updateElementPosition,
  activeDragInfo,
  setActiveDragInfo,
  containerRef
}) {
  const { lang } = useVocab();
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const [progress, setProgress] = useState(0);

  // Keep video element visible once playback starts (even when paused)
  useEffect(() => {
    if (isPlayingVideo) {
      setHasStartedVideo(true);
    }
  }, [isPlayingVideo]);

  // Reset to static thumbnail when clip changes while not actively playing
  useEffect(() => {
    if (!isPlayingVideo) {
      setHasStartedVideo(false);
      setProgress(0);
    }
  }, [currentClip?.id, currentClip?.slug, currentClip?.videoUrl]);

  const onTimeUpdate = (e) => {
    const vid = e.target;
    if (vid && vid.duration && vid.duration > 0) {
      setProgress((vid.currentTime / vid.duration) * 100);
    }
    handleTimeUpdate?.(e);
  };

  const onEnded = (e) => {
    setProgress(100);
    handleVideoEnded?.(e);
  };

  const movieTitle =
    currentClip?.title ||
    currentClip?.movieTitle ||
    (currentClip?.movie ? `${currentClip.movie}${currentClip.year ? ` (${currentClip.year})` : ''}` : '') ||
    (thumbUrl ? (lang === 'th' ? 'ฉากภาพยนตร์' : 'Movie Scene') : '');

  // Extract English subtitle quote and Thai translation
  const rawSubEn = (currentClip?.rawTranscript || currentClip?.quote || '')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .trim();
  const subEn = rawSubEn && !rawSubEn.toLowerCase().startsWith('scene from') ? rawSubEn : '';
  const subTh = (currentClip?.quoteTh || '')
    .replace(/^["'“”()]+|["'“”()]+$/g, '')
    .trim();

  return (
    <div
      id="preview-middle-clip-block"
      className={
        isWide
          ? 'col-span-5 flex flex-col items-center justify-center'
          : 'w-full flex flex-col items-center justify-center py-0.5'
      }
    >
      <DraggablePreviewItem
        id="movieBox"
        label={lang === 'th' ? 'คลิปภาพยนตร์' : 'Movie Clip'}
        className="w-full max-w-[374px] flex items-center justify-center"
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      >
        <div
          id="movie-clip-box"
          onClick={togglePlay}
          role="button"
          tabIndex={0}
          aria-label={isPlayingVideo ? (lang === 'th' ? 'หยุดคลิปชั่วคราว' : 'Pause clip') : (lang === 'th' ? 'เล่นคลิป' : 'Play clip')}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              togglePlay?.(e);
            }
          }}
          className={`${cfg?.clipBoxClass || 'w-full aspect-[16/9]'} bg-[#0c0a09] rounded-none overflow-hidden shadow-none relative border-0 flex-shrink-0 cursor-pointer group transition-all duration-300 focus:outline-none`}
        >
          {/* Video element for streamed playback with audio - remains visible when paused */}
          <video
            ref={videoRef}
            id="preview-video"
            onEnded={onEnded}
            onTimeUpdate={onTimeUpdate}
            className={`movie-uniform-fill bg-[#0c0a09] w-full h-full object-cover object-center rounded-none ${hasStartedVideo ? 'block' : 'hidden'} scale-[1.05]`}
            playsInline
            preload="auto"
          />

          {/* Static Image thumbnail (shown before first playback) */}
          {!hasStartedVideo && thumbUrl && !imgError && (
            <img
              id="preview-movie-img"
              crossOrigin="anonymous"
              src={thumbUrl}
              alt={currentClip?.title || 'Clip thumbnail'}
              onError={() => setImgError?.(true)}
              className="movie-uniform-fill w-full h-full object-cover object-center rounded-none transition duration-300 scale-[1.05] group-hover:scale-[1.07]"
            />
          )}

          {/* Empty state when no clip selected yet */}
          {!hasStartedVideo && (!thumbUrl || imgError) && (
            <div id="preview-movie-empty" className="w-full h-full flex flex-col items-center justify-center text-[#a8a29e] p-4 text-center">
              <i className="fa-solid fa-film text-2xl mb-1.5" />
              <span className="text-[11px]">{lang === 'th' ? 'ยังไม่ได้เลือกคลิป' : 'No clip selected'}</span>
            </div>
          )}

          {/* Minimalist Movie Title Credit Badge Top Left */}
          {movieTitle && (
            <div
              id="preview-movie-credit-badge"
              className="absolute top-2.5 left-2.5 z-20 pointer-events-none select-none flex items-center"
            >
              <div className="px-2.5 py-1 rounded bg-black/65 backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5 shadow-sm">
                <i className="fa-solid fa-film text-[9px] text-white/70" />
                <span
                  id="preview-movie-title"
                  className="text-white text-[10.5px] font-medium tracking-wide font-['Inter',sans-serif] drop-shadow-xs truncate max-w-[220px]"
                >
                  {movieTitle}
                </span>
              </div>
            </div>
          )}

          {/* Sequence Badge Top Right when multiple clips in queue */}
          {activeClipSequence && activeClipSequence.length > 1 && (
            <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none select-none">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/65 backdrop-blur-md text-white font-semibold border border-white/10 shadow-sm">
                {currentSequenceIndex + 1}/{activeClipSequence.length}
              </span>
            </div>
          )}

          {/* Minimalist Bilingual Subtitles (English + Thai) Overlay */}
          {(subEn || subTh) && (
            <div
              id="preview-movie-subtitles"
              className="absolute bottom-2.5 left-2 right-2 z-20 pointer-events-none select-none flex flex-col items-center justify-center text-center px-1"
            >
              <div className="max-w-[94%] px-3 py-1.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 shadow-lg space-y-0.5">
                {subEn && (
                  <p
                    id="preview-sub-en"
                    className="text-white text-[11px] sm:text-xs font-semibold leading-snug font-['Inter',sans-serif] tracking-wide drop-shadow-sm"
                  >
                    "{subEn}"
                  </p>
                )}
                {subTh && (
                  <p
                    id="preview-sub-th"
                    className="text-amber-200/90 text-[10px] sm:text-[10.5px] font-medium leading-snug drop-shadow-xs"
                  >
                    ({subTh})
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Play / Pause Overlay Indicator */}
          <div
            id="play-indicator"
            data-export-ignore="true"
            className={`absolute inset-0 flex items-center justify-center transition-all duration-200 z-10 pointer-events-none ${
              isPlayingVideo
                ? 'bg-black/0 group-hover:bg-black/25 opacity-0 group-hover:opacity-100'
                : 'bg-black/20 opacity-100'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full bg-stone-950/80 text-white flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-xs transition-transform duration-200 ${
                isPlayingVideo
                  ? 'scale-90 group-hover:scale-100'
                  : 'scale-100 hover:scale-105'
              }`}
            >
              <i
                id="play-indicator-icon"
                className={`fa-solid ${isPlayingVideo ? 'fa-pause' : 'fa-play ml-0.5'} text-sm text-white drop-shadow-sm`}
              />
            </div>
          </div>

          {/* Video Playback Progress Bar */}
          {hasStartedVideo && (
            <div
              data-export-ignore="true"
              className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-20 pointer-events-none"
            >
              <div
                className="h-full bg-amber-400 transition-[width] duration-100 ease-linear shadow-xs"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </DraggablePreviewItem>
    </div>
  );
}
