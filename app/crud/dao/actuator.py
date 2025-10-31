from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.model.actuator import IoTActuator
from app.schema.mqtt import MqttRegisterActuatorMessage, MqttUpdateActuatorStateMessage
from app.schema.base import DefaultEdit, PageResponse
import app.crud.dao.device as device_dao

def register_if_not_exists(db: Session, device_code: str, request: MqttRegisterActuatorMessage) -> IoTActuator:
    device_dao.create_if_not_exists(db, device_code)
    
    actuator = db.query(IoTActuator).filter(
        IoTActuator.device_code == device_code,
        IoTActuator.name == request.name
    ).first()
    
    if not actuator:
        actuator = IoTActuator(device_code=device_code, name=request.name, level=request.level)
        db.add(actuator)
        db.commit()
        db.refresh(actuator)
        
    elif actuator.level != request.level: # type: ignore
        setattr(actuator, "level", request.level)
        setattr(actuator, "state", 0)
        db.commit()
        db.refresh(actuator)
    
    return actuator


def get_by_device_code_and_name(db: Session, device_code: str, name: str) -> IoTActuator:
    actuator = db.query(IoTActuator).filter(
        IoTActuator.device_code == device_code,
        IoTActuator.name == name
    ).first()
    
    if not actuator:
        raise HTTPException(status_code=404, detail="해당 액추에이터를 찾을 수 없습니다.")
    return actuator


def get_all_by_device_code(db: Session, device_code: str) -> list[IoTActuator]:
    return db.query(IoTActuator).filter(IoTActuator.device_code == device_code).all()

def get_pagination(db: Session, device_code: str, page: int, size: int) -> PageResponse[IoTActuator]:
    total_items = db.query(IoTActuator).filter(IoTActuator.device_code == device_code).count()
    total_pages = (total_items + size - 1) // size
    
    actuators = db.query(IoTActuator).filter(
        IoTActuator.device_code == device_code
    ).offset((page - 1) * size).limit(size).all()
    
    return PageResponse(
        contents=actuators,
        page=page,
        size=size,
        total_pages=total_pages,
        total_items=total_items
    )


def get_actuator_by_id(db: Session, actuator_id: int) -> IoTActuator:
    actuator = db.query(IoTActuator).filter(IoTActuator.id == actuator_id).first()
    
    if not actuator:
        raise HTTPException(status_code=404, detail="해당 액추에이터를 찾을 수 없습니다.")
    return actuator


def exists_by_device_code_and_id(db: Session, device_code: str, actuator_id: int) -> bool:
    return db.query(IoTActuator).filter(IoTActuator.device_code == device_code, IoTActuator.id == actuator_id).first() is not None


def update_detail(db: Session, actuator_id: int, request: DefaultEdit) -> IoTActuator:
    actuator = get_actuator_by_id(db, actuator_id)
    if request.name:
        setattr(actuator, "name_shown", request.name)
    if request.description:
        setattr(actuator, "description", request.description)
    db.commit()
    db.refresh(actuator)
    return actuator


def update_state(db: Session, device_code: str, request: MqttUpdateActuatorStateMessage) -> IoTActuator:
    actuator = get_by_device_code_and_name(db, device_code, request.name)
    
    if request.state < 0 or request.state > actuator.level: # type: ignore
        raise HTTPException(status_code=400, detail="변경 가능한 범위에서 벗어났습니다.")
    
    setattr(actuator, "state", request.state)
    db.commit()
    db.refresh(actuator)
    return actuator
