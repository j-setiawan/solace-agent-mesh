# Feature Proposal: Declarative MCP Test Harness

- **Status**: Proposed
- **Author**: AI Developer
- **Date**: 2025-08-10

## 1. Summary

This document proposes the creation of a new test harness, the `TestMCPServer`, within the `sam-test-infrastructure`. This harness will enable robust, declarative integration testing of an agent's ability to process responses from external tools via the Model Context Protocol (MCP). It will mirror the successful pattern established by the `TestLLMServer`, allowing developers to define MCP server behavior directly within test-case YAML files.

## 2. Goals

- To enable comprehensive and reliable integration testing of the agent's MCP response parsing and artifact creation logic (`MCPContentProcessor`).
- To provide a consistent, intuitive, and low-friction testing experience for developers, reusing existing declarative testing patterns.
- To ensure the agent's MCP handling is tested against both `stdio` and `http` (Streamable HTTP/SSE) transport protocols.
- To facilitate the simulation of a wide variety of MCP response types, including valid, complex, and malformed data, to ensure robustness.

## 3. Requirements

- A new test harness, `TestMCPServer`, must be created. It will act as a configurable mock MCP server.
- The `TestMCPServer` must be configurable via a new `mcp_interactions` section within the existing declarative YAML test files.
- The test harness must be capable of running as a standalone process and communicating over both `stdio` and `http` (Streamable HTTP/SSE) transports.
- The harness must be able to simulate various MCP content types, including text (with different formats like JSON, CSV), binary (image, audio), resource references, and mixed-content responses.
- The syntax used within the `mcp_interactions` YAML block must be consistent with project standards (i.e., use `snake_case` for all keys).

## 4. Key Decisions

- **Framework Choice**: The `TestMCPServer` will be built using the `fastmcp` library. This choice is driven by its high-level, decorator-based API which simplifies server creation, and its built-in support for switching between `stdio` and `http` transports.

- **Configuration Method**: Test scenarios will be defined declaratively within the test-case YAML files. This follows the pattern of the existing `TestLLMServer` and centralizes test logic, making it easy to read and maintain.

- **Configuration Delivery Mechanism**: The test configuration (from the `mcp_interactions` block) will be serialized, Base64-encoded, and embedded as a directive within the agent's input prompt (e.g., `[mcp_responses_json=...]`). The `TestMCPServer` will be responsible for parsing this directive to configure itself for the specific test case. This avoids complex side-channel communication between the test runner and the server process.

- **Protocol vs. Developer Experience**: To ensure a consistent developer experience, the test YAML will use `snake_case` keys (e.g., `mime_type`). The `TestMCPServer` harness will be responsible for transforming these keys into the protocol-correct `camelCase` (e.g., `mimeType`) before sending the response to the agent. This encapsulates protocol-specific details within the test harness, preventing developer error.

- **Client for Testing**: The tests will validate the agent's end-to-end integration. Therefore, the client connecting to the `TestMCPServer` will be the agent's own `MCPToolset` from the Google ADK. We will not use a separate `fastmcp.Client` for these integration tests.
