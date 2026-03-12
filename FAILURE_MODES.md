FAILURE_MODES.md

Failure Modes & Error Handling Contract for LocalPDF V6 (Codex / LLM)

0. Purpose

This document defines all acceptable failure modes in LocalPDF V6 and how they must be handled, surfaced, and tested.

LocalPDF V6 follows the rule:

Failures are first-class events.
Silent failure is a bug.

Codex / LLM must obey this document when:

generating logic

generating UI

generating Runner or Worker code

handling errors or edge cases

1. Core Failure Philosophy

LocalPDF V6 distinguishes between:

Expected failures (user input, limits, permissions)

Recoverable failures (resource exhaustion, worker interruption)

Fatal failures (corrupted state, invariant violations)

Each category has different handling rules.

2. Failure Taxonomy (MANDATORY)
2.1 Access & Monetization Failures

Examples

File exceeds Free tier size

Page count exceeds allowed limit

Tool requires Pro subscription

Entitlement missing

Handled by

UnifiedToolRunner

Rules

Tool logic MUST NOT run

Worker MUST NOT start

UI MUST receive structured denial event

Event

{
  type: 'TOOL_ACCESS_DENIED',
  reason: 'LIMIT_EXCEEDED' | 'ENTITLEMENT_REQUIRED',
  details?: string
}


❌ Never throw
❌ Never log as error
❌ Never silently ignore

This is expected behavior, not an exception.

2.2 User Input Failures

Examples

Empty input

Invalid page range

Unsupported file format

Corrupted PDF file

Handled by

Tool logic (Worker)

Rules

Fail fast

Return structured error

Never crash worker

Event

{
  type: 'ERROR',
  message: 'Invalid page range'
}


❌ Do not retry
❌ Do not guess intent

2.3 Resource Failures

Examples

Out-of-memory

Excessive file size in Worker

Browser resource limits

Worker terminated by browser

Handled by

WorkerOrchestrator + Runner

Rules

Gracefully terminate task

Emit error event

Allow UI recovery

❌ No infinite retries
❌ No partial success without explicit confirmation

2.4 Worker Lifecycle Failures

Examples

Worker crashes

Worker fails to load logic module

Worker receives invalid command

Logic throws uncaught exception

Handled by

WorkerOrchestrator

Rules

Worker must be terminated

Error must be reported to Runner

Runner must notify UI

Worker crashes are isolated by design.

2.5 VFS Failures

Examples

File not found

Failed read/write

Storage quota exceeded

Temp file cleanup failure

Handled by

VFS layer

Rules

Return explicit error

Never leak file references

Never leave orphaned temp files

❌ Never expose storage internals
❌ Never fallback silently

2.6 Platform Invariant Violations (FATAL)

Examples

Tool executed without registry entry

Logic executed in main thread

File accessed outside VFS

Runner bypassed

Handled by

Immediate hard failure

Rules

Throw synchronously

Abort operation

Log as platform bug

These are developer errors, not user errors.

3. Error Propagation Rules
3.1 One Direction Only

Errors propagate strictly:

Logic → Worker → Orchestrator → Runner → UI


❌ UI must never catch logic errors directly
❌ Logic must never notify UI directly

3.2 Structured Errors Only

All errors must be:

typed

explicit

serializable

❌ No throw "string"
❌ No console.error as error handling

4. UI Error Handling Rules

UI must:

react to events

display human-readable messages

allow retry when possible

never infer system state

UI must NOT:

guess cause

retry automatically

hide errors

5. Retry Rules
Allowed retries:

Worker restart after crash

Temporary resource exhaustion (once)

Forbidden retries:

Invalid input

Access denied

Platform invariant violation

Retries must be:

explicit

user-visible

limited

6. Cancellation Failure Handling

If a task is cancelled:

Worker must stop immediately

Temp files must be cleaned

UI must receive TASK_CANCELLED

Cancellation is not an error.

7. Logging Rules
Allowed:

Platform-level logging

Error boundary logging

Development diagnostics

Forbidden:

Logging inside tool logic for control flow

Console logs as error handling

Silent catch blocks

Logs are for developers, not for recovery.

8. Testing Failure Modes (MANDATORY)

Every failure mode must have:

at least one test

deterministic reproduction

explicit assertion

Untested failure modes do not exist.

9. LLM Behavior Rules

When generating code, LLM must:

enumerate possible failure modes

choose correct category

use correct handler layer

refuse to generate silent fallback behavior

If unsure:
👉 STOP and ASK.

10. Success Criteria

Failure handling is correct only if:

UI never freezes

no partial corrupt state exists

temp files are cleaned

user always receives feedback

platform invariants are protected

FINAL DIRECTIVE

LocalPDF V6 treats failure as part of normal execution.

If code “just keeps going” after something goes wrong —
👉 it is wrong.

Silent failure is the worst failure.