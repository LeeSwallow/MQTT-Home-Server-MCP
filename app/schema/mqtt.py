from pydantic import BaseModel, Field, field_validator
from app.model.enums import SensorType, RegisterType

# esp32 -> server
class MqttRegisterSensorMessage(BaseModel):
    type: RegisterType = Field(description="등록 타입")
    name: str = Field(description="센서 이름")
    data_type: SensorType = Field(description="센서 타입")
    
# esp32 -> server
class MqttRegisterActuatorMessage(BaseModel):
    type: RegisterType = Field(description="등록 타입")
    name: str = Field(description="액추에이터 이름")
    level: int = Field(description="액추에이터 레벨", ge=0)

# server -> esp32
class MqttRegisterResponse(BaseModel):
    type: RegisterType = Field(description="등록 타입")
    name: str = Field(description="등록된 unit(센서 또는 액추에이터) 이름")

# esp32 -> server
class MqttUpdateSensorStateMessage(BaseModel):
    type: RegisterType = Field(description="등록 타입")
    name: str = Field(description="센서 이름")
    state: str = Field(description="센서 상태")

# esp32 -> server
class MqttUpdateActuatorStateMessage(BaseModel):
    type: RegisterType = Field(description="등록 타입")
    name: str = Field(description="액추에이터 이름")
    state: int = Field(description="액추에이터 상태", ge=0)


# server -> esp32
class MqttUpdateActuatorStateRequest(BaseModel):
    name: str = Field(description="액추에이터 이름")
    state: int = Field(description="액추에이터 상태", ge=0)