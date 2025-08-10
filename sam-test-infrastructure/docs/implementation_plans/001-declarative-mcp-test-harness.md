# Implementation Plan: Declarative MCP Test Harness

- **Status**: Proposed
- **Author**: AI Developer
- **Date**: 2025-08-10
- **Related Documents**:
    - `proposals/001-mcp-test-harness.md`
    - `designs/001-declarative-mcp-test-harness.md`

---

## Implementation Checklist

### Part 1: `TestMCPServer` Application
- [x] **Module**: Create `mcp_server/server.py`.
- [x] **Class**: Implement `TestMCPServer` class using `fastmcp`.
- [x] **Tool**: Add a generic `@mcp.tool def get_data(...)`.
- [x] **Parsing**: Implement directive parsing for `[test_case_id=...]` and `[mcp_responses_json=...]`.
- [x] **State**: Implement a stateful response cache keyed by `test_case_id`.
- [x] **Transform**: Implement `snake_case` to `camelCase` key transformation for responses.
- [x] **Health Check**: Add a `GET /health` endpoint for `http` mode.
- [x] **Runnable**: Make `server.py` runnable from the CLI with transport/port arguments.

### Part 2: Pytest Fixture
- [x] **Module**: Create `mcp_server/fixture.py`.
- [x] **Fixture**: Define the `mcp_server_harness` pytest fixture.
- [x] **Process Management**: Use `subprocess.Popen` to start the server process.
- [x] **Readiness Check**: Implement a readiness check (polling `/health` for http mode).
- [x] **Yield Config**: Yield `connection_params` for dynamic agent configuration.
- [x] **Teardown**: Ensure reliable server process termination.

### Part 3: Test Runner Integration
- [ ] **YAML Parsing**: Modify `TestDeclarativeAgent` to read the `mcp_interactions` key from YAML.
- [ ] **Encoding**: Implement Base64 encoding for the `mcp_interactions` data.
- [ ] **Directive Injection**: Inject the encoded data and `test_case_id` into the gateway input prompt.
- [ ] **Dynamic Tool Config**: Inject the `connection_params` from the fixture into the agent's `mcp` tool configuration at runtime.

### Part 4: Integration Tests
- [ ] **Test Structure**: Create `test_mcp_processing.py` and a corresponding `test_data/mcp/` directory.
- [ ] **Test Case 1 (Text)**: Add a test for basic text processing.
- [ ] **Test Case 2 (Image)**: Add a test for base64 image processing.
- [ ] **Test Case 3 (Intelligent Off)**: Add a test for `enable_intelligent_processing: false`.
- [ ] **Test Case 4 (Fallback)**: Add a test for `fallback_to_raw_on_error: true` with malformed data.
- [ ] **Test Case 5 (HTTP)**: Add a parameterized test to run a case using the `http` transport.

### Part 5: Documentation
- [ ] **Usage Guide**: Update the primary testing `README.md` to explain how to use `mcp_interactions`.
- [ ] **Code Comments**: Add clear, concise comments to the new `TestMCPServer` and `mcp_server_harness` modules.

---

This document provides a step-by-step plan for implementing the Declarative MCP Test Harness feature.

### Part 1: Create the `TestMCPServer` Harness Application

This part focuses on building the standalone, runnable mock MCP server.

1.  **Create New Module**: Create a new directory and file for the server: `sam-test-infrastructure/src/sam_test_infrastructure/mcp_server/server.py`.

2.  **Basic Server Structure**: In `server.py`, use the `fastmcp` library to define a `TestMCPServer` class. This class will encapsulate a `fastmcp.FastMCP` instance and the stateful response cache.

3.  **Implement Generic Tool**: Add a single, generic tool to the server using the `@mcp.tool` decorator, named `get_data`. This tool will accept a `task_description: str` argument, which will contain the test directives.

4.  **Implement Directive Parsing**: Inside the `get_data` tool, implement logic to parse the `task_description` argument using regular expressions to find and extract the `[test_case_id=...]` and `[mcp_responses_json=...]` directives.

5.  **Implement Stateful Cache**: Add a dictionary instance variable to the `TestMCPServer` class (e.g., `self.responses_cache = {}`) to store the response lists. When the `get_data` tool is called for the first time for a given `test_case_id`, it will decode the Base64 JSON string and populate this cache.

6.  **Implement Key Transformation**: Create a helper function that recursively traverses a dictionary or list and converts all `snake_case` keys to `camelCase`. This function will be called on the response data before it is returned by the `get_data` tool.

7.  **Add Health Check Endpoint**: For the `http` transport mode, add a simple health check endpoint (e.g., `GET /health`) to the underlying FastAPI app that returns a `200 OK` response. This is essential for the test fixture to know when the server is ready.

