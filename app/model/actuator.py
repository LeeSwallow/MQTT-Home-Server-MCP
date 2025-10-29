from datetime import datetime

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, UniqueConstraint
from app.util.database import Base


class IoTActuator(Base):
    __tablename__ = "iot_actuators"
    __table_args__ = (
        UniqueConstraint("device_code", "name", name="uix_device_name_unique"),
    )
    id = Column(Integer, primary_key=True, autoincrement=True)
    device_code = Column(String, ForeignKey("iot_devices.device_code"), nullable=False)
    name = Column(String, nullable=False)
    name_shown = Column(String, nullable=True)
    description = Column(String, nullable=True)
    level = Column(Integer, nullable=False)
    state = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
