from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer

from app.util.database import Base


class IoTDevice(Base):
    __tablename__ = "iot_devices"
    device_code = Column(String, primary_key=True, nullable=False, unique=True)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.now)
    updated_at = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
