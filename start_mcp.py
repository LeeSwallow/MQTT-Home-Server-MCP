from dotenv import load_dotenv
from shmcp.server import mcpServer

load_dotenv(dotenv_path=".env.mcp")

def main():
    mcpServer.run()

if __name__ == "__main__":
    main()