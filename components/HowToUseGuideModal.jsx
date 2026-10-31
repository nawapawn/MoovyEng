'use client';

import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';

export default function HowToUseGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useVocab();

  const isTh = lang === 'th';

  return (
    <>
      {/* Floating Shortcut Pill to Open Guide in Studio */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 px-3.5 py-2 rounded-full bg-[#0c0a09]/90 dark:bg-white/90 text-white dark:text-[#0c0a09] backdrop-blur-md text-xs font-semibold shadow-lg hover:scale-105 transition-all flex items-center gap-2 border border-white/20"
        title={isTh ? 'วิธีใช้งาน MoovyEng' : 'How to use MoovyEng'}
      >
        <i className="fa-solid fa-circle-question text-amber-400 dark:text-amber-500" />
        <span>{isTh ? 'วิธีใช้งาน' : 'Quick Guide'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c0a09]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1917] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#e7e5e4] dark:border-[#292524] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#f0efed] dark:border-[#292524]">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-2xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] flex items-center justify-center text-sm font-bold">
                  <i className="fa-solid fa-graduation-cap" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0c0a09] dark:text-white leading-tight">
                    {isTh ? 'วิธีใช้งาน MoovyEng ใน 4 ขั้นตอน' : 'How to Use MoovyEng in 4 Steps'}
                  </h3>
                  <p className="text-xs text-[#777169] dark:text-[#a8a29e]">
                    {isTh ? 'สร้างคลิปสอนภาษาอังกฤษจากหนังจริง พร้อมส่งออก MP4' : 'Craft cinema-powered video lessons with ease'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] text-[#777169] dark:text-[#a8a29e] flex items-center justify-center text-xs transition"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#24211e] border border-[#e7e5e4] dark:border-[#38332f] space-y-2">
                <div className="w-6 h-6 rounded-md bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-[10px] font-mono font-bold flex items-center justify-center">
                  01
                </div>
                <h4 className="text-xs font-bold text-[#0c0a09] dark:text-white">
                  {isTh ? 'ใส่คำศัพท์ หรือกดสุ่มให้ AI ช่วยแต่ง' : 'Enter Vocab or Randomize with AI'}
                </h4>
                <p className="text-[11px] text-[#777169] dark:text-[#a8a29e] leading-relaxed">
                  {isTh
                    ? 'พิมพ์คำศัพท์/สำนวน หรือกดปุ่มลูกเต๋าเพื่อสุ่ม Phrasal Verbs ระบบ AI จะเติมคำอ่านไทย คำแปล และสูตรไวยากรณ์ให้อัตโนมัติ'
                    : 'Type a target phrase or roll the dice for phrasal verbs. AI generates Thai phonetics, meaning, and grammar formulas.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#24211e] border border-[#e7e5e4] dark:border-[#38332f] space-y-2">
                <div className="w-6 h-6 rounded-md bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-[10px] font-mono font-bold flex items-center justify-center">
                  02
                </div>
                <h4 className="text-xs font-bold text-[#0c0a09] dark:text-white">
                  {isTh ? 'เลือกคลิปหนังภาษาอังกฤษจริง' : 'Browse & Queue Authentic Movie Clips'}
                </h4>
                <p className="text-[11px] text-[#777169] dark:text-[#a8a29e] leading-relaxed">
                  {isTh
                    ? 'ระบบจะดึงซีนภาพยนตร์จาก clip.cafe ที่มีบทพูดตรงกับคำศัพท์นั้นๆ ให้คุณกดฟังเสียง และเลือกคลิปเข้าคิวเล่นต่อเนื่องในหน้าพรีวิว'
                    : 'Indexes real Hollywood movie moments from clip.cafe matching your phrase. Audition audio and queue clips for smooth playback.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#24211e] border border-[#e7e5e4] dark:border-[#38332f] space-y-2">
                <div className="w-6 h-6 rounded-md bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-[10px] font-mono font-bold flex items-center justify-center">
                  03
                </div>
                <h4 className="text-xs font-bold text-[#0c0a09] dark:text-white">
                  {isTh ? 'จัดแต่งสไตล์ & สัดส่วนวิดีโอ' : 'Customize Canvas, Font & Aspect Ratio'}
                </h4>
                <p className="text-[11px] text-[#777169] dark:text-[#a8a29e] leading-relaxed">
                  {isTh
                    ? 'เลือกสัดส่วน 9:16 (แนวตั้งสำหรับ TikTok/Reels) หรือ 16:9 แนวนอน ปรับสีพื้นหลัง ลากปรับตำแหน่งข้อความ และเปลี่ยนฟอนต์ตามใจชอบ'
                    : 'Select 9:16 vertical or 16:9 widescreen. Adjust background colors, drag elements into place, and change typography.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-[#24211e] border border-[#e7e5e4] dark:border-[#38332f] space-y-2">
                <div className="w-6 h-6 rounded-md bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-[10px] font-mono font-bold flex items-center justify-center">
                  04
                </div>
                <h4 className="text-xs font-bold text-[#0c0a09] dark:text-white">
                  {isTh ? 'ส่งออกวิดีโอ MP4 คมชัด' : 'Export MP4 Video & Copy Social Caption'}
                </h4>
                <p className="text-[11px] text-[#777169] dark:text-[#a8a29e] leading-relaxed">
                  {isTh
                    ? 'กดปุ่มส่งออกด้านบนขวา เพื่อเรนเดอร์ทั้งพรีวิวรวมกับคลิปหนังเป็นวิดีโอ MP4 คมชัด พร้อมคัดลอกแคปชั่นสำหรับโพสต์ได้ทันที'
                    : 'Click Export to render the complete card composite into MP4 video with audio, with smart automatic post-download cache cleaning.'}
                </p>
              </div>
            </div>

            {/* Official Example Channels */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-xs font-bold">
                <i className="fa-solid fa-sparkles text-amber-500" />
                <span>{isTh ? 'ดูตัวอย่างผลงานจริงจากช่องของเรา' : 'See Real Video Output Examples'}</span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                {isTh
                  ? 'คุณสามารถดูตัวอย่างคลิปวิดีโอสั้นสอนภาษาอังกฤษที่สร้างจากระบบนี้ได้ที่ช่องทางการของโปรเจกต์:'
                  : 'Check out authentic educational short videos generated using this system on our official channels:'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://www.tiktok.com/@move0nyoung"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#0c0a09] text-white text-xs font-semibold hover:bg-black transition flex items-center gap-2 shadow-xs"
                >
                  <i className="fa-brands fa-tiktok text-sm" />
                  <span>TikTok @move0nyoung</span>
                </a>
                <a
                  href="https://www.instagram.com/move0nyoung/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-xs"
                >
                  <i className="fa-brands fa-instagram text-sm" />
                  <span>Instagram @move0nyoung</span>
                </a>
              </div>
            </div>

            {/* Close action */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold transition"
              >
                {isTh ? 'เข้าใจแล้ว เริ่มต้นใช้งาน' : 'Got it, let’s create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
