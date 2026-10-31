# 🚀 คู่มือการนำ MoovyEng ขึ้นระบบ Cloud 24/7 (Cloud Deployment Guide)

โปรเจกต์ **MoovyEng** มีส่วนประกอบของ **Next.js Web Studio** ร่วมกับ **Python FFmpeg Media Engine** ทางเลือกที่ดีที่สุดในการเปิดให้คนทั่วโลกเข้าใช้ได้ตลอด 24 ชั่วโมง คือการ Deploy ผ่าน **Railway** หรือ **Render** (หรือแยกเว็บขึ้น **Vercel**)

Repository ปัจจุบันของคุณ: **[`https://github.com/nawapawn/MoovyEng.git`](https://github.com/nawapawn/MoovyEng.git)**

---

## 🌟 แนะนำที่สุด: ขึ้นระบบด้วย Railway (รองรับทั้ง Web + Python + FFmpeg ในตัวเดียว)

Railway เป็น Cloud Platform ที่รองรับ Dockerfile ที่เตรียมไว้ให้แล้ว โดยจะรันทั้งหน้าเว็บและระบบเรนเดอร์วิดีโอให้ทำงานครบ 100%:

### ขั้นตอนการทำ (ใช้เวลาประมาณ 3 นาที):

1. **Push โค้ดล่าสุดขึ้น GitHub**:
   เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วรัน:
   ```bash
   git add .
   git commit -m "feat: complete MoovyEng cloud deployment setup with Dockerfile"
   git push origin master
   ```

2. **เปิดเว็บ [railway.app](https://railway.app/)**:
   - กดปุ่ม **Login with GitHub**
   - คลิกปุ่ม **"+ New Project"**
   - เลือก **"Deploy from GitHub repo"**
   - ค้นหาและเลือก Repository: **`MoovyEng`**
   - กด **"Deploy Now"**

3. **รับ Public Domain ฟรี**:
   - เมื่อระบบ Build เสร็จ ให้เข้าไปที่แท็บ **Settings** ของโปรเจกต์ใน Railway
   - ในหัวข้อ **Networking** ให้กดปุ่ม **"Generate Domain"**
   - คุณจะได้ URL ทันที เช่น `https://moovyeng-production.up.railway.app` ซึ่งทุกคนทั่วโลกจะสามารถเข้าใช้งานได้ตลอดเวลา 24/7

---

## ⚡ ทางเลือกเสริม: ขึ้นเฉพาะหน้าเว็บด้วย Vercel (ฟรี 100%)

หากต้องการให้หน้าเว็บหลักและ Personal Website (`/about`) ออนไลน์อย่างรวดเร็วผ่านโครงข่าย CDN ระดับโลกของ Vercel:

1. เปิดเว็บ [vercel.com](https://vercel.com/) แล้วเข้าสู่ระบบด้วย GitHub
2. คลิก **"Add New..."** -> **"Project"**
3. เลือก Repository `MoovyEng` แล้วกด **"Deploy"**
4. Vercel จะสร้าง URL สวยๆ ให้ทันที เช่น `https://moovyeng.vercel.app`
