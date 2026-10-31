'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PersonalShowcasePage() {
  const [lang, setLang] = useState('th');
  const [activeTab, setActiveTab] = useState('desktop');

  // Load language preference from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('movy_lang') || 'th';
      setLang(savedLang);
    } catch (e) {}
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'th' ? 'en' : 'th';
    setLang(nextLang);
    try {
      localStorage.setItem('movy_lang', nextLang);
    } catch (e) {}
  };

  const t = {
    th: {
      brandSub: 'Personal Creator Studio & Showcase',
      openStudio: 'เข้าสู่สตูดิโอสร้างสรรค์',
      openMobile: 'โหมดมือถือ',
      badge: 'Production-Grade AI Vocab & Movie Studio',
      heroTitleLine1: 'สร้างคอนเทนต์สอนภาษาอังกฤษ',
      heroTitleLine2: 'จากซีนภาพยนตร์ฮอลลีวูดจริง',
      heroDesc:
        'MoovyEng คือสตูดิโอเว็บแอปพลิเคชันส่วนตัวที่ผสมผสาน AI ขั้นสูงหลายค่าย (Gemini, GPT-4o, Groq) เข้ากับคลิปภาพยนตร์ภาษาอังกฤษความละเอียดสูง พร้อมระบบเรนเดอร์วิดีโอ Full Canvas สำหรับ TikTok, Reels และ Shorts',
      ctaPrimary: 'เข้าสู่สตูดิโอ (Desktop)',
      ctaSecondary: 'เปิดบนมือถือ (Mobile /edit)',
      galleryHeading: 'ภาพรวมการทำงานและอินเทอร์เฟซจริง',
      gallerySub: 'คลิกเพื่อดูหน้าจอและขั้นตอนการทำงานของสตูดิโอในแต่ละมุมมอง',
      featuresHeading: 'สถาปัตยกรรมและเทคโนโลยีสำคัญ',
      featuresSub: 'ออกแบบด้วยมาตรฐาน ElevenLabs Editorial Aesthetic มินิมอล คมชัด และทำงานรวดเร็ว',
      tabDesktop: 'Desktop Two-Column Studio',
      tabDark: 'ElevenLabs Luxury Dark Theme',
      tabMobile: 'Mobile Creator Interface',
      tagDesktop: 'Desktop Layout (1440x900)',
      titleDesktop: 'สตูดิโอแบบ 2 คอลัมน์ ออกแบบพร้อมพรีวิวแบบเรียลไทม์',
      descDesktop:
        'ฝั่งซ้ายเป็น Phone Canvas พรีวิวสดแบบ Sticky ตรึงตำแหน่งขณะเลื่อน และฝั่งขวาเป็นชุดเครื่องมือ 4 ขั้นตอน: AI Generator, คลังคลิปหนัง, Color Lab และข้อมูล Social Profile',
      tagDark: 'Dark Mode Aesthetic',
      titleDark: 'โหมดกลางคืนพรีเมียม สบายตาและเปี่ยมสมาธิ',
      descDark:
        'สลับโหมด Dark Theme ได้ทันที พร้อมระบบคำนวณ Contrast สีตัวหนังสืออัตโนมัติ ทำให้การอ่านและจัดสไลด์ตัวอย่างประโยคชัดเจนในทุกระดับความสว่าง',
      tagMobile: 'Touch-Optimized Mobile View',
      titleMobile: 'โหมดสร้างสรรค์บนมือถือ ใช้งานได้ทุกที่',
      descMobile:
        'ออกแบบแยกสำหรับสมาร์ตโฟนโดยเฉพาะ เลื่อนสัมผัสง่าย พร้อมแถบเมนูลัดด้านล่าง และปุ่ม Export สไลด์และวิดีโอได้จากบนมือถือโดยตรง',
      
      // Guide / How to use
      guideHeading: 'วิธีใช้งาน MoovyEng ง่ายๆ ใน 4 ขั้นตอน',
      guideSub: 'ขั้นตอนสร้างวิดีโอสั้นพร้อมโพสต์ลงโซเชียลตั้งแต่เริ่มต้นจนจบ',
      step1Num: '01',
      step1Title: 'เลือกหรือค้นหาคำศัพท์ / ให้ AI ช่วยแต่ง',
      step1Desc: 'พิมพ์คำศัพท์หรือสำนวนที่ต้องการ หรือกดสุ่มคำศัพท์ Phrasal Verbs ระบบ AI จะช่วยเติมคำอ่านไทย คำแปล และตัวอย่างประโยคจากบริบทจริงให้อัตโนมัติ',
      step2Num: '02',
      step2Title: 'เลือกคลิปภาพยนตร์ภาษาอังกฤษจริง',
      step2Desc: 'ระบบจะดึงซีนภาพยนตร์จาก clip.cafe ที่มีบทพูดตรงกับคำศัพท์นั้นๆ ให้คุณสามารถกดฟังเสียง กดเลือกคลิปเข้าคิวเล่นต่อเนื่อง หรือสลับซีนที่ชอบได้ทันที',
      step3Num: '03',
      step3Title: 'ปรับแต่งสไตล์ สี และสัดส่วนวิดีโอ',
      step3Desc: 'เลือกสัดส่วน 9:16 (แนวตั้งสำหรับ TikTok/Reels) หรือ 16:9 (แนวนอน) ปรับโทนสีพื้นหลัง การไล่ระดับสี และเลือกฟอนต์ลายมือหรือโมเดิร์นที่ต้องการ',
      step4Num: '04',
      step4Title: 'กดส่งออกวิดีโอ MP4 คมชัดพร้อมแคปชัน',
      step4Desc: 'คลิกปุ่ม Export ด้านบนขวา ระบบจะเรนเดอร์ทั้งหน้าพรีวิวพร้อมคลิปรวมเป็นไฟล์ MP4 คุณภาพสูง และล้างไฟล์แคชในเซิร์ฟเวอร์ให้อัตโนมัติทันทีที่ดาวน์โหลดเสร็จ',

      feat1Title: 'Multi-AI Prompt Engine',
      feat1Desc:
        'รองรับ Google Gemini 2.5, OpenAI GPT-4o, Groq LLaMA 3, Claude 3.5 และ OpenRouter ช่วยแนะนำประโยคตัวอย่าง คำอ่านไทย และแคปชันอย่างแม่นยำ',
      feat2Title: 'Clip.cafe High-Res Cinema',
      feat2Desc:
        'ดึงคลิปภาพยนตร์ภาษาอังกฤษจริงที่พูดตรงกับคำศัพท์หรือสำนวน พร้อมระบบเล่นวิดีโอต่อเนื่องและพรีวิวลงบนการ์ดแบบ Real-time',
      feat3Title: 'Automated Cache Pruning',
      feat3Desc:
        'ระบบส่งออกวิดีโอ MP4 คมชัดด้วย Python FFmpeg พร้อมคำสั่งล้างแคชไฟล์ชั่วคราวทั้งหมดอัตโนมัติทันทีที่ดาวน์โหลดเสร็จสิ้น ไม่กินพื้นที่เครื่อง',
      ctaFinalTitle: 'พร้อมเริ่มสร้างสรรค์คลิปภาษาอังกฤษแล้วหรือยัง?',
      ctaFinalDesc: 'เปิดใช้งาน MoovyEng ได้ทันทีผ่านเบราว์เซอร์ของคุณ ทั้งบนคอมพิวเตอร์และมือถือ',
      ctaFinalBtn: 'เข้าสู่สตูดิโอ MoovyEng ตอนนี้',
      
      // Footer Creator & Repo
      creatorHeading: 'เกี่ยวกับผู้พัฒนา & โอเพนซอร์สเพื่อการศึกษา',
      creatorDesc: 'โปรเจกต์นี้สร้างขึ้นโดย Nawapawn เพื่อเป็นสื่อการเรียนรู้ ทดลองพัฒนาระบบ Full-Stack Next.js + Python Clip Processing Engine และเปิดเป็นโอเพนซอร์สสำหรับผู้ที่สนใจศึกษาต่อยอด',
      githubBtn: 'ศึกษาโค้ดบน GitHub (Open Source)',
      footerRights: '© 2026 MoovyEng. Created with passion by Nawapawn for educational & creative purposes.',
      footerHome: 'หน้าสตูดิโอหลัก',
      footerMobile: 'โหมดมือถือ',
      footerAbout: 'เกี่ยวกับโปรเจกต์',
    },
    en: {
      brandSub: 'Personal Creator Studio & Showcase',
      openStudio: 'Launch Studio',
      openMobile: 'Mobile Mode',
      badge: 'Production-Grade AI Vocab & Movie Studio',
      heroTitleLine1: 'Craft Engaging English Videos',
      heroTitleLine2: 'From Iconic Hollywood Scenes',
      heroDesc:
        'MoovyEng is a personal creator web studio that unites Multi-Provider AI (Gemini, GPT-4o, Groq) with authentic English movie scenes, rendering production-ready full canvas short videos for TikTok, Reels, and Shorts.',
      ctaPrimary: 'Launch Studio (Desktop)',
      ctaSecondary: 'Open Mobile View (/edit)',
      galleryHeading: 'System Architecture & Live Interface',
      gallerySub: 'Explore real system captures across desktop, dark theme, and mobile experiences.',
      featuresHeading: 'Core Pillars & Engineering',
      featuresSub: 'Crafted with ElevenLabs Editorial Aesthetics — minimal, precise, and highly responsive.',
      tabDesktop: 'Desktop Two-Column Studio',
      tabDark: 'ElevenLabs Luxury Dark Theme',
      tabMobile: 'Mobile Creator Interface',
      tagDesktop: 'Desktop Layout (1440x900)',
      titleDesktop: 'Dual-Column Studio with Live Synchronized Preview',
      descDesktop:
        'Left pinned phone canvas stays sticky while you scroll through 4 progressive tool suites on the right: AI Generator, Clip Pool, Color Lab, and Social Captioning.',
      tagDark: 'Dark Mode Aesthetic',
      titleDark: 'ElevenLabs Luxury Dark Theme with Smart Contrast',
      descDark:
        'Instant light/dark switching with dynamic text color inversion, ensuring optimal readability and eye comfort across movie clip backdrops.',
      tagMobile: 'Touch-Optimized Mobile View',
      titleMobile: 'Dedicated Touch Studio for On-the-Go Creators',
      descMobile:
        'Seamless mobile interface with bottom quick navigation, live slide renderer, and direct export actions tailored for iOS and Android displays.',
      
      // Guide / How to use
      guideHeading: 'How to Use MoovyEng in 4 Simple Steps',
      guideSub: 'The complete workflow from discovering words to rendering short videos ready for social posting.',
      step1Num: '01',
      step1Title: 'Select or Search Vocabulary / Let AI Formulate',
      step1Desc: 'Type your target word or pick curated phrasal verbs. The Multi-AI engine automatically generates authentic example sentences, Thai phonetics, and grammatical nuances.',
      step2Num: '02',
      step2Title: 'Browse & Queue Real Movie Dialogue Clips',
      step2Desc: 'The system indexes high-definition movie clips from clip.cafe containing the exact line. Audition audio, queue multiple scenes, and watch them play sequentially in the preview.',
      step3Num: '03',
      step3Title: 'Customize Canvas Palette, Font & Aspect Ratio',
      step3Desc: 'Choose 9:16 vertical (TikTok/Reels/Shorts) or 16:9 widescreen. Refine background gradient, adjust padding, and apply hand-drawn or editorial fonts.',
      step4Num: '04',
      step4Title: 'Export MP4 Video with 1-Click Server Cleanup',
      step4Desc: 'Click Export in the top header. The Python FFmpeg engine renders the full canvas with audio, and purges intermediate server cache immediately once downloaded.',

      feat1Title: 'Multi-AI Prompt Engine',
      feat1Desc:
        'Integrated with Gemini 2.5, OpenAI GPT-4o, Groq LLaMA 3, Claude 3.5 and OpenRouter for natural collocations, Thai phonetics, and viral social hooks.',
      feat2Title: 'Clip.cafe High-Res Cinema',
      feat2Desc:
        'Indexes verified movie moments matching your vocabulary, providing seamless sequential multi-clip playback inside 16:9 canvas apertures.',
      feat3Title: 'Automated Cache Pruning',
      feat3Desc:
        'Python FFmpeg video compiler with intelligent post-download cleanup that purges server temporary files immediately upon completed download.',
      ctaFinalTitle: 'Ready to create engaging video lessons?',
      ctaFinalDesc: 'Jump into MoovyEng Studio directly in your browser — zero installation required.',
      ctaFinalBtn: 'Launch MoovyEng Studio',
      
      // Footer Creator & Repo
      creatorHeading: 'Creator & Educational Open Source',
      creatorDesc: 'Created by Nawapawn as a full-stack learning project combining Next.js with Python media engines, and open-sourced for developers and creators to study and build upon.',
      githubBtn: 'Study Source Code on GitHub',
      footerRights: '© 2026 MoovyEng. Created with passion by Nawapawn for educational & creative purposes.',
      footerHome: 'Studio Home',
      footerMobile: 'Mobile Mode',
      footerAbout: 'About Showcase',
    },
  }[lang];

  const galleryData = {
    desktop: {
      tag: t.tagDesktop,
      title: t.titleDesktop,
      desc: t.descDesktop,
      avif: '/screenshots/hero_studio_1440.avif',
      webp: '/screenshots/hero_studio_1440.webp',
      png: '/screenshots/hero_studio_1440.png',
      badge: '1440 x 900 Desktop View',
    },
    dark: {
      tag: t.tagDark,
      title: t.titleDark,
      desc: t.descDark,
      avif: '/screenshots/studio_dark_1440.avif',
      webp: '/screenshots/studio_dark_1440.webp',
      png: '/screenshots/studio_dark_1440.png',
      badge: 'Dark Mode Activated',
    },
    mobile: {
      tag: t.tagMobile,
      title: t.titleMobile,
      desc: t.descMobile,
      avif: '/screenshots/mobile_editor_touch.avif',
      webp: '/screenshots/mobile_editor_touch.webp',
      png: '/screenshots/mobile_editor_touch.png',
      badge: '414 x 896 Mobile Touch View',
    },
  };

  const currentShot = galleryData[activeTab] || galleryData.desktop;

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0c0a09] text-[#292524] dark:text-[#f5f5f4] selection:bg-[#f4c5a8]/40 transition-colors duration-300 relative overflow-x-hidden font-sans">
      {/* ElevenLabs Atmospheric Pastel Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[42rem] h-[42rem] rounded-full opacity-40 dark:opacity-15 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #a7e5d3 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[44rem] h-[44rem] rounded-full opacity-40 dark:opacity-15 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #f4c5a8 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed -bottom-40 left-1/4 w-[42rem] h-[42rem] rounded-full opacity-35 dark:opacity-10 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #c8b8e0 0%, transparent 70%)' }} />

      {/* Floating Editorial Top Navigation */}
      <nav className="sticky top-4 z-50 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white/90 dark:bg-[#1c1917]/90 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-2xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4 transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/icon.svg" alt="MoovyEng Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
            <div>
              <span className="editorial-display text-xl font-bold tracking-tight text-[#0c0a09] dark:text-white leading-none block">
                MoovyEng
              </span>
              <span className="text-[10px] text-[#777169] dark:text-[#a8a29e] block font-medium mt-0.5">
                {t.brandSub}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Switcher Button (TH / EN) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="h-8 px-3 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-[#f5f5f4] text-xs font-semibold border border-[#d6d3d1] dark:border-[#44403c] hover:bg-[#e7e5e4] dark:hover:bg-[#3b3633] transition flex items-center gap-1.5 shadow-2xs"
              title="Switch Language (TH / EN)"
            >
              <i className="fa-solid fa-globe text-[11px] text-[#777169] dark:text-[#a8a29e]" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Launch Studio CTA */}
            <Link
              href="/"
              className="h-8 px-4 rounded-full bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
            >
              <span>{t.openStudio}</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] text-xs font-medium text-[#777169] dark:text-[#d6d3d1] mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.badge}</span>
        </div>

        <h1 className="editorial-display text-4xl sm:text-6xl font-light text-[#0c0a09] dark:text-white leading-[1.15] mb-6 tracking-tight">
          {t.heroTitleLine1} <br />
          <span className="font-normal text-[#292524] dark:text-[#f5f5f4] underline decoration-[#f4c5a8] decoration-wavy decoration-2 underline-offset-8">
            {t.heroTitleLine2}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#777169] dark:text-[#a8a29e] max-w-2xl mx-auto leading-relaxed mb-8">
          {t.heroDesc}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2.5"
          >
            <span>{t.ctaPrimary}</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
          <Link
            href="/edit"
            className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] text-[#0c0a09] dark:text-white text-xs font-semibold hover:bg-[#fafafa] dark:hover:bg-[#25221f] transition shadow-2xs flex items-center gap-2"
          >
            <i className="fa-solid fa-mobile-screen text-xs text-[#777169] dark:text-[#a8a29e]" />
            <span>{t.ctaSecondary}</span>
          </Link>
        </div>
      </header>

      {/* Live Interactive UI Gallery Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="editorial-display text-2xl sm:text-3xl font-normal text-[#0c0a09] dark:text-white mb-2">
            {t.galleryHeading}
          </h2>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e]">
            {t.gallerySub}
          </p>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'desktop'
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-xs'
                : 'bg-white/80 dark:bg-[#1c1917]/80 text-[#777169] dark:text-[#a8a29e] border border-[#e7e5e4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#25221f]'
            }`}
          >
            <i className="fa-solid fa-desktop text-xs" />
            <span>{t.tabDesktop}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dark')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'dark'
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-xs'
                : 'bg-white/80 dark:bg-[#1c1917]/80 text-[#777169] dark:text-[#a8a29e] border border-[#e7e5e4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#25221f]'
            }`}
          >
            <i className="fa-solid fa-moon text-xs" />
            <span>{t.tabDark}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              activeTab === 'mobile'
                ? 'bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] shadow-xs'
                : 'bg-white/80 dark:bg-[#1c1917]/80 text-[#777169] dark:text-[#a8a29e] border border-[#e7e5e4] dark:border-[#292524] hover:bg-white dark:hover:bg-[#25221f]'
            }`}
          >
            <i className="fa-solid fa-mobile-screen text-xs" />
            <span>{t.tabMobile}</span>
          </button>
        </div>

        {/* Master Showcase Frame with Minimal Chrome */}
        <div className="bg-white/90 dark:bg-[#1c1917]/90 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] rounded-2xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.05)] space-y-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0efed] dark:border-[#292524]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#777169] dark:text-[#a8a29e]">
                {currentShot.tag}
              </span>
              <h3 className="text-lg font-semibold text-[#0c0a09] dark:text-white mt-0.5">
                {currentShot.title}
              </h3>
              <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1 max-w-2xl leading-relaxed">
                {currentShot.desc}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-[#f0efed] dark:bg-[#292524] hover:bg-[#0c0a09] hover:text-white dark:hover:bg-white dark:hover:text-[#0c0a09] text-xs font-semibold text-[#0c0a09] dark:text-white transition flex items-center gap-1.5 self-start sm:self-center flex-shrink-0"
            >
              <span>{t.openStudio}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
            </Link>
          </div>

          {/* Browser Window Frame with Responsive Next-Gen Picture */}
          <div className="rounded-xl overflow-hidden border border-[#e7e5e4] dark:border-[#292524] bg-[#fafafa] dark:bg-[#12100e] shadow-sm">
            <div className="px-3.5 py-2 bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border-b border-[#e7e5e4] dark:border-[#292524] flex items-center justify-between text-[11px] text-[#777169] dark:text-[#a8a29e]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e7e5e4] dark:bg-[#292524]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#e7e5e4] dark:bg-[#292524]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#e7e5e4] dark:bg-[#292524]" />
                <span className="ml-2 font-mono text-[10px]">https://moovyeng.vercel.app</span>
              </div>
              <span className="text-[10px] font-medium hidden sm:inline">{currentShot.badge}</span>
            </div>

            <div className="relative aspect-video sm:aspect-[16/10] w-full overflow-hidden bg-black/5 flex items-center justify-center">
              <picture className="w-full h-full">
                {/* 1. Ultra modern AVIF format (High compression, smallest footprint ~48KB) */}
                <source srcSet={currentShot.avif} type="image/avif" />
                {/* 2. Modern WebP format (Supported on 98%+ browsers ~80KB) */}
                <source srcSet={currentShot.webp} type="image/webp" />
                {/* 3. Fallback standard PNG format */}
                <img
                  src={currentShot.png}
                  alt={currentShot.title}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain sm:object-cover transition-opacity duration-300"
                />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Step-by-Step Interactive Guide (เข้าใจง่ายใน 4 ขั้นตอน) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="editorial-display text-2xl sm:text-3xl font-normal text-[#0c0a09] dark:text-white mb-2">
            {t.guideHeading}
          </h2>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e]">
            {t.guideSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center">
              {t.step1Num}
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white">
              {t.step1Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center">
              {t.step2Num}
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white">
              {t.step2Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center">
              {t.step3Num}
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white">
              {t.step3Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.step3Desc}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center">
              {t.step4Num}
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white">
              {t.step4Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.step4Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Feature Pillars (3 Minimal Cards) */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <div className="text-center mb-10">
          <h2 className="editorial-display text-2xl sm:text-3xl font-normal text-[#0c0a09] dark:text-white mb-2">
            {t.featuresHeading}
          </h2>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e]">
            {t.featuresSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm mb-4 transition-colors">
              <i className="fa-solid fa-microchip" />
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white mb-2">
              {t.feat1Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.feat1Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm mb-4 transition-colors">
              <i className="fa-solid fa-film" />
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white mb-2">
              {t.feat2Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.feat2Desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:border-[#0c0a09] dark:hover:border-white transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#f0efed] dark:bg-[#292524] text-[#0c0a09] dark:text-white flex items-center justify-center text-sm mb-4 transition-colors">
              <i className="fa-solid fa-trash-can-arrow-up" />
            </div>
            <h3 className="text-sm font-semibold text-[#0c0a09] dark:text-white mb-2">
              {t.feat3Title}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {t.feat3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Clean Call to Action */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="p-10 rounded-2xl bg-white/90 dark:bg-[#1c1917]/90 border border-[#e7e5e4] dark:border-[#292524] backdrop-blur-md shadow-sm">
          <h2 className="editorial-display text-2xl sm:text-3xl font-normal text-[#0c0a09] dark:text-white mb-3">
            {t.ctaFinalTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#777169] dark:text-[#a8a29e] max-w-lg mx-auto mb-6 leading-relaxed">
            {t.ctaFinalDesc}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold shadow-xs hover:shadow-md transition flex items-center gap-2"
            >
              <span>{t.ctaFinalBtn}</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Creator Profile & Open Source Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        <div className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-[#1c1917]/80 border border-[#e7e5e4] dark:border-[#292524] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#f0efed] dark:bg-[#292524] border border-[#e7e5e4] dark:border-[#44403c] flex items-center justify-center text-xl text-[#0c0a09] dark:text-white flex-shrink-0">
              <i className="fa-brands fa-github" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0c0a09] dark:text-white">
                  nawapawn / MoovyEng
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                  Public Repo
                </span>
              </div>
              <p className="text-xs text-[#777169] dark:text-[#a8a29e] mt-1 max-w-xl leading-relaxed">
                {t.creatorDesc}
              </p>
            </div>
          </div>

          <a
            href="https://github.com/nawapawn/MoovyEng"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold hover:opacity-90 transition flex items-center gap-2 flex-shrink-0 shadow-xs"
          >
            <i className="fa-brands fa-github text-sm" />
            <span>{t.githubBtn}</span>
          </a>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="relative z-10 border-t border-[#e7e5e4] dark:border-[#292524] py-8 text-center text-xs text-[#777169] dark:text-[#a8a29e]">
        <p className="font-mono text-[11px]">{t.footerRights}</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
          <Link href="/" className="hover:text-[#0c0a09] dark:hover:text-white transition">
            {t.footerHome}
          </Link>
          <span>•</span>
          <Link href="/edit" className="hover:text-[#0c0a09] dark:hover:text-white transition">
            {t.footerMobile}
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[#0c0a09] dark:hover:text-white transition">
            {t.footerAbout}
          </Link>
          <span>•</span>
          <a
            href="https://github.com/nawapawn/MoovyEng"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#0c0a09] dark:hover:text-white transition inline-flex items-center gap-1"
          >
            <i className="fa-brands fa-github text-[11px]" />
            <span>GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
