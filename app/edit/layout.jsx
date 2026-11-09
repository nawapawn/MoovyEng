export const metadata = {
  title: 'Mobile Studio — แก้ไขการ์ดคำศัพท์และคลิปภาพยนตร์บนมือถือ',
  description:
    'สตูดิโอแก้ไขแฟลชการ์ดคำศัพท์ภาษาอังกฤษและตัดต่อคลิปภาพยนตร์สำหรับหน้าจอมือถือ ปรับแต่งฟอนต์ สี อัตราส่วน 9:16, 1:1, 4:5, 16:9 และส่งออกวิดีโอได้ทันที',
  alternates: {
    canonical: '/edit',
  },
  openGraph: {
    title: 'MoovyEng Mobile Studio — แก้ไขการ์ดคำศัพท์และวิดีโอบนมือถือ',
    description:
      'เครื่องมือสร้างคอนเทนต์สอนภาษาอังกฤษบนมือถือ พร้อม AI สร้างคำศัพท์และค้นหาคลิปภาพยนตร์อัตโนมัติ',
    url: '/edit',
    images: [
      {
        url: '/screenshots/mobile_touch_studio.png',
        width: 1200,
        height: 630,
        alt: 'MoovyEng Mobile Studio',
      },
    ],
  },
};

export default function EditLayout({ children }) {
  return children;
}
