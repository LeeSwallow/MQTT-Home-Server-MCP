from enum import Enum

class SensorType(str, Enum):
    BOOLEAN = "boolean"
    INTEGER = "integer"
    FLOAT = "float"
    STRING = "string"

class RegisterType(str, Enum):
    SENSOR = "sensor"
    ACTUATOR = "actuator"