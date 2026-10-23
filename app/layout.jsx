import './globals.css';
import { VocabProvider } from '../context/VocabContext';
import Toast from '../components/Toast';
import ExportModal from '../components/ExportModal';
import CustomDialog from '../components/CustomDialog';

export const metadata = {
  title: 'MoovyEng — AI Vocab & Movie Clip Studio',
  description: 'AI-Powered English Vocabulary & Movie Clip Card Generator for TikTok, Reels, and Shorts',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className="light overflow-x-hidden" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* FontAwesome for icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Google Fonts: EB Garamond, Inter, Itim, Noto Serif Thai, Prompt, Fredoka, Kanit, Sarabun, Mitr, Chonburi */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chonburi&family=EB+Garamond:wght@300;400;500&family=Fredoka:wght@500;600&family=Inter:wght@300;400;500;600;700&family=Itim&family=Kanit:wght@300;400;500;600&family=Mitr:wght@400;500&family=Noto+Serif+Thai:wght@400;500;600;700&family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600&display=swap"
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
