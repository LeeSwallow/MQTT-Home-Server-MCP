#include "SmartHome.h"
#include <ArduinoJson.h>

Actuator::Actuator(String name, int level) : name(name), level(level) {
    isRegistered = false;
    state = 0;
}

String Actuator::getRegisterMessage() {
    String msg = "{";
    msg += "\"type\":\"actuator\",";
    msg += "\"name\":\"" + name + "\",";
    msg += "\"level\":" + String(level);
    msg += "}";
    return msg;
}

String Actuator::getStateMessage() {
    String msg = "{";
    msg += "\"type\":\"actuator\",";
    msg += "\"name\":\"" + name + "\",";
    msg += "\"state\":" + String(state);
    msg += "}";
    return msg;
}

Sensor::Sensor(String name, String type) : name(name), type(type) {
    isRegistered = false;
    state = "";
}

String Sensor::getRegisterMessage() {
    String msg = "{";
    msg += "\"type\":\"sensor\",";
    msg += "\"name\":\"" + name + "\",";
    msg += "\"data_type\":\"" + type + "\"";
    msg += "}";
    return msg;
}

String Sensor::getStateMessage() {
    String msg = "{";
    msg += "\"type\":\"sensor\",";
    msg += "\"name\":\"" + name + "\",";
    msg += "\"state\":\"" + state + "\"";
    msg += "}";
    return msg;
}

// SmartHomeClient 정적 멤버 초기화
SmartHomeClient* SmartHomeClient::instance = nullptr;
SmartHomeClient::ActuatorCallback SmartHomeClient::actuatorCallback = nullptr;

// 생성자
SmartHomeClient::SmartHomeClient(WiFiClient& wifiClient, const char* deviceId)
    : mqttClient(wifiClient) {
    // 인스턴스 포인터 설정
    SmartHomeClient::instance = this;
    // deviceId를 안전하게 내부 String으로 복사
    this->deviceId = String(deviceId);
}

// 내부 헬퍼 구현
void SmartHomeClient::publishRegister(Actuator& actuator) {
    if (!mqttClient.connected() || registerPub.length() == 0) return;
    String msg = actuator.getRegisterMessage();
    mqttClient.publish(registerPub.c_str(), msg.c_str());
}

void SmartHomeClient::publishRegister(Sensor& sensor) {
    if (!mqttClient.connected() || registerPub.length() == 0) return;
    String msg = sensor.getRegisterMessage();
    mqttClient.publish(registerPub.c_str(), msg.c_str());
}

// public API 구현
void SmartHomeClient::setupMQTT(const char* server, uint16_t port, const char* username, const char* password) {
    mqttClient.setServer(server, port);
    while (!mqttClient.connected()) {
        Serial.print("Connecting to MQTT broker...");
        // connect requires a C-string client id - use the safely stored String
        if (mqttClient.connect(deviceId.c_str(), username, password)) {
            Serial.println("connected");
            registerSub = String("devices/") + deviceId + "/response";
            actionSub = String("devices/") + deviceId + "/action";
            registerPub = String("devices/") + deviceId + "/register";
            actionPub = String("devices/") + deviceId + "/update";

            mqttClient.setCallback(mqttCallback);
            mqttClient.subscribe(registerSub.c_str());
            mqttClient.subscribe(actionSub.c_str());

        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" try again in 5 seconds");
            delay(5000);
        }
    }
}

void SmartHomeClient::addActuator(String name, int level) {
    actuators[name.c_str()] = Actuator(name, level);
}

void SmartHomeClient::addSensor(String name, String type) {
    sensors[name.c_str()] = Sensor(name, type);
}

void SmartHomeClient::setActuatorCallback(ActuatorCallback callback) {
    actuatorCallback = callback;
}

void SmartHomeClient::publishSensorState(String name, String state) {
    std::string sensorName = name.c_str();
    if (sensors.find(sensorName) != sensors.end()) {
        // 등록 되지 않은 센서가 있다면 등록 요청 전송
        if (sensors[sensorName].isRegistered == false) {
            publishRegister(sensors[sensorName]);
            return;
        }
        sensors[sensorName].state = state;
        if (!mqttClient.connected() || actionPub.length() == 0) return;
        String msg = sensors[sensorName].getStateMessage();
        mqttClient.publish(actionPub.c_str(), msg.c_str());
    }
}

void SmartHomeClient::publishActuatorState(String name, int state) {
    std::string actuatorName = name.c_str();
    if (actuators.find(actuatorName) != actuators.end()) {
        
        // 등록 되지 않은 액추에이터가 있다면 등록 요청 전송
        if (actuators[actuatorName].isRegistered == false) {
            publishRegister(actuators[actuatorName]);
            return;
        }
        actuators[actuatorName].state = state;
        String msg = actuators[actuatorName].getStateMessage();
        mqttClient.publish(actionPub.c_str(), msg.c_str());
    }
}

void SmartHomeClient::loop() {
    if (!mqttClient.connected()) {
        return;
    }
    mqttClient.loop();

    // 등록되지 않은 액추에이터 및 센서 등록 요청 전송
    for (auto& pair : actuators) {
        Actuator& actuator = pair.second;
        if (!actuator.isRegistered) {
            publishRegister(actuator);
        }
    }
    for (auto& pair : sensors) {
        Sensor& sensor = pair.second;
        if (!sensor.isRegistered) {
            publishRegister(sensor);
        }
    }
}

// static 함수
void SmartHomeClient::mqttCallback(char* topic, byte* payload, unsigned int length) {
    SmartHomeClient* client = SmartHomeClient::instance;
    if (!client) return; // 안전장치: 인스턴스가 없으면 리턴

    String topicStr = String(topic);
    // payload를 String으로 안전하게 만든다
    String payloadStr = String((char*)payload, length);

    if (topicStr == client->registerSub) {
        onRegister(payloadStr);
    } else if (topicStr == client->actionSub) {
        onAction(payloadStr);
    }
}

void SmartHomeClient::onRegister(String payload) {
    SmartHomeClient* client = SmartHomeClient::instance;
    if (!client) return;

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload.c_str());
    if (error) {
        Serial.println("Failed to parse registration response JSON");
        return;
    }
    String name = doc["name"].as<String>();
    std::string key = name.c_str();
    auto ait = client->actuators.find(key);
    if (ait != client->actuators.end()) {
        ait->second.isRegistered = true;
        return;
    }
    auto sit = client->sensors.find(key);
    if (sit != client->sensors.end()) {
        sit->second.isRegistered = true;
    }
}

void SmartHomeClient::onAction(String payload) {
    SmartHomeClient* client = SmartHomeClient::instance;
    if (!client) return;

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload.c_str());
    if (error) {
        Serial.println("Failed to parse action JSON");
        return;
    }
    String name = doc["name"].as<String>();
    int state = doc["state"].as<int>();

    std::string key = name.c_str();
    auto it = client->actuators.find(key);
    if (it != client->actuators.end()) {
        if (it->second.isRegistered == false) return;
        if (actuatorCallback) actuatorCallback(name, state);
    }
}
