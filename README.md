# 🎬 MoovyEng

> **Web Application & Video Studio** สำหรับสร้างวิดีโอสั้นและแฟลชการ์ดสอนภาษาอังกฤษ (TikTok, Reels, Shorts) จากคลิปภาพยนตร์ภาษาอังกฤษจริง พร้อมระบบ AI Multi-Provider อัจฉริยะ

---

## 📚 ศูนย์รวมเอกสารคู่มือ (Documentation)

เอกสารทั้งหมดถูกจัดหมวดหมู่อย่างเป็นระเบียบไว้ที่โฟลเดอร์ **[`docs/`](docs/README.md)**:

| หมวดหมู่ | เอกสารสำคัญ | รายละเอียด |
|---|---|---|
| **🚀 ติดตั้งและเริ่มใช้งาน** | [docs/setup/INSTALL.md](docs/setup/INSTALL.md) | วิธีติดตั้ง Node.js, Python, FFmpeg, คำสั่งรันระบบ และการใส่ AI API Keys |
| **🎨 การออกแบบและ UI/UX** | [docs/design/DESIGN.md](docs/design/DESIGN.md)<br>[docs/design/DESIGN_SPECIFICATION.md](docs/design/DESIGN_SPECIFICATION.md) | ElevenLabs Aesthetic, Color Palette, Typography และ Pixel Specs |
| **🧠 สถาปัตยกรรม & AI Prompts** | [docs/architecture/PROJECT_OVERVIEW_AND_PROMPTS.md](docs/architecture/PROJECT_OVERVIEW_AND_PROMPTS.md) | แผนผังระบบ, Master AI Prompt ทั้งหมด และการทำงานของ Video Engine |

👉 ดูสารบัญเอกสารฉบับเต็มได้ที่ **[docs/README.md](docs/README.md)**

---

## ⚡ เริ่มต้นใช้งานด่วน (Quick Start)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รัน Media Proxy Server (Port 3001)
```bash
node server.js
```

### 3. รัน Next.js Development Server (Port 3000)
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่:
- **Desktop Studio**: [http://localhost:3000](http://localhost:3000)
- **Mobile Studio**: [http://localhost:3000/edit](http://localhost:3000/edit)
