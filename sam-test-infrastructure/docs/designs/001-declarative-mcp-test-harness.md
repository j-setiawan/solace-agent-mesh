# Detailed Design: Declarative MCP Test Harness

- **Status**: Proposed
- **Author**: AI Developer
- **Date**: 2025-08-10
- **Related Proposal**: `proposals/001-mcp-test-harness.md`

## 1. Overview

This document outlines the detailed design for the `TestMCPServer`, a new test harness for integration testing of the agent's Model Context Protocol (MCP) response handling. This system will follow the declarative testing pattern established by the `TestLLMServer`, enabling developers to define mock MCP server behavior within YAML test files.

## 2. Component Design

This feature introduces two primary components to the `sam-test-infrastructure`: the `TestMCPServer` application and a corresponding pytest fixture to manage it.

### 2.1. `TestMCPServer` Application

The `TestMCPServer` will be a standalone Python application built using the `fastmcp` library.

*   **Responsibilities**:
    *   Act as a generic, runnable MCP server that can be started as a separate process by the test suite.
    *   Support both `stdio` and `http` (Streamable HTTP/SSE) transports, selectable at runtime.
    *   Expose a single, generic tool (e.g., `@mcp.tool def get_data(...)`). This tool will be the universal entry point for all test interactions.
    *   Receive its response configuration dynamically for each test case.
    *   Serve pre-configured responses in a stateful, turn-by-turn manner, mimicking a real MCP interaction.
    *   Perform the transformation of configuration keys from developer-friendly `snake_case` to protocol-correct `camelCase` before sending the response.

*   **Internal Logic**:
    1.  When the `get_data` tool is called, it will expect a `task_description` argument containing special directives.
    2.  It will parse `[test_case_id=...]` and `[mcp_responses_json=...]` directives from the argument.
    3.  The `mcp_responses_json` value will be a Base64-encoded JSON string containing the list of responses defined in the test YAML.
    4.  The server will decode and parse this configuration, caching the list of responses against the `test_case_id`.
    5.  On each call for a given `test_case_id`, it will pop the next response from its cache, perform the key-casing transformation, and return it.

### 2.2. `mcp_server_harness` Pytest Fixture

A new pytest fixture will be created to manage the lifecycle of the `TestMCPServer` process.

*   **Responsibilities**:
    *   Start the `TestMCPServer` in a separate process using `subprocess.Popen` before a test runs. It will be able to start it in either `stdio` or `http` mode.
    *   Ensure the server process is ready to accept connections before yielding control to the test. For `http` mode, this involves polling a health check endpoint. For `stdio`, readiness is assumed once the process starts.
    *   Provide the test function with the necessary connection parameters to configure the agent's `MCPToolset`. This will be a dictionary containing either the `command` and `args` for `stdio` mode, or the `url` for `http` mode.
    *   Reliably terminate the `TestMCPServer` process during test teardown, even if the test fails.

## 3. Configuration and Data Flow

The entire system is designed around a clean, declarative data flow that minimizes complexity in the test cases themselves.

### 3.1. YAML Test Configuration

A new top-level key, `mcp_interactions`, will be added to the declarative test YAML schema.

*   **Structure**: It will be a list of dictionaries, where each dictionary represents a single response from the mock server.
*   **Syntax**: All keys within this block (e.g., `mime_type`, `tool_args`) will use `snake_case` for consistency with the rest of the project's configuration.

*Example `mcp_interactions` block:*
```yaml
mcp_interactions:
  - content:
      - type: "image"
        data: "iVBORw0KGgo..."
        mime_type: "image/png"
```

### 3.2. Data Flow

1.  **Test Runner (`TestDeclarativeAgent` class)**: The test runner will read the `mcp_interactions` block from the YAML file.
2.  **Encoding**: It will serialize this block to a JSON string and then encode it using Base64.
3.  **Injection**: The runner will inject the Base64 string into the `gateway_input` text using a directive, e.g., `[mcp_responses_json=BASE64_STRING]`. It will also inject the `[test_case_id=...]`.
4.  **Agent Invocation**: The `TestGatewayComponent` sends this text to the agent.
5.  **Tool Call**: The agent's LLM (mocked by `TestLLMServer`) will decide to call the MCP tool, passing the text containing the directives as an argument.
6.  **ADK `MCPToolset`**: The agent's `MCPToolset` connects to the `TestMCPServer` process using the connection details provided by the `mcp_server_harness` fixture.
7.  **`TestMCPServer` Configuration**: The `TestMCPServer` receives the tool call, parses the directives from the arguments, and configures its response queue for the test.
8.  **Response**: The `TestMCPServer` sends the configured (and key-transformed) response back to the agent.
9.  **Agent Processing**: The agent's `MCPContentProcessor` receives and processes the response.
10. **Assertion**: The test asserts that the correct artifacts were created in the `TestInMemoryArtifactService`.

## 4. Integration with Existing Framework

This feature is designed to integrate seamlessly with the existing test infrastructure.

*   **Agent Configuration**: The test YAML will configure an `mcp` tool in the agent's `tools` list. The `connection_params` for this tool will be dynamically populated by the `mcp_server_harness` fixture at runtime.

*Example Agent Tool Config in YAML:*
```yaml
agent_config:
  tools:
    - tool_type: mcp
      # The 'connection_params' will be injected by the test fixture.
      # The test will decide whether to run in stdio or http mode.
      connection_params:
        type: stdio # or 'sse'
        # ... other params like command/url filled in by fixture
```

*   **Test Assertions**: Tests will continue to use existing fixtures like `test_in_memory_artifact_service` to inspect the outcome of the agent's processing, checking filenames, MIME types, and metadata of created artifacts.

## 5. Testing Strategy

The new harness will enable a comprehensive suite of tests covering:

*   **Intelligent Processing**: Verifying that different content types (`text`, `image`, `audio`, `resource`) with various formats (`json`, `csv`, `png`) are correctly parsed and saved as typed artifacts when intelligent processing is enabled.
*   **Configuration Toggles**: Testing the behavior of all flags in the `mcp_intelligent_processing` configuration block, such as `enable_intelligent_processing: false` (which should always result in a single raw `.json` artifact) and `fallback_to_raw_on_error`.
*   **Error Handling**: Simulating malformed MCP responses (e.g., invalid base64, malformed JSON) to ensure the agent's parser handles them gracefully and respects the fallback configuration.
*   **Transport Protocols**: Running a key subset of tests over both `stdio` and `http` transports to validate that both connection methods work correctly with the ADK.
