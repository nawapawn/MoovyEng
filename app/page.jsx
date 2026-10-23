'use client';

import React from 'react';
import PhonePreview from '../components/PhonePreview';
import StudioHeader from '../components/StudioHeader';
import ToolStep1AI from '../components/ToolStep1AI';
import ToolStep2Vocab from '../components/ToolStep2Vocab';
import ToolStep3Ratio from '../components/ToolStep3Ratio';
import ToolStep4Social from '../components/ToolStep4Social';

export default function HomePage() {
  return (
    <div className="w-full min-h-[100dvh] flex justify-start items-start overflow-x-hidden lg:py-5 lg:px-6 relative">
      {/* ElevenLabs Atmospheric Pastel Gradient Orbs (Mint, Peach, Lavender, Sky) */}
      <div
        className="pointer-events-none fixed -top-24 -left-24 w-96 h-96 rounded-full opacity-45 blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #a7e5d3 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed top-1/3 -right-24 w-96 h-96 rounded-full opacity-45 blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #f4c5a8 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-24 left-1/4 w-96 h-96 rounded-full opacity-40 blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #c8b8e0 0%, transparent 70%)' }}
      />

      {/* Responsive Master Container:
           - Mobile (< lg): Displays Phone Preview full-screen, with 'Studio' button to navigate to /edit.
           - Desktop / PC (>= lg): Pins Phone Preview on the FAR LEFT + 2-Column Studio Tools Workspace on the right! */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center lg:items-start justify-start gap-6">
        {/* LEFT COLUMN: Phone Canvas (Pinned Far Left & Sticky on Desktop, Fullscreen on Mobile) */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-start lg:sticky lg:top-5 flex-shrink-0">
          <PhonePreview />
        </div>

        {/* RIGHT COLUMN: Full All-in-One Studio Tools for PC / Large Screens (hidden on mobile, visible on lg+) */}
        <div className="hidden lg:flex flex-col flex-1 min-w-0 w-full space-y-3.5 pb-10">
          {/* PC Studio Header + Quick Tool Search Bar */}
          <StudioHeader />

          {/* Responsive 2-Column Tool Grid on Desktop for Easy All-in-One Access */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* LEFT TOOL SUB-COLUMN (7 cols on xl): Step 1 (AI Model) + Step 2 (Vocab & Clips) */}
            <div className="xl:col-span-7 space-y-4">
              <ToolStep1AI />
              <ToolStep2Vocab />
            </div>

            {/* RIGHT TOOL SUB-COLUMN (5 cols on xl): Step 3 (Aspect Ratio & Queue) + Step 4 (Profile & Caption) */}
            <div className="xl:col-span-5 space-y-4">
              <ToolStep3Ratio />
              <ToolStep4Social />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
