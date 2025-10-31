from fastapi import APIRouter
from app.util.database import SessionDep
from app.schema.base import PageResponse, DefaultEdit
from app.schema.rest import RestDeviceResponse
import app.crud.rest as crud

router = APIRouter(
    prefix="/api/v1/devices",
    tags=["devices"]
)

@router.get("/")
def get_devices(session: SessionDep) -> list[RestDeviceResponse]:
    return crud.get_devices(session)

@router.get("/pagination")
def get_pagination_devices(session: SessionDep, page: int = 0, size: int = 10) -> PageResponse[RestDeviceResponse]:
    return crud.get_pagination_devices(session, page, size)

@router.get("/{device_code}")
def get_device_by_code(device_code: str, session: SessionDep) -> RestDeviceResponse:
    return crud.get_device_by_code(session, device_code)

@router.put("/{device_code}")
def update_device(device_code:str, request: DefaultEdit, session: SessionDep) -> RestDeviceResponse:
    return crud.update_device(db=session, device_code=device_code, request=request)