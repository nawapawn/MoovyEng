export const metadata = {
  title: 'เกี่ยวกับ MoovyEng — คู่มือใช้งานและฟีเจอร์สตูดิโอสร้างวิดีโอสอนภาษาอังกฤษด้วย AI',
  description:
    'เจาะลึกสถาปัตยกรรมและคู่มือการใช้งาน MoovyEng สตูดิโอสร้างวิดีโอสั้นสอนคำศัพท์ภาษาอังกฤษจากคลิปภาพยนตร์จริง พร้อมระบบ AI Multi-Provider, Color Lab และส่งออกวิดีโอ 60fps',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'เกี่ยวกับ MoovyEng — AI Vocab & Movie Clip Studio',
    description:
      'คู่มือใช้งานและฟีเจอร์ครบวงจรของ MoovyEng สำหรับครีเอเตอร์สายสอนภาษาอังกฤษบน TikTok, Reels และ Shorts',
    url: '/about',
    images: [
      {
        url: '/screenshots/studio_overview.png',
        width: 1440,
        height: 900,
        alt: 'MoovyEng Studio Overview',
      },
    ],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
