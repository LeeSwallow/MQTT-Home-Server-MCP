from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.types import Enum as SQLEnum, Float, Boolean

from app.util.database import Base
from app.model.enums import SensorType

    
class IoTSensor(Base):
    __tablename__ = "iot_sensors"
    __table_args__ = (
        UniqueConstraint("device_code", "name", name="uix_device_name_unique"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_code = Column(String, ForeignKey("iot_devices.device_code"), nullable=False)
    sensor_type = Column(SQLEnum(SensorType), nullable=False)
    name = Column(String, nullable=False)
    name_shown = Column(String, nullable=True)
    description = Column(String, nullable=True)
    state = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)