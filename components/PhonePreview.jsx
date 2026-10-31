'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useVocab } from '../context/VocabContext';
import { ASPECT_RATIO_CONFIG } from '../lib/constants';
import { isColorDark, normalizeThumbUrl, getItemFormat } from '../lib/utils';
import PreviewHeader from './preview/PreviewHeader';
import PreviewWordBlock from './preview/PreviewWordBlock';
import PreviewMovieBox from './preview/PreviewMovieBox';
import PreviewGrammarCard from './preview/PreviewGrammarCard';
import DistanceGuideOverlay from './preview/DistanceGuideOverlay';

export default function PhonePreview({ isMobile = false }) {
  const {
    word,
    phonetic,
    thaiRead,
    meaning,
    grammar,
    ex1En,
    ex1Th,
    ex2En,
    ex2Th,
    channel,
    avatar,
    bgColor,
    clipAspectRatio,
    activeClipSequence,
    cafeClipPool,
    isPlayingVideo,
    setIsPlayingVideo,
    currentSequenceIndex,
    setCurrentSequenceIndex,
    playTrigger,
    textFormat,
    setActiveFormatTarget,
    elementPositions,
    updateElementPosition,
    resetElementPositions,
    lang
  } = useVocab();

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [activeDragInfo, setActiveDragInfo] = useState(null);

  // Synchronized refs to avoid stale closures in event handlers
  const activeClipSequenceRef = useRef(activeClipSequence);
  const currentSequenceIndexRef = useRef(currentSequenceIndex);
  useEffect(() => {
    activeClipSequenceRef.current = activeClipSequence;
  }, [activeClipSequence]);
  useEffect(() => {
    currentSequenceIndexRef.current = currentSequenceIndex;
  }, [currentSequenceIndex]);

  const cfg = ASPECT_RATIO_CONFIG[clipAspectRatio] || ASPECT_RATIO_CONFIG['9:16'];
  const isDark = isColorDark(bgColor || '#ffffff');

  // Per-component itemized text formats
  const fmtWord = getItemFormat(textFormat, 'word', isDark);
  const fmtPhonetic = getItemFormat(textFormat, 'phonetic', isDark);
  const fmtThaiRead = getItemFormat(textFormat, 'thaiRead', isDark);
  const fmtMeaning = getItemFormat(textFormat, 'meaning', isDark);
  const fmtGrammar = getItemFormat(textFormat, 'grammar', isDark);
  const fmtEx1 = getItemFormat(textFormat, 'ex1', isDark);
  const fmtEx2 = getItemFormat(textFormat, 'ex2', isDark);
  const fmtChannel = getItemFormat(textFormat, 'channel', isDark);

  const backgroundStyle = {
    backgroundColor: bgColor || '#ffffff'
  };

  const primaryClip = activeClipSequence[0] || (cafeClipPool && cafeClipPool.length > 0 ? cafeClipPool[0] : null);
  const currentClip = activeClipSequence[currentSequenceIndex] || primaryClip;
  const thumbUrl = primaryClip ? normalizeThumbUrl(primaryClip.thumb, primaryClip.slug) : '';
  const wordKeyword = word ? word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim() : '';

  useEffect(() => {
    setImgError(false);
  }, [thumbUrl]);

  // Pre-cache all clips in queue in background for zero-delay instant switching
  useEffect(() => {
    if (!activeClipSequence || !activeClipSequence.length) return;
    activeClipSequence.forEach(async (clip) => {
      if (!clip.localVideoUrl && (clip.slug || clip.videoUrl)) {
        try {
          const slug = clip.slug || clip.id || clip.videoUrl;
          const resp = await fetch(`/api/cafe/python-video?slug=${encodeURIComponent(slug)}`);
          if (resp.ok) {
            const pyData = await resp.json();
            if (pyData.success && pyData.publicUrl) {
              clip.localVideoUrl = pyData.publicUrl;
            }
          }
        } catch (e) {}
      }
    });
  }, [activeClipSequence]);

  // Listen to playTrigger from Play Queue button in Step 3
  useEffect(() => {
    if (playTrigger > 0) {
      playClipAt(0);
    }
  }, [playTrigger]);

  // Video Playback Toggle (Play / Pause & Resume)
  const togglePlay = async (e) => {
    if (e) {
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }
    const seq = activeClipSequenceRef.current;
    if (!seq || !seq.length) return;

    const vid = videoRef.current;
    if (!vid) return;

    // If currently playing -> PAUSE IT
    if (isPlayingVideo && !vid.paused) {
      vid.pause();
      setIsPlayingVideo(false);
      return;
    }

    // If video reached end -> Replay from start
    if (vid.ended || (vid.duration && vid.currentTime >= vid.duration - 0.15)) {
      vid.currentTime = 0;
      setIsPlayingVideo(true);
      try {
        await vid.play();
      } catch (err) {
        console.warn('Replay error:', err);
        setIsPlayingVideo(false);
      }
      return;
    }

    // If already loaded and paused -> RESUME immediately from current position
    if (vid.src) {
      setIsPlayingVideo(true);
      try {
        await vid.play();
      } catch (err) {
        console.warn('Resume playback error:', err);
        setIsPlayingVideo(false);
      }
      return;
    }

    // First time play -> Load clip and play
    setIsPlayingVideo(true);
    await playClipAt(currentSequenceIndexRef.current || 0);
  };

  const playClipAt = async (idx) => {
    const seq = activeClipSequenceRef.current;
    if (!seq || !seq.length) return;
    const targetIdx = idx >= seq.length ? 0 : idx;
    setCurrentSequenceIndex(targetIdx);
    currentSequenceIndexRef.current = targetIdx;
    const clip = seq[targetIdx];
    const vid = videoRef.current;
    if (!vid) return;

    let streamSrc = clip.localVideoUrl;
    if (!streamSrc && (clip.slug || clip.videoUrl)) {
      try {
        const slug = clip.slug || clip.id || clip.videoUrl;
        const resp = await fetch(`/api/cafe/python-video?slug=${encodeURIComponent(slug)}`);
        if (resp.ok) {
          const pyData = await resp.json();
          if (pyData.success && pyData.publicUrl) {
            clip.localVideoUrl = pyData.publicUrl;
            streamSrc = pyData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Could not fetch local video URL:', err);
      }
    }

    if (!streamSrc && clip.videoUrl) {
      streamSrc = `/api/cafe/stream?url=${encodeURIComponent(clip.videoUrl)}`;
    }

    if (streamSrc) {
      vid.src = streamSrc;
      vid.load();
      vid.play().catch((err) => {
        console.warn('Playback error:', err);
        setIsPlayingVideo(false);
      });
    } else {
      setIsPlayingVideo(false);
    }
  };

  const handleVideoEnded = () => {
    const seq = activeClipSequenceRef.current;
    if (seq && seq.length > 1) {
      const nextIdx = (currentSequenceIndexRef.current + 1) % seq.length;
      playClipAt(nextIdx);
    } else {
      setIsPlayingVideo(false);
    }
  };

  const isWide = clipAspectRatio === '16:9';
  const hasMovedElements = Object.values(elementPositions || {}).some(
    (p) => p && (p.x !== 0 || p.y !== 0)
  );

  return (
    <div
      ref={containerRef}
      id="phone-container"
      data-aspect-ratio={clipAspectRatio}
      className={`${cfg.containerClass} ${isDark ? 'phone-dark-contrast' : ''}`}
      style={backgroundStyle}
    >
      {/* Smart Snap & Distance Guide Overlay with Scale Ruler */}
      <DistanceGuideOverlay
        activeDragInfo={activeDragInfo}
        containerHeight={containerRef.current?.clientHeight || 736}
      />

      {/* Floating Reset Positions Button (Hidden on export) */}
      {hasMovedElements && (
        <button
          type="button"
          data-export-ignore="true"
          onClick={resetElementPositions}
          className="absolute bottom-2.5 right-2.5 z-30 px-2 py-1 text-[10px] font-semibold rounded bg-stone-900/85 hover:bg-stone-950 text-white shadow-md border border-white/20 transition-all flex items-center gap-1.5 select-none"
          title={lang === 'th' ? 'รีเซ็ตตำแหน่งทั้งหมดกลับเป็นค่าเริ่มต้น' : 'Reset all element positions to default'}
        >
          <svg className="w-3 h-3 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {lang === 'th' ? 'รีเซ็ตตำแหน่ง' : 'Reset Positions'}
        </button>
      )}

      {/* Top Navigation & Controls Header */}
      <PreviewHeader
        cfg={cfg}
        avatar={avatar}
        channel={channel}
        fmtChannel={fmtChannel}
        isDark={isDark}
        isMobile={isMobile}
        setActiveFormatTarget={setActiveFormatTarget}
        elementPositions={elementPositions}
        updateElementPosition={updateElementPosition}
        activeDragInfo={activeDragInfo}
        setActiveDragInfo={setActiveDragInfo}
        containerRef={containerRef}
      />

      {/* Central Content Stream */}
      <div
        id="video-canvas-area"
        className={
          isWide
            ? 'w-full flex-1 relative z-10 grid grid-cols-12 items-center gap-2 sm:gap-3 px-3 sm:px-6 pb-2.5 sm:pb-3 overflow-hidden'
            : cfg.streamClass
        }
      >
        {/* Vocab Word & Phonetic Block */}
        <PreviewWordBlock
          isWide={isWide}
          cfg={cfg}
          word={word}
          phonetic={phonetic}
          thaiRead={thaiRead}
          fmtWord={fmtWord}
          fmtPhonetic={fmtPhonetic}
          fmtThaiRead={fmtThaiRead}
          isDark={isDark}
          setActiveFormatTarget={setActiveFormatTarget}
          elementPositions={elementPositions}
          updateElementPosition={updateElementPosition}
          activeDragInfo={activeDragInfo}
          setActiveDragInfo={setActiveDragInfo}
          containerRef={containerRef}
        />

        {/* 16:9 Movie Clip Box */}
        <PreviewMovieBox
          isWide={isWide}
          cfg={cfg}
          videoRef={videoRef}
          isPlayingVideo={isPlayingVideo}
          togglePlay={togglePlay}
          handleVideoEnded={handleVideoEnded}
          thumbUrl={thumbUrl}
          imgError={imgError}
          setImgError={setImgError}
          currentClip={currentClip}
          activeClipSequence={activeClipSequence}
          currentSequenceIndex={currentSequenceIndex}
          elementPositions={elementPositions}
          updateElementPosition={updateElementPosition}
          activeDragInfo={activeDragInfo}
          setActiveDragInfo={setActiveDragInfo}
          containerRef={containerRef}
        />

        {/* Meaning & Grammar Details Card */}
        <PreviewGrammarCard
          isWide={isWide}
          cfg={cfg}
          meaning={meaning}
          grammar={grammar}
          wordKeyword={wordKeyword}
          ex1En={ex1En}
          ex1Th={ex1Th}
          ex2En={ex2En}
          ex2Th={ex2Th}
          fmtMeaning={fmtMeaning}
          fmtGrammar={fmtGrammar}
          fmtEx1={fmtEx1}
          fmtEx2={fmtEx2}
          isDark={isDark}
          setActiveFormatTarget={setActiveFormatTarget}
          elementPositions={elementPositions}
          updateElementPosition={updateElementPosition}
          activeDragInfo={activeDragInfo}
          setActiveDragInfo={setActiveDragInfo}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
}
