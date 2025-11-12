# API 문서

스마트 홈 컨트롤러의 REST API 및 MQTT 프로토콜 문서입니다.

## 목차

- [REST API](#rest-api)
- [MQTT 프로토콜](#mqtt-프로토콜)

---

## REST API

모든 API는 `/api/v1` 접두사를 사용합니다.

### Base URL

```
http://localhost:8000/api/v1
```

### 응답 형식

모든 API는 JSON 형식으로 응답합니다.

---

## 기기 (Devices)

### 모든 기기 목록 조회

**GET** `/devices/`

모든 등록된 기기의 목록을 반환합니다.

**응답 예시:**
```json
[
  {
    "device_code": "HS-0000-0000-0001",
    "name": "거실 스마트 디바이스",
    "description": "거실에 설치된 IoT 기기",
    "created_at": "2025-11-12T10:00:00",
    "updated_at": "2025-11-12T10:00:00"
  }
]
```

### 페이지네이션 기기 목록 조회

**GET** `/devices/pagination?page=0&size=10`

페이지네이션을 사용하여 기기 목록을 조회합니다.

**쿼리 파라미터:**
- `page` (int, 기본값: 0): 페이지 번호 (0부터 시작)
- `size` (int, 기본값: 10): 페이지당 항목 수

**응답 예시:**
```json
{
  "contents": [
    {
      "device_code": "HS-0000-0000-0001",
      "name": "거실 스마트 디바이스",
      "description": "거실에 설치된 IoT 기기",
      "created_at": "2025-11-12T10:00:00",
      "updated_at": "2025-11-12T10:00:00"
    }
  ],
  "page": 0,
  "size": 10,
  "total_pages": 1,
  "total_items": 1
}
```

### 특정 기기 정보 조회

**GET** `/devices/{device_code}`

특정 기기의 상세 정보를 조회합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드

**응답 예시:**
```json
{
  "device_code": "HS-0000-0000-0001",
  "name": "거실 스마트 디바이스",
  "description": "거실에 설치된 IoT 기기",
  "created_at": "2025-11-12T10:00:00",
  "updated_at": "2025-11-12T10:00:00"
}
```

### 기기 정보 수정

**PUT** `/devices/{device_code}`

기기의 이름과 설명을 수정합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드

**요청 본문:**
```json
{
  "name": "수정된 기기 이름",
  "description": "수정된 설명"
}
```

**응답 예시:**
```json
{
  "device_code": "HS-0000-0000-0001",
  "name": "수정된 기기 이름",
  "description": "수정된 설명",
  "created_at": "2025-11-12T10:00:00",
  "updated_at": "2025-11-12T10:05:00"
}
```

---

## 액추에이터 (Actuators)

### 기기의 모든 액추에이터 조회

**GET** `/devices/{device_code}/actuators/`

특정 기기에 등록된 모든 액추에이터 목록을 반환합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드

**응답 예시:**
```json
[
  {
    "id": 1,
    "name": "servo",
    "description": "서보 모터",
    "level": 180,
    "state": 90,
    "created_at": "2025-11-12T10:00:00",
    "updated_at": "2025-11-12T10:00:00"
  }
]
```

### 페이지네이션 액추에이터 목록 조회

**GET** `/devices/{device_code}/actuators/pagination?page=1&size=10`

**경로 파라미터:**
- `device_code` (string): 기기 코드

**쿼리 파라미터:**
- `page` (int, 기본값: 1): 페이지 번호 (1부터 시작)
- `size` (int, 기본값: 10): 페이지당 항목 수

### 특정 액추에이터 조회

**GET** `/devices/{device_code}/actuators/{actuator_id}`

**경로 파라미터:**
- `device_code` (string): 기기 코드
- `actuator_id` (int): 액추에이터 ID

**응답 예시:**
```json
{
  "id": 1,
  "name": "servo",
  "description": "서보 모터",
  "level": 180,
  "state": 90,
  "created_at": "2025-11-12T10:00:00",
  "updated_at": "2025-11-12T10:00:00"
}
```

### 액추에이터 정보 수정

**PUT** `/devices/{device_code}/actuators/{actuator_id}`

액추에이터의 이름과 설명을 수정합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드
- `actuator_id` (int): 액추에이터 ID

**요청 본문:**
```json
{
  "name": "수정된 액추에이터 이름",
  "description": "수정된 설명"
}
```

### 액추에이터 상태 변경

**POST** `/devices/{device_code}/actuators/{actuator_id}/action`

액추에이터의 상태를 변경합니다. 이 요청은 MQTT를 통해 실제 기기에 명령을 전송합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드
- `actuator_id` (int): 액추에이터 ID

**요청 본문:**
```json
{
  "state": 100
}
```

**응답:**
```json
null
```

**참고:** `state` 값은 0부터 `level - 1` 사이의 값이어야 합니다.

---

## 센서 (Sensors)

### 기기의 모든 센서 조회

**GET** `/devices/{device_code}/sensors/`

특정 기기에 등록된 모든 센서 목록을 반환합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드

**응답 예시:**
```json
[
  {
    "id": 1,
    "name": "temperature",
    "sensor_type": "float",
    "state": "25.5",
    "description": "온도 센서",
    "created_at": "2025-11-12T10:00:00",
    "updated_at": "2025-11-12T10:00:00"
  }
]
```

### 페이지네이션 센서 목록 조회

**GET** `/devices/{device_code}/sensors/pagination?page=1&size=10`

**경로 파라미터:**
- `device_code` (string): 기기 코드

**쿼리 파라미터:**
- `page` (int, 기본값: 1): 페이지 번호 (1부터 시작)
- `size` (int, 기본값: 10): 페이지당 항목 수

### 특정 센서 조회

**GET** `/devices/{device_code}/sensors/{sensor_id}`

**경로 파라미터:**
- `device_code` (string): 기기 코드
- `sensor_id` (int): 센서 ID

**응답 예시:**
```json
{
  "id": 1,
  "name": "temperature",
  "sensor_type": "float",
  "state": "25.5",
  "description": "온도 센서",
  "created_at": "2025-11-12T10:00:00",
  "updated_at": "2025-11-12T10:00:00"
}
```

### 센서 정보 수정

**PUT** `/devices/{device_code}/sensors/{sensor_id}`

센서의 이름과 설명을 수정합니다.

**경로 파라미터:**
- `device_code` (string): 기기 코드
- `sensor_id` (int): 센서 ID

**요청 본문:**
```json
{
  "name": "수정된 센서 이름",
  "description": "수정된 설명"
}
```

---

## MQTT 프로토콜

서버는 MQTT 브로커를 통해 Arduino 기기와 통신합니다.

### 서버 구독 토픽

서버는 다음 토픽들을 구독합니다:

#### 1. 기기 등록 토픽

**토픽:** `devices/{device_code}/register`

**설명:** Arduino 기기가 센서나 액추에이터를 등록할 때 사용합니다.

**메시지 형식:**

**센서 등록:**
```json
{
  "type": "sensor",
  "name": "temperature",
  "data_type": "float"
}
```

**액추에이터 등록:**
```json
{
  "type": "actuator",
  "name": "servo",
  "level": 180
}
```

**필드 설명:**
- `type`: 등록 타입 (`"sensor"` 또는 `"actuator"`)
- `name`: 센서/액추에이터 이름 (고유해야 함)
- `data_type`: 센서 타입 (`"boolean"`, `"integer"`, `"float"`, `"string"`) - 센서만
- `level`: 액추에이터 최대 레벨 (0 이상의 정수) - 액추에이터만

#### 2. 상태 업데이트 토픽

**토픽:** `devices/{device_code}/update`

**설명:** Arduino 기기가 센서 값이나 액추에이터 상태를 업데이트할 때 사용합니다.

**메시지 형식:**

**센서 상태 업데이트:**
```json
{
  "type": "sensor",
  "name": "temperature",
  "state": "25.5"
}
```

**액추에이터 상태 업데이트:**
```json
{
  "type": "actuator",
  "name": "servo",
  "state": 90
}
```

**필드 설명:**
- `type`: 업데이트 타입 (`"sensor"` 또는 `"actuator"`)
- `name`: 센서/액추에이터 이름
- `state`: 센서는 문자열, 액추에이터는 정수 (0 이상)

---

### 서버 발행 토픽

서버는 다음 토픽들로 메시지를 발행합니다:

#### 1. 등록 응답 토픽

**토픽:** `devices/{device_code}/response`

**설명:** 센서나 액추에이터 등록이 완료되었을 때 Arduino 기기에 응답을 보냅니다.

**메시지 형식:**
```json
{
  "type": "sensor",
  "name": "temperature"
}
```

또는

```json
{
  "type": "actuator",
  "name": "servo"
}
```

**필드 설명:**
- `type`: 등록된 타입 (`"sensor"` 또는 `"actuator"`)
- `name`: 등록된 센서/액추에이터 이름

#### 2. 액추에이터 제어 토픽

**토픽:** `devices/{device_code}/action`

**설명:** 액추에이터를 제어하기 위해 Arduino 기기에 명령을 보냅니다.

**메시지 형식:**
```json
{
  "name": "servo",
  "state": 100
}
```

**필드 설명:**
- `name`: 액추에이터 이름
- `state`: 설정할 상태 값 (0 이상의 정수, `level` 미만)

---

### Arduino 기기 구독 토픽

Arduino 기기는 다음 토픽들을 구독합니다:

#### 1. 등록 응답 토픽

**토픽:** `devices/{device_code}/response`

서버로부터 등록 완료 응답을 받습니다.

#### 2. 액추에이터 제어 토픽

**토픽:** `devices/{device_code}/action`

서버로부터 액추에이터 제어 명령을 받습니다.

---

### Arduino 기기 발행 토픽

Arduino 기기는 다음 토픽들로 메시지를 발행합니다:

#### 1. 기기 등록 토픽

**토픽:** `devices/{device_code}/register`

센서나 액추에이터를 등록할 때 사용합니다.

#### 2. 상태 업데이트 토픽

**토픽:** `devices/{device_code}/update`

센서 값이나 액추에이터 상태를 업데이트할 때 사용합니다.

---

## 에러 응답

모든 API는 에러 발생 시 다음 형식으로 응답합니다:

```json
{
  "detail": "에러 메시지"
}
```

### HTTP 상태 코드

- `200 OK`: 요청 성공
- `400 Bad Request`: 잘못된 요청
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

---

## 예시

### cURL 예시

```bash
# 모든 기기 조회
curl http://localhost:8000/api/v1/devices/

# 특정 기기 조회
curl http://localhost:8000/api/v1/devices/HS-0000-0000-0001

# 액추에이터 상태 변경
curl -X POST http://localhost:8000/api/v1/devices/HS-0000-0000-0001/actuators/1/action \
  -H "Content-Type: application/json" \
  -d '{"state": 100}'

# 기기 정보 수정
curl -X PUT http://localhost:8000/api/v1/devices/HS-0000-0000-0001 \
  -H "Content-Type: application/json" \
  -d '{"name": "새로운 이름", "description": "새로운 설명"}'
```

### Python 예시

```python
import requests

# 모든 기기 조회
response = requests.get("http://localhost:8000/api/v1/devices/")
devices = response.json()

# 액추에이터 상태 변경
response = requests.post(
    "http://localhost:8000/api/v1/devices/HS-0000-0000-0001/actuators/1/action",
    json={"state": 100}
)
```

---

## 참고사항

- 모든 날짜/시간은 ISO 8601 형식입니다.
- 센서의 `state`는 문자열 타입입니다 (센서 타입에 따라 다름).
- 액추에이터의 `state`는 정수 타입이며, 0부터 `level - 1` 사이의 값입니다.
- MQTT 메시지는 JSON 형식이며, UTF-8 인코딩을 사용합니다.
- MQTT QoS 레벨은 1을 사용합니다.

