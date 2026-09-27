---
name: OpenAPI integer compatibility
description: Compatibility note for the workspace's generated Zod schemas.
---

OpenAPI integer fields currently generate `zod.int()` calls that are incompatible with the workspace's installed Zod 3 runtime. Use numeric fields at the contract boundary until the generator/runtime versions are aligned.

**Why:** Code generation can succeed while the chained library typecheck fails, blocking the client and server build.

**How to apply:** When adding integer-like request or response fields, prefer `type: number` in the OpenAPI contract and enforce integer semantics in server logic if the field truly needs it.