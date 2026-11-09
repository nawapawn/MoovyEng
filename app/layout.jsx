import './globals.css';
import { VocabProvider } from '../context/VocabContext';
import Toast from '../components/Toast';
import ExportModal from '../components/ExportModal';
import CustomDialog from '../components/CustomDialog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://moovyeng.com';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MoovyEng — AI Vocab & Movie Clip Studio | สตูดิโอสร้างวิดีโอสอนภาษาอังกฤษด้วย AI',
    template: '%s | MoovyEng',
  },
  description:
    'สตูดิโอสร้างวิดีโอสั้นและแฟลชการ์ดสอนภาษาอังกฤษ (TikTok, Reels, Shorts) จากคลิปภาพยนตร์จริง พร้อมระบบ AI Multi-Provider อัจฉริยะ ปรับแต่งฟอนต์ สี และส่งออกวิดีโอ 60fps',
  keywords: [
    'MoovyEng',
    'สอนภาษาอังกฤษ',
    'คำศัพท์ภาษาอังกฤษ',
    'เรียนภาษาอังกฤษจากหนัง',
    'สร้างวิดีโอ TikTok',
    'Reels สอนภาษาอังกฤษ',
    'YouTube Shorts',
    'AI Vocab Generator',
    'Movie Clip Studio',
    'English Vocabulary Flashcards',
  ],
  authors: [{ name: 'MoovyEng Studio' }],
  creator: 'MoovyEng Studio',
  publisher: 'MoovyEng Studio',
  applicationName: 'MoovyEng',
  category: 'education',
  alternates: {
    canonical: '/',
    languages: {
      'th-TH': '/',
      'en-US': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    alternateLocale: ['en_US'],
    url: '/',
    siteName: 'MoovyEng',
    title: 'MoovyEng — AI Vocab & Movie Clip Studio',
    description:
      'สร้างวิดีโอสั้นและแฟลชการ์ดสอนภาษาอังกฤษ (TikTok, Reels, Shorts) จากคลิปภาพยนตร์จริงด้วย AI',
    images: [
      {
        url: '/screenshots/hero_studio_1440.png',
        width: 1440,
        height: 900,
        alt: 'MoovyEng — AI Vocab & Movie Clip Studio Workspace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MoovyEng — AI Vocab & Movie Clip Studio',
    description:
      'สร้างวิดีโอสั้นและแฟลชการ์ดสอนภาษาอังกฤษ (TikTok, Reels, Shorts) จากคลิปภาพยนตร์จริงด้วย AI',
    images: ['/screenshots/hero_studio_1440.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/icon.png', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'MoovyEng',
      description:
        'AI-Powered English Vocabulary & Movie Clip Card Generator for TikTok, Reels, and Shorts',
      inLanguage: ['th-TH', 'en-US'],
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: 'MoovyEng — AI Vocab & Movie Clip Studio',
      url: SITE_URL,
      applicationCategory: 'EducationalApplication, MultimediaApplication',
      operatingSystem: 'Web Browser (Desktop & Mobile)',
      description:
        'Web Application & Video Studio สำหรับสร้างวิดีโอสั้นและแฟลชการ์ดสอนภาษาอังกฤษจากคลิปภาพยนตร์จริง พร้อมระบบ AI Multi-Provider',
      image: `${SITE_URL}/screenshots/hero_studio_1440.png`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'THB',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className="light overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* FontAwesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Google Fonts: EB Garamond, Inter, Itim, Noto Serif Thai, Prompt, Fredoka, Kanit, Sarabun, Mitr, Chonburi + Canva Effects Special Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chonburi&family=EB+Garamond:wght@300;400;500&family=Fredoka:wght@500;600&family=Inter:wght@300;400;500;600;700&family=Itim&family=Kanit:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,700&family=Mitr:wght@400;500&family=Noto+Serif+Thai:wght@400;500;600;700&family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600&family=Press+Start+2P&family=Rubik+Glitch&family=Pacifico&family=Monoton&family=Orbitron:wght@700;900&family=Bungee&family=Silkscreen:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f5f5f5] dark:bg-[#0c0a09] text-[#0c0a09] dark:text-[#f5f5f4] min-h-[100dvh] w-full relative">
        <VocabProvider>
          {children}
          <ExportModal />
          <CustomDialog />
          <Toast />
        </VocabProvider>
      </body>
    </html>
  );
}
