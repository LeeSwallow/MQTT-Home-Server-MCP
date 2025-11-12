# MCP 서버 설치 및 실행 가이드

스마트 홈 컨트롤러의 MCP (Model Context Protocol) 서버 설치 및 실행 방법을 안내합니다.

## 목차

- [MCP 서버란?](#mcp-서버란)
- [요구사항](#요구사항)
- [설치 방법](#설치-방법)
- [설정](#설정)
- [MCP 서버 실행](#mcp-서버-실행)
- [LLM과 통합](#llm과-통합)
- [사용 가능한 도구](#사용-가능한-도구)
- [문제 해결](#문제-해결)

---

## MCP 서버란?

MCP (Model Context Protocol) 서버는 LLM이 스마트 홈 컨트롤러의 API를 쉽게 호출할 수 있도록 래핑한 서버입니다. 이를 통해 LLM이 자연어로 기기 정보를 조회하거나 액추에이터를 제어할 수 있습니다.

### 주요 기능

- 기기 정보 조회
- 센서 데이터 읽기
- 액추에이터 제어
- 자연어 인터페이스 제공

---

## 요구사항

### 필수 요구사항

- **Python**: >= 3.13
- **uv**: Python 패키지 관리자
- **백엔드 서버**: 실행 중이어야 함 (기본: `http://localhost:8000`)

### MCP 클라이언트

MCP 서버를 사용하려면 MCP를 지원하는 클라이언트가 필요합니다:

- **Claude Desktop** (Anthropic)
- **Cursor** (MCP 지원)
- 기타 MCP 호환 클라이언트

---

## 설치 방법

### 1. 프로젝트 설치

백엔드 서버와 동일한 프로젝트를 사용하므로, 백엔드 서버 설치가 완료되어 있다면 추가 설치가 필요 없습니다.

의존성이 설치되어 있지 않다면:

```bash
cd proj_mvp
uv sync
```

### 2. MCP 서버 확인

MCP 서버 파일이 있는지 확인:

```bash
# Windows
dir shmcp\server.py

# Linux/macOS
ls shmcp/server.py
```

---

## 설정

### 환경 변수

MCP 서버는 백엔드 서버와 동일한 `.env` 파일을 사용합니다. 백엔드 서버가 정상적으로 실행되고 있다면 추가 설정이 필요 없습니다.

### MCP 클라이언트 설정

MCP 클라이언트에 서버를 등록해야 합니다.

#### Claude Desktop 설정

`claude_desktop_config.json` 파일을 편집하세요:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**설정 예시:**
```json
{
  "mcpServers": {
    "smart-home": {
      "command": "uv",
      "args": [
        "run",
        "python",
        "D:/Univ/arduino/term proj/proj_mvp/start_mcp.py"
      ],
      "env": {
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

**경로 주의사항:**
- Windows: 경로를 백슬래시(`\`)로 구분하거나 슬래시(`/`)를 사용하세요
- 절대 경로를 사용하는 것을 권장합니다

#### Cursor 설정

`.cursor/mcp.json` 파일을 편집하세요:

```json
{
  "mcpServers": {
    "smart-home": {
      "command": "uv",
      "args": [
        "run",
        "python",
        "start_mcp.py"
      ],
      "cwd": "D:/Univ/arduino/term proj/proj_mvp",
      "env": {
        "API_BASE_URL": "http://localhost:8000"
      }
    }
  }
}
```

---

## MCP 서버 실행

### 직접 실행 (테스트용)

```bash
uv run start_mcp.py
```

### MCP 클라이언트를 통한 실행

MCP 클라이언트가 자동으로 서버를 시작합니다. 별도로 실행할 필요가 없습니다.

---

## LLM과 통합

### 사용 예시

MCP 서버가 설정되면 LLM이 자연어로 기기를 제어할 수 있습니다:

#### 예시 1: 기기 정보 조회

**사용자:** "현재 등록된 기기 정보를 알려줘"

**LLM 응답:** MCP 도구 `get_device_info`를 호출하여 기기 정보를 조회합니다.

#### 예시 2: 센서 데이터 읽기

**사용자:** "온도 센서 값을 알려줘"

**LLM 응답:** MCP 도구 `list_sensors`를 호출하여 센서 목록을 조회하고, 온도 센서의 값을 반환합니다.

#### 예시 3: 액추에이터 제어

**사용자:** "서보 모터를 90도로 설정해줘"

**LLM 응답:** 
1. MCP 도구 `list_actuators`로 서보 모터의 ID를 찾습니다
2. MCP 도구 `set_actuator_state`로 상태를 변경합니다

---

## 사용 가능한 도구

MCP 서버는 다음 도구들을 제공합니다:

### 1. get_device_info

**설명:** 현재 등록된 기기 정보를 조회합니다.

**파라미터:** 없음

**반환값:**
```json
{
  "device_code": "HS-0000-0000-0001",
  "name": "거실 스마트 디바이스",
  "description": "거실에 설치된 IoT 기기",
  "created_at": "2025-11-12T10:00:00",
  "updated_at": "2025-11-12T10:00:00"
}
```

### 2. list_actuators

**설명:** 등록된 모든 액추에이터 목록을 조회합니다.

**파라미터:** 없음

**반환값:**
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

### 3. get_actuator

**설명:** 특정 액추에이터의 정보를 조회합니다.

**파라미터:**
- `actuator_id` (int): 액추에이터 ID

**반환값:**
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

### 4. list_sensors

**설명:** 등록된 모든 센서 목록을 조회합니다.

**파라미터:** 없음

**반환값:**
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

### 5. get_sensor

**설명:** 특정 센서의 정보를 조회합니다.

**파라미터:**
- `sensor_id` (int): 센서 ID

**반환값:**
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

### 6. set_actuator_state

**설명:** 액추에이터의 상태를 설정합니다.

**파라미터:**
- `actuator_id` (int): 액추에이터 ID
- `state` (int): 설정할 상태 값 (0 이상, level 미만)

**반환값:**
```json
{
  "ok": true
}
```

---

## 문제 해결

### MCP 서버가 시작되지 않음

1. **백엔드 서버 확인**
   ```bash
   curl http://localhost:8000/api/v1/devices/
   ```
   백엔드 서버가 실행 중이어야 합니다.

2. **경로 확인**
   - MCP 클라이언트 설정의 경로가 올바른지 확인
   - 절대 경로 사용 권장

3. **uv 설치 확인**
   ```bash
   uv --version
   ```

### 도구 호출 실패

1. **API 연결 확인**
   - `API_BASE_URL` 환경 변수가 올바른지 확인
   - 백엔드 서버가 실행 중인지 확인

2. **로그 확인**
   - MCP 클라이언트의 로그를 확인
   - 백엔드 서버 로그 확인 (`logs/app.log`)

### LLM이 도구를 인식하지 못함

1. **MCP 클라이언트 재시작**
   - Claude Desktop 또는 Cursor를 재시작

2. **설정 파일 확인**
   - JSON 구문 오류가 없는지 확인
   - 경로가 올바른지 확인

3. **도구 목록 확인**
   - MCP 클라이언트에서 도구 목록을 확인할 수 있는 기능 사용

---

## 고급 설정

### 커스텀 API URL

다른 서버를 사용하려면 환경 변수를 설정하세요:

```json
{
  "env": {
    "API_BASE_URL": "http://192.168.1.100:8000"
  }
}
```

### 타임아웃 설정

MCP 클라이언트 설정에서 타임아웃을 조정할 수 있습니다:

```json
{
  "mcpServers": {
    "smart-home": {
      "command": "uv",
      "args": ["run", "python", "start_mcp.py"],
      "timeout": 30
    }
  }
}
```

---

## 보안 고려사항

1. **로컬 네트워크 사용**: MCP 서버는 로컬 네트워크에서만 사용하는 것을 권장합니다
2. **인증**: 프로덕션 환경에서는 API 인증을 추가하는 것을 고려하세요
3. **권한 제한**: LLM이 특정 작업만 수행하도록 제한할 수 있습니다

---

## 추가 리소스

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [FastMCP 문서](https://github.com/jlowin/fastmcp)
- [백엔드 서버 문서](./BACKEND_SERVER_SETUP.md)
- [API 문서](./API_DOCUMENTATION.md)

