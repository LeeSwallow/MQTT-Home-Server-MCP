from typing import List, Annotated
from pydantic import Field
from shmcp.server import mcpServer
from shmcp.schema import DeviceResponse, ActuatorResponse, SensorResponse
from shmcp.util.client import (
    get_device_info as api_get_device_info,
    api_get_actuators,
    api_get_sensors,
    api_update_actuator_state,
)

@mcpServer.tool(
    name="get_device_info",
    description="IoT 기기 정보를 조회합니다.",
)
async def get_device_info() -> dict:
    device = await api_get_device_info()
    return device.model_dump()

@mcpServer.tool(
    name="list_actuators",
    description="액추에이터 목록을 조회합니다.",
)
async def list_actuators() -> list[dict]:
    data = await api_get_actuators()
    return [ActuatorResponse.model_validate(item).model_dump() for item in data]

@mcpServer.tool(
    name="list_sensors",
    description="센서 목록을 조회합니다.",
)
async def list_sensors() -> list[dict]:
    data = await api_get_sensors()
    return [SensorResponse.model_validate(item).model_dump() for item in data]

@mcpServer.tool(
    name="set_actuator_state",
    description="액추에이터 상태를 설정합니다.",
)
async def set_actuator_state(
    actuator_id: Annotated[int, Field(description="액추에이터 ID")],
    state: Annotated[int, Field(description="0~level 사이의 값")],
) -> dict:
    await api_update_actuator_state(actuator_id=actuator_id, state=state)
    return {"ok": True}