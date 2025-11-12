# 백엔드 서버 설치 및 실행 가이드

스마트 홈 컨트롤러 백엔드 서버의 설치 및 실행 방법을 안내합니다.

## 목차

- [요구사항](#요구사항)
- [설치 방법](#설치-방법)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 설정](#데이터베이스-설정)
- [MQTT 브로커 설정](#mqtt-브로커-설정)
- [서버 실행](#서버-실행)
- [문제 해결](#문제-해결)

---

## 요구사항

### 필수 요구사항

- **Python**: >= 3.13
- **uv**: Python 패키지 관리자
- **MQTT 브로커**: Mosquitto 또는 다른 MQTT 브로커

### 권장 사항

- **운영체제**: Windows 10+, Linux, macOS
- **메모리**: 최소 512MB
- **디스크 공간**: 최소 100MB

---

## 설치 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd proj_mvp
```

### 2. uv 설치

uv가 설치되어 있지 않다면 다음 명령으로 설치하세요:

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Linux/macOS:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 3. 의존성 설치

프로젝트 루트 디렉토리에서 다음 명령을 실행하세요:

```bash
uv sync
```

이 명령은 `pyproject.toml`에 정의된 모든 의존성을 설치합니다.

### 4. 설치 확인

설치가 완료되었는지 확인하려면:

```bash
uv run python -c "import fastapi; print('FastAPI 설치 완료')"
```

---

## 환경 변수 설정

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 데이터베이스 설정
DATABASE_URL=sqlite:///./database/iot_devices.db

# MQTT 브로커 설정
MQTT_BROKER_URL=localhost
MQTT_BROKER_PORT=1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
```

### 환경 변수 설명

#### DATABASE_URL
- **설명**: SQLite 데이터베이스 파일 경로
- **형식**: `sqlite:///./database/iot_devices.db`
- **기본값**: 없음 (필수)

#### MQTT_BROKER_URL
- **설명**: MQTT 브로커 호스트 주소
- **예시**: `localhost`, `192.168.1.100`, `mqtt.example.com`
- **기본값**: 없음 (필수)

#### MQTT_BROKER_PORT
- **설명**: MQTT 브로커 포트 번호
- **예시**: `1883` (일반), `8883` (TLS)
- **기본값**: 없음 (필수)

#### MQTT_USERNAME
- **설명**: MQTT 브로커 사용자 이름
- **예시**: `admin`, `user`
- **기본값**: 없음 (필수)

#### MQTT_PASSWORD
- **설명**: MQTT 브로커 비밀번호
- **예시**: `password123`
- **기본값**: 없음 (필수)

---

## 데이터베이스 설정

### 자동 초기화

서버를 처음 실행하면 데이터베이스가 자동으로 초기화됩니다.

데이터베이스 파일은 다음 경로에 생성됩니다:
```
database/iot_devices.db
```

### 수동 초기화

데이터베이스를 수동으로 초기화하려면:

```bash
uv run python -c "from app.util.database import init_db; init_db()"
```

### 데이터베이스 백업

데이터베이스를 백업하려면:

```bash
# Windows
copy database\iot_devices.db database\iot_devices.db.backup

# Linux/macOS
cp database/iot_devices.db database/iot_devices.db.backup
```

---

## MQTT 브로커 설정

### Mosquitto 설치 (로컬 테스트용)

**Windows:**
1. [Mosquitto 다운로드](https://mosquitto.org/download/)
2. 설치 후 서비스로 실행

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**macOS:**
```bash
brew install mosquitto
brew services start mosquitto
```

### MQTT 브로커 인증 설정

인증이 필요한 경우 Mosquitto 설정 파일을 수정하세요:

**Linux/macOS:** `/etc/mosquitto/mosquitto.conf`
**Windows:** Mosquitto 설치 디렉토리의 `mosquitto.conf`

```conf
allow_anonymous false
password_file /etc/mosquitto/passwd
```

비밀번호 파일 생성:
```bash
mosquitto_passwd -c /etc/mosquitto/passwd your_username
```

### MQTT 브로커 연결 테스트

MQTT 브로커가 정상적으로 작동하는지 테스트:

```bash
# 구독
mosquitto_sub -h localhost -p 1883 -u your_username -P your_password -t "test/topic"

# 발행 (다른 터미널에서)
mosquitto_pub -h localhost -p 1883 -u your_username -P your_password -t "test/topic" -m "Hello MQTT"
```

---

## 서버 실행

### 기본 실행

```bash
uv run start_server.py
```

서버는 기본적으로 `http://0.0.0.0:8000`에서 실행됩니다.

### 옵션 사용

#### 자동 리로드 모드 (개발용)

코드 변경 시 자동으로 서버를 재시작합니다:

```bash
uv run start_server.py --reload
```

#### 포트 변경

```bash
uv run start_server.py --port 3000
```

#### 호스트 변경

```bash
uv run start_server.py --host 127.0.0.1
```

#### 여러 옵션 조합

```bash
uv run start_server.py --reload --port 8080 --host 127.0.0.1
```

#### 로그 레벨 변경

```bash
uv run start_server.py --log-level debug
```

사용 가능한 로그 레벨: `critical`, `error`, `warning`, `info`, `debug`, `trace`

### 도움말 보기

```bash
uv run start_server.py --help
```

---

## 서버 상태 확인

### API 문서 확인

서버가 실행되면 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 헬스 체크

```bash
curl http://localhost:8000/docs
```

### 웹 UI 확인

브라우저에서 다음 URL을 열어보세요:

```
http://localhost:8000/
```

---

## 문제 해결

### 포트가 이미 사용 중인 경우

다른 포트를 사용하세요:

```bash
uv run start_server.py --port 8001
```

### MQTT 브로커 연결 실패

1. MQTT 브로커가 실행 중인지 확인
2. `.env` 파일의 MQTT 설정이 올바른지 확인
3. 방화벽 설정 확인
4. 네트워크 연결 확인

### 데이터베이스 오류

1. `database/` 디렉토리가 존재하는지 확인
2. 쓰기 권한이 있는지 확인
3. 데이터베이스 파일이 손상된 경우 백업에서 복원

### 의존성 오류

의존성을 다시 설치하세요:

```bash
uv sync --reinstall
```

### 로그 확인

로그 파일은 `logs/app.log`에 저장됩니다.

```bash
# Windows
type logs\app.log

# Linux/macOS
tail -f logs/app.log
```

---

## 프로덕션 배포

### 프로덕션 모드 실행

```bash
uv run start_server.py --workers 4
```

**주의:** `--reload` 옵션은 프로덕션에서 사용하지 마세요.

### 시스템 서비스로 등록 (Linux)

`/etc/systemd/system/smart-home.service` 파일 생성:

```ini
[Unit]
Description=Smart Home Controller Server
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/proj_mvp
Environment="PATH=/path/to/uv/bin"
ExecStart=/path/to/uv run start_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

서비스 시작:

```bash
sudo systemctl daemon-reload
sudo systemctl enable smart-home
sudo systemctl start smart-home
```

---

## 성능 최적화

### 데이터베이스 최적화

SQLite는 기본적으로 충분히 빠르지만, 많은 데이터가 있는 경우:

1. 인덱스 추가
2. 정기적인 VACUUM 실행
3. WAL 모드 활성화

### 메모리 사용량 최적화

- 불필요한 로그 레벨 낮추기
- 워커 프로세스 수 조정

---

## 보안 고려사항

1. **환경 변수 보호**: `.env` 파일을 Git에 커밋하지 마세요
2. **MQTT 인증**: 프로덕션에서는 반드시 인증을 사용하세요
3. **HTTPS 사용**: 프로덕션에서는 HTTPS를 사용하세요
4. **방화벽 설정**: 필요한 포트만 열어두세요

---

## 추가 리소스

- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [SQLAlchemy 문서](https://docs.sqlalchemy.org/)
- [Paho MQTT 문서](https://www.eclipse.org/paho/)
- [uv 문서](https://github.com/astral-sh/uv)

