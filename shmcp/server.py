import os
from fastmcp import FastMCP
from dotenv import load_dotenv
from shmcp.util.client import get_device_info

mcpServer = FastMCP(name="smart-home-mcp")

from shmcp.tool import *  # noqa: F401

