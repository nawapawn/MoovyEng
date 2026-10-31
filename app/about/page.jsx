'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LuxuryAboutPage() {
  const [lang, setLang] = useState('th');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const mainContainerRef = useRef(null);

  // Sync language with localStorage
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

  /**
   * GSAP ScrollTrigger Animations
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
      heroTl
        .from('.hero-badge', { y: 20, opacity: 0, scale: 0.95, duration: 0.8 })
        .from('.hero-title', { y: 40, opacity: 0, scale: 0.98, duration: 1.2 }, '-=0.5')
        .from('.hero-desc', { y: 25, opacity: 0, duration: 1.0 }, '-=0.8')
        .from('.hero-cta-btn', { y: 20, opacity: 0, scale: 0.96, stagger: 0.1, duration: 0.8 }, '-=0.7');

      // 2. Carousel Section Reveal
      gsap.from('.carousel-section', {
        scrollTrigger: {
          trigger: '.carousel-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out'
      });

      // 3. Detailed Guide Steps
      gsap.from('.guide-card-detail', {
        scrollTrigger: {
          trigger: '.guide-cards-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 1.0,
        ease: 'power2.out'
      });

      // 4. Feature Pillars
      gsap.from('.feature-card-luxury', {
        scrollTrigger: {
          trigger: '.feature-cards-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 30,
        opacity: 0,
        stagger: 0.12,
        duration: 1.0,
        ease: 'power2.out'
      });
    }, mainContainerRef);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [lang]);

  // Content Translations
  const isTh = lang === 'th';

  const slides = [
    {
      id: 'studio_overview',
      tag: isTh ? '01 / ภาพรวมสตูดิโอ' : '01 / STUDIO OVERVIEW',
      title: isTh ? 'สตูดิโอ 2 คอลัมน์ ออกแบบพร้อมพรีวิวสด' : 'Two-Column Realtime Creative Workspace',
      desc: isTh
        ? 'จัดวาง Phone Canvas ด้านซ้ายตรึงตำแหน่งตายตัว และเครื่องมือฝั่งขวา 4 สเต็ปอย่างเป็นระเบียบ ให้คุณเห็นผลลัพธ์ของวิดีโอทันทีทุกครั้งที่แก้ไข'
        : 'Sticky vertical canvas on the left, paired with 4 synchronized workflow modules on the right for zero-latency video authoring.',
      img: '/screenshots/studio_overview.webp',
      fallback: '/screenshots/studio_overview.png',
      badge: isTh ? 'อินเทอร์เฟซเดสก์ท็อปมาตรฐาน 1440x900' : 'Desktop Studio Canvas'
    },
    {
      id: 'preview_canvas',
      tag: isTh ? '02 / พรีวิวแคนวาสมือถือ' : '02 / SMART PHONE CANVAS',
      title: isTh ? 'จัดวางข้อความอิสระ พร้อมระบบไม้บรรทัดไกด์' : 'Interactive Draggable Canvas & Smart Guides',
      desc: isTh
        ? 'ทุกองค์ประกอบทั้งคำศัพท์, สัทอักษร, คำอ่านไทย, กล่องคลิป 16:9, ไวยากรณ์ และตัวอย่างประโยค สามารถคลิกลากย้ายตำแหน่งได้อย่างอิสระ พร้อมเส้นไกด์บอกระยะห่างแบบพิกเซล'
        : 'Freely reposition target words, IPA phonetics, meaning, and video boxes with pixel-precise alignment distance indicators.',
      img: '/screenshots/section_preview_canvas.webp',
      fallback: '/screenshots/section_preview_canvas.png',
      badge: isTh ? 'สัดส่วนแนวตั้ง 9:16 (TikTok / Reels / Shorts)' : '9:16 Vertical Video'
    },
    {
      id: 'step1_ai',
      tag: isTh ? '03 / ปัญญาประดิษฐ์ AI' : '03 / MULTI-AI PROMPT ENGINE',
      title: isTh ? 'เชื่อมต่อโมเดล AI ชั้นนำระดับโลก' : 'Seamless Multi-Vendor AI Connectivity',
      desc: isTh
        ? 'รองรับ Gemini 2.5 Pro/Flash, OpenAI GPT-4o, Groq LLaMA 3.3, Claude 3.7 Sonnet และ DeepSeek R1 ตรวจสอบ API Key อัตโนมัติและดึงโมเดลใหม่ล่าสุดทันที'
        : 'Direct integration with Google Gemini, OpenAI, Claude 3.7, Groq, and DeepSeek for instant idiom extraction and sentence creation.',
      img: '/screenshots/section_step1_ai.webp',
      fallback: '/screenshots/section_step1_ai.png',
      badge: isTh ? 'โมเดล AI มากกว่า 15+ ตัวเลือก' : '15+ Top Tier LLM Models'
    },
    {
      id: 'step2_vocab',
      tag: isTh ? '04 / คลังคำศัพท์ & บทหนัง' : '04 / CINEMA DIALOGUE SCRAPER',
      title: isTh ? 'ค้นหาและดึงคลิปหนังฮอลลีวูดจริงแบบ HD' : 'Clip.cafe Real Dialogue Matching & Extraction',
      desc: isTh
        ? 'เพียงพิมพ์คำศัพท์ที่ต้องการ ระบบจะค้นหาบทสนทนาจากหนังฮอลลีวูดจริงบน Clip.cafe ดึงวิดีโอเสียงต้นฉบับมาเข้าคิวเล่นแบบไร้รอยต่อ พร้อมแต่งประโยคตามบริบทหนัง'
        : 'Instantly query authentic cinema moments matching your idiom, audition original audio, and craft paired contextual sentences.',
      img: '/screenshots/section_step2_vocab.webp',
      fallback: '/screenshots/section_step2_vocab.png',
      badge: isTh ? 'คลิปหนังแท้จากฐานข้อมูล Clip.cafe' : 'Verified Cinema Archives'
    },
    {
      id: 'step3_ratio',
      tag: isTh ? '05 / สัดส่วนภาพ & ห้องสี' : '05 / RATIO & COLOR LAB',
      title: isTh ? 'สลับสัดส่วน 9:16 / 16:9 และปรับแต่งเฉดสี' : 'Solid Canvas Palette & Play Queue Sequence',
      desc: isTh
        ? 'เลือกสัดส่วนภาพสำหรับ TikTok หรือ YouTube แนวนอน ถาดสีระดับโปรแบบ Canva พร้อมฟังก์ชันคิวคลิปเล่นต่อเนื่องด้วย Python Media Engine'
        : 'Toggle between 9:16 portrait and 16:9 widescreen, pick custom backdrop tones, and organize sequential playback.',
      img: '/screenshots/section_step3_ratio.webp',
      fallback: '/screenshots/section_step3_ratio.png',
      badge: isTh ? 'สลับอัตราส่วนทันที ไม่ต้องรีเรนเดอร์' : 'Instant Canvas Reframe'
    },
    {
      id: 'mobile_touch',
      tag: isTh ? '06 / โหมดสมาร์ตโฟน' : '06 / TOUCH-OPTIMIZED MOBILE',
      title: isTh ? 'สร้างสรรค์ได้ทุกที่ผ่านหน้าจอสมาร์ตโฟน' : 'Dedicated Mobile Interface at /edit',
      desc: isTh
        ? 'ออกแบบอินเทอร์เฟซแยกสำหรับมือถือโดยเฉพาะ แถบเมนูด้านล่างขนาดใหญ่แตะสัมผัสง่าย พร้อมปุ่ม Export วิดีโอบนมือถือได้ทันที'
        : 'Fully responsive mobile creator studio with bottom action bar, thumb-reachable step navigation, and direct MP4 export.',
      img: '/screenshots/mobile_touch_studio.webp',
      fallback: '/screenshots/mobile_touch_studio.png',
      badge: isTh ? 'รองรับ Touch Gesture เต็มรูปแบบ' : '414 x 896 Mobile Touch'
    }
  ];

  const currentSlide = slides[carouselIndex];

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
      ref={mainContainerRef}
      style={{
        fontFamily: isTh ? "'PrintAble4U', 'Prompt', sans-serif" : "'Inter', -apple-system, sans-serif"
      }}
      className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-[#0c0a09] dark:text-[#f5f5f4] transition-colors duration-300 selection:bg-[#0c0a09] selection:text-white dark:selection:bg-white dark:selection:text-[#0c0a09] relative overflow-hidden"
    >
      {/* Ambient Floating Glow Orbs (Subtle luxury ElevenLabs background) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#a7e5d3]/20 via-[#f4c5a8]/10 to-transparent blur-3xl animate-float-slow" />
        <div className="absolute top-[35%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#c8b8e0]/20 via-[#a7e5d3]/10 to-transparent blur-3xl animate-float-delayed" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-[#f4c5a8]/15 via-transparent to-transparent blur-3xl animate-float-slow" />
      </div>

      {/* Luxury Minimalist Header */}
      <nav className="relative z-20 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/icon.svg"
            alt="MoovyEng Logo"
            className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <div>
            <span className="editorial-display text-2xl font-normal tracking-tight text-[#0c0a09] dark:text-white block leading-none">
              MoovyEng
            </span>
            <span className="text-[10px] text-[#777169] dark:text-[#a8a29e] tracking-wider uppercase font-medium">
              Cinema Vocab Studio
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] text-xs font-semibold text-[#0c0a09] dark:text-white hover:bg-white dark:hover:bg-[#25221f] transition shadow-2xs"
            title={isTh ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
          >
            {lang.toUpperCase()}
          </button>

          <Link
            href="/"
            className="btn-magical px-4 py-2 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold shadow-xs flex items-center gap-2"
          >
            <span>{isTh ? 'เข้าสู่สตูดิโอ' : 'Launch Studio'}</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-16 text-center space-y-6">
        {/* Shimmer Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 dark:border-amber-400/25 shadow-xs shimmer-badge">
          <i className="fa-solid fa-wand-magic-sparkles text-amber-500 text-xs" />
          <span className="text-[11px] font-medium text-[#0c0a09] dark:text-white tracking-wide">
            {isTh ? 'สถาปัตยกรรมสตูดิโอระดับพรีเมียม • ElevenLabs Aesthetic' : 'Next-Generation Cinema Vocab Engine'}
          </span>
        </div>

        <h1 className="hero-title editorial-display text-4xl sm:text-6xl text-[#0c0a09] dark:text-white font-normal tracking-tight leading-[1.12]">
          {isTh ? (
            <>
              สร้างคอนเทนต์สอนภาษาอังกฤษ <br className="hidden sm:inline" />
              <span className="italic font-serif">จากซีนภาพยนตร์จริง</span> สู่โซเชียลมีเดีย
            </>
          ) : (
            <>
              Craft English Video Lessons <br className="hidden sm:inline" />
              <span className="italic font-serif">from Authentic Cinema Scenes</span>
            </>
          )}
        </h1>

        <p className="hero-desc max-w-2xl mx-auto text-sm sm:text-base text-[#777169] dark:text-[#a8a29e] leading-relaxed">
          {isTh
            ? 'MoovyEng รวมพลังของ Multi-AI, คลังคลิปหนังความละเอียดสูง และระบบเรนเดอร์วิดีโอ Full Canvas เพื่อสร้างคลิปสั้นสำหรับ TikTok, Reels และ YouTube Shorts ได้ในไม่กี่คลิก'
            : 'MoovyEng seamlessly fuses multi-vendor AI reasoning, high-definition Hollywood dialogue moments, and instant full-canvas video generation in your browser.'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="hero-cta-btn btn-magical px-6 py-3.5 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold shadow-md flex items-center gap-2.5"
          >
            <span>{isTh ? 'เปิดสตูดิโอบนคอม (Desktop)' : 'Launch Desktop Studio'}</span>
            <i className="fa-solid fa-desktop text-[11px]" />
          </Link>
          <Link
            href="/edit"
            className="hero-cta-btn btn-magical px-5 py-3.5 rounded-xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] text-[#0c0a09] dark:text-white text-xs font-semibold shadow-2xs flex items-center gap-2"
          >
            <i className="fa-solid fa-mobile-screen text-xs text-[#777169] dark:text-[#a8a29e]" />
            <span>{isTh ? 'เปิดโหมดมือถือ (Mobile /edit)' : 'Open Mobile Interface'}</span>
          </Link>
        </div>
      </header>

      {/* Interactive Showcase Carousel Section */}
      <section className="carousel-section relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="editorial-display text-2xl sm:text-4xl font-normal text-[#0c0a09] dark:text-white mb-2">
            {isTh ? 'ทัวร์ชมเครื่องมือและระบบการทำงานจริง' : 'Interactive System Tour & Workspace Gallery'}
          </h2>
          <p className="text-xs sm:text-sm text-[#777169] dark:text-[#a8a29e]">
            {isTh
              ? 'เลื่อนดูฟังก์ชันเด่นแต่ละส่วนที่ออกแบบมาเพื่อการผลิตคลิปอย่างมืออาชีพ'
              : 'Explore each synchronized module engineered for high-engagement educational content creation'}
          </p>
        </div>

        {/* Carousel Master Frame */}
        <div className="card-magical rounded-3xl overflow-hidden border border-[#e7e5e4] dark:border-[#292524] bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl shadow-xl">
          {/* Top Window Chrome Bar */}
          <div className="px-5 py-3.5 border-b border-[#f0efed] dark:border-[#27272a] flex items-center justify-between bg-[#fafaf9]/80 dark:bg-[#18181b]/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#10b981]/80 inline-block" />
              <span className="text-[11px] font-mono text-[#777169] dark:text-[#a8a29e] ml-2 hidden sm:inline">
                https://moovyeng.vercel.app/
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#27272a] text-[#0c0a09] dark:text-white">
                {currentSlide.badge}
              </span>
            </div>
          </div>

          {/* Carousel Slide Media & Viewport */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#f4f4f5] dark:bg-[#09090b] flex items-center justify-center group">
            <img
              src={currentSlide.img}
              alt={currentSlide.title}
              loading="eager"
              className="w-full h-full object-contain object-top transition-transform duration-500 group-hover:scale-[1.01]"
              onError={(e) => {
                // Fallback to PNG if WebP is still processing
                e.currentTarget.src = currentSlide.fallback;
              }}
            />

            {/* Left / Right Carousel Controls */}
            <button
              type="button"
              onClick={handlePrevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-[#18181b]/90 text-[#0c0a09] dark:text-white border border-[#e7e5e4] dark:border-[#27272a] shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-80 hover:opacity-100"
              aria-label="Previous Slide"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-[#18181b]/90 text-[#0c0a09] dark:text-white border border-[#e7e5e4] dark:border-[#27272a] shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all opacity-80 hover:opacity-100"
              aria-label="Next Slide"
            >
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>

          {/* Slide Description & Meta Footer */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#18181b] border-t border-[#f0efed] dark:border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                {currentSlide.tag}
              </span>
              <h3 className="editorial-display text-xl sm:text-2xl text-[#0c0a09] dark:text-white font-normal">
                {currentSlide.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#777169] dark:text-[#a8a29e] leading-relaxed">
                {currentSlide.desc}
              </p>
            </div>

            {/* Slide Pagination Dots */}
            <div className="flex items-center gap-1.5 self-start sm:self-center">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === carouselIndex
                      ? 'w-7 bg-[#0c0a09] dark:bg-white'
                      : 'w-2 bg-[#d6d3d1] dark:bg-[#3f3f46] hover:bg-[#a1a1aa]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step 4 Core Workflow Modules */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="editorial-display text-2xl sm:text-4xl font-normal text-[#0c0a09] dark:text-white mb-2">
            {isTh ? 'วิธีใช้งาน MoovyEng อย่างละเอียดใน 4 ขั้นตอน' : 'How It Works: 4 Step-by-Step Walkthrough'}
          </h2>
          <p className="text-xs sm:text-sm text-[#777169] dark:text-[#a8a29e]">
            {isTh
              ? 'ตั้งแต่การเชื่อมต่อโมเดล AI จนถึงการบันทึกวิดีโอ MP4 คมชัดพร้อมลง TikTok และ Reels'
              : 'From connecting your preferred AI engine to rendering high-impact short videos in seconds'}
          </p>
        </div>

        <div className="guide-cards-grid grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Step 1 */}
          <div className="guide-card-detail card-magical p-6 rounded-3xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                01
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                AI Provider Setup
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#0c0a09] dark:text-white">
              {isTh ? '1. เลือกโมเดล AI & วาง API Key' : '1. Select AI Model & Authenticate Key'}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {isTh
                ? 'เลือกผู้ให้บริการที่ต้องการ เช่น Google Gemini, OpenAI, Claude หรือ Groq วาง API Key แล้วคลิกปุ่มตรวจเช็ก ระบบจะโหลดลิสต์โมเดลที่ใช้งานได้ให้อัตโนมัติ'
                : 'Select your preferred vendor (Gemini, OpenAI, Anthropic Claude, Groq). Paste your API Key and verify to unlock real-time prompt generation.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="guide-card-detail card-magical p-6 rounded-3xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                02
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                Vocab & Movie Scraper
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#0c0a09] dark:text-white">
              {isTh ? '2. พิมพ์คำศัพท์ & ดึงคลิปหนังภาษาอังกฤษ' : '2. Enter Vocabulary & Queue Movie Scenes'}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {isTh
                ? 'กรอกคำศัพท์ที่ต้องการ หรือกดไอคอนลูกเต๋าเพื่อสุ่มสำนวนยอดฮิต กดปุ่ม "AI วิเคราะห์ & ดึงคลิป" ระบบจะสแกนหาซีนภาพยนตร์ฮอลลีวูดที่มีประโยคตรงกัน พร้อมแต่งประโยคตัวอย่างให้ทันที'
                : 'Type your word or click the random dice. Our engine queries authentic cinema lines containing that phrase, generating natural collocations and Thai phonetics.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="guide-card-detail card-magical p-6 rounded-3xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                03
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                Visual Layout & Font
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#0c0a09] dark:text-white">
              {isTh ? '3. ปรับสัดส่วนภาพ สีพื้นหลัง และจัดฟอนต์' : '3. Customize Aspect Ratio & Typography'}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {isTh
                ? 'เลือกสัดส่วน 9:16 สำหรับแนวตั้ง หรือ 16:9 แนวนอน ปรับสีพื้นหลังผ่าน Color Lab เลือกลายมือหรือฟอนต์มินิมอล และลากวางข้อความบนหน้าพรีวิวได้อย่างอิสระ'
                : 'Switch between 9:16 vertical and 16:9 widescreen. Refine solid backdrop tones, select playful Thai handwriting fonts, and drag elements on the canvas.'}
            </p>
          </div>

          {/* Step 4 */}
          <div className="guide-card-detail card-magical p-6 rounded-3xl bg-white/85 dark:bg-[#1c1917]/85 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                04
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e]">
                Direct MP4 Video Export
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#0c0a09] dark:text-white">
              {isTh ? '4. ส่งออกวิดีโอ MP4 & แคปชั่นพร้อมโพสต์' : '4. Render MP4 & Copy Social Caption'}
            </h3>
            <p className="text-xs text-[#777169] dark:text-[#a8a29e] leading-relaxed">
              {isTh
                ? 'คลิกปุ่ม Export บนแถบเมนูบนสุด เครื่องยนต์ Python FFmpeg จะคอมไพล์วิดีโอทั้งสไลด์พร้อมเสียงให้ทันที พร้อมล้างไฟล์แคชส่วนเกินออกจากเซิร์ฟเวอร์อัตโนมัติ'
                : 'Click Export in the top header. The Python FFmpeg media compiler renders your complete card and movie playback into an MP4 file with automatic server cache pruning.'}
            </p>
          </div>
        </div>
      </section>

      {/* Official Social Channels & Example Output */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/20 dark:border-amber-400/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <i className="fa-solid fa-play text-base" />
          </div>
          <h3 className="editorial-display text-2xl sm:text-3xl text-[#0c0a09] dark:text-white font-normal">
            {isTh ? 'ชมตัวอย่างคลิปวิดีโอที่สร้างจริงบนโซเชียลมีเดีย' : 'Explore Real Video Output on Social Channels'}
          </h3>
          <p className="text-xs sm:text-sm text-[#777169] dark:text-[#a8a29e] max-w-xl mx-auto leading-relaxed">
            {isTh
              ? 'ติดตามผลงานคลิปวิดีโอสั้นสอนภาษาอังกฤษจากหนังที่เรนเดอร์ผ่านระบบ MoovyEng ได้ที่ช่องทางการของเรา:'
              : 'View educational video lessons generated directly from this studio on our official channels:'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="https://www.tiktok.com/@move0nyoung"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-magical px-5 py-3 rounded-xl bg-[#0c0a09] text-white text-xs font-semibold hover:bg-black transition flex items-center gap-2.5 shadow-md"
            >
              <i className="fa-brands fa-tiktok text-sm" />
              <span>TikTok @move0nyoung</span>
            </a>
            <a
              href="https://www.instagram.com/move0nyoung/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-magical px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs font-semibold hover:opacity-95 transition flex items-center gap-2.5 shadow-md"
            >
              <i className="fa-brands fa-instagram text-sm" />
              <span>Instagram @move0nyoung</span>
            </a>
          </div>
        </div>
      </section>

      {/* Creator Profile & Open Source Learning Showcase */}
      <footer className="relative z-10 max-w-5xl mx-auto px-6 pt-10 pb-16 border-t border-[#e7e5e4] dark:border-[#292524] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="editorial-display text-lg text-[#0c0a09] dark:text-white font-normal">
              MoovyEng
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0efed] dark:bg-[#292524] text-[#777169] dark:text-[#a8a29e] font-mono">
              Open Source
            </span>
          </div>
          <p className="text-xs text-[#777169] dark:text-[#a8a29e]">
            {isTh
              ? 'พัฒนาโดย Nawapawn เพื่อการศึกษาและสร้างสรรค์คอนเทนต์การเรียนรู้ภาษาอังกฤษ'
              : 'Crafted with passion by Nawapawn for educational and creative purposes.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/nawapawn/MoovyEng"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-magical px-4 py-2 rounded-xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] text-xs font-semibold text-[#0c0a09] dark:text-white flex items-center gap-2 shadow-2xs"
          >
            <i className="fa-brands fa-github text-sm" />
            <span>{isTh ? 'ศึกษาโค้ดบน GitHub' : 'View GitHub Repo'}</span>
          </a>
          <Link
            href="/"
            className="btn-magical px-4 py-2 rounded-xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-xs font-semibold shadow-xs"
          >
            <span>{isTh ? 'ไปที่สตูดิโอ' : 'Launch Studio'}</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
