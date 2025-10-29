import json
from app.util.broker import mqttClient
import app.crud.dao.actuator as actuator_dao
from app.util.database import SessionLocal
from app.schema.mqtt import MqttUpdateActuatorStateRequest, MqttRegisterResponse
from app.util.logging import logging

logger = logging.getLogger(__name__)


def send_register_response(device_code: str, request: MqttRegisterResponse):
    mqttClient.publish(
        f"devices/{device_code}/response",
        json.dumps(request.model_dump()),
        qos=1
    )
    logger.info(f"등록 응답 이벤트 발행: {request}")

def send_actuator_action(device_code: str, actuator_id: int, state: int):
    db = SessionLocal()
    try:
        actuator = actuator_dao.get_actuator_by_id(db, actuator_id)
        request = MqttUpdateActuatorStateRequest(id=actuator_id, name=str(actuator.name), state=state)
        mqttClient.publish(
            f"devices/{device_code}/action",
            json.dumps(request.model_dump()),
            qos=1
        )
        logger.info(f"액추에이터 상태 업데이트 이벤트 발행: {request}")
    except Exception as e:
        logger.error(f"액추에이터 상태 업데이트 이벤트 발행 실패: {e}")
    finally:
        db.close()