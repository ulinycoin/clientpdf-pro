# Project Agent Rules (Codex CLI / LLM Model Contract)

This document is the **ultimate source of truth** for all code generation, refactoring, and analysis performed by an LLM or Codex CLI inside the LocalPDF V6 repository. It consolidates the rules from `MODEL.md`, `LLM_GUARD.md`, `FAILURE_MODES.md`, and `TESTING_RULES.md`.

## 0. Absolute Priorities (In Order)
1. **Architecture correctness**.
2. **Layer isolation**.
3. **Deterministic behavior**.
4. **Performance & memory safety**.
5. Only then — **developer convenience**.
Speed, brevity, or cleverness do not matter if architecture is violated. If you are unsure — **STOP and ASK**. Never guess. Never improvise architecture.

## 1. System Identity
You are operating inside LocalPDF V6. It is a plugin-based, worker-first, declarative cross-platform platform (Web + Tauri).
**Core principle**: Tool developers write logic only. The platform owns routing, files, execution, limits, and monetization.

## 2. Non-Negotiable Architecture Rules
### 2.1 Layer Separation (STRICT)
- **UI (`plugins/*/ui`)**: User input, configuration, display. **Forbidden**: Heavy logic, PDF libs, file system.
- **Logic (`plugins/*/logic`)**: Pure document processing. **Forbidden**: UI code, DOM, routing, subscription checks.
- **Core (`core/*`)**: Registry, Runner, VFS, Workers. **Forbidden**: Tool-specific logic.
- **Services**: External systems (subscription, limits). **Forbidden**: Tool logic.
❌ **Never mix layers. Never bypass platform abstractions.**

### 2.2 Tool Model (Canonical)
A tool MUST consist of EXACTLY three parts:
- `definition.ts` (Declarative metadata)
- `ui/` (React UI, lazy-loaded)
- `logic/` (Worker logic, isolated)
A tool IS NOT a route, a component, or a service.

### 2.3 Execution Model & Workers
**Worker-First Rule**: All heavy processing (PDF parsing/manipulation, OCR, compression, conversion) MUST run in Web Workers. No CPU-heavy logic in the main thread.
**Workers Communication**: Only via the Command/Event protocol. UI sends commands and receives events, while Logic never touches the Worker API directly.

### 2.4 File Handling (VFS ONLY)
All file operations must go through VFS (`IFileSystem`, `IFileEntry`).
❌ **Forbidden**: `URL.createObjectURL`, `URL.revokeObjectURL`, direct Blob lifecycle code, IndexedDB, filesystem access.

### 2.5 Logic Function Contract (STRICT)
All tool logic functions MUST conform exactly to `ToolLogicFunction`:
```typescript
export type ToolLogicFunction = (params: {
  inputIds: string[];
  options?: any;
  fs: IFileSystem;
  emitProgress?: (percent: number) => void;
}) => Promise<{ outputIds: string[] }>;
```
❌ Do not invent other signatures, return Blobs, or access global state.

### 2.6 Monetization & Limits
Limits and monetization are **DECLARATIVE ONLY**, defined in `IToolDefinition` and enforced by `UnifiedToolRunner`.
❌ Checking subscriptions in tools or limits in logic is strictly forbidden.

### 2.7 UI Rules
- Components must be thin and stateless where possible.
- Must only call `vfs.write` and `runner.start`.
- ❌ No orchestration logic, no chaining tools, no direct execution decisions inside the UI.

## 3. Execution Guardrails & Forbidden Patterns
- No "Quick Fixes" ("just do it here", "temporarily bypass", "simplest solution is...").
- Do not hardcode routes, limits, or tool IDs.
- Tools are NOT special cases. All tools are treated equally by the Runner.
- Do not refactor legacy code without explicit instruction. Treat V6 code as authoritative.
- **If user request, existing code, or your intuition conflicts with these rules => THESE RULES WIN. Explain the conflict and stop.**

## 4. Failure Modes & Error Handling
**Silent failure is a bug.** Failures are first-class events. Code that "just keeps going" after something goes wrong is unacceptable.

### Taxonomy:
1. **Access & Monetization Failures**: Expected. Handled by `UnifiedToolRunner`. Logic/Worker MUST NOT start. UI gets event. Never throw or log.
2. **User Input Failures**: Expected. Handled by tool logic. Fail fast, return structured error.
3. **Resource / Worker Lifecycle Failures**: Recoverable. Handled by WorkerOrchestrator + Runner. Graceful termination.
4. **VFS Failures**: Explicit error. Never leak files/temp files.
5. **Platform Invariant Violations**: Fatal. Throw synchronously, abort operation.

### Error Rules:
- **One Direction**: Logic → Worker → Orchestrator → Runner → UI. UI never catches logic errors directly. Logic never notifies UI directly.
- **Structured**: All errors must be typed and serializable. No `throw "string"` or `console.error` as error handling.
- **UI Role**: React to events, display human-readable messages, allow retry if possible. Never guess cause, infer system state, hide errors, or retry automatically.

## 5. Testing Rules
**Test behavior, not implementation. Test contracts, not internals.**

### What MUST be tested:
- **Tool Logic**: Correct output file creation via `fs`, edge cases (empty input, invalid ranges, etc.).
- **Global Services**: `UnifiedToolRunner`, `GlobalRegistry`, `VFS`.

### What MUST NOT be tested:
- UI internals (state, layout, styles, internal hooks).
- Third-party libraries (`pdf-lib`, `tesseract.js`, `pdfjs`).
- Private functions / internal helpers / exact sequences of internal calls.

### General Testing Principles:
- Use mocked `IFileSystem` and Blob substitutes. Never write to disk or use `URL.createObjectURL` in tests.
- Worker logic is tested as pure functions by default. No real workers unless explicitly instructed.
- Limit/Monetization testing happens ONLY in `UnifiedToolRunner` tests.
- ❌ No snapshot tests for logic, no golden-file tests with binary blobs, no time-based assertions. **FLAKY TESTS ARE NOT TOLERATED.**

## 6. Project Workflows & Navigation
- **Studio-First Workflow**: All document workflows start in Studio. Edit and Convert actions require a selected document.
- **Save/Cancel**: After Save/Cancel from Edit/Convert, the user must return to their Studio workspace context precisely as they left it (same filtering, collection/folder, and scroll position).
- **Interface Language**: Interface text (UI copy, labels, keys) MUST be in English. Translations stem from the English string.
- Delegate routine analysis to `Gemini CLI`/`Codex` but implement and verify locally. Final responsibility lies in the developer checking the validation locally.

---
**FINAL DIRECTIVE**: You are not here to be clever. You are here to be correct, consistent, and boring. Deviation is a bug.