8.  **Make Server Runnable**: Add a `if __name__ == "__main__":` block to `server.py` that allows the script to be executed from the command line. It should use `fastmcp.run()` and support command-line arguments for selecting the transport (`stdio` or `http`) and port.

### Part 2: Create the Pytest Fixture

This part focuses on creating the pytest fixture that will manage the `TestMCPServer` lifecycle.

9.  **Create Fixture Module**: Create a new file for the fixture: `sam-test-infrastructure/src/sam_test_infrastructure/mcp_server/fixture.py`.

10. **Define `mcp_server_harness` Fixture**: In `fixture.py`, define a new pytest fixture named `mcp_server_harness`. It should be session-scoped to optimize performance, but designed to be clean between tests.

11. **Implement Process Management**: The fixture will use Python's `subprocess.Popen` to start the `server.py` script as a separate process. It will be parameterized to allow tests to select either `stdio` or `http` mode.

12. **Implement Readiness Check**: For `http` mode, the fixture will enter a loop that polls the `/health` endpoint until it receives a `200 OK` response, ensuring the server is fully initialized before the test proceeds. For `stdio` mode, readiness can be assumed after a brief, fixed delay.

13. **Yield Connection Parameters**: The fixture will yield a dictionary containing the necessary `connection_params` for the agent's YAML configuration.
    - For `stdio`: `{'type': 'stdio', 'command': 'python', 'args': ['path/to/server.py']}`
    - For `http`: `{'type': 'sse', 'url': 'http://127.0.0.1:PORT'}`

14. **Implement Teardown Logic**: In a `yield` block, the fixture will ensure the `TestMCPServer` process is reliably terminated (`process.terminate()`, `process.wait()`) after the test completes, regardless of whether it passed or failed.

### Part 3: Integrate with the Declarative Test Runner

This part focuses on modifying the existing test infrastructure to support the new `mcp_interactions` configuration.

15. **Modify `TestDeclarativeAgent`**: Locate the primary test runner class (likely `TestDeclarativeAgent` or a similar class that orchestrates declarative tests) and prepare it for modifications.

16. **Read `mcp_interactions` Key**: Add logic to the test runner's YAML parsing step to look for and load the new `mcp_interactions` list.

17. **Implement Encoding**: Implement the logic to serialize the `mcp_interactions` list to a JSON string and then encode that string using Base64.

18. **Implement Directive Injection**: Modify the part of the runner that constructs the `gateway_input`. It will now inject the `[mcp_responses_json=...]` and `[test_case_id=...]` directives into the text part of the message.

19. **Dynamic Tool Configuration**: The test runner will be modified to dynamically construct the agent's `tools` configuration. It will take the `connection_params` dictionary yielded by the `mcp_server_harness` fixture and insert it into the `mcp` tool definition in the agent's configuration before the agent is initialized.

### Part 4: Write Integration Tests

This part focuses on creating the initial suite of tests to validate the new harness and the agent's MCP processing logic.

20. **Create Test File**: Create a new test file: `tests/integration/scenarios_declarative/test_mcp_processing.py`.

21. **Create Test Data Directory**: Create a new directory for the test data: `tests/integration/scenarios_declarative/test_data/mcp/`.

22. **Test 1: Basic Text Processing**: Create a YAML file in the new directory. Define an `mcp_interactions` block that returns a simple text content item. The test will assert that a single `.txt` artifact is created with the correct content.

23. **Test 2: Image Processing**: Create a YAML file that returns a base64-encoded image with an `image/png` MIME type. The test will assert that a `.png` artifact is created and that its metadata is correct.

24. **Test 3: Intelligent Processing Disabled**: Create a YAML file and set `enable_intelligent_processing: false` in the agent's config. The test will assert that only a single raw `.json` artifact is created, regardless of the content type sent by the server.

25. **Test 4: Error Fallback**: Create a YAML file where the server sends malformed data (e.g., invalid base64). Configure the agent with `fallback_to_raw_on_error: true`. The test will assert that a raw `.json` artifact is created.

26. **Test 5: HTTP Transport**: Copy one of the previous tests (e.g., image processing) and parameterize it to use the `http` transport mode from the `mcp_server_harness` fixture. This will validate the end-to-end flow over the network.

### Part 5: Documentation and Refinements

27. **Update Documentation**: Add a section to the primary testing documentation (`README.md` or equivalent) explaining how to use the new `mcp_interactions` block in declarative tests, including an example.

28. **Code Comments**: Ensure the new `TestMCPServer` and `mcp_server_harness` fixture code is well-commented, explaining the purpose of key components like the stateful cache and the key transformation logic.
