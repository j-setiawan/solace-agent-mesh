"""
Pytest fixture for managing the TestMCPServer lifecycle during integration tests.
"""

import pytest
import subprocess
import sys
import time
import socket
import httpx
from typing import Dict, Any, Generator

# Get the absolute path to the server.py script to ensure it can be run from anywhere
import sam_test_infrastructure.mcp_server.server as server_module

SERVER_PATH = server_module.__file__


def find_free_port() -> int:
    """Finds and returns an available TCP port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def mcp_server_harness() -> Generator[Dict[str, Any], None, None]:
    """
    Pytest fixture to manage the lifecycle of the TestMCPServer.

    It starts the server in a separate process for HTTP and provides connection details
    for both 'stdio' and 'http' transports.

    Yields:
        A dictionary containing the `connection_params` for both stdio and http.
    """
    process = None
    port = 0

    try:
        # Prepare stdio config
        stdio_params = {
            "type": "stdio",
            "command": sys.executable,
            "args": [SERVER_PATH, "--transport", "stdio"],
        }
        print("\nConfigured TestMCPServer for stdio mode (ADK will start process).")

        # Start HTTP server
        port = find_free_port()
        url = f"http://127.0.0.1:{port}"
        health_url = f"{url}/health"
        command = [
            sys.executable,
            SERVER_PATH,
            "--transport",
            "http",
            "--port",
            str(port),
        ]
        process = subprocess.Popen(
            command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        print(f"\nStarted TestMCPServer in http mode (PID: {process.pid})...")

        # Readiness check by polling the /health endpoint
        max_wait_seconds = 10
        start_time = time.time()
        is_ready = False
        while time.time() - start_time < max_wait_seconds:
            try:
                response = httpx.get(health_url, timeout=1)
                if response.status_code == 200:
                    print(f"TestMCPServer is ready on {url}.")
                    is_ready = True
                    break
            except httpx.RequestError:
                time.sleep(0.1)

        if not is_ready:
            pytest.fail(
                f"Test MCP Server (http) failed to start on port {port} within {max_wait_seconds} seconds."
            )

        http_params = {
            "type": "sse",  # 'sse' is the type used by the ADK's MCPToolset for http
            "url": url,
        }

        connection_params = {"stdio": stdio_params, "http": http_params}

        yield connection_params

    finally:
        if process:
            print(f"\nTerminating TestMCPServer (PID: {process.pid})...")
            process.terminate()
            try:
                stdout, stderr = process.communicate(timeout=5)
                if stdout:
                    print(
                        f"\n--- TestMCPServer STDOUT ---\n{stdout.decode('utf-8', 'ignore')}"
                    )
                if stderr:
                    print(
                        f"\n--- TestMCPServer STDERR ---\n{stderr.decode('utf-8', 'ignore')}"
                    )
            except subprocess.TimeoutExpired:
                process.kill()
                print(
                    "\nTestMCPServer process did not terminate gracefully, had to be killed."
                )
            print("TestMCPServer terminated.")

        print(
            "\nNo external TestMCPServer process to terminate for stdio mode (ADK manages process)."
        )
