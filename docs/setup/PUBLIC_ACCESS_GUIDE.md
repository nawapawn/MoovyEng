# 🌍 แนวทางการเปิดให้ทุกคนเข้าใช้งาน MoovyEng (Public Access & Deployment Guide)

เอกสารนี้รวบรวมวิธีทำให้บุคคลภายนอก หรือผู้ใช้ทุกคนบนอินเทอร์เน็ต สามารถเข้าใช้งาน **MoovyEng** ของคุณได้

---

## 🌟 ทางเลือกที่ 1: แชร์ให้คนในวง Wi-Fi / วงแลนเดียวกันเข้าใช้งาน (ทันที ไม่ต้องลงอะไรเพิ่ม)

หากต้องการให้เพื่อนร่วมงาน หรือคนในบ้านเปิดดูผ่านมือถือ/คอมพิวเตอร์เครื่องอื่น:
1. คอมพิวเตอร์ของคุณมี IP ภายในคือ: `192.168.1.188`
2. ให้เครื่องอื่นเปิด Browser แล้วพิมพ์:
   - สตูดิโอบนเดสก์ท็อป: **`http://192.168.1.188:3000`**
   - ใช้งานบนมือถือ: **`http://192.168.1.188:3000/edit`**
   - หน้า Personal Showcase: **`http://192.168.1.188:3000/about`**

---

## 🚀 ทางเลือกที่ 2: สร้าง Public Link ส่งให้คนทั่วโลกผ่านอินเทอร์เน็ตฟรี (Cloudflare Tunnel / Localtunnel)

หากต้องการลิงก์ `https://...` ชั่วคราวเพื่อส่งให้ใครก็ได้ในโลกเข้าใช้งานทันทีจากเครื่องคอมพิวเตอร์ของคุณ:

### วิธี A: ใช้ Cloudflare Tunnel (แนะนำที่สุด - ฟรี รวดเร็ว และไม่ต้องสมัครสมาชิก)
1. ดาวน์โหลด [cloudflared for Windows](https://github.com/cloudflare/cloudflared/releases) (หรือรันผ่าน PowerShell)
2. พิมพ์คำสั่ง:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
3. Cloudflare จะให้ URL สาธารณะ เช่น `https://random-subdomain.trycloudflare.com` ซึ่งทุกคนทั่วโลกจะสามารถเข้าใช้งานได้ทันที

### วิธี B: ใช้ Localtunnel ผ่าน npx
```bash
npx localtunnel --port 3000
```
ระบบจะให้ URL สาธารณะที่คุณสามารถส่งต่อให้เพื่อนหรือผู้ใช้งานได้เลย

---

## ☁️ ทางเลือกที่ 3: ขึ้นระบบ Cloud ถาวร (Production Cloud Deployment)

สำหรับการเปิดบริการแบบ 24/7 เพื่อให้ทุกคนเข้าใช้งานได้ตลอดเวลา แนะนำดังนี้:

| แพลตฟอร์ม | หน้าที่ | วิธีการ |
|---|---|---|
| **Vercel** | โฮสต์ Next.js Web Application & Personal Site | เชื่อมต่อผ่าน GitHub Repository แล้วกด Import คลิกเดียวเสร็จ |
| **Railway / Render** | โฮสต์ Node.js Proxy & Python Video Engine (`server.js` + `clip_engine.py`) | มี Dockerfile และรองรับการประมวลผล Python + FFmpeg ได้อย่างเต็มประสิทธิภาพ |
