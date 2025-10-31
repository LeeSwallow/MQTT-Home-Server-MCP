#include <Arduino.h>
#include <WiFi.h>
#include <SmartHome.h>
#include <ESP32Servo.h>

#define SERVO_PIN 18

String DEVICE_ID = "HS-0000-0000-0001"; // Unique device ID
int TIMEOUT_PORTAL = 180; //seconds
unsigned long previousMillis = 0;

// AP credentials
String WIFI_SSID = "Netis104_2G";
String WIFI_PASSWORD = "aaaa1111";
WiFiClient espClient;
SmartHomeClient* smartHomeClient = nullptr;

// MQTT Broker settings
String MQTT_SERVER = "swallow104.gonetis.com";
int MQTT_PORT = 11883;
String MQTT_USERNAME = "test_user";
String MQTT_PASSWORD = "testpass1212";

Servo myServo;

void setup_WiFi();
void actuator_callback(const String& actuator_name, int value);
void setup_smart_home();
void test_read_sensors();

void setup() {
  Serial.begin(115200);
  setup_WiFi();
  setup_smart_home();
  myServo.attach(SERVO_PIN);
  previousMillis = millis();
}

void loop() {
  smartHomeClient->loop();
  
  unsigned long currentMillis = millis();
  // 10초마다 온도 및 습도 센서 값 전송
  const unsigned long interval = 10000UL;

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    test_read_sensors();
  }
}

void setup_WiFi() {
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void actuator_callback(const String& actuator_name, int value) {
  if (actuator_name == "servo") {
    Serial.print("Setting servo to ");
    Serial.print(value);
    Serial.println(" degrees.");
    myServo.write(value);
    smartHomeClient->publishActuatorState(actuator_name, value);
  }
}

void setup_smart_home() {
  smartHomeClient = new SmartHomeClient(espClient, DEVICE_ID.c_str());
  // 액추에이터 및 센서 추가
  smartHomeClient->addActuator("servo", 181); // 0~180도
  smartHomeClient->addSensor("temperature", "float");
  smartHomeClient->addSensor("humidity", "float");

  // 액추에이터가 활성화 될 경우의 콜백함수 추가
  smartHomeClient->setActuatorCallback(actuator_callback);

  // MQTT 설정
  smartHomeClient->setupMQTT(
    MQTT_SERVER.c_str(), 
    MQTT_PORT, 
    MQTT_USERNAME.c_str(), 
    MQTT_PASSWORD.c_str()
  );
}

void test_read_sensors() {
  float temperature = random(200, 300) / 10.0; // 20.0 ~ 30.0도 사이의 랜덤 값
  float humidity = random(400, 700) / 10.0;    // 40.0 ~ 70.0% 사이의 랜덤 값
  Serial.print("Temperature: "); Serial.print(temperature, 1); Serial.println(" C");
  Serial.print("Humidity: "); Serial.print(humidity, 1); Serial.println(" %");
  smartHomeClient->publishSensorState("temperature", String(temperature, 1));
  smartHomeClient->publishSensorState("humidity", String(humidity, 1));
  delay(50); // 중복 전송 방지
}