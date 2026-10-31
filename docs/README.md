# 📚 MoovyEng — ศูนย์รวมเอกสารคู่มือ (Documentation Hub)

ยินดีต้อนรับสู่ศูนย์รวมเอกสารและการออกแบบของโปรเจกต์ **MoovyEng** เอกสารทั้งหมดถูกจัดหมวดหมู่ไว้ในโฟลเดอร์ `docs/` ดังนี้:

---

## 📂 สารบัญเอกสารแยกตามหมวดหมู่ (Table of Contents)

### 1. 🚀 ติดตั้งและการเริ่มต้นระบบ (Setup & Installation)
- **[`docs/setup/INSTALL.md`](setup/INSTALL.md)**
  - ความต้องการของระบบ (Node.js, Python 3.9+, FFmpeg)
  - ขั้นตอนการติดตั้ง dependencies (`npm install`)
  - คำสั่งรัน Media Proxy Server (Port 3001) และ Next.js Web Studio (Port 3000)
  - แหล่งขอและวิธีตั้งค่า AI API Keys (Gemini, OpenAI, Groq, Claude ฯลฯ)
  - แนวทางการแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

---

### 2. 🎨 การออกแบบและดีไซน์ซิสเต็ม (Design & UI/UX System)
- **[`docs/design/DESIGN.md`](design/DESIGN.md)**
  - คู่มือดีไซน์หลัก ElevenLabs Aesthetic (สี, Typography, Spacing, Micro-interactions)
  - กฎการออกแบบ Typography (EB Garamond, Inter, Prompt, Itim)
  - โครงสร้างธีม Light / Dark mode และสไตล์ปุ่ม
- **[`docs/design/DESIGN_SPECIFICATION.md`](design/DESIGN_SPECIFICATION.md)**
  - ข้อกำหนดและสเปกการออกแบบหน้าจอแบบละเอียด (Pixel-level specs)
  - รูปแบบการแสดงผลบนจอเดสก์ท็อปและมือถือ (Desktop Two-Column & Mobile View)
  - แผนผังพาเลทสี (Color Palette) และพฤติกรรมของ Canvas

---

### 3. 🧠 สถาปัตยกรรมระบบและ AI Prompts (Architecture & AI System)
- **[`docs/architecture/PROJECT_OVERVIEW_AND_PROMPTS.md`](architecture/PROJECT_OVERVIEW_AND_PROMPTS.md)**
  - สรุปภาพรวมและสถาปัตยกรรมระบบทั้งหมด (System Architecture)
  - รายละเอียด **Master System Prompt** และโครงสร้าง Prompt สำหรับ AI Multi-Provider
  - รูปแบบ JSON Output Schema สำหรับดึงคำศัพท์ ตัวอย่างประโยค และแคปชัน
  - การทำงานของ Python FFmpeg Clip Engine และการประมวลผลวิดีโอหลายอัตราส่วน

---

## 🗺️ แผนผังโฟลเดอร์เอกสาร
```text
docs/
├── README.md                              # หน้ารวมสารบัญเอกสารนี้
├── setup/                                 # หมวดคู่มือติดตั้งและรันระบบ
│   └── INSTALL.md
├── design/                                # หมวดดีไซน์และ UI/UX
│   ├── DESIGN.md
│   └── DESIGN_SPECIFICATION.md
└── architecture/                          # หมวดสถาปัตยกรรมและ AI Prompt
    └── PROJECT_OVERVIEW_AND_PROMPTS.md
```
