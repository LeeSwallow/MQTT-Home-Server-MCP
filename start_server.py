from app.server import app
import uvicorn
import argparse
from app.util.logging import logging

logger = logging.getLogger(__name__)

def parse_args():
    """명령줄 인자를 파싱합니다."""
    parser = argparse.ArgumentParser(
        description="스마트 홈 컨트롤러 서버를 실행합니다.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예제:
  python start_server.py                    # 기본 설정으로 실행
  python start_server.py --reload           # 자동 리로드 활성화
  python start_server.py --host 127.0.0.1 --port 3000
  python start_server.py --reload --port 8080
        """
    )
    
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="서버가 바인딩할 호스트 주소 (기본값: 0.0.0.0)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="서버가 사용할 포트 번호 (기본값: 8000)"
    )
    
    parser.add_argument(
        "--reload",
        action="store_true",
        help="코드 변경 시 자동으로 서버를 재시작합니다"
    )
    
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="작업자 프로세스 수 (기본값: 1)"
    )
    
    parser.add_argument(
        "--log-level",
        type=str,
        default="info",
        choices=["critical", "error", "warning", "info", "debug", "trace"],
        help="로그 레벨 (기본값: info)"
    )
    
    return parser.parse_args()

if __name__ == "__main__":
    try:
        args = parse_args()
        
        logger.info(f"서버 시작: host={args.host}, port={args.port}, reload={args.reload}")
        
        # reload 모드에서는 import string을 사용해야 함
        if args.reload:
            uvicorn.run(
                "app.server:app",  # import string 형식
                host=args.host,
                port=args.port,
                reload=args.reload,
                log_level=args.log_level
            )
        else:
            uvicorn.run(
                app,  # 직접 앱 객체 전달
                host=args.host,
                port=args.port,
                reload=args.reload,
                workers=args.workers,
                log_level=args.log_level
            )
    except KeyboardInterrupt:
        logger.info("서버 종료 중...")
    except Exception as e:
        logger.error(f"서버 실행 중 오류 발생: {e}", exc_info=True)
        exit(1)