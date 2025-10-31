#include <Arduino.h>
#include <WiFi.h>
#include <SmartHome.h>


String DEVICE_ID = "HS-0000-0000-0001"; // Unique device ID
int TIMEOUT_PORTAL = 180; //seconds

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

int LED_PIN = 2; // GPIO2 for built-in LED on many ESP32 boards

void setup_WiFi();
void actuator_callback(const String& actuator_name, int value);
void setup_smart_home();

void setup() {
  Serial.begin(115200);
  setup_WiFi();
  setup_smart_home();
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  smartHomeClient->loop();
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
  if (actuator_name == "led") {
    int brightness = map(value, 0, 9, 0, 255); // 값 범위를 0-255로 매핑
    analogWrite(LED_PIN, brightness);
  }
  smartHomeClient->publishActuatorState(actuator_name, value);
}

void setup_smart_home() {
  smartHomeClient = new SmartHomeClient(espClient, DEVICE_ID.c_str());
  // 액추에이터 및 센서 추가
  smartHomeClient->addActuator("led", 10);  // 입력 값 범위 0-9

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

