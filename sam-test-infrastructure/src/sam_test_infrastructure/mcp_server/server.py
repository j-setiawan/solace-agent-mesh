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

from fastmcp import Context, FastMCP
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
        self.responses_cache: Dict[str, List[Any]] = {}
        self.cache_lock = threading.Lock()

        # Register the generic tool under two different names for stdio and http
        self.mcp.tool(self.get_data, name="get_data_stdio")
        self.mcp.tool(self.get_data, name="get_data_http")
        self.mcp.custom_route("/health", methods=["GET"])(self.health_check)

    async def health_check(self, request: Request) -> Response:
        """Simple health check endpoint for HTTP mode."""
        return JSONResponse({"status": "ok"})

    async def get_data(self, task_description: str, ctx: Context) -> Dict[str, Any]:
        """
        A generic tool that returns a pre-configured response based on
        directives found in the task_description.
        """
        case_id_match = re.search(r"\[test_case_id=([\w.-]+)\]", task_description)
        if not case_id_match:
            return {
                "error": "Directive [test_case_id=...] not found in task_description."
            }
        case_id = case_id_match.group(1)

        with self.cache_lock:
            if case_id not in self.responses_cache:
                responses_match = re.search(
                    r"\[mcp_responses_json=([\w=+/]+)\]", task_description
                )
                if not responses_match:
                    return {
                        "error": "Directive [mcp_responses_json=...] not found for new test case."
                    }

                b64_str = responses_match.group(1)
                try:
                    json_str = base64.b64decode(b64_str).decode("utf-8")
                    self.responses_cache[case_id] = json.loads(json_str)
                except (
                    base64.binascii.Error,
                    json.JSONDecodeError,
                    UnicodeDecodeError,
                ) as e:
                    return {"error": f"Failed to decode mcp_responses_json: {e}"}

            if not self.responses_cache.get(case_id):
                return {
                    "error": f"No more responses available for test case '{case_id}'."
                }

            response_to_serve = self.responses_cache[case_id].pop(0)

        # Transform keys to camelCase before returning
        transformed_response = _convert_keys_to_camel_case(response_to_serve)
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
