'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PersonalShowcasePage() {
  const [activeTab, setActiveTab] = useState('desktop');

  const galleryItems = [
    {
      id: 'desktop',
      label: 'Desktop All-in-One Studio',
      icon: 'fa-desktop',
      tag: 'Desktop Studio 1920x1080',
      title: 'สตูดิโอแบบ 2 คอลัมน์ ออกแบบพร้อมพรีวิวแบบเรียลไทม์',
      description:
        'จัดวางฝั่งซ้ายเป็น Phone Live Preview แบบเกาะติดหน้าจอ (Sticky) และฝั่งขวาเป็นชุดเครื่องมือ 4 ขั้นตอน AI Generator, Clip Search, Aspect Ratio & Color Lab, และ Social Profile',
      image: '/screenshots/studio_desktop_preview.png',
    },
    {
      id: 'dark',
      label: 'ElevenLabs Luxury Dark Theme',
      icon: 'fa-moon',
      tag: 'Dark Mode Aesthetic',
      title: 'โหมดกลางคืนระดับพรีเมียม สบายตาและเน้นโฟกัส',
      description:
        'สลับโหมด Dark Theme ได้ในคลิกเดียว พร้อมการปรับ Contrast ตัวหนังสืออัตโนมัติ ให้การอ่านตัวอย่างประโยคและคำศัพท์คมชัดที่สุด',
      image: '/screenshots/studio_dark_mode.png',
    },
    {
      id: 'colorlab',
      label: 'Minimalist Color Laboratory',
      icon: 'fa-palette',
      tag: 'Color & Typography Studio',
      title: 'ระบบจัดสี การไล่ระดับเฉดสี และฟอนต์พรีเมียม 14 แบบ',
      description:
        'ปรับแต่งสีพื้นหลังทั้งแบบสีเดี่ยวและแบบ Gradient ดูดสีจากโปสเตอร์หนัง หรือใส่ฟอนต์ลายมือภาษาอังกฤษและภาษาไทยอย่างอิสระ',
      image: '/screenshots/studio_color_lab.png',
    },
    {
      id: 'mobile',
      label: 'Mobile Creator View (/edit)',
      icon: 'fa-mobile-screen',
      tag: 'Touch-Optimized Mobile UI',
      title: 'โหมดมือถือใช้งานง่าย ออกแบบได้ทุกที่ทุกเวลา',
      description:
        'อินเทอร์เฟซแยกสำหรับสมาร์ตโฟน ออกแบบให้เลื่อนสัมผัสลื่นไหล มีแถบเมนูด้านล่าง Quick Actions และสามารถสั่ง Export ได้ทันทีจากมือถือ',
      image: '/screenshots/studio_mobile_tools.png',
    },
    {
      id: 'export',
      label: 'Video & Slide Exporter',
      icon: 'fa-cloud-arrow-down',
      tag: 'Python FFmpeg Video Engine',
      title: 'ส่งออกวิดีโอ MP4 คมชัดพร้อมแคปชันสำหรับโซเชียล',
      description:
        'เรนเดอร์เนื้อหาทั้งหมดทั้งหน้าพรีวิวพร้อมคลิปภาพยนตร์ 16:9 รวมเป็นวิดีโอสั้นพร้อมโพสต์ลง TikTok, IG Reels และ YouTube Shorts ทันที',
      image: '/screenshots/studio_export_modal.png',
    },
  ];

  const currentItem = galleryItems.find((item) => item.id === activeTab) || galleryItems[0];

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0a09] text-[#1c1917] dark:text-[#f5f5f4] selection:bg-[#f4c5a8]/40 overflow-x-hidden">
      {/* ElevenLabs Pastel Atmosphere Glows */}
      <div className="pointer-events-none fixed -top-36 -left-36 w-[38rem] h-[38rem] rounded-full opacity-45 dark:opacity-20 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #a7e5d3 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed top-1/3 -right-36 w-[40rem] h-[40rem] rounded-full opacity-45 dark:opacity-20 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #f4c5a8 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed -bottom-36 left-1/4 w-[40rem] h-[40rem] rounded-full opacity-35 dark:opacity-15 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #c8b8e0 0%, transparent 70%)' }} />

      {/* Top Floating Glass Navigation */}
      <nav className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-2xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/icon.svg" alt="MoovyEng Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <div>
              <span className="text-xl font-bold tracking-tight text-[#0c0a09] dark:text-white leading-tight block">MoovyEng</span>
              <span className="text-[10px] text-[#78716c] dark:text-[#a8a29e] block font-medium">Personal Creator Showcase</span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] hover:opacity-90 shadow-xs hover:shadow-md transition flex items-center gap-2"
            >
              <span>เข้าใช้งานเว็บเลย</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] text-xs font-semibold text-[#78716c] dark:text-[#d6d3d1] mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          ✨ Official Personal Project Portfolio & Showcase
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0c0a09] dark:text-white leading-[1.12] mb-6">
          ยินดีต้อนรับสู่ <span className="bg-gradient-to-r from-amber-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">MoovyEng</span>
          <br className="hidden sm:inline" /> สตูดิโอสอนภาษาอังกฤษจากคลิปหนัง
        </h1>

        <p className="text-base sm:text-lg text-[#57534e] dark:text-[#a8a29e] max-w-3xl mx-auto leading-relaxed mb-8">
          โปรเจกต์ส่วนตัวที่ผสานคลิปภาพยนตร์ฮอลลีวูดจริง เข้ากับพลังของ <strong>Multi-AI Generator</strong> สร้างเป็นสื่อการเรียนการสอนภาษาอังกฤษแบบวิดีโอสั้น (TikTok, Reels, Shorts) ที่สวยงาม สะดุดตา และเข้าใจง่ายที่สุด
        </p>

        {/* Call-to-action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="px-7 py-4 rounded-2xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 group"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>กดเข้าใช้งานเว็บสตูดิโอ (Desktop)</span>
          </Link>
          <Link
            href="/edit"
            className="px-6 py-4 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] text-[#0c0a09] dark:text-white text-sm font-bold hover:bg-[#f5f5f4] dark:hover:bg-[#25221f] shadow-2xs transition-all flex items-center gap-2.5"
          >
            <i className="fa-solid fa-mobile-screen text-indigo-500" />
            <span>เปิดบนมือถือ (Mobile Mode)</span>
          </Link>
        </div>
      </header>

      {/* Interactive Gallery & Screenshots Showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c0a09] dark:text-white mb-2">
            ตัวอย่างภาพหน้าจอจริงของ MoovyEng
          </h2>
          <p className="text-xs sm:text-sm text-[#78716c] dark:text-[#a8a29e]">
            คลิกเลือกหมวดหมู่ด้านล่างเพื่อชมภาพตัวอย่างแต่ละฟีเจอร์อย่างละเอียด
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {galleryItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-md scale-105'
                    : 'bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md text-[#57534e] dark:text-[#a8a29e] border border-[#e7e5e4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#25221f]'
                }`}
              >
                <i className={`fa-solid ${item.icon} ${isActive ? 'text-amber-400 dark:text-amber-500' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase Main Display Card */}
        <div className="bg-white/90 dark:bg-[#1c1917]/90 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-3xl p-5 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#f0efed] dark:border-[#292524]">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold tracking-wide uppercase mb-2">
                {currentItem.tag}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0c0a09] dark:text-white">
                {currentItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#78716c] dark:text-[#a8a29e] mt-1 max-w-3xl leading-relaxed">
                {currentItem.description}
              </p>
            </div>

            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-bold shadow-xs hover:shadow-md transition flex items-center gap-2 flex-shrink-0"
            >
              <span>ทดลองใช้งานหน้านี้</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
            </Link>
          </div>

          {/* Screenshot Preview with Browser Frame */}
          <div className="rounded-2xl overflow-hidden border border-[#e7e5e4] dark:border-[#292524] bg-[#f5f5f4] dark:bg-[#12100e] shadow-inner relative group">
            {/* Fake macOS / Browser Header Dots */}
            <div className="px-4 py-2.5 bg-white/70 dark:bg-[#1c1917]/70 backdrop-blur-md border-b border-[#e7e5e4] dark:border-[#292524] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="text-[10px] text-[#78716c] dark:text-[#a8a29e] ml-2 font-mono">
                moovyeng.app • {currentItem.label}
              </span>
            </div>

            {/* Actual Screenshot Image */}
            <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden bg-black/5 flex items-center justify-center">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="w-full h-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-brain" />
            </div>
            <h4 className="text-base font-bold text-[#0c0a09] dark:text-white mb-2">Smart Multi-AI</h4>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              สลับใช้ Gemini 2.5, OpenAI GPT-4o หรือ Groq ช่วยคิดตัวอย่างประโยคและคำอ่านไทยที่แม่นยำ พร้อมบันทึกคีย์ไว้ใน Browser ของคุณ
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-clapperboard" />
            </div>
            <h4 className="text-base font-bold text-[#0c0a09] dark:text-white mb-2">Real Movie Clips</h4>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              ค้นหาซีนภาพยนตร์ที่ตรงกับสำนวนภาษาอังกฤษโดยตรง เล่นวิดีโอต่อเนื่องและฝังในหน้าพรีวิวให้เห็นผลลัพธ์ทันที
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-bolt" />
            </div>
            <h4 className="text-base font-bold text-[#0c0a09] dark:text-white mb-2">1-Click Full Export</h4>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              รวมคลิปหนังและสไลด์คำศัพท์เป็นวิดีโอ MP4 อัตราส่วน 9:16 หรือ 16:9 ในคลิกเดียว พร้อมล้างไฟล์แคชอัตโนมัติทันทีที่ดาวน์โหลดเสร็จ
            </p>
          </div>
        </div>
      </section>

      {/* Big Final Call to Action */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-[#e7e5e4] dark:border-[#292524] backdrop-blur-lg">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0c0a09] dark:text-white mb-4">
            พร้อมที่จะสร้างคลิปสอนภาษาอังกฤษของคุณหรือยัง?
          </h2>
          <p className="text-sm text-[#78716c] dark:text-[#a8a29e] max-w-xl mx-auto mb-8">
            กดเข้ามาทดลองใช้งาน MoovyEng Studio ตอนนี้ได้ฟรีทันที โดยไม่ต้องลงทะเบียนใดๆ
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-8 py-4 rounded-2xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-sm font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
            >
              <span>เข้าสู่สตูดิโอ MoovyEng เลยทันที</span>
              <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e7e5e4] dark:border-[#292524] py-8 text-center text-xs text-[#a8a29e]">
        <p>© 2026 MoovyEng. Personal Creator Studio & Portfolio.</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
          <Link href="/" className="hover:text-[#0c0a09] dark:hover:text-white transition">หน้าสตูดิโอหลัก</Link>
          <span>•</span>
          <Link href="/edit" className="hover:text-[#0c0a09] dark:hover:text-white transition">โหมดมือถือ</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[#0c0a09] dark:hover:text-white transition">Personal Showcase</Link>
        </div>
      </footer>
    </div>
  );
}
