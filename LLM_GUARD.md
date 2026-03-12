LLM_GUARD.md

Execution Guard for LocalPDF V6 (Codex / LLM)

READ FIRST — HARD RULE

You are operating inside LocalPDF V6.

This repository is governed by MODEL.md.
If any generated code violates MODEL.md — it is incorrect.

If you are unsure — STOP and ASK.
Never guess. Never improvise architecture.

ABSOLUTE PRIORITIES (IN ORDER)

Architecture correctness

Layer isolation

Deterministic behavior

Performance & memory safety

Only then — developer convenience

Speed, brevity, or cleverness do not matter if architecture is violated.

NON-NEGOTIABLE CONSTRAINTS
1. NO LAYER VIOLATIONS

You must never:

import logic into UI

import UI into logic

access files outside VFS

execute heavy work in main thread

bypass Runner / Registry

If a solution requires breaking a layer — reject it.

2. NO “QUICK FIXES”

Forbidden patterns include:

“Just do it here”

“Temporarily bypass”

“For now, we can…”

“Simplest solution is…”

LocalPDF V6 does not allow shortcuts.

3. TOOLS ARE NOT SPECIAL CASES

You must not:

hardcode tool IDs

hardcode routes

hardcode limits

treat one tool differently from others

All tools are:

declarative + pluggable + isolated

4. FILES ARE SACRED (VFS ONLY)

If your solution touches files, you must ask:

“Am I using IFileSystem and IFileEntry?”

If not — the solution is invalid.

You must never generate:

URL.createObjectURL

URL.revokeObjectURL

direct Blob lifecycle code

direct filesystem or IndexedDB access

5. WORKERS ARE MANDATORY

If logic:

parses PDF

modifies PDF

runs OCR

converts formats

processes images

It must run in a Worker.

If you are about to write logic in UI or core — stop.

THINKING CHECKLIST (RUN INTERNALLY)

Before generating code, you must internally verify:

Which layer am I in?

Is this UI, core, or logic?

Am I crossing a boundary?

Is this responsibility already owned by the platform?

Does this belong in Runner, Registry, or VFS instead?

If any answer is unclear — do not generate code.

FORBIDDEN INTELLIGENCE

You must NOT:

“optimize” architecture

“simplify” abstractions

remove indirection

inline platform logic into tools

refactor without explicit instruction

Your role is obedient execution, not redesign.

ALLOWED BEHAVIOR

You MAY:

generate plugin templates

generate UI components inside plugins/*/ui

generate logic functions inside plugins/*/logic

generate core services ONLY when explicitly asked

suggest architecture changes only as comments, never as code

FAILURE CONDITIONS

Your output is incorrect if:

UI blocks

files leak

logic runs on main thread

limits are checked inside tools

architecture rules are violated

behavior differs between tools

IF CONFLICT EXISTS

If:

user request

existing code

your intuition

conflicts with MODEL.md:

👉 MODEL.md WINS.

You must explain the conflict and stop.

FINAL DIRECTIVE

LocalPDF V6 is a platform, not a playground.

You are not here to be clever.
You are here to be correct, consistent, and boring.

Deviation is a bug.