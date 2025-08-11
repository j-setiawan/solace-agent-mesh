"""
Test MCP Server for integration testing.
This server is built using fastmcp and is designed to be configured dynamically
at runtime by directives passed from the test case.
"""

import argparse
import base64
import json
import re
import threading
from typing import Any, Dict, List

from fastmcp import Context, FastMCP, ToolResult
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


def _to_camel_case(snake_str: str) -> str:
    """Converts a snake_case string to camelCase."""
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


def _convert_keys_to_camel_case(data: Any) -> Any:
    """Recursively converts all dictionary keys in a structure to camelCase."""
    if isinstance(data, dict):
        return {
            _to_camel_case(k): _convert_keys_to_camel_case(v) for k, v in data.items()
        }
    if isinstance(data, list):
        return [_convert_keys_to_camel_case(i) for i in data]
    return data


class TestMCPServer:
    """
    A generic, configurable MCP server for integration testing.
    It is configured dynamically via directives in the tool's input.
    """

    def __init__(self):
        self.mcp = FastMCP(
            name="TestMCPServer",
            instructions="A mock server for testing MCP tool integrations.",
        )

        # Register the generic tool under two different names for stdio and http
        self.mcp.tool(self.get_data, name="get_data_stdio")
        self.mcp.tool(self.get_data, name="get_data_http")
        self.mcp.custom_route("/health", methods=["GET"])(self.health_check)

    async def health_check(self, request: Request) -> Response:
        """Simple health check endpoint for HTTP mode."""
        return JSONResponse({"status": "ok"})

    async def get_data(
        self, response_to_return: Dict[str, Any], ctx: Context
    ) -> Dict[str, Any]:
        """
        A generic tool that returns the provided dictionary as its response.
        This allows tests to directly inject the desired MCP response.
        The tool's single argument 'response_to_return' is expected to be a
        dictionary containing the desired MCP response structure (e.g., a 'content' list).
        """
        # Transform keys to camelCase to mimic a real MCP server response.
        transformed_response = _convert_keys_to_camel_case(response_to_return)
        return transformed_response


def main():
    """Main entry point to run the server from the command line."""
    parser = argparse.ArgumentParser(description="Run the Test MCP Server.")
    parser.add_argument(
        "--transport",
        type=str,
        choices=["stdio", "http", "sse"],
        default="stdio",
        help="The transport protocol to use.",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8001,
        help="The port to use for the http transport.",
    )
    args = parser.parse_args()

    server_instance = TestMCPServer()
    if args.transport == "stdio":
        server_instance.mcp.run(transport=args.transport)
    else:
        server_instance.mcp.run(transport=args.transport, port=args.port)


if __name__ == "__main__":
    main()
