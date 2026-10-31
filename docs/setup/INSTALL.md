# 📘 คู่มือการติดตั้งและใช้งาน MoovyEng (Installation & Setup Guide)

**MoovyEng** คือเว็บแอปพลิเคชันและสตูดิโอสร้างคอนเทนต์วิดีโอ/แฟลชการ์ดสอนภาษาอังกฤษจากคลิปภาพยนตร์ระดับพรีเมียม (TikTok, Reels, YouTube Shorts) พร้อมระบบ AI อัจฉริยะ (Gemini, OpenAI, Groq, OpenRouter, Claude, DeepSeek) และระบบ Composite Video Exporter

---

## 💻 ความต้องการของระบบ (Prerequisites)

ก่อนเริ่มการติดตั้ง กรุณาตรวจสอบว่าเครื่องของคุณมีโปรแกรมเหล่านี้เรียบร้อยแล้ว:

1. **Node.js**: เวอร์ชัน `18.x` หรือ `20.x` ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
2. **Python**: เวอร์ชัน `3.9+` (ใช้สำหรับ Clip Processing Engine)
3. **FFmpeg**: จำเป็นสำหรับประมวลผล ตัดต่อ และรวมไฟล์วิดีโอระดับ HD/4K
   - ตรวจสอบโดยเปิด Terminal/PowerShell แล้วพิมพ์ `ffmpeg -version`
   - หากยังไม่มี:
     - **Windows (ผ่าน Chocolatey / Winget)**:
       ```powershell
       winget install Gyan.FFmpeg
       ```
     - **macOS (ผ่าน Homebrew)**:
       ```bash
       brew install ffmpeg
       ```
     - **Linux (Ubuntu/Debian)**:
       ```bash
       sudo apt update && sudo apt install ffmpeg
       ```

---

## 🚀 ขั้นตอนการติดตั้ง (Installation Steps)

### ขั้นตอนที่ 1: ดึงโปรเจกต์หรือเปิดโฟลเดอร์
เปิด Terminal / PowerShell ไปที่โฟลเดอร์โปรเจกต์:
```bash
cd c:\Users\os\Downloads\move0nyoung
```

### ขั้นตอนที่ 2: ติดตั้ง Node.js Dependencies
รันคำสั่งเพื่อติดตั้งแพ็กเกจที่จำเป็นของโปรเจกต์ (Next.js, Tailwind, Lucide, ฯลฯ):
```bash
npm install
```

---

## 🏃 การรันระบบ (Running the Application)

ระบบของ MoovyEng ทำงานประสานกันระหว่าง 2 บริการหลัก:

### 1. รัน Proxy & Video Engine Server (Port 3001)
เซิร์ฟเวอร์ตัวนี้ทำหน้าที่เป็น Media Proxy เลี่ยงปัญหา CORS สำหรับดึงคลิปหนังและคำบรรยายจาก clip.cafe รวมถึงเชื่อมต่อกับ Python `clip_engine.py` สำหรับเรนเดอร์วิดีโอ:
```bash
node server.js
```
> เซิร์ฟเวอร์จะเริ่มทำงานที่: `http://localhost:3001`

### 2. รัน Next.js Web Studio (Port 3000)
เปิด Terminal อีกหน้าต่างหนึ่ง แล้วรันเว็บสตูดิโอ:
```bash
npm run dev
```
> หน้าเว็บจะพร้อมใช้งานที่: `http://localhost:3000`

---

## 🌐 ลิงก์เข้าใช้งาน (Access URLs)

| หน้าจอ | URL | คำอธิบาย |
|---|---|---|
| **Desktop Studio** | [http://localhost:3000](http://localhost:3000) | หน้าจอสตูดิโอแบบเต็ม จอพรีวิวซ้าย + เครื่องมือครบครันขวา |
| **Mobile Studio** | [http://localhost:3000/edit](http://localhost:3000/edit) | หน้าสตูดิโอจัดแต่งสำหรับมือถือ (Touch-optimized) |
| **Media Server Health** | [http://localhost:3001/health](http://localhost:3001/health) | ตรวจสอบสถานะการทำงานของ Proxy Server |

---

## 🔑 การตั้งค่า AI API Keys (Optional แต่แนะนำ)

คุณสามารถนำ API Key มากรอกในหน้าเว็บที่แถบ **AI Model Settings (เครื่องมือข้อ 1)** ได้ทันที โดยระบบจะบันทึกเก็บไว้ใน Browser (LocalStorage) ของคุณอย่างปลอดภัย:

- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/) *(แนะนำ - รองรับ Gemini 2.5/Flash)*
- **OpenAI API Key**: [OpenAI Platform](https://platform.openai.com/)
- **Groq API Key**: [Groq Cloud Console](https://console.groq.com/) *(ตอบสนองไวมาก LLaMA 3)*
- **OpenRouter API Key**: [OpenRouter](https://openrouter.ai/)
- **Anthropic Claude API Key**: [Anthropic Console](https://console.anthropic.com/)

---

## 📂 โครงสร้างโฟลเดอร์สำคัญ (Project Structure)

```text
move0nyoung/
├── app/                  # Next.js App Router (UI Pages & Layouts)
│   ├── page.jsx          # หน้าหลัก Desktop Studio
│   └── edit/page.jsx     # หน้า Mobile Editor
├── components/           # React Components (AI, Vocab, Preview, Canvas Controls)
├── context/              # VocabContext (ศูนย์กลางการจัดการ State ทั้งหมด)
├── lib/                  # ค่าคงที่และฟังก์ชันยูทิลิตี้ (Utils, Constants)
├── server.js             # Node.js Media Proxy & Engine Bridge (Port 3001)
├── clip_engine.py        # Python FFmpeg Composite Exporter & Clip Downloader
├── clips_cache/          # โฟลเดอร์แคชคลิปวิดีโอที่ดาวน์โหลดมาชั่วคราว
├── exports/              # โฟลเดอร์ผลลัพธ์วิดีโอและรูปภาพที่ Export เสร็จสมบูรณ์
└── package.json          # รายการ Dependencies และคำสั่งสคริปต์
```

---

## 🛠️ การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

1. **พรีวิววิดีโอหรือคลิปหนังไม่ขึ้น / เล่นไม่ได้:**
   - ตรวจสอบว่า `node server.js` รันอยู่ที่ Port 3001 หรือไม่
2. **Export วิดีโอไม่สำเร็จ (Python / FFmpeg error):**
   - ตรวจสอบว่าได้ติดตั้ง `ffmpeg` และคำสั่ง `py` หรือ `python` อยู่ในระบบ PATH เรียบร้อยแล้ว
3. **ต้องการล้างแคชคลิปเก่าเพื่อประหยัดพื้นที่:**
   - คุณสามารถลบไฟล์ภายในโฟลเดอร์ `clips_cache/` ได้ ระบบจะสร้างใหม่ให้อัตโนมัติเมื่อมีการเรียกใช้
