from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.model.sensor import IoTSensor
from app.schema.base import DefaultEdit, PageResponse
from app.model.enums import SensorType
import app.crud.dao.device as device_dao

def register_if_not_exists(db: Session, device_code: str, name: str, sensor_type: SensorType) -> IoTSensor:
    device_dao.create_if_not_exists(db, device_code)
    
    sensor = db.query(IoTSensor).filter(IoTSensor.device_code == device_code, IoTSensor.name == name).first()
    
    if not sensor:
        sensor = IoTSensor(device_code=device_code, name=name, sensor_type=sensor_type)
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
    
    elif sensor.sensor_type != sensor_type: # type: ignore
        setattr(sensor, "sensor_type", sensor_type)
        setattr(sensor, "state", None)
        db.commit()
        db.refresh(sensor)
    
    return sensor

def exists_by_device_code_and_id(db: Session, device_code: str, sensor_id: int) -> bool:
    return db.query(IoTSensor).filter(IoTSensor.device_code == device_code, IoTSensor.id == sensor_id).first() is not None

def get_pagination(db: Session, device_code: str, page: int, size: int) -> PageResponse[IoTSensor]:
    total_items = db.query(IoTSensor).filter(IoTSensor.device_code == device_code).count()
    total_pages = (total_items + size - 1) // size
    sensors = db.query(IoTSensor).filter(IoTSensor.device_code == device_code).offset((page - 1) * size).limit(size).all()
    return PageResponse(
        contents=sensors,
        page=page,
        size=size,
        total_pages=total_pages,
        total_items=total_items
    )
    
def get_sensor_by_id(db: Session, sensor_id: int) -> IoTSensor:
    sensor = db.query(IoTSensor).filter(IoTSensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="해당 센서를 찾을 수 없습니다.")
    return sensor

def update_detail(db: Session, sensor_id: int, request: DefaultEdit) -> IoTSensor:
    sensor = get_sensor_by_id(db, sensor_id)
    if request.name:
        setattr(sensor, "name_shown", request.name)
    if request.description:
        setattr(sensor, "description", request.description)
    db.commit()
    db.refresh(sensor)
    return sensor

def update_state(db: Session, sensor_id: int, state: str) -> IoTSensor:
    sensor = get_sensor_by_id(db, sensor_id)
    _validate_state(sensor, state)
    setattr(sensor, "state", state)
    db.commit()
    db.refresh(sensor)
    return sensor

def _validate_state(sensor: IoTSensor, state: str):
    try:
        if sensor.sensor_type == SensorType.BOOLEAN: # type: ignore
            bool(state)
        elif sensor.sensor_type == SensorType.INTEGER: # type: ignore
            int(state)
        elif sensor.sensor_type == SensorType.FLOAT: # type: ignore
            float(state)
    except ValueError:
        raise HTTPException(status_code=400, detail="유효하지 않은 상태입니다.")