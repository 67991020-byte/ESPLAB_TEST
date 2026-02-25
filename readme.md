# 🌡️ ESP32 Real-Time MQTT Environment Dashboard

[![ESP32](https://img.shields.io/badge/Hardware-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![MQTT](https://img.shields.io/badge/Protocol-MQTT-green.svg)](https://mqtt.org/)
[![UI](https://img.shields.io/badge/UI-Glassmorphism-purple.svg)]()

ระบบตรวจวัดสภาพแวดล้อมอัจฉริยะ แสดงผลแบบ Real-Time ผ่าน **Web Dashboard** สไตล์ **Modern Glassmorphism** เชื่อมต่อข้อมูลอย่างไร้รอยต่อด้วยโปรโตคอล **MQTT (HiveMQ Cloud)**

---

## ✨ คุณสมบัติหลัก (Key Features)

*   📡 **Real-Time Synchronize**: แสดงผลข้อมูลวินาทีต่อวินาทีผ่าน MQTT WebSockets
*   📊 **Visual Analytics**: กราฟเส้นแบบไดนามิกจาก Chart.js แสดงแนวโน้มอุณหภูมิและความชื้น
*   🎨 **Premium Dashboard**: ดีไซน์ล้ำสมัยด้วย Glassmorphism Effect รองรับ Responsive ทุกหน้าจอ
*   💡 **Smart Control**: ควบคุมสถานะ LED ผ่าน Touch Sensor บน ESP32 พร้อมอัปเดตสถานะบนเว็บทันที
*   �️ **Security Focused**: แยกการตั้งค่ารหัสผ่าน (Credentials) ออกจากโค้ดหลัก ปลอดภัยเมื่อขึ้น GitHub

---

## 🛠️ อุปกรณ์ที่ใช้ (Hardware Requirements)

1.  **ESP32** Development Board
2.  **SHT21 / HTU21D** (I2C) - สำหรับวัดอุณหภูมิและความชื้น
3.  **LED** (ขา GPIO 15)
4.  **Touch Pin** (ขา GPIO 4)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
ESPLAB_TEST/
├── ESP/
│   ├── main.ino          # โค้ดหลัก Arduino
│   └── secrets.h         # 🔒 ไฟล์เก็บรหัส WiFi/MQTT (ถูก ignored)
├── index.html            # หน้าเว็บ Dashboard
├── index.css             # สไตล์ Glassmorphism
├── config.js             # 🔒 ไฟล์คอนฟิก MQTT ฝั่งเว็บ (ถูก ignored)
├── .gitignore            # ตั้งค่าไม่ให้อัปโหลดรหัสผ่านขึ้น Git
└── README.md             # รายละเอียดโปรเจกต์
```

---

## 🚀 วิธีการติดตั้ง (Setup Instructions)

### 1. ฝั่ง Hardware (ESP32)
1.  ติดตั้ง Library ใน Arduino IDE: `PubSubClient`, `Adafruit HTU21DF`
2.  สร้างไฟล์ `ESP/secrets.h` และใส่ข้อมูลดังนี้:
    ```cpp
    const char* ssid = "WIFI_NAME";
    const char* password = "WIFI_PASSWORD";
    const char* mqtt_server = "YOUR_HIVEMQ_URL";
    const char* mqtt_user = "USER";
    const char* mqtt_pass = "PASS";
    ```
3.  อัปโหลด `main.ino` ลงบอร์ด ESP32

### 2. ฝั่ง Web Dashboard
1.  สร้างหรือแก้ไขไฟล์ `config.js` ในโฟลเดอร์หลัก:
    ```javascript
    const MQTT_CONFIG = {
        hostname: "YOUR_HIVEMQ_URL",
        port: 8884,
        path: "/mqtt",
        username: "USER",
        password: "PASS",
        topic: "home/sensor/data"
    };
    ```
2.  เปิดไฟล์ `index.html` ผ่าน Browser หรือใช้ Local Server:
    ```bash
    python -m http.server 8000
    ```

---

## 📊 การทำงานของระบบ (System Workflow)

1.  **Sensor Reading**: ESP32 อ่านค่าจาก SHT21 และตรวจสอบค่าสัมผัส (Touch)
2.  **Data Publishing**: ส่งข้อมูลรูปแบบ JSON ไปยัง HiveMQ Cloud ผ่านพอร์ต 8883 (SSL)
3.  **Real-Time Subscribing**: Web Dashboard รับข้อมูลผ่าน WebSockets (พอร์ต 8884)
4.  **Instant UI Update**: JavaScript อัปเดตข้อมูลบน Card, กราฟ และตารางประวัติทันที

---

## 🛡️ ข้อมูลความปลอดภัย (Security Note)

โปรเจกต์นี้ใช้ระบบแยกไฟล์ตั้งค่า เพื่อป้องกันรหัสผ่านหลุดไปยังที่สาธารณะ:
*   `secrets.h` และ `config.js` จะ **ไม่ถูกอัปโหลด** ขึ้น GitHub เพราะถูกระบุไว้ใน `.gitignore`
*   กรุณาสำรองไฟล์เหล่านี้ไว้ในเครื่องของคุณเสมอ

---
*Created for ESPLAB_TEST Project*