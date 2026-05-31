# Daemi

Private shared scrapbook app for long-distance couples. Expo + React Native + TypeScript + Supabase.

## Commands

- `npx expo start` — start dev server
- `npx tsc --noEmit` — type check
- `npm test` — run tests (not configured yet)

## Architecture

- Architecture docs: `docs/architecture/` (00-16, start with 00-overview.md)
- Routes: `app/` (Expo Router, file-based routing)
- Source: `src/` (components, features, lib, types)
- Feature hooks pattern: UI components call hooks from `src/features/`, never Supabase directly

## Current Phase

Phase 0 (Foundation) — complete. Phase 1 (Database & Auth) — complete. Phase 2 (Auth Flow & Route Guards) — complete. Next: Phase 3 (Timeline).
