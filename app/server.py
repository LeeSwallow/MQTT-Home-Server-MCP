from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.router import device, actuator, sensor
from app.util.database import init_db
import paho.mqtt.client as mqtt
from app.util.logging import logging
from app.util.broker import mqttClient
from app.crud.event.listener import on_register, on_update

logger = logging.getLogger(__name__)

def mqtt_on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("MQTT 브로커 연결 성공")
        
        # 연결 성공 후 토픽 구독
        client.subscribe("devices/+/register")
        client.subscribe("devices/+/update")
        logger.info("MQTT 토픽 구독 완료")
    else:
        logger.error("MQTT 브로커 연결 실패: %s", rc)
        client.reconnect()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 서버 시작 시
    init_db()
    logger.info("데이터베이스 초기화 완료")
    
    mqttClient.on_connect = mqtt_on_connect
    
    # 메시지 콜백 등록 (loop_start 전에 등록)
    mqttClient.message_callback_add("devices/+/register", on_register)
    mqttClient.message_callback_add("devices/+/update", on_update)
    
    # MQTT 네트워크 루프 시작 (연결 시작)
    mqttClient.loop_start()
    yield
    # 서버 종료 시
    mqttClient.loop_stop()
    logger.info("MQTT 브로커 연결 종료")

    
app = FastAPI(
    title="IoT Home Server",
    description="IoT Home Server API",
    version="0.1.0",
    lifespan=lifespan
)

app.include_router(device.router)
app.include_router(actuator.router)
app.include_router(sensor.router)