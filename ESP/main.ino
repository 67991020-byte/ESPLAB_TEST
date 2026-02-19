#include "Adafruit_HTU21DF.h"
#include "sec.h"
#include <HTTPClient.h>
#include <WiFi.h>

String GOOGLE_SCRIPT_ID = sheet_key;

#define DHTPIN                                                                 \
  21 // หมายเหตุ: SHT21 ใช้ I2C พิน 21(SDA) และ 22(SCL) เป็นค่าเริ่มต้นของ ESP32
Adafruit_HTU21DF sht21 = Adafruit_HTU21DF();

int touchPin = 4;
int ledPin = 15;
int touchThreshold = 1000;
bool ledState = false;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.println("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(SECRET_SSID, SECRET_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");

  if (!sht21.begin()) {
    Serial.println("Couldn't find SHT21 sensor!");
    while (1)
      ;
  }
} // <--- จุดนี้คือที่เคยหายไปครับ

void loop() {
  // ส่วนของ Touch Sensor ควบคุม LED
  int touchValue = touchRead(touchPin);
  if (touchValue < touchThreshold) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    Serial.printf("LED Toggled: %s (Touch Value: %d)\n",
                  ledState ? "ON" : "OFF", touchValue);
    delay(500); // Debounce
  }

  // ส่วนของการส่งข้อมูลไป Google Sheets ตามช่วงเวลา
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    float temp = sht21.readTemperature();
    float rel_hum = sht21.readHumidity();

    float hi = 0; // Heat Index (ถ้าต้องการคำนวณเพิ่ม)
    String ledStatus = ledState ? "ON" : "OFF";

    Serial.print("Temp: ");
    Serial.print(temp);
    Serial.print(" C");
    Serial.print("\t\t");
    Serial.print("Humidity: ");
    Serial.print(rel_hum);
    Serial.println(" %");
    Serial.print("touchThreshold");
    Serial.print(touchValue);

    // เรียกฟังก์ชันส่งข้อมูล
    sendDataToGoogle(temp, rel_hum, hi, ledStatus);
  }
}

void sendDataToGoogle(float temp, float hum, float hi, String led) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    // สร้าง URL พร้อม Parameter
    String url =
        "https://script.google.com/macros/s/" + GOOGLE_SCRIPT_ID + "/exec";
    url += "?temp=" + String(temp);
    url += "&hum=" + String(hum);
    url += "&hi=" + String(temp - 0.5);
    url += "&led=" + led;

    Serial.println(">>> Sending to Google Sheets...");

    http.begin(url);
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    http.setTimeout(2500);

    int httpCode = http.GET();
    if (httpCode > 0) {
      Serial.printf("Success! HTTP Code: %d\n", httpCode);
    } else {
      Serial.printf("Error: %s (Code: %d)\n",
                    http.errorToString(httpCode).c_str(), httpCode);
    }
    http.end();
  } else {
    Serial.println("WiFi not connected! Cannot send data.");
  }
}