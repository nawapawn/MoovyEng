import Link from 'next/link';

export const metadata = {
  title: 'MoovyEng — AI Movie Vocabulary & Creator Studio',
  description: 'The personal showcase & creator studio for turning iconic English movie clips into viral educational micro-learning content for TikTok, Reels, and Shorts.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0a09] text-[#1c1917] dark:text-[#f5f5f4] selection:bg-[#f4c5a8]/40">
      {/* Ambient Pastel Background Glows */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-[34rem] h-[34rem] rounded-full opacity-40 dark:opacity-20 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #a7e5d3 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed top-1/4 -right-32 w-[36rem] h-[36rem] rounded-full opacity-40 dark:opacity-20 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #f4c5a8 0%, transparent 70%)' }} />
      <div className="pointer-events-none fixed -bottom-32 left-1/3 w-[36rem] h-[36rem] rounded-full opacity-35 dark:opacity-15 blur-3xl z-0" style={{ background: 'radial-gradient(circle, #c8b8e0 0%, transparent 70%)' }} />

      {/* Navigation */}
      <nav className="relative z-20 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/icon.svg" alt="MoovyEng Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
          <div>
            <div className="text-xl font-bold tracking-tight text-[#0c0a09] dark:text-white leading-tight">MoovyEng</div>
            <div className="text-[11px] text-[#78716c] dark:text-[#a8a29e]">AI Vocab & Movie Studio</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#f0efed] dark:bg-[#292524] hover:bg-[#e7e5e4] dark:hover:bg-[#3f3b38] transition shadow-2xs"
          >
            เปิดสตูดิโอ (Studio)
          </Link>
          <Link
            href="/edit"
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] hover:opacity-90 transition shadow-sm"
          >
            เข้าใช้บนมือถือ (Mobile)
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] text-xs font-medium text-[#78716c] dark:text-[#d6d3d1] mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Personal Showcase & Creator Studio
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0c0a09] dark:text-white leading-[1.15] mb-6">
          เปลี่ยนซีนหนังดังระดับโลก <br />
          ให้กลายเป็น <span className="bg-gradient-to-r from-amber-600 via-rose-500 to-indigo-600 bg-clip-text text-transparent">คลิปสอนภาษาอังกฤษไวรัล</span>
        </h1>
        <p className="text-base sm:text-lg text-[#57534e] dark:text-[#a8a29e] max-w-2xl mx-auto leading-relaxed mb-8">
          <strong>MoovyEng</strong> คือโปรเจกต์ส่วนตัวที่ผสานความชาญฉลาดของ Multi-AI Engine เข้ากับคลิปภาพยนตร์ภาษาอังกฤษคมชัดระดับ HD พร้อมระบบเรนเดอร์วิดีโอ Full Canvas สำหรับ TikTok, Reels และ YouTube Shorts
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/"
            className="px-6 py-3.5 rounded-2xl bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09] text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>ทดลองใช้งานสตูดิโอฟรี</span>
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#1c1917] border border-[#e7e5e4] dark:border-[#292524] text-sm font-semibold text-[#0c0a09] dark:text-white hover:bg-[#fafafa] dark:hover:bg-[#25221f] transition shadow-2xs flex items-center gap-2"
          >
            <i className="fa-brands fa-github text-sm" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0c0a09] dark:text-white mb-3">จุดเด่นและเทคโนโลยีที่ขับเคลื่อน MoovyEng</h2>
          <p className="text-sm text-[#78716c] dark:text-[#a8a29e]">สร้างขึ้นด้วยความพิถีพิถัน ใส่ใจทุกพิกเซล เพื่อประสบการณ์ Creator ระดับสตูดิโอ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-wand-magic-sparkles" />
            </div>
            <h3 className="text-base font-bold text-[#0c0a09] dark:text-white mb-2">Multi-AI Provider Suite</h3>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              รองรับทั้ง Google Gemini 2.5, OpenAI GPT-4o, Groq LLaMA 3, Claude 3.5 และ OpenRouter ช่วยแต่งประโยค คำอ่านไทย และแคปชันโซเชียลอัตโนมัติ
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-film" />
            </div>
            <h3 className="text-base font-bold text-[#0c0a09] dark:text-white mb-2">Clip.cafe Movie Engine</h3>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              ดึงคลิปหนังภาษาอังกฤษจริงที่ตรงกับคำศัพท์ พร้อมเล่นฉากต่อฉากแบบต่อเนื่องไร้รอยต่อ และพรีวิวสดแบบ Real-Time Canvas
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#1c1917]/80 backdrop-blur-md border border-[#e7e5e4] dark:border-[#292524] shadow-2xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-download" />
            </div>
            <h3 className="text-base font-bold text-[#0c0a09] dark:text-white mb-2">Auto Smart Cleanup</h3>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              ระบบประมวลผลวิดีโอด้วย Python FFmpeg คมชัด พร้อมฟังก์ชันลบแคชคลิปและไฟล์ Export อัตโนมัติทันทีที่ดาวน์โหลดเสร็จสิ้น ไม่เปลืองพื้นที่
            </p>
          </div>
        </div>
      </section>

      {/* Creator Profile / Bio */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white to-[#fafafa] dark:from-[#1c1917] dark:to-[#141210] border border-[#e7e5e4] dark:border-[#292524] shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#f4c5a8]/30 dark:bg-[#f4c5a8]/10 border-2 border-white dark:border-zinc-800 shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/icon.svg" alt="Creator Avatar" className="w-16 h-16 object-contain" />
          </div>
          <div className="text-center sm:text-left space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#0c0a09] dark:bg-white text-white dark:text-[#0c0a09]">
              Creator & Developer
            </div>
            <h3 className="text-xl font-bold text-[#0c0a09] dark:text-white">เกี่ยวกับผู้พัฒนา MoovyEng</h3>
            <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-relaxed">
              สร้างขึ้นด้วยเป้าหมายที่ต้องการให้ผู้เรียนภาษาอังกฤษและคอนเทนต์ครีเอเตอร์สามารถผลิตสื่อการสอนคุณภาพสูงจากภาพยนตร์ได้ภายในไม่กี่คลิก โดยมุ่งเน้นความสวยงาม สบายตา เรียบง่าย และทรงพลัง
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#e7e5e4] dark:border-[#292524] py-8 text-center text-xs text-[#a8a29e]">
        <p>© 2026 MoovyEng. Designed & Developed with Passion.</p>
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
          <Link href="/" className="hover:text-[#0c0a09] dark:hover:text-white transition">หน้าหลักสตูดิโอ</Link>
          <span>•</span>
          <Link href="/edit" className="hover:text-[#0c0a09] dark:hover:text-white transition">โหมดมือถือ</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[#0c0a09] dark:hover:text-white transition">เกี่ยวกับโปรเจกต์</Link>
        </div>
      </footer>
    </div>
  );
}
