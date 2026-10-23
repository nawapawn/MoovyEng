'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useVocab } from '../context/VocabContext';
import { ASPECT_RATIO_CONFIG } from '../lib/constants';
import { isColorDark, highlightKeyword, formatGrammarHtml, normalizeThumbUrl, getFontFamilyCss } from '../lib/utils';

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
    bgColor1,
    bgColor2,
    clipAspectRatio,
    activeClipSequence,
    isPlayingVideo,
    setIsPlayingVideo,
    currentSequenceIndex,
    setCurrentSequenceIndex,
    showHighlight,
    useMovieBackdrop,
    bgBlur,
    bgOverlayOpacity,
    textFormat
  } = useVocab();

  const videoRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const cfg = ASPECT_RATIO_CONFIG[clipAspectRatio] || ASPECT_RATIO_CONFIG['9:16'];
  const darkContrast = isColorDark(bgColor1) || isColorDark(bgColor2);
  const isDark = darkContrast || (useMovieBackdrop && (bgOverlayOpacity || 45) > 30);

  const activeTextColor = textFormat?.textColor || (isDark ? '#f8fafc' : '#0c0a09');
  const secondaryTextColor = textFormat?.textColor ? `${textFormat.textColor}d9` : (isDark ? '#cbd5e1' : '#57534e');
  const phoneticColor = textFormat?.textColor ? `${textFormat.textColor}b3` : (isDark ? '#e2e8f0' : '#4e4e4e');
  const fontFamilyCss = getFontFamilyCss(textFormat?.fontFamily);
  const isBold = textFormat?.bold !== false;
  const isItalic = Boolean(textFormat?.italic);
  const isUnderline = Boolean(textFormat?.underline);
  const textAlign = textFormat?.textAlign || 'left';

  const backgroundStyle = {
    background: bgColor1 === bgColor2 ? bgColor1 : `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`
  };

  const primaryClip = activeClipSequence[0] || null;
  const currentClip = activeClipSequence[currentSequenceIndex] || primaryClip;
  const thumbUrl = primaryClip ? normalizeThumbUrl(primaryClip.thumb, primaryClip.slug) : '';
  const wordKeyword = word ? word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim() : '';
  const cleanTh = (str) => (str || '').replace(/^\s*\((.*)\)\s*$/, '$1').trim();

  useEffect(() => {
    setImgError(false);
  }, [thumbUrl]);

  // Video Playback Toggle
  const togglePlay = async (e) => {
    if (e) e.stopPropagation();
    if (!activeClipSequence.length) return;

    const vid = videoRef.current;
    if (isPlayingVideo) {
      if (vid) vid.pause();
      setIsPlayingVideo(false);
      return;
    }

    setIsPlayingVideo(true);
    await playClipAt(0);
  };

  const playClipAt = async (idx) => {
    if (!activeClipSequence.length) return;
    const targetIdx = idx >= activeClipSequence.length ? 0 : idx;
    setCurrentSequenceIndex(targetIdx);
    const clip = activeClipSequence[targetIdx];
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
    if (activeClipSequence.length > 1) {
      const nextIdx = (currentSequenceIndex + 1) % activeClipSequence.length;
      playClipAt(nextIdx);
    } else {
      setIsPlayingVideo(false);
    }
  };

  const isWide = clipAspectRatio === '16:9' || clipAspectRatio === '3:2';

  return (
    <div
      id="phone-container"
      className={`${cfg.containerClass} ${isDark ? 'phone-dark-contrast' : ''}`}
      style={backgroundStyle}
    >
      {/* Movie Background Backdrop & Live Blur Control */}
      {useMovieBackdrop && thumbUrl && !imgError && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            crossOrigin="anonymous"
            src={thumbUrl}
            alt="Movie Backdrop"
            className="w-full h-full object-cover scale-110 transition duration-300"
            style={{ filter: `blur(${bgBlur || 0}px)` }}
          />
          <div
            className="absolute inset-0 transition duration-200"
            style={{
              backgroundColor: isColorDark(bgColor1) ? bgColor1 : '#000000',
              opacity: (bgOverlayOpacity ?? 45) / 100
            }}
          />
        </div>
      )}

      {/* Subtle Internal Atmospheric Orbs inside Card (Active when no backdrop) */}
      {!useMovieBackdrop && (
        <>
          <div
            className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-15 blur-2xl"
            style={{ background: 'radial-gradient(circle, #a8c8e8 0%, transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15 blur-2xl"
            style={{ background: 'radial-gradient(circle, #e8b8c4 0%, transparent 70%)' }}
          />
        </>
      )}

      {/* Top iOS Status Bar (ElevenLabs Crisp Minimalist - Ignored on Export/Download) */}
      <div
        id="preview-ios-statusbar"
        data-export-ignore="true"
        className={
          cfg.showStatusBar
            ? `hidden sm:flex absolute top-0 left-0 w-full z-30 justify-between items-center px-7 pt-3.5 text-xs font-medium ${isDark ? 'text-white/80' : 'text-[#292524]'}`
            : 'hidden'
        }
      >
        <span className="tracking-tight">9:41</span>
        <div className={`w-16 h-3 rounded-full mx-auto -mt-0.5 ${isDark ? 'bg-white/40' : 'bg-[#0c0a09]'}`} />
        <div className={`flex items-center space-x-1.5 text-[11px] ${isDark ? 'text-white/80' : 'text-[#292524]'}`}>
          <i className="fa-solid fa-signal" />
          <i className="fa-solid fa-wifi" />
          <i className="fa-solid fa-battery-full text-sm" />
        </div>
      </div>

      {/* Top Navigation & Controls Header (ElevenLabs Clean Editorial Header) */}
      <div id="preview-top-header" className={cfg.headerClass}>
        {/* Brand Signature with Custom Profile Picture */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#292524] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden border ${isDark ? 'border-white/30' : 'border-[#d6d3d1]'} shadow-xs flex-shrink-0`}>
            {avatar ? (
              <img
                id="preview-top-avatar"
                crossOrigin="anonymous"
                src={avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <i id="preview-top-avatar-icon" className="fa-solid fa-user text-xs" />
            )}
          </div>
          <span
            id="preview-top-channel"
            style={{ color: activeTextColor }}
            className="font-semibold text-xs sm:text-[13px] tracking-tight truncate max-w-[170px] select-none"
          >
            {channel || '@MoovyEng'}
          </span>
        </div>

        <div data-export-ignore="true" className="flex items-center space-x-1.5 flex-shrink-0">
          {/* AI Studio Entry Icon (Visible on Mobile/Tablet to open separate page) */}
          {!isMobile && (
            <Link
              href="/edit"
              className="lg:hidden w-8 h-8 rounded-full bg-[#292524] hover:bg-[#0c0a09] text-white flex items-center justify-center transition shadow-2xs"
              title="Studio Tools"
              aria-label="Studio"
            >
              <i className="fa-solid fa-pen-to-square text-xs" />
            </Link>
          )}
        </div>
      </div>

      {/* Central Content Stream (Compact Grouping: Vocab, 16:9 Movie Clip, Meaning & Always-Visible Grammar) */}
      <div
        id="video-canvas-area"
        className={
          isWide
            ? 'w-full h-full relative z-10 grid grid-cols-12 items-center gap-3 px-5 pt-9 pb-3 overflow-hidden'
            : cfg.streamClass
        }
      >
        {/* TOP SECTION: English Word, Phonetic, and Red Thai Reading (Close to Movie Clip) */}
        <div
          id="preview-top-vocab-block"
          className={
            isWide
              ? 'col-span-5 flex flex-col items-center justify-center space-y-0.5 text-center'
              : 'w-full flex flex-col items-center justify-center space-y-0.5 text-center'
          }
        >
          <div className="flex items-center justify-center">
            <h1
              id="preview-word"
              className={cfg.wordClass}
              style={{ color: activeTextColor, fontFamily: fontFamilyCss }}
            >
              {word}
            </h1>
          </div>

          {/* IPA Phonetic Guide */}
          <div className="flex items-center justify-center pt-0.5">
            <p
              id="preview-phonetic"
              style={{ color: phoneticColor, fontFamily: fontFamilyCss }}
              className="text-xs sm:text-sm font-mono tracking-wide text-center"
            >
              {phonetic}
            </p>
          </div>

          {/* Thai Pronunciation in Bold Red */}
          <p id="preview-thai-read" className="thai-vocab-font text-base sm:text-lg font-bold text-[#dc2626] text-center">
            {thaiRead}
          </p>
        </div>

        {/* MIDDLE SECTION: Movie Clip Card (Always Uniformly Cropped to 16:9 with Zero Black Bars) */}
        <div
          id="preview-middle-clip-block"
          className={
            isWide
              ? 'col-span-5 flex flex-col items-center justify-center'
              : 'w-full flex flex-col items-center justify-center py-0.5'
          }
        >
          <div
            id="movie-clip-box"
            onClick={togglePlay}
            className={`${cfg.clipBoxClass} bg-[#0c0a09] rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] relative border border-[#e7e5e4] flex-shrink-0 cursor-pointer group transition-all duration-300`}
          >
            {/* Video element for Python-streamed playback with audio */}
            <video
              ref={videoRef}
              id="preview-video"
              onEnded={handleVideoEnded}
              className={`movie-uniform-fill bg-[#0c0a09] ${isPlayingVideo ? '' : 'hidden'} scale-[1.03]`}
              playsInline
            />

            {/* Static Image thumbnail */}
            {!isPlayingVideo && thumbUrl && !imgError && (
              <img
                id="preview-movie-img"
                crossOrigin="anonymous"
                src={thumbUrl}
                alt={currentClip?.title || 'Clip thumbnail'}
                onError={() => setImgError(true)}
                className="movie-uniform-fill transition duration-300 scale-[1.03] group-hover:scale-[1.05]"
              />
            )}

            {/* Empty state when no clip selected yet */}
            {!isPlayingVideo && (!thumbUrl || imgError) && (
              <div id="preview-movie-empty" className="w-full h-full flex flex-col items-center justify-center text-[#a8a29e] p-4 text-center">
                <i className="fa-solid fa-film text-2xl mb-1.5" />
                <span className="text-[11px]">No clip selected</span>
              </div>
            )}

            {/* Movie Title Watermark Top Left */}
            {currentClip?.title && (
              <div className="absolute top-2.5 left-3.5 drop-shadow-md z-10 pointer-events-none">
                <span id="preview-movie-title" className="text-white text-[11px] font-semibold tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {currentClip.title}
                </span>
              </div>
            )}

            {/* Play Overlay Indicator */}
            <div
              id="play-indicator"
              data-export-ignore="true"
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition z-10"
            >
              <div className="w-10 h-10 rounded-full bg-[#0c0a09]/70 text-white flex items-center justify-center backdrop-blur-sm">
                <i
                  id="play-indicator-icon"
                  className={`fa-solid ${isPlayingVideo ? 'fa-pause' : 'fa-play ml-0.5'} text-sm`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Thai Meaning & Frameless Grammar/Examples Card */}
        <div
          id="preview-bottom-grammar-block"
          className={
            isWide
              ? 'col-span-7 col-start-6 row-start-1 row-span-2 flex flex-col items-center justify-center space-y-1.5'
              : 'w-full flex flex-col items-center justify-center space-y-2 pt-0.5'
          }
        >
          {/* Thai Meaning (Big, Bold, Clean) */}
          <div className="text-center w-full px-2">
            <h2
              id="preview-meaning"
              className={cfg.meaningClass}
              style={{ color: activeTextColor, fontFamily: fontFamilyCss }}
            >
              {(meaning || '').replace(/["']/g, '')}
            </h2>
          </div>

          {/* Frameless Grammar & Examples Container (Clean, Proportional, No Heavy Box) */}
          <div
            id="grammar-detail-card"
            className={`${cfg.grammarCardClass} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`}
            style={{ fontFamily: fontFamilyCss, textAlign }}
          >
            {/* Formula (e.g. S + wish + [Someone] + to + break a leg → ...) */}
            <div
              id="preview-grammar"
              className={`text-[13px] sm:text-[14px] leading-snug ${isBold ? 'font-semibold' : 'font-normal'}`}
              style={{ color: activeTextColor }}
              dangerouslySetInnerHTML={{ __html: formatGrammarHtml(grammar, wordKeyword, showHighlight, isDark) }}
            />
            {/* 2 Punchy Example Sentences without numbers */}
            <div className={`space-y-1.5 pt-1.5 border-t ${isDark ? 'border-white/20' : 'border-black/10'}`}>
              <div id="preview-ex1" className="leading-relaxed">
                {ex1En && (
                  <>
                    <div
                      className={`preview-example-en text-[12.5px] sm:text-[13.5px] leading-snug ${isBold ? 'font-bold' : 'font-normal'}`}
                      style={{ color: activeTextColor }}
                      dangerouslySetInnerHTML={{ __html: highlightKeyword(ex1En, wordKeyword, showHighlight) }}
                    />
                    {ex1Th && (
                      <div
                        className="preview-example-th text-[11.5px] sm:text-[12px] preview-thai-font pt-0.5"
                        style={{ color: secondaryTextColor }}
                      >
                        → {cleanTh(ex1Th)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div id="preview-ex2" className="leading-relaxed">
                {ex2En && (
                  <>
                    <div
                      className={`preview-example-en text-[12.5px] sm:text-[13.5px] leading-snug ${isBold ? 'font-bold' : 'font-normal'}`}
                      style={{ color: activeTextColor }}
                      dangerouslySetInnerHTML={{ __html: highlightKeyword(ex2En, wordKeyword, showHighlight) }}
                    />
                    {ex2Th && (
                      <div
                        className="preview-example-th text-[11.5px] sm:text-[12px] preview-thai-font pt-0.5"
                        style={{ color: secondaryTextColor }}
                      >
                        → {cleanTh(ex2Th)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
