from shmcp.server import mcpServer

def main():
    # 환경 변수는 mcp.json에서 전달됨
    mcpServer.run()

if __name__ == "__main__":
    main()