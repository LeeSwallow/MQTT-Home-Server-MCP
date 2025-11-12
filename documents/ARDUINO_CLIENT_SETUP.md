# Arduino 클라이언트 설치 및 사용 가이드

ESP32 기반 Arduino 클라이언트의 설치 및 사용 방법을 안내합니다.

## 목차

- [개요](#개요)
- [하드웨어 요구사항](#하드웨어-요구사항)
- [PlatformIO 설치](#platformio-설치)
- [프로젝트 설정](#프로젝트-설정)
- [SmartHome 라이브러리](#smarthome-라이브러리)
- [코드 작성](#코드-작성)
- [업로드 및 실행](#업로드-및-실행)
- [문제 해결](#문제-해결)

---

## 개요

Arduino 클라이언트는 ESP32 보드를 사용하여 MQTT 브로커를 통해 서버와 통신합니다. SmartHome 라이브러리를 통해 센서와 액추에이터를 쉽게 등록하고 제어할 수 있습니다.

### 주요 기능

- **자동 등록**: 센서와 액추에이터를 자동으로 서버에 등록
- **실시간 통신**: MQTT를 통한 실시간 데이터 전송 및 제어
- **간편한 API**: SmartHome 라이브러리로 쉬운 구현
- **자동 재연결**: MQTT 연결 끊김 시 자동 재연결

---

## 하드웨어 요구사항

### 지원 보드

- **DFRobot FireBeetle 2 ESP32-E**
- **ESP32-S3 USB OTG**
- 기타 ESP32 기반 보드 (설정 수정 필요)

### 추가 하드웨어 (예시)

- 서보 모터 (액추에이터 예시)
- 온도/습도 센서 (센서 예시)
- 기타 센서 및 액추에이터

---

## PlatformIO 설치

### VS Code 확장 설치

1. VS Code를 엽니다
2. 확장 마켓플레이스에서 "PlatformIO IDE" 검색
3. 설치 및 VS Code 재시작

### PlatformIO CLI 설치 (선택사항)

**Windows:**
```powershell
# Python이 설치되어 있어야 함
pip install platformio
```

**Linux/macOS:**
```bash
pip install platformio
```

---

## 프로젝트 설정

### 1. 프로젝트 열기

VS Code에서 `arduino/smart-home-mqtt` 폴더를 엽니다.

### 2. 보드 선택

`platformio.ini` 파일에서 사용하는 보드에 맞는 환경을 선택하거나 수정합니다:

```ini
[env:dfrobot_firebeetle2_esp32e]
platform = espressif32
board = dfrobot_firebeetle2_esp32e
framework = arduino
lib_deps = 
	knolleary/PubSubClient@^2.8
	bblanchon/ArduinoJson@^7.4.2
	madhephaestus/ESP32Servo@^3.0.9
monitor_speed = 115200
upload_port = COM23  # Windows: COM 포트 번호, Linux: /dev/ttyUSB0
```

### 3. WiFi 및 MQTT 설정

`src/main.cpp` 파일을 열고 다음 변수들을 수정합니다:

```cpp
// WiFi 설정
String WIFI_SSID = "YOUR_WIFI_SSID";
String WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT 브로커 설정
String MQTT_SERVER = "your_mqtt_broker.com";
int MQTT_PORT = 1883;
String MQTT_USERNAME = "your_username";
String MQTT_PASSWORD = "your_password";

// 기기 ID (고유해야 함)
String DEVICE_ID = "HS-0000-0000-0001";
```

### 4. 센서 및 액추에이터 설정

`setup_smart_home()` 함수에서 센서와 액추에이터를 추가합니다:

```cpp
void setup_smart_home() {
  smartHomeClient = new SmartHomeClient(espClient, DEVICE_ID.c_str());
  
  // 액추에이터 추가 (이름, 최대 레벨)
  smartHomeClient->addActuator("servo", 181);  // 0~180도
  
  // 센서 추가 (이름, 타입)
  smartHomeClient->addSensor("temperature", "float");
  smartHomeClient->addSensor("humidity", "float");
  
  // 액추에이터 콜백 설정
  smartHomeClient->setActuatorCallback(actuator_callback);
  
  // MQTT 연결
  smartHomeClient->setupMQTT(
    MQTT_SERVER.c_str(), 
    MQTT_PORT, 
    MQTT_USERNAME.c_str(), 
    MQTT_PASSWORD.c_str()
  );
}
```

---

## SmartHome 라이브러리

### 클래스 개요

`SmartHomeClient` 클래스는 MQTT를 통한 서버 통신을 간편하게 만들어줍니다.

### 주요 메서드

#### 생성자

```cpp
SmartHomeClient(WiFiClient& wifiClient, const char* deviceId)
```

- `wifiClient`: WiFiClient 인스턴스
- `deviceId`: 고유한 기기 ID (예: "HS-0000-0000-0001")

#### MQTT 설정

```cpp
void setupMQTT(const char* server, uint16_t port, const char* username, const char* password)
```

MQTT 브로커에 연결합니다. 연결이 성공할 때까지 재시도합니다.

#### 액추에이터 추가

```cpp
void addActuator(String name, int level)
```

- `name`: 액추에이터 이름 (고유해야 함)
- `level`: 액추에이터의 최대 레벨 (0 이상의 정수)

**예시:**
```cpp
smartHomeClient->addActuator("servo", 181);  // 0~180도 서보 모터
smartHomeClient->addActuator("led", 256);    // 0~255 밝기 LED
```

#### 센서 추가

```cpp
void addSensor(String name, String type)
```

- `name`: 센서 이름 (고유해야 함)
- `type`: 센서 데이터 타입 (`"boolean"`, `"integer"`, `"float"`, `"string"`)

**예시:**
```cpp
smartHomeClient->addSensor("temperature", "float");
smartHomeClient->addSensor("humidity", "float");
smartHomeClient->addSensor("motion", "boolean");
```

#### 액추에이터 콜백 설정

```cpp
void setActuatorCallback(ActuatorCallback callback)
```

액추에이터 제어 명령을 받았을 때 호출될 콜백 함수를 설정합니다.

**콜백 함수 시그니처:**
```cpp
void actuator_callback(const String& actuator_name, int value)
```

#### 센서 상태 발행

```cpp
void publishSensorState(String name, String state)
```

센서의 현재 상태를 서버에 전송합니다. 센서가 등록되지 않았다면 자동으로 등록 요청을 보냅니다.

**예시:**
```cpp
float temperature = 25.5;
smartHomeClient->publishSensorState("temperature", String(temperature, 1));
```

#### 액추에이터 상태 발행

```cpp
void publishActuatorState(String name, int state)
```

액추에이터의 현재 상태를 서버에 전송합니다. 액추에이터가 등록되지 않았다면 자동으로 등록 요청을 보냅니다.

**예시:**
```cpp
int servoAngle = 90;
smartHomeClient->publishActuatorState("servo", servoAngle);
```

#### 메인 루프

```cpp
void loop()
```

`loop()` 함수에서 반드시 호출해야 합니다. MQTT 메시지를 처리하고, 등록되지 않은 센서/액추에이터를 자동으로 등록합니다.

---

## 코드 작성

### 기본 구조

```cpp
#include <Arduino.h>
#include <WiFi.h>
#include <SmartHome.h>

String DEVICE_ID = "HS-0000-0000-0001";
WiFiClient espClient;
SmartHomeClient* smartHomeClient = nullptr;

// WiFi 및 MQTT 설정
String WIFI_SSID = "YOUR_WIFI_SSID";
String WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
String MQTT_SERVER = "your_mqtt_broker.com";
int MQTT_PORT = 1883;
String MQTT_USERNAME = "your_username";
String MQTT_PASSWORD = "your_password";

void setup() {
  Serial.begin(115200);
  
  // WiFi 연결
  setup_WiFi();
  
  // SmartHome 클라이언트 설정
  setup_smart_home();
}

void loop() {
  // 반드시 호출해야 함
  smartHomeClient->loop();
  
  // 센서 읽기 및 전송
  // ...
}

void setup_WiFi() {
  WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void setup_smart_home() {
  smartHomeClient = new SmartHomeClient(espClient, DEVICE_ID.c_str());
  
  // 센서 및 액추에이터 추가
  smartHomeClient->addActuator("servo", 181);
  smartHomeClient->addSensor("temperature", "float");
  
  // 콜백 설정
  smartHomeClient->setActuatorCallback(actuator_callback);
  
  // MQTT 연결
  smartHomeClient->setupMQTT(
    MQTT_SERVER.c_str(), 
    MQTT_PORT, 
    MQTT_USERNAME.c_str(), 
    MQTT_PASSWORD.c_str()
  );
}

void actuator_callback(const String& actuator_name, int value) {
  if (actuator_name == "servo") {
    // 서보 모터 제어
    // myServo.write(value);
    smartHomeClient->publishActuatorState(actuator_name, value);
  }
}
```

### 센서 데이터 전송 예시

```cpp
void loop() {
  smartHomeClient->loop();
  
  // 10초마다 센서 데이터 전송
  static unsigned long lastRead = 0;
  if (millis() - lastRead > 10000) {
    lastRead = millis();
    
    // 센서 읽기
    float temperature = readTemperature();
    float humidity = readHumidity();
    
    // 서버에 전송
    smartHomeClient->publishSensorState("temperature", String(temperature, 1));
    smartHomeClient->publishSensorState("humidity", String(humidity, 1));
  }
}
```

### 액추에이터 제어 예시

```cpp
void actuator_callback(const String& actuator_name, int value) {
  Serial.print("Actuator: ");
  Serial.print(actuator_name);
  Serial.print(" = ");
  Serial.println(value);
  
  if (actuator_name == "servo") {
    myServo.write(value);
    smartHomeClient->publishActuatorState(actuator_name, value);
  } else if (actuator_name == "led") {
    analogWrite(LED_PIN, value);
    smartHomeClient->publishActuatorState(actuator_name, value);
  }
}
```

---

## 업로드 및 실행

### 1. 보드 연결

USB 케이블로 ESP32 보드를 컴퓨터에 연결합니다.

### 2. 포트 확인

**Windows:**
- 장치 관리자에서 COM 포트 확인
- `platformio.ini`의 `upload_port` 수정

**Linux:**
```bash
ls /dev/ttyUSB*  # 또는 /dev/ttyACM*
```

**macOS:**
```bash
ls /dev/cu.usbserial-*
```

### 3. 빌드 및 업로드

VS Code에서:
1. 하단 상태바에서 보드 선택
2. `PlatformIO: Build` 클릭 (또는 `Ctrl+Alt+B`)
3. `PlatformIO: Upload` 클릭 (또는 `Ctrl+Alt+U`)

또는 터미널에서:
```bash
pio run --target upload
```

### 4. 시리얼 모니터

VS Code에서:
- `PlatformIO: Serial Monitor` 클릭 (또는 `Ctrl+Alt+S`)

터미널에서:
```bash
pio device monitor
```

---

## MQTT 토픽 구조

### 기기 발행 토픽

#### 등록 토픽
**토픽:** `devices/{device_code}/register`

**메시지 형식:**
```json
{
  "type": "sensor",
  "name": "temperature",
  "data_type": "float"
}
```

또는

```json
{
  "type": "actuator",
  "name": "servo",
  "level": 181
}
```

#### 상태 업데이트 토픽
**토픽:** `devices/{device_code}/update`

**메시지 형식:**
```json
{
  "type": "sensor",
  "name": "temperature",
  "state": "25.5"
}
```

또는

```json
{
  "type": "actuator",
  "name": "servo",
  "state": 90
}
```

### 기기 구독 토픽

#### 등록 응답 토픽
**토픽:** `devices/{device_code}/response`

서버로부터 등록 완료 응답을 받습니다.

**메시지 형식:**
```json
{
  "type": "sensor",
  "name": "temperature"
}
```

#### 액추에이터 제어 토픽
**토픽:** `devices/{device_code}/action`

서버로부터 액추에이터 제어 명령을 받습니다.

**메시지 형식:**
```json
{
  "name": "servo",
  "state": 90
}
```

---

## 문제 해결

### WiFi 연결 실패

1. **SSID와 비밀번호 확인**
   ```cpp
   String WIFI_SSID = "정확한_SSID";
   String WIFI_PASSWORD = "정확한_비밀번호";
   ```

2. **신호 강도 확인**
   - 보드가 WiFi 신호 범위 내에 있는지 확인

3. **재시도 로직 추가**
   ```cpp
   void setup_WiFi() {
     WiFi.begin(WIFI_SSID.c_str(), WIFI_PASSWORD.c_str());
     int attempts = 0;
     while (WiFi.status() != WL_CONNECTED && attempts < 20) {
       delay(500);
       Serial.print(".");
       attempts++;
     }
     if (WiFi.status() != WL_CONNECTED) {
       Serial.println("WiFi 연결 실패!");
       ESP.restart();
     }
   }
   ```

### MQTT 연결 실패

1. **브로커 주소 및 포트 확인**
   ```cpp
   String MQTT_SERVER = "올바른_주소";
   int MQTT_PORT = 1883;  // 또는 8883 (TLS)
   ```

2. **인증 정보 확인**
   ```cpp
   String MQTT_USERNAME = "올바른_사용자명";
   String MQTT_PASSWORD = "올바른_비밀번호";
   ```

3. **네트워크 연결 확인**
   - WiFi가 연결되어 있는지 확인
   - 브로커가 접근 가능한지 확인

### 센서/액추에이터 등록 실패

1. **기기 ID 확인**
   - 각 기기는 고유한 ID를 가져야 합니다
   - 서버에 이미 등록된 기기인지 확인

2. **이름 중복 확인**
   - 같은 기기 내에서 센서/액추에이터 이름이 중복되지 않아야 합니다

3. **시리얼 모니터 확인**
   - 등록 요청이 전송되는지 확인
   - 서버 응답을 확인

### 메모리 부족

1. **불필요한 코드 제거**
2. **문자열 사용 최소화**
3. **정적 할당 사용**

### 업로드 실패

1. **포트 확인**
   - `platformio.ini`의 `upload_port`가 올바른지 확인

2. **보드 선택 확인**
   - 사용하는 보드에 맞는 환경 선택

3. **부트로더 모드**
   - 일부 보드는 업로드 시 특정 버튼을 눌러야 함

---

## 고급 사용법

### 여러 센서/액추에이터 사용

```cpp
void setup_smart_home() {
  smartHomeClient = new SmartHomeClient(espClient, DEVICE_ID.c_str());
  
  // 여러 액추에이터
  smartHomeClient->addActuator("servo1", 181);
  smartHomeClient->addActuator("servo2", 181);
  smartHomeClient->addActuator("led", 256);
  
  // 여러 센서
  smartHomeClient->addSensor("temperature", "float");
  smartHomeClient->addSensor("humidity", "float");
  smartHomeClient->addSensor("pressure", "float");
  smartHomeClient->addSensor("motion", "boolean");
  
  smartHomeClient->setActuatorCallback(actuator_callback);
  smartHomeClient->setupMQTT(...);
}
```

### 주기적 센서 읽기

```cpp
void loop() {
  smartHomeClient->loop();
  
  // 각 센서마다 다른 주기 설정
  static unsigned long lastTemp = 0;
  static unsigned long lastHumidity = 0;
  
  unsigned long now = millis();
  
  if (now - lastTemp > 5000) {  // 5초마다
    lastTemp = now;
    float temp = readTemperature();
    smartHomeClient->publishSensorState("temperature", String(temp, 1));
  }
  
  if (now - lastHumidity > 10000) {  // 10초마다
    lastHumidity = now;
    float humidity = readHumidity();
    smartHomeClient->publishSensorState("humidity", String(humidity, 1));
  }
}
```

### 에러 처리

```cpp
void publishSensorStateSafe(String name, String state) {
  if (smartHomeClient && WiFi.status() == WL_CONNECTED) {
    smartHomeClient->publishSensorState(name, state);
  } else {
    Serial.println("센서 상태 전송 실패: 연결되지 않음");
  }
}
```

---

## 센서 타입 가이드

### Boolean 타입

```cpp
smartHomeClient->addSensor("motion", "boolean");
smartHomeClient->publishSensorState("motion", "true");  // 또는 "false"
```

### Integer 타입

```cpp
smartHomeClient->addSensor("counter", "integer");
int count = 42;
smartHomeClient->publishSensorState("counter", String(count));
```

### Float 타입

```cpp
smartHomeClient->addSensor("temperature", "float");
float temp = 25.5;
smartHomeClient->publishSensorState("temperature", String(temp, 1));  // 소수점 1자리
```

### String 타입

```cpp
smartHomeClient->addSensor("status", "string");
smartHomeClient->publishSensorState("status", "online");
```

---

## 추가 리소스

- [PlatformIO 문서](https://docs.platformio.org/)
- [ESP32 Arduino 문서](https://docs.espressif.com/projects/arduino-esp32/)
- [PubSubClient 라이브러리](https://github.com/knolleary/pubsubclient)
- [ArduinoJson 라이브러리](https://arduinojson.org/)
- [API 문서](../documents/API_DOCUMENTATION.md)

---

## 예제 프로젝트

프로젝트의 `arduino/smart-home-mqtt/src/main.cpp` 파일을 참고하여 자신의 프로젝트를 작성할 수 있습니다.

### 주요 단계

1. WiFi 연결 설정
2. SmartHomeClient 인스턴스 생성
3. 센서 및 액추에이터 추가
4. 콜백 함수 설정
5. MQTT 연결
6. `loop()`에서 `smartHomeClient->loop()` 호출
7. 센서 데이터 주기적 전송

---

**Happy Coding! 🚀**

