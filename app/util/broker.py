import os
import paho.mqtt.client as mqtt
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER_URL=os.getenv("MQTT_BROKER_URL")
MQTT_BROKER_PORT=os.getenv("MQTT_BROKER_PORT")
MQTT_USERNAME=os.getenv("MQTT_USERNAME")
MQTT_PASSWORD=os.getenv("MQTT_PASSWORD")

if not MQTT_BROKER_URL or not MQTT_BROKER_PORT or not MQTT_USERNAME or not MQTT_PASSWORD:
    raise ValueError("MQTT 환경 변수가 설정되지 않았습니다.")

MQTT_BROKER_PORT = int(MQTT_BROKER_PORT)

mqttClient = mqtt.Client()
mqttClient.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
mqttClient.connect_async(MQTT_BROKER_URL, MQTT_BROKER_PORT)
