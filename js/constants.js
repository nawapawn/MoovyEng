/**
 * ============================================================================
 * MoovyEng — Shared Constants & State Definitions
 * ============================================================================
 */

const STORAGE_KEY = 'tiktok_vocab_data';

// Application State Variables
let activeClipSequence = [];
let cafeClipPool = [];
let currentSequenceIndex = 0;
let isPlayingVideo = false;
let currentPage = 1;
let isScrapingClips = false;
let currentAvatarData = '';
let currentClipAspectRatio = '9:16';
let currentBgGradient = { color1: '#fafafa', color2: '#fafafa' };
let detectedProviderType = '';
let apiKeyDetectTimer = null;
let currentLang = 'th';

// Alias for mobile editor compatibility: selectedClips <-> activeClipSequence
Object.defineProperty(window, 'selectedClips', {
  get() { return activeClipSequence; },
  set(val) { activeClipSequence = val; },
  configurable: true
});

// Curated Viral Idioms & Phrases
const CURATED_RANDOM_WORDS = [
  'break a leg', 'bite the bullet', 'hit the sack', 'call it a day',
  'piece of cake', 'spill the tea', 'under the weather', 'once in a blue moon',
  'burn the midnight oil', 'on the fence', 'see eye to eye', 'costs an arm and a leg',
  'back to the drawing board', 'blessing in disguise', 'cut corners', 'out of the blue',
  'take it with a grain of salt', 'beat around the bush', 'pull yourself together',
  'speak of the devil', 'through thick and thin', 'actions speak louder than words'
];

// Aspect Ratio Configurations
const ASPECT_RATIO_CONFIG = {
  '9:16': {
    containerClass: 'relative w-full h-[100dvh] sm:w-[414px] sm:h-[736px] sm:rounded-[32px] sm:border sm:border-[#e7e5e4] bg-[#fafafa] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-center transition-all duration-300',
    streamClass: 'w-full h-full relative z-10 flex flex-col items-center justify-center gap-2.5 px-5 pt-14 pb-5 overflow-y-auto',
    clipBoxClass: 'w-full max-w-[356px] aspect-[16/9]',
    grammarCardClass: 'w-full max-w-[356px] px-2 py-1 space-y-2 preview-thai-font text-[12px] text-[#292524] transition-all text-left',
    wordClass: 'vocab-font text-[34px] sm:text-[40px] font-bold text-[#0c0a09] tracking-tight text-center leading-none',
    meaningClass: 'thai-vocab-font text-2xl sm:text-[26px] font-bold text-[#0c0a09] tracking-wide leading-tight',
    showStatusBar: true,
    headerClass: 'absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-3 sm:pt-9 pb-2',
    badgeText: '9:16',
    exportWidth: 1080,
    exportHeight: 1920
  },
  '2:3': {
    containerClass: 'relative w-full aspect-[2/3] max-w-[420px] sm:w-[420px] sm:h-[630px] sm:rounded-[28px] sm:border sm:border-[#e7e5e4] bg-[#fafafa] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-center transition-all duration-300',
    streamClass: 'w-full h-full relative z-10 flex flex-col items-center justify-center gap-2 px-5 pt-11 pb-4 overflow-y-auto',
    clipBoxClass: 'w-full max-w-[330px] aspect-[16/9]',
    grammarCardClass: 'w-full max-w-[360px] px-2 py-1 space-y-1.5 preview-thai-font text-[11.5px] text-[#292524] transition-all text-left',
    wordClass: 'vocab-font text-[30px] sm:text-[34px] font-bold text-[#0c0a09] tracking-tight text-center leading-none',
    meaningClass: 'thai-vocab-font text-xl sm:text-[24px] font-bold text-[#0c0a09] tracking-wide leading-tight',
    showStatusBar: false,
    headerClass: 'absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-2.5 pb-1',
    badgeText: '2:3',
    exportWidth: 1080,
    exportHeight: 1620
  },
  '4:5': {
    containerClass: 'relative w-full aspect-[4/5] max-w-[440px] sm:w-[440px] sm:h-[550px] sm:rounded-[28px] sm:border sm:border-[#e7e5e4] bg-[#fafafa] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-center transition-all duration-300',
    streamClass: 'w-full h-full relative z-10 flex flex-col items-center justify-center gap-1.5 px-4 pt-10 pb-3 overflow-y-auto',
    clipBoxClass: 'w-full max-w-[300px] aspect-[16/9]',
    grammarCardClass: 'w-full max-w-[380px] px-2 py-1 space-y-1 preview-thai-font text-[11px] text-[#292524] transition-all text-left',
    wordClass: 'vocab-font text-[28px] sm:text-[32px] font-bold text-[#0c0a09] tracking-tight text-center leading-none',
    meaningClass: 'thai-vocab-font text-xl sm:text-[22px] font-bold text-[#0c0a09] tracking-wide leading-tight',
    showStatusBar: false,
    headerClass: 'absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-2.5 pb-1',
    badgeText: '4:5',
    exportWidth: 1080,
    exportHeight: 1350
  },
  '1:1': {
    containerClass: 'relative w-full aspect-square max-w-[480px] sm:w-[480px] sm:h-[480px] sm:rounded-[28px] sm:border sm:border-[#e7e5e4] bg-[#fafafa] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-center transition-all duration-300',
    streamClass: 'w-full h-full relative z-10 flex flex-col items-center justify-center gap-1 px-4 pt-9 pb-2.5 overflow-y-auto',
    clipBoxClass: 'w-full max-w-[235px] aspect-[16/9]',
    grammarCardClass: 'w-full max-w-[420px] px-2 py-1 space-y-1 preview-thai-font text-[10.5px] text-[#292524] transition-all text-left',
    wordClass: 'vocab-font text-[25px] sm:text-[28px] font-bold text-[#0c0a09] tracking-tight text-center leading-none',
    meaningClass: 'thai-vocab-font text-lg sm:text-[19px] font-bold text-[#0c0a09] tracking-wide leading-tight',
    showStatusBar: false,
    headerClass: 'absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-2 pb-1',
    badgeText: '1:1',
    exportWidth: 1080,
    exportHeight: 1080
  },
  '16:9': {
    containerClass: 'relative w-full aspect-[16/9] max-w-[600px] sm:w-[600px] sm:h-[338px] sm:rounded-[24px] sm:border sm:border-[#e7e5e4] bg-[#fafafa] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-center transition-all duration-300',
    streamClass: 'w-full h-full relative z-10 grid grid-cols-12 items-center gap-3 px-5 pt-9 pb-3 overflow-hidden',
    clipBoxClass: 'w-full aspect-[16/9]',
    grammarCardClass: 'w-full px-2 py-1 space-y-1 preview-thai-font text-[10.5px] text-[#292524] transition-all text-left',
    wordClass: 'vocab-font text-[24px] sm:text-[26px] font-bold text-[#0c0a09] tracking-tight text-center leading-none',
    meaningClass: 'thai-vocab-font text-base sm:text-[18px] font-bold text-[#0c0a09] tracking-wide leading-tight',
    showStatusBar: false,
    headerClass: 'absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-2 pb-1',
    badgeText: '16:9',
    exportWidth: 1920,
    exportHeight: 1080
  },
  '3:2': {
    containerClass: 'relative w-full aspect-[3/2] max-w-[560px] sm:w-[560px] sm:h-[374px] sm:rounded-[24px] sm:border sm:border-[#e7e5e4] bg-[#fafafa] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex flex-col justify-center transition-all duration-300',
    streamClass: 'w-full h-full relative z-10 grid grid-cols-12 items-center gap-3 px-5 pt-9 pb-3 overflow-hidden',
    clipBoxClass: 'w-full aspect-[16/9]',
    grammarCardClass: 'w-full px-2 py-1 space-y-1 preview-thai-font text-[10.5px] text-[#292524] transition-all text-left',
    wordClass: 'vocab-font text-[24px] sm:text-[26px] font-bold text-[#0c0a09] tracking-tight text-center leading-none',
    meaningClass: 'thai-vocab-font text-base sm:text-[18px] font-bold text-[#0c0a09] tracking-wide leading-tight',
    showStatusBar: false,
    headerClass: 'absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-2 pb-1',
    badgeText: '3:2',
    exportWidth: 1620,
    exportHeight: 1080
  }
};

