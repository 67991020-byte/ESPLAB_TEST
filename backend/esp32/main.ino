#include <Adafruit_HTU21DF.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include "secrets.h"

WiFiClientSecure espClient;
PubSubClient client(espClient);
Adafruit_HTU21DF sht21 = Adafruit_HTU21DF();

// --- Hardware Pins & Timing ---
const int touchPin = 4;
const int ledPin = 15;
const int touchThreshold = 40; // ปรับให้เหมาะกับบอร์ดจริง (ต่ำกว่า 40 คือสัมผัส)

bool ledState = false;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 1500; // ส่งทุกๆ 1.5 วินาที

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  // เชื่อมต่อ WiFi
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  if (!sht21.begin()) {
    Serial.println("Couldn't find SHT21 sensor!");
    while (1)
      ;
  }

  // ตั้งค่า SSL สำหรับ HiveMQ Cloud
  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32-Client-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void publishData() {
  float temp = sht21.readTemperature();
  float hum = sht21.readHumidity();
  String ledStatus = ledState ? "ON" : "OFF";

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Failed to read from SHT21 sensor!");
    return;
  }

  // สร้าง JSON Payload
  String payload = "{";
  payload += "\"temp\":" + String(temp, 1);
  payload += ",\"hum\":" + String(hum, 1);
  payload += ",\"led\":\"" + ledStatus + "\"";
  payload += "}";

  Serial.print("Publishing: ");
  Serial.println(payload);
  client.publish(mqtt_topic, payload.c_str());
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // ตรวจสอบ Touch Sensor (Capacitive Touch)
  int touchValue = touchRead(touchPin);
  if (touchValue < touchThreshold && touchValue > 0) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    Serial.printf("Touch Triggered! Value: %d | LED: %s\n", touchValue,
                  ledState ? "ON" : "OFF");

    publishData(); // ส่งข้อมูลทันทีเมื่อมีการสัมผัส
    delay(400);    // ป้องกันการสัมผัสซ้ำ (Debounce)
  }

  // ส่งข้อมูลอัตโนมัติตามช่วงเวลา (1.5 วินาที)
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    publishData();
  }
}