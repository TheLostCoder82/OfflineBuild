# Copilot Instructions

This repo is a browser-based React + TypeScript IDE prototype for generating React components from a unified visual/layout schema.

## Use these facts first

- Frontend-only project: no backend or server code.
- Main source files:
  - `src/main.tsx`
  - `src/store/useWorkspaceStore.tsx`
  - `src/components/WorkspaceShell.tsx`
  - `src/compiler/SchemaASTParser.ts`
  - `src/compiler/ComponentExporter.ts`
  - `src/types/schema.ts`
- Tests use Vitest with `@testing-library/react` and `happy-dom`.
- Tailwind CSS is the primary styling method.
- `npm run dev`, `npm test`, and `npm run build` are the primary workflows.

## How to work in this repo

- Prefer changes inside `src/` and keep the current architecture and test patterns.
- Use `src/types/schema.ts` as the schema source of truth for layout and logic definitions.
- Keep UI components controlled and clear; avoid adding new styling frameworks.
- When adding features, preserve or extend the existing IDE/graph pipeline structure.
- When writing tests, follow the existing Vitest and React Testing Library style.

## Documentation links

- [README.md](../README.md)
- [AGENTS.md](../AGENTS.md)
- [generator.prompt.md](../generator.prompt.md)
