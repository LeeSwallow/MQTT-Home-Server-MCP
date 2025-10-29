from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.model.device import IoTDevice
from app.schema.base import DefaultEdit, PageResponse

def create_if_not_exists(db: Session, device_code: str) -> IoTDevice:
    device = db.query(IoTDevice).filter(IoTDevice.device_code == device_code).first()
    if not device:
        device = IoTDevice(device_code=device_code)
        db.add(device)
        db.commit()
        db.refresh(device)
    return device

def get_device_by_code(db: Session, device_code: str) -> IoTDevice:
    device = db.query(IoTDevice).filter(IoTDevice.device_code == device_code).first()
    if not device:
        raise HTTPException(status_code=404, detail="해당 기기를 찾을 수 없습니다.")
    return device

def get_pagination(db: Session, page: int, size: int) -> PageResponse[IoTDevice]:
    total_items = db.query(IoTDevice).count()
    total_pages = (total_items + size - 1) // size
    devices = db.query(IoTDevice).offset((page - 1) * size).limit(size).all()
    
    return PageResponse(
        contents=devices,
        page=page,
        size=size,
        total_pages=total_pages,
        total_items=total_items
    )

def update_detail(db: Session, device_code: str, request: DefaultEdit) -> IoTDevice:
    device = db.query(IoTDevice).filter(IoTDevice.device_code == device_code).first()
    if not device:
        raise HTTPException(status_code=404, detail="해당 기기를 찾을 수 없습니다.")
    if request.name:
        setattr(device, "name", request.name)
    if request.description:
        setattr(device, "description", request.description)
    db.commit()
    db.refresh(device)
    return device