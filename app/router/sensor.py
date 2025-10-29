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
def get_sensors(device_code: str,session: SessionDep, page=1, size=10) -> PageResponse[RestSensorResponse]:
    return crud.get_pagination_sensors(session, device_code, page, size)

@router.put("/{sensor_id}")
def update_sensor(device_code:str, sensor_id: int, request: DefaultEdit, session: SessionDep) -> RestSensorResponse:
    return crud.update_sensor(db=session, device_code=device_code, sensor_id=sensor_id, request=request)