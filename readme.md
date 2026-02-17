# 🌡️ ESP32 Real-Time Environment Dashboard

ระบบตรวจวัดอุณหภูมิและความชื้นแบบ Real-Time โดยใช้ ESP32 ส่งข้อมูลไปยัง Google Sheets และแสดงผลผ่าน Web Dashboard ที่สวยงาม พร้อมกราฟวิเคราะห์ข้อมูลแยกส่วน

## ✨ คุณสมบัติ (Features)
- **Real-Time Tracking**: ส่งข้อมูลจากเซนเซอร์ DHT22/DHT11 ไปยัง Google Sheets ทุกๆ 10 วินาที
- **Premium Dashboard**: หน้าเว็บแสดงผลสไตล์ Modern Glassmorphism พร้อม Dark Mode
- **Dual Dynamic Charts**: กราฟเส้นแยกกันระหว่าง Temperature และ Humidity เพื่อการวิเคราะห์ที่ชัดเจน
- **Auto Data Cleanup**: ระบบอัตโนมัติรักษาข้อมูลใน Google Sheets ให้เหลือเพียง 10 รายการล่าสุดเสมอ (ป้องกัน Sheet อืด)
- **Status Monitoring**: แสดงสถานะการเชื่อมต่อ (Live/Error) และสถานะ LED ของ ESP32 แบบวินาทีต่อวินาที

## 🛠️ อุปกรณ์ที่ใช้ (Hardware)
- ESP32 Development Board
- DHT22 หรือ DHT11 Sensor
- Touch Sensor (Built-in ESP32) สำหรับควบคุมไฟ LED

## 📂 โครงสร้างโปรเจกต์ (Project Structure)
- `/ESP`: โค้ด Arduino สำหรับ ESP32 (`main.ino` และการตั้งค่า WiFi ใน `sec.h`)
- `index.html`: หน้าเว็บ Dashboard หลัก (HTML/JS/Chart.js)
- `index.css`: ไฟล์สไตล์การตกแต่ง Dashboard
- `google_script.gs`: โค้ด Google Apps Script สำหรับรับ/ส่งข้อมูลหลังบ้าน

## 🚀 วิธีการติดตั้ง (Setup Instructions)

### 1. Google Sheets & Apps Script
1. สร้าง Google Sheet ใหม่
2. ไปที่ **Extensions** > **Apps Script**
3. คัดลอกโค้ดจาก `google_script.gs` ไปวาง
4. กด **Deploy** > **New Deployment**
   - Type: **Web App**
   - Execute As: **Me**
   - Who has access: **Anyone**
5. คัดลอก **Web App URL (Key)** ที่ได้

### 2. ESP32 Configuration
1. เปิดไฟล์ `ESP/sec.h`
2. ใส่ชื่อ WiFi และ Password ของคุณ
3. ใส่ Web App URL Key ที่ได้จากขั้นตอนที่แล้วในตัวแปร `sheet_key`
4. อัปโหลดโค้ดลง ESP32

### 3. Web Dashboard
1. เปิดไฟล์ `index.html` ด้วยโปรแกรมแก้ไขข้อความ
2. ตรวจสอบบรรทัดที่ 170 ให้ `const SCRIPT_URL` ตรงกับ Web App URL ของคุณ
3. เปิดไฟล์ `index.html` ผ่าน Browser เพื่อเริ่มใช้งาน

## 📊 การแสดงผล
- **Cards**: แสดงค่าปัจจุบันของ Temperature, Humidity และสถานะ LED
- **Charts**: กราฟประวัติข้อมูล 10 รายการล่าสุด
- **Table**: ตารางสรุปข้อมูลพร้อมเวลาที่บันทึกจริง

---
*Created for ESPLAB_TEST Project*