# Test Plan: MCP Tool Response Handling

This document outlines the test plan for verifying the callback mechanism that processes responses from MCP (Multi-Capability-Peer) tools.

## 1. Core Threshold and Triggering Logic

This section tests the fundamental decision-making process of the callback, ensuring that artifact saving is triggered under the correct conditions.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 1.1 | Verifies that a small text response, whose size is below both the save and LLM return thresholds, is **not** saved as an artifact and is returned to the LLM in full. | Implemented | `test_mcp_trigger_below_thresholds.yaml` |
| 1.2 | Verifies that a text response larger than the `mcp_tool_response_save_threshold_bytes` but smaller than the LLM return limit **is** saved as an artifact, and the full response is still returned to the LLM. | Implemented | `test_mcp_trigger_above_save_threshold.yaml` |
| 1.3 | Verifies that a text response larger than both the save and LLM return thresholds **is** saved as an artifact, and a **truncated** response is returned to the LLM. | Implemented | `test_mcp_trigger_above_all_thresholds.yaml` |
| 1.4 | Verifies that a response containing non-text content (e.g., a small image) is **always** saved as an artifact, even if its total size is below all configured size thresholds. | Implemented | `test_mcp_trigger_non_text_content.yaml` |

---

## 2. Intelligent Artifact Processing by Content Type

This section ensures the `MCPContentProcessor` correctly handles each content type, creating the right kind of artifact with the correct content, MIME type, and metadata.

### 2.1 Text Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.1.1 | Tests that a simple string response is correctly identified and saved as a `.txt` file with a `text/plain` MIME type. | Implemented | `test_mcp_text_processing_plain.yaml` |
| 2.1.2 | Tests that a valid JSON string is identified, saved as a `.json` file with an `application/json` MIME type, and its metadata includes a summary of the JSON structure. | Implemented | `test_mcp_text_processing_json.yaml` |
| 2.1.3 | Tests that a valid CSV string is identified, saved as a `.csv` file with a `text/csv` MIME type, and its metadata includes a summary (rows, columns, headers). | Implemented | `test_mcp_text_processing_csv.yaml` |
| 2.1.4 | Tests that a valid YAML string is identified and saved as a `.yaml` file with an `application/x-yaml` MIME type. | Implemented | `test_mcp_text_processing_yaml.yaml` |
| 2.1.5 | Tests that a string containing Markdown syntax is identified and saved as a `.md` file with a `text/markdown` MIME type. | Implemented | `test_mcp_text_processing_markdown.yaml` |

### 2.2 Image Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.2.1 | Tests that a base64-encoded PNG image is correctly decoded and saved as a `.png` file with an `image/png` MIME type. | Implemented | `test_mcp_image_processing_png.yaml` |
| 2.2.2 | Tests that a base64-encoded JPEG image is correctly decoded and saved as a `.jpg` file with an `image/jpeg` MIME type. | Implemented | `test_mcp_image_processing_jpeg.yaml` |

### 2.3 Audio Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.3.1 | Tests that a base64-encoded MP3 audio stream is correctly decoded and saved as an `.mp3` file with an `audio/mpeg` MIME type. | Implemented | `test_mcp_audio_processing_mp3.yaml` |
| 2.3.2 | Tests that a base64-encoded WAV audio stream is correctly decoded and saved as a `.wav` file with an `audio/wav` MIME type. | Implemented | `test_mcp_audio_processing_wav.yaml` |

### 2.4 Resource Content Processing

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 2.4.1 | Tests that a resource link with only a URI creates a placeholder artifact containing the URI text, with a filename derived from the URI. | Implemented | `test_mcp_resource_processing_uri_only.yaml` |
| 2.4.2 | Tests that a resource with embedded text content creates an artifact containing that text, using the filename from the URI and the specified MIME type. | Implemented | `test_mcp_resource_processing_with_text.yaml` |
| 2.4.3 | Tests that a resource with base64-encoded binary content creates an artifact with the correctly decoded binary data. | Implemented | `test_mcp_resource_processing_with_binary.yaml` |

---

## 3. LLM Response Formatting and Error Handling

This section focuses on edge cases for LLM response formatting and error handling during artifact saving.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 3.1 | Verifies that a response is saved as an artifact when it exceeds the LLM return limit, even if it's below the save threshold. | Implemented | `test_mcp_save_forced_by_truncation.yaml` |
| 3.2 | Verifies that if artifact saving fails, the LLM receives the original (or truncated) response along with a clear message that the save operation failed. | Implemented | `test_mcp_llm_response_save_failed.yaml` |

---

## 4. Error Handling and Fallback Behavior

This section tests the system's resilience and ensures it handles failures gracefully.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 4.1 | Verifies that if intelligent processing is disabled in the configuration, the system correctly falls back to saving the entire raw MCP response as a single `.json` artifact. | Implemented | `test_mcp_fallback_intelligent_disabled.yaml` |
| 4.2 | Verifies that if the `content` field in the MCP response is not a list, the system falls back to saving the raw response as a single `.json` artifact. | Skipped | Not feasible with current test infrastructure. |
| 4.3 | Verifies that if one item in a multi-item response is malformed (e.g., invalid base64), it is skipped, others are processed, and the final status is `partial_success`. | Skipped | Not feasible with current test infrastructure. |
| 4.4 | Verifies that if `fallback_to_raw_on_error` is `false`, a processing error results in no artifact being saved and an error message being returned to the LLM. | Implemented | `test_mcp_no_fallback_on_error.yaml` |

---

## 5. Complex and Multi-Content Scenarios

This section tests more advanced use cases involving multiple content items and conversational turns.

| Test ID | Description | Status | Test File |
| :--- | :--- | :--- | :--- |
| 5.1 | Tests that a single MCP response containing multiple items (e.g., text and an image) results in the creation of two separate, correctly typed artifacts. | Implemented | `test_mcp_multi_content_single_response.yaml` |
| 5.2 | Tests a two-turn conversation where the first turn creates an artifact and the second turn successfully uses that artifact, confirming metadata is correctly injected and used by the LLM. | Implemented | `test_mcp_conversation_with_artifact.yaml` |
| 5.3 | Tests that a single response containing multiple text items of different formats (e.g., one JSON and one CSV) results in two distinct, correctly typed text artifacts. | | |
