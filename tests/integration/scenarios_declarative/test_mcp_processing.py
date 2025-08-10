"""
Test suite for verifying the agent's intelligent processing of MCP tool responses.
"""

import pytest
from .test_declarative_agent import TestDeclarativeAgent


@pytest.mark.mcp_processing
class TestMCPProcessing(TestDeclarativeAgent):
    """
    Runs declarative tests for MCP response handling.
    The `mcp_server_harness` fixture is parameterized to run each test twice,
    once with 'stdio' and once with 'http' transport, ensuring both connection
    methods are validated.
    """

    def test_mcp_text_processing(self, mcp_server_harness):
        """Tests that a simple text response from an MCP tool is saved as a .txt artifact."""
        self.run_test(
            "mcp/test_mcp_text_processing.yaml",
            dynamic_tool_configs={"mcp": mcp_server_harness},
        )

    def test_mcp_image_processing(self, mcp_server_harness):
        """Tests that a base64 image response is correctly saved as a .png artifact."""
        self.run_test(
            "mcp/test_mcp_image_processing.yaml",
            dynamic_tool_configs={"mcp": mcp_server_harness},
        )

    def test_mcp_intelligent_processing_disabled(self, mcp_server_harness):
        """Tests that when intelligent processing is off, the raw response is saved as JSON."""
        self.run_test(
            "mcp/test_mcp_intelligent_disabled.yaml",
            dynamic_tool_configs={"mcp": mcp_server_harness},
        )

    def test_mcp_error_fallback(self, mcp_server_harness):
        """Tests that with fallback enabled, a malformed response is saved as raw JSON."""
        self.run_test(
            "mcp/test_mcp_error_fallback.yaml",
            dynamic_tool_configs={"mcp": mcp_server_harness},
        )