const ASPECT_RATIO_LABELS = {
  '9:16': '9:16 (Reels/TikTok)',
  '2:3': '2:3 (Portrait)',
  '4:5': '4:5 (Feed)',
  '1:1': '1:1 (Square)',
  '16:9': '16:9 (Landscape)',
  '3:2': '3:2 (Classic)'
};

const VENDOR_LABELS = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  deepseek: 'DeepSeek AI',
  groq: 'Groq Cloud',
  anthropic: 'Anthropic Claude',
  xai: 'xAI (Grok)',
  mistral: 'Mistral AI'
};

const I18N = {
  th: {
    langBtn: 'TH',
    searchToolsPlaceholder: 'ค้นหาเครื่องมือสตูดิโอ (AI, Vocab, Ratio)...',
    exportBtnText: 'Export',
    step1Title: '1. เชื่อมต่อ AI Model & API Key',
    step1Subtitle: 'ใส่คีย์ AI เพื่อดึงคำศัพท์ ไวยากรณ์ และตัวอย่าง',
    step2Title: '2. ใส่คำศัพท์ & ดึงคลิปหนังภาษาอังกฤษ',
    step2Subtitle: 'Scrape คลิปหนังจริง พร้อมแต่งประโยคให้เข้ากับบริบท',
    step3Title: '3. ปรับแต่งดีไซน์ & สัดส่วนภาพ',
    step3Subtitle: 'เลือก Aspect Ratio พื้นหลัง และบัญชีโซเชียล',
    wordPlaceholder: 'เช่น break a leg, serendipity, bite the bullet',
    generateBtn: 'สร้างสไลด์ + ดึงคลิปหนัง',
    bgColorHeading: 'Background Color / Gradient'
  },
  en: {
    langBtn: 'EN',
    searchToolsPlaceholder: 'Search studio tools (AI, Vocab, Ratio)...',
    exportBtnText: 'Export',
    step1Title: '1. Connect AI Model & API Key',
    step1Subtitle: 'Connect AI provider to generate vocab & examples',
    step2Title: '2. Vocabulary & English Movie Clips',
    step2Subtitle: 'Scrape real clips and generate cohesive examples',
    step3Title: '3. Design & Canvas Settings',
    step3Subtitle: 'Aspect ratio, gradient background & social handle',
    wordPlaceholder: 'e.g. break a leg, serendipity, bite the bullet',
    generateBtn: 'Generate Slide + Clips',
    bgColorHeading: 'Background Color / Gradient'
  }
};
