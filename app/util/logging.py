import os
import logging
from dotenv import load_dotenv

load_dotenv()

LOG_FILE = os.getenv("LOG_FILE_PATH")

if not LOG_FILE:
    raise ValueError("LOG_FILE_PATH 환경 변수가 설정되지 않았습니다.")

os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_FILE, mode='a')
    ]
)

logger = logging.getLogger(__name__)
logger.info("로깅 설정 완료")