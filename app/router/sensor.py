from fastapi import APIRouter
from app.util.database import SessionDep
from app.schema.base import PageResponse, DefaultEdit
from app.schema.rest import RestSensorResponse
import app.crud.rest as crud

router = APIRouter(
    prefix="/api/v1/devices/{device_code}/sensors",
    tags=["sensors"]
)

@router.get("/")
def get_sensors(device_code: str, session: SessionDep) -> list[RestSensorResponse]:
    return crud.get_sensors(session, device_code)

@router.get("/pagination")
def get_pagination_sensors(device_code: str, session: SessionDep, page: int = 1, size: int = 10) -> PageResponse[RestSensorResponse]:
    return crud.get_pagination_sensors(session, device_code, page, size)

@router.get("/{sensor_id}")
def get_sensor(device_code: str, sensor_id: int, session: SessionDep) -> RestSensorResponse:
    return crud.get_sensor(session, device_code, sensor_id)

@router.put("/{sensor_id}")
def update_sensor(device_code:str, sensor_id: int, request: DefaultEdit, session: SessionDep) -> RestSensorResponse:
    return crud.update_sensor(db=session, device_code=device_code, sensor_id=sensor_id, request=request)