export default function manifest() {
  return {
    name: 'MoovyEng — AI Vocab & Movie Clip Studio',
    short_name: 'MoovyEng',
    description:
      'สตูดิโอสร้างวิดีโอสั้นและแฟลชการ์ดสอนภาษาอังกฤษ (TikTok, Reels, Shorts) จากคลิปภาพยนตร์จริงด้วยระบบ AI Multi-Provider',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f5',
    theme_color: '#0c0a09',
    lang: 'th',
    categories: ['education', 'multimedia', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
