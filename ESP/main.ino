#include "DHT.h"
#include "sec.h"
#include <HTTPClient.h>
#include <WiFi.h>
const char *ssid = SECRET_SSID;
const char *password = SECRET_PASS;
String GOOGLE_SCRIPT_ID = sheet_key;
#define DHTPIN 22
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
int touchPin = 4;
int ledPin = 15;
int touchThreshold = 40;
bool ledState = false;
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000;
void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
}
void loop() {
  int touchValue = touchRead(touchPin);
  if (touchValue < touchThreshold) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState ? HIGH : LOW);
    Serial.printf("LED Toggled: %s\n", ledState ? "ON" : "OFF");
    delay(500);
  }
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      float hic = dht.computeHeatIndex(t, h, false);
      Serial.print(F("Temp: "));
      Serial.print(t);
      Serial.print(F("C | Hum: "));
      Serial.print(h);
      Serial.print(F("% | LED: "));
      Serial.println(ledState ? "ON" : "OFF");
      sendDataToGoogle(t, h, hic, ledState ? "ON" : "OFF");
    } else {
      Serial.println(F("Failed to read DHT sensor!"));
    }
  }
}
void sendDataToGoogle(float temp, float hum, float hi, String led) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "https://script.google.com/macros/s/" + sheet_key + "/exec";
    url += "?temp=" + String(temp);
    url += "&hum=" + String(hum);
    url += "&hi=" + String(hi);
    url += "&led=" + led;
    Serial.println(">>> Sending...");
    http.begin(url);
    http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    http.setTimeout(8000);
    int httpCode = http.GET();
    if (httpCode > 0) {
      Serial.printf("Success! Code: %d\n", httpCode);
    } else {
      Serial.printf("Error: %s (Code: %d)\n",
                    http.errorToString(httpCode).c_str(), httpCode);
    }
    http.end();
  } else {
    Serial.println("WiFi connected! fail");
  }
}