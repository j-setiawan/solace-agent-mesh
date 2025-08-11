# Test Plan: MCP Tool Response Handling

This document outlines the test plan for verifying the callback mechanism that processes responses from MCP (Multi-Capability-Peer) tools.

## 1. Core Threshold and Triggering Logic

This section tests the fundamental decision-making process of the callback, ensuring that artifact saving is triggered under the correct conditions.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 1.1 | Verifies that a small text response, whose size is below both the save and LLM return thresholds, is **not** saved as an artifact and is returned to the LLM in full. | Implemented | `test_mcp_trigger_below_thresholds.yaml` |
| 1.2 | Verifies that a text response larger than the `mcp_tool_response_save_threshold_bytes` but smaller than the LLM return limit **is** saved as an artifact, and the full response is still returned to the LLM. | | |
| 1.3 | Verifies that a text response larger than both the save and LLM return thresholds **is** saved as an artifact, and a **truncated** response is returned to the LLM. | | |
| 1.4 | Verifies that a response containing non-text content (e.g., a small image) is **always** saved as an artifact, even if its total size is below all configured size thresholds. | | |

---

## 2. Intelligent Artifact Processing by Content Type

This section ensures the `MCPContentProcessor` correctly handles each content type, creating the right kind of artifact with the correct content, MIME type, and metadata.

### 2.1 Text Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.1.1 | Tests that a simple string response is correctly identified and saved as a `.txt` file with a `text/plain` MIME type. | | |
| 2.1.2 | Tests that a valid JSON string is identified, saved as a `.json` file with an `application/json` MIME type, and its metadata includes a summary of the JSON structure. | | |
| 2.1.3 | Tests that a valid CSV string is identified, saved as a `.csv` file with a `text/csv` MIME type, and its metadata includes a summary (rows, columns, headers). | | |
| 2.1.4 | Tests that a valid YAML string is identified and saved as a `.yaml` file with an `application/x-yaml` MIME type. | | |
| 2.1.5 | Tests that a string containing Markdown syntax is identified and saved as a `.md` file with a `text/markdown` MIME type. | | |

### 2.2 Image Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.2.1 | Tests that a base64-encoded PNG image is correctly decoded and saved as a `.png` file with an `image/png` MIME type. | | |
| 2.2.2 | Tests that a base64-encoded JPEG image is correctly decoded and saved as a `.jpg` file with an `image/jpeg` MIME type. | | |

### 2.3 Audio Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.3.1 | Tests that a base64-encoded MP3 audio stream is correctly decoded and saved as an `.mp3` file with an `audio/mpeg` MIME type. | | |
| 2.3.2 | Tests that a base64-encoded WAV audio stream is correctly decoded and saved as a `.wav` file with an `audio/wav` MIME type. | | |

### 2.4 Resource Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.4.1 | Tests that a resource link with only a URI creates a placeholder artifact containing the URI text, with a filename derived from the URI. | | |
| 2.4.2 | Tests that a resource with embedded text content creates an artifact containing that text, using the filename from the URI and the specified MIME type. | | |
| 2.4.3 | Tests that a resource with base64-encoded binary content creates an artifact with the correctly decoded binary data. | | |

---

## 3. LLM Response Formatting and Truncation

This section focuses on verifying that the final dictionary returned to the LLM is correctly formatted, informative, and truncated when necessary.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 3.1 | Verifies that when an artifact is saved but not truncated, the LLM receives the full original response along with a message confirming the save. | | |
| 3.2 | Verifies that when a large response is saved, the LLM receives a **truncated** string preview and a message indicating both saving and truncation occurred. | | |
| 3.3 | Verifies the edge case where a response is too large for the LLM but smaller than the save threshold. The LLM should receive a truncated response and a message about truncation only. | | |
| 3.4 | Verifies that if artifact saving fails, the LLM receives the original (or truncated) response along with a clear message that the save operation failed. | | |

---

## 4. Error Handling and Fallback Behavior

This section tests the system's resilience and ensures it handles failures gracefully.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 4.1 | Verifies that if intelligent processing is disabled in the configuration, the system correctly falls back to saving the entire raw MCP response as a single `.json` artifact. | | |
| 4.2 | Verifies that if the `content` field in the MCP response is not a list, the system falls back to saving the raw response as a single `.json` artifact. | | |
| 4.3 | Verifies that if one item in a multi-item response is malformed (e.g., invalid base64), it is skipped, others are processed, and the final status is `partial_success`. | | |
| 4.4 | Verifies that if `fallback_to_raw_on_error` is `false`, a processing error results in no artifact being saved and an error message being returned to the LLM. | | |

---

## 5. Complex and Multi-Content Scenarios

This section tests more advanced use cases involving multiple content items and conversational turns.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 5.1 | Tests that a single MCP response containing multiple items (e.g., text and an image) results in the creation of two separate, correctly typed artifacts. | | |
| 5.2 | Tests a two-turn conversation where the first turn creates an artifact and the second turn successfully uses that artifact, confirming metadata is correctly injected and used by the LLM. | | |
| 5.3 | Tests that a single response containing multiple text items of different formats (e.g., one JSON and one CSV) results in two distinct, correctly typed text artifacts. | | |
