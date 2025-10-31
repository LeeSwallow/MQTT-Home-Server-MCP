#pragma once
#include <Arduino.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <unordered_map>
#include <string>

struct Actuator {
    String name; // unique name of the actuator
    int level; // level of the actuator
    bool isRegistered;
    int state;

    Actuator(String name = "", int level = 0);
    String getRegisterMessage();
    String getStateMessage();
};

struct Sensor {
    String name; // unique name of the sensor
    String type; // "boolean", "integer", "float", "string"
    String state;
    bool isRegistered;

    Sensor(String name = "", String type = "");
    String getRegisterMessage();
    String getStateMessage();
};


class SmartHomeClient {
public:
    using ActuatorCallback = void(*)(const String& name, int state);

    // constructor
    SmartHomeClient(WiFiClient& wifiClient, const char* deviceId);

    // public API
    void setupMQTT(const char* server, uint16_t port, const char* username, const char* password);
    void addActuator(String name, int level);
    void addSensor(String name, String type);
    void setActuatorCallback(ActuatorCallback callback);
    void publishSensorState(String name, String state);
    void publishActuatorState(String name, int state);
    void loop();

private:
    // 인스턴스 관리
    static SmartHomeClient* instance;

    // deviceId를 raw 포인터로 보관하면 호출 측의 String.c_str()가
    // 가리키는 버퍼가 나중에 무효화되어 런타임 에러가 발생할 수 있습니다.
    // 내부에서 안전하게 복사해서 보관합니다.
    String deviceId;
    PubSubClient mqttClient;
    String registerSub, actionSub, registerPub, actionPub;

    // 내부 저장소
    std::unordered_map<std::string, Actuator> actuators;
    std::unordered_map<std::string, Sensor> sensors;

    // 콜백
    static ActuatorCallback actuatorCallback;

    // MQTT 콜백 / 처리 함수 (구현은 cpp)
    static void mqttCallback(char* topic, byte* payload, unsigned int length);
    static void onRegister(String payload);
    static void onAction(String payload);

    // 내부 헬퍼
    void publishRegister(Actuator& actuator);
    void publishRegister(Sensor& sensor);
};