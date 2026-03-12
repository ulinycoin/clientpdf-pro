TESTING_RULES.md

Testing Contract for LocalPDF V6 (Codex / LLM)

0. Purpose

This document defines mandatory testing rules for all tests generated inside the LocalPDF V6 repository.

Codex / LLM must treat this file as authoritative when:

generating new tests

modifying existing tests

suggesting test strategies

If a test violates these rules — it is invalid.

1. Core Testing Philosophy

LocalPDF V6 follows this principle:

Test behavior, not implementation.
Test contracts, not internals.

The platform is layered and declarative, therefore:

most logic is tested at unit and contract level

UI is tested for interaction and wiring

platform services are tested for deterministic behavior

2. What MUST Be Tested
2.1 Tool Logic (Worker Logic) — REQUIRED

Every tool logic function MUST have tests.

You must test:

correct processing of valid input

correct output file creation via IFileSystem

edge cases (empty input, invalid ranges, limits exceeded by input data)

progress reporting (if supported)

You must NOT test:

UI behavior

routing

monetization enforcement (Runner owns this)

2.2 UnifiedToolRunner — REQUIRED

Runner tests must verify:

limits enforcement based on IToolDefinition

correct rejection when limits are exceeded

correct command dispatch to WorkerOrchestrator

correct event propagation back to UI layer

deterministic behavior for same inputs

Runner tests define platform correctness.

2.3 GlobalRegistry — REQUIRED

Registry tests must verify:

tools are discoverable

metadata is read correctly

routing/navigation data derives from registry only

missing or invalid tool definitions are rejected

2.4 VFS — REQUIRED

VFS tests must verify:

files can be written, read, deleted

temporary files are cleaned up

no memory leaks (Object URL lifecycle is abstracted)

identical behavior across adapters (Web / Tauri via mocks)

3. What MUST NOT Be Tested
❌ UI internals

Do NOT test:

component state variables

internal hooks

layout structure

styling

UI tests exist only to verify:

user interaction triggers Runner

file selection calls VFS

results are displayed when events arrive

❌ Third-party libraries

Do NOT test:

pdf-lib

pdfjs

tesseract.js

browser APIs

Assume they work.
Test how LocalPDF uses them, not their internals.

❌ Implementation details

Do NOT test:

private functions

internal helper methods

exact sequence of internal calls

If changing internals breaks a test — the test is wrong.

4. Test Types and Scope
4.1 Unit Tests (Primary)

Used for:

tool logic

VFS

Registry

Runner

Characteristics:

fast

isolated

deterministic

no real workers

no real filesystem

4.2 Contract Tests (Critical)

Contract tests validate interfaces, not implementations.

Examples:

ToolLogicFunction signature compliance

IFileSystem behavior

Worker Command/Event protocol shape

Contract tests must fail if:

interface changes

payload shape changes

assumptions are violated

4.3 Integration Tests (Selective)

Allowed only for:

Runner ↔ WorkerOrchestrator interaction

VFS ↔ IO Adapter wiring

Integration tests must:

still avoid real filesystem

still avoid real Web Workers unless explicitly requested

5. Worker Testing Rules
5.1 No Real Web Workers by Default

By default:

Worker logic is tested as pure functions

Worker communication is mocked

Only test real Workers if explicitly instructed.

5.2 Deterministic Execution

Tests must not rely on:

timing

real concurrency

race conditions

If concurrency is involved:

simulate via mocks

assert ordering explicitly

6. File Handling in Tests
REQUIRED

Use mocked IFileSystem

Use in-memory Blob substitutes

Track file IDs, not raw Blobs

FORBIDDEN

URL.createObjectURL

writing to disk

IndexedDB

Node.js fs in tool tests

7. Monetization & Limits Testing
Where to test:

ONLY in UnifiedToolRunner tests

What to test:

correct rejection for Free tier

correct allowance for Pro tier

correct error events (TOOL_ACCESS_DENIED)

no tool logic execution when denied

Forbidden:

testing limits inside tool logic

mocking subscription inside tool tests

8. Naming & Structure Rules
Test File Naming
<file>.test.ts
<file>.spec.ts


Examples:

extract-pages.logic.test.ts
UnifiedToolRunner.spec.ts
VFS.memory.spec.ts

Test Structure Pattern
describe('ComponentUnderTest', () => {
  describe('when condition', () => {
    it('does expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});


No one-line tests.
No “happy-path-only” tests.

9. Forbidden Testing Patterns

❌ Snapshot tests for logic
❌ Testing implementation details
❌ Testing UI + logic together
❌ Golden-file tests with binary blobs
❌ Time-based assertions
❌ Flaky tests tolerated

If a test is flaky — it must be rewritten or deleted.

10. LLM Behavior Rules

When generating tests, Codex / LLM must:

prefer fewer, stronger tests over many weak ones

explain assumptions if behavior is unclear

refuse to generate tests if contracts are missing

stop and ask if correct test boundary is unclear

11. Success Criteria

A test suite is correct only if:

changing internals does NOT break tests

breaking contracts DOES break tests

tools remain isolated

platform rules are enforced

behavior is deterministic

FINAL DIRECTIVE

Tests exist to protect the architecture, not to inflate coverage.

If a test does not protect:

a contract

a boundary

a rule

👉 it should not exist.

Bad tests are worse than no tests.