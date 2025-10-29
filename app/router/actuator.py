from fastapi import APIRouter
from app.util.database import SessionDep
from app.schema.base import PageResponse, DefaultEdit
import app.crud.rest as crud
from app.schema.rest import RestActuatorResponse
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/v1/devices/{device_code}/actuators",
    tags=["actuator"]
)

@router.get("/")
def get_actuator_page(device_code: str, session: SessionDep, page=1, size=10) -> PageResponse[RestActuatorResponse]:
    return crud.get_pagination_actuators(session, device_code, page, size)

@router.put("/{actuator_id}")
def update_actuator(device_code:str, actuator_id: int, request: DefaultEdit, session: SessionDep) -> RestActuatorResponse:
    return crud.update_actuator(db=session, actuator_id=actuator_id, device_code=device_code, request=request)
