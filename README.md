# 🏠 스마트 홈 컨트롤러

MQTT 브로커와 Arduino 기기를 활용한 스마트홈 서버-클라이언트 시스템입니다. 동적으로 센서와 액추에이터를 구독하고 제어할 수 있으며, 여러 기기를 분리하여 관리할 수 있습니다.

## ✨ 주요 기능

- **동적 기기 관리**: MQTT를 통해 Arduino 기기를 자동으로 등록하고 관리
- **센서 모니터링**: 실시간 센서 데이터 수신 및 표시
- **액추에이터 제어**: 원격으로 액추에이터 상태 조작
- **다중 기기 지원**: 여러 기기를 독립적으로 관리
- **SQLite 데이터베이스**: 간편한 데이터 저장 및 조회
- **RESTful API**: 표준화된 API로 쉬운 통합
- **웹 UI**: 직관적인 웹 인터페이스로 관리
- **MCP 서버**: LLM과 통합하여 자연어로 기기 제어

## 🛠 기술 스택

### Backend
- **FastAPI**: 고성능 비동기 웹 프레임워크
- **SQLAlchemy**: ORM 및 데이터베이스 관리
- **SQLite**: 경량 데이터베이스
- **Paho MQTT**: MQTT 클라이언트
- **Jinja2**: 템플릿 엔진

### Frontend
- **Bootstrap 5**: 반응형 UI 프레임워크
- **Vanilla JavaScript**: 컴포넌트 기반 구조

### MCP Integration
- **FastMCP**: MCP 서버 구현
- LLM을 통한 자연어 기기 제어

## 📦 설치

### 요구사항
- Python >= 3.13
- uv (Python 패키지 관리자)
- MQTT 브로커 (예: Mosquitto)

### 설치 방법

1. 저장소 클론
```bash
git clone <repository-url>
cd proj_mvp
```

2. 의존성 설치
```bash
uv sync
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
DATABASE_URL=sqlite:///./database/iot_devices.db
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_BROKER_USERNAME=
MQTT_BROKER_PASSWORD=
```

## 🚀 실행

### 서버 실행

```bash
# 기본 실행
uv run start_server.py

# 자동 리로드 모드 (개발용)
uv run start_server.py --reload

# 포트 변경
uv run start_server.py --port 3000

# 호스트 변경
uv run start_server.py --host 127.0.0.1
```

### MCP 서버 실행

```bash
uv run start_mcp.py
```

## 📡 MQTT 프로토콜

### 기기 등록
기기는 다음 토픽으로 등록됩니다:
```
devices/{device_code}/register
```

### 센서 데이터 업데이트
센서 데이터는 다음 토픽으로 전송됩니다:
```
devices/{device_code}/update
```

### 액추에이터 제어
액추에이터 제어 명령은 다음 토픽으로 전송됩니다:
```
devices/{device_code}/actuators/{actuator_id}/action
```

## 🔌 API 엔드포인트

### 기기 (Devices)

- `GET /api/v1/devices/` - 모든 기기 목록 조회
- `GET /api/v1/devices/pagination?page=0&size=10` - 페이지네이션 기기 목록
- `GET /api/v1/devices/{device_code}` - 특정 기기 정보 조회
- `PUT /api/v1/devices/{device_code}` - 기기 정보 수정

### 액추에이터 (Actuators)

- `GET /api/v1/devices/{device_code}/actuators/` - 기기의 모든 액추에이터 조회
- `GET /api/v1/devices/{device_code}/actuators/{actuator_id}` - 특정 액추에이터 조회
- `PUT /api/v1/devices/{device_code}/actuators/{actuator_id}` - 액추에이터 정보 수정
- `POST /api/v1/devices/{device_code}/actuators/{actuator_id}/action` - 액추에이터 상태 변경

### 센서 (Sensors)

- `GET /api/v1/devices/{device_code}/sensors/` - 기기의 모든 센서 조회
- `GET /api/v1/devices/{device_code}/sensors/{sensor_id}` - 특정 센서 조회
- `PUT /api/v1/devices/{device_code}/sensors/{sensor_id}` - 센서 정보 수정

