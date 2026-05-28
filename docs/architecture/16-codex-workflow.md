# Codex Workflow

## Rule

Do not ask Codex to build the entire app at once.

Use one phase per Codex task.

## Standard Codex Prompt Format

```txt
Context:
Daemi is a private shared scrapbook app for couples.
Current phase: [PHASE NAME]
Relevant architecture docs:
- docs/architecture/[doc].md
- docs/architecture/[doc].md

Task:
Implement only the current phase.

Requirements:
- [specific requirements]

Constraints:
- Do not modify unrelated domains.
- Keep components modular.
- Use existing architecture docs as source of truth.
- Add tests where practical.
- Explain files changed.
- List known limitations.
```

## First Codex Task

```txt
Read docs/architecture/00-overview.md, 01-tech-stack.md, 02-app-architecture.md, and 13-routing.md.

Set up the initial Expo React Native TypeScript app architecture for Daemi.

Implement:
- Expo Router structure
- empty auth routes
- empty onboarding routes
- bottom tabs for Timeline, Trips, Add, and Find
- shared theme tokens
- base Supabase client placeholder
- TanStack Query provider
- Zustand app UI store placeholder

Do not implement business logic yet.

Return:
1. files changed
2. architecture summary
3. next recommended task
```

## Review Checklist

Before accepting a Codex diff, check:

- Did it stay inside the requested phase?
- Did it introduce unnecessary libraries?
- Did it bypass RLS assumptions?
- Did it hardcode user IDs or couple space IDs?
- Did it keep feature boundaries clean?
- Did it preserve the emotional product direction?
- Did it add enough TODOs for deferred features without implementing them prematurely?
