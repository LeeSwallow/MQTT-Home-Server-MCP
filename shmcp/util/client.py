import os
import httpx
from dotenv import load_dotenv
from shmcp.schema import DeviceResponse

load_dotenv(dotenv_path=".env.mcp")

DEVICE_ID = os.getenv("DEVICE_ID")
SERVER_URL = os.getenv("SERVER_URL")
if not DEVICE_ID:
    raise ValueError("DEVICE_ID 환경 변수가 설정되지 않았습니다.")
if not SERVER_URL:
    raise ValueError("SERVER_URL 환경 변수가 설정되지 않았습니다.")

_client = httpx.AsyncClient(base_url=SERVER_URL, timeout=10.0)

async def get_device_info(device_code: str | None = None) -> DeviceResponse:
    code = device_code or DEVICE_ID
    response = await _client.get(f"/api/v1/devices/{code}")
    response.raise_for_status()
    return DeviceResponse.model_validate(response.json())

async def get_request(path: str) -> dict:
    response = await _client.get(path)
    response.raise_for_status()
    return response.json()

async def post_request(path: str, data: dict) -> dict:
    response = await _client.post(path, json=data)
    response.raise_for_status()
    return response.json()

async def put_request(path: str, data: dict) -> dict:
    response = await _client.put(path, json=data)
    response.raise_for_status()
    return response.json()

# Convenience API wrappers
async def api_get_actuators(device_code: str | None = None) -> list[dict]:
    code = device_code or DEVICE_ID
    return await get_request(f"/api/v1/devices/{code}/actuators")

async def api_get_sensors(device_code: str | None = None) -> list[dict]:
    code = device_code or DEVICE_ID
    return await get_request(f"/api/v1/devices/{code}/sensors")

async def api_update_actuator_state(actuator_id: int, state: int, device_code: str | None = None) -> dict:
    code = device_code or DEVICE_ID
    payload = {"state": state}
    return await post_request(f"/api/v1/devices/{code}/actuators/{actuator_id}/action", payload)