### 웹 UI

- `GET /` - 기기 목록 페이지
- `GET /device/{device_code}` - 기기 상세 페이지

## 🤖 MCP 서버

MCP 서버를 통해 LLM이 자연어로 기기를 제어할 수 있습니다.

### 주요 기능

- 기기 정보 조회
- 센서 데이터 읽기
- 액추에이터 제어
- 기기 목록 조회

### 사용 예시

```python
# LLM이 MCP 도구를 통해 기기 제어
# 예: "HS-0000-0000-0001 기기의 온도 센서 값을 알려줘"
# 예: "HS-0000-0000-0001 기기의 LED를 켜줘"
```

## 📁 프로젝트 구조

```
proj_mvp/
├── app/
│   ├── crud/              # 데이터베이스 CRUD 작업
│   │   ├── dao/           # 데이터 접근 객체
│   │   └── event/         # MQTT 이벤트 처리
│   ├── model/             # SQLAlchemy 모델
│   ├── router/            # FastAPI 라우터
│   ├── schema/            # Pydantic 스키마
│   ├── templates/         # Jinja2 템플릿
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   └── static/        # 정적 파일 (CSS, JS)
│   ├── util/              # 유틸리티 함수
│   └── server.py          # FastAPI 애플리케이션
├── arduino/               # Arduino 클라이언트 코드
├── shmcp/                 # MCP 서버 구현
├── database/              # SQLite 데이터베이스
├── start_server.py        # 서버 실행 스크립트
└── start_mcp.py           # MCP 서버 실행 스크립트
```

## 🎨 웹 UI 특징

- **반응형 디자인**: 모바일 및 데스크톱 지원
- **다크 테마**: 눈에 편안한 다크 모드
- **실시간 업데이트**: 센서 데이터 자동 새로고침
- **직관적인 인터페이스**: Bootstrap 기반의 현대적인 UI
- **컴포넌트 기반**: 재사용 가능한 템플릿 구조

## 📝 사용 예시

### 기기 등록
Arduino 기기가 MQTT 브로커에 연결되면 자동으로 등록됩니다.

### 센서 데이터 확인
웹 UI에서 기기를 선택하면 실시간 센서 데이터를 확인할 수 있습니다.

### 액추에이터 제어
웹 UI의 슬라이더나 버튼을 통해 액추에이터를 제어할 수 있습니다.

### API를 통한 제어
```bash
# 액추에이터 상태 변경
curl -X POST http://localhost:8000/api/v1/devices/HS-0000-0000-0001/actuators/1/action \
  -H "Content-Type: application/json" \
  -d '{"state": 100}'

# 센서 데이터 조회
curl http://localhost:8000/api/v1/devices/HS-0000-0000-0001/sensors/
```

## 🔧 개발

### 코드 구조

- **Router**: API 엔드포인트 정의
- **CRUD**: 비즈니스 로직 및 데이터베이스 작업
- **Model**: 데이터베이스 모델 정의
- **Schema**: API 요청/응답 스키마
- **Templates**: 웹 UI 템플릿

### 스타일 가이드

- Python: PEP 8 준수
- JavaScript: ES6+ 사용
- CSS: 컴포넌트별 분리 (base, device, actuator, sensor)

## 📚 문서

상세한 문서는 `documents/` 폴더에서 확인할 수 있습니다:

- **[API 문서](documents/API_DOCUMENTATION.md)**: REST API 및 MQTT 프로토콜 상세 문서
- **[백엔드 서버 설치 가이드](documents/BACKEND_SERVER_SETUP.md)**: 서버 설치 및 실행 방법
- **[MCP 서버 설치 가이드](documents/MCP_SERVER_SETUP.md)**: MCP 서버 설정 및 LLM 통합 방법
- **[Arduino 클라이언트 설치 가이드](documents/ARDUINO_CLIENT_SETUP.md)**: Arduino 클라이언트 설정 및 사용 방법

## 📄 라이선스

이 프로젝트는 [LICENSE](LICENSE) 파일을 참조하세요.

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.

---

**Made with ❤️ for Smart Home Automation**

