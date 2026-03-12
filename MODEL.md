MODEL.md

LocalPDF V6 — Model Contract for Codex CLI

0. Purpose

This file defines mandatory architectural rules for all code generation, refactoring, and analysis performed by Codex CLI inside the LocalPDF repository.

Codex must treat this document as a system-level contract.
If any instruction conflicts with generated code, this document always wins.

Codex must prefer:

correctness over speed

architecture over convenience

platform rules over local optimizations

1. System Identity

You are operating inside LocalPDF V6.

LocalPDF V6 is:

a platform, not a collection of ad-hoc tools

plugin-based

worker-first

declarative

cross-platform (Web + Tauri)

The core principle is:

Tool developers write logic only.
The platform owns routing, files, execution, limits, and monetization.

2. Non-Negotiable Architecture Rules
2.1 Layer Separation (STRICT)
Layer	Responsibility	Forbidden
UI (plugins/*/ui)	User input, configuration, display	Heavy logic, PDF libs, file system
Logic (plugins/*/logic)	Pure document processing	UI code, DOM, routing, subscription checks
Core (core/*)	Registry, Runner, VFS, Workers	Tool-specific logic
Services	External systems (subscription, limits)	Tool logic

❌ Never mix layers
❌ Never bypass platform abstractions

3. Tool Model (Canonical)

A tool MUST consist of exactly three parts:

plugins/<tool-id>/
├── definition.ts   # Declarative metadata
├── ui/             # React UI (lazy-loaded)
└── logic/          # Worker logic (isolated)


A tool IS NOT:

a route

a component

a service

a function call

A tool IS:

a declarative description + UI plugin + logic plugin

4. Global Registry Is the Single Source of Truth

Codex must assume:

routing

navigation

access control

monetization

availability

are derived exclusively from IToolDefinition.

❌ Never hardcode routes
❌ Never manually add tools to navigation
❌ Never duplicate limits or entitlements elsewhere

5. Execution Model (MANDATORY)
5.1 Worker-First Rule

All heavy processing:

PDF parsing

PDF manipulation

OCR

compression

conversion

MUST run in Web Workers.

❌ No pdf-lib, pdfjs, tesseract imports in UI
❌ No CPU-heavy logic in main thread

5.2 Worker Communication

Workers communicate only via the Command/Event protocol.

UI:

sends commands

receives events

never blocks

Logic:

never touches Worker API directly

never posts messages itself

6. File Handling (VFS ONLY)

All file operations must go through VFS.

Forbidden:

URL.createObjectURL

URL.revokeObjectURL

direct Blob lifecycle management

direct IndexedDB access

direct filesystem access

Required:

IFileSystem.write

IFileSystem.read

IFileEntry

Codex must treat VFS as:

the only legal way to touch files

7. Logic Function Contract (STRICT)

All tool logic functions MUST conform to this shape:

export type ToolLogicFunction = (params: {
  inputIds: string[];
  options?: any;
  fs: IFileSystem;
  emitProgress?: (percent: number) => void;
}) => Promise<{ outputIds: string[] }>;


❌ Do not invent other signatures
❌ Do not return Blobs directly
❌ Do not access global state

8. Monetization & Limits (DECLARATIVE ONLY)
Forbidden:

if (isFree)

if (!isPremium)

checking subscription in tools

checking limits in logic

Required:

limits defined in IToolDefinition

enforcement via UnifiedToolRunner

Codex must assume:

Tools are monetization-agnostic

9. UI Rules

UI components:

must be thin

must be stateless where possible

must only call:

vfs.write

runner.start

❌ No orchestration logic
❌ No chaining tools
❌ No execution decisions

10. Forbidden Patterns (ABSOLUTE)

Codex must never generate:

direct file downloads in tools

manual routing switches

shared mutable state between tools

tool-to-tool calls

logic imports into UI

UI imports into logic

platform logic duplicated in plugins

11. Migration Awareness

Legacy and V5 code may exist.

Codex must:

not refactor legacy code unless explicitly instructed

treat V6 code as authoritative

never mix Legacy/V5 patterns into V6

12. If Unsure — STOP

If Codex cannot determine:

correct layer

correct abstraction

correct responsibility

It must:

STOP

Ask for clarification

NOT guess

13. Success Criteria

Generated code is correct only if:

UI never blocks

files never leak

logic is isolated

tools are declarative

limits are centralized

architecture remains clean

This file is authoritative.
Deviation is a bug.

14. Studio-First UI Workflow (MANDATORY)

All document workflows must start in Studio.

Required Studio behavior:

document visualization is available in Studio

page operations in Studio include add, delete, and reorder

Edit and Convert actions are available only when a document is selected

Required Edit/Convert behavior:

Edit opens a unified workspace with tools in the side menu

Convert follows the same unified workspace principle

after Save from Edit, user returns to the same Studio workspace context:
same collection/folder, same selected document, same sorting/filtering, same scroll position

after Save from Convert, user returns to the same Studio workspace context and the converted result appears as a new file next to the source file

save cancellation must be supported (user can explicitly refuse Save and keep or discard changes according to the chosen action)

Download policy:

document download is performed from Studio after returning from Edit/Convert

Status indicator:

after returning to Studio from successful Edit/Convert save, the modified/produced document must show a green "M" marker
