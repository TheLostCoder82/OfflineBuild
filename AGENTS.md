# React-Spaghetti AI Agent Guide

This repository is a browser-based React + TypeScript IDE prototype for generating React components from a unified visual/layout schema.

## Key project facts

- Framework: React 19 + TypeScript + Vite
- Styling: Tailwind CSS
- Testing: Vitest + `@testing-library/react` + `happy-dom`
- Main app entry: `src/main.tsx`
- Core state provider: `src/store/useWorkspaceStore.tsx`
- Main UI shell: `src/components/WorkspaceShell.tsx`
- Compiler engine: `src/compiler/SchemaASTParser.ts` and `src/compiler/ComponentExporter.ts`
- Unified schema definitions: `src/types/schema.ts`

## Primary commands

- `npm install` — install dependencies
- `npm run dev` — start Vite development server
- `npm run build` — compile TypeScript and bundle for production
- `npm test` — run Vitest in watch mode
- `npm run test:run` — run Vitest once

## What agents should know

- This is a frontend-only repo. There is no backend service code.
- The app is built around a unified schema that combines a visual layout tree with a logic graph.
- Changes should be made in `src/`; keep side effects minimal and preserve the existing component/test structure.
- Prefer TypeScript module syntax and follow the current project conventions in `src/`.
- Tailwind classes are the primary styling convention; avoid injecting unrelated CSS frameworks.
- For compiler or code generation tasks, use `src/types/schema.ts` as the source of truth for schema shape.

## Important files and areas

- `README.md` — top-level project overview and commands
- `generator.prompt.md` — design intent, architecture goals, and schema generation guidance
- `src/components/WorkspaceShell.tsx` — VS Code-like IDE layout and zone rendering
- `src/store/useWorkspaceStore.tsx` — workspace context, state history, undo/redo logic
- `src/compiler/SchemaASTParser.ts` — schema-to-AST parsing logic
- `src/compiler/ComponentExporter.ts` — AST-to-React code generation
- `src/types/schema.ts` — unified JSON schema types for layout and logic
- `vite.config.ts` — Vite config and test environment configuration

## Agent behavior guidance

- When asked to modify features or add components, prioritize the existing architecture and keep changes aligned with the current IDE/graph pipeline.
- When working on tests, use Vitest and `@testing-library/react` patterns already present in the repo.
- When adding or updating documentation, keep it short and link to `README.md` or `generator.prompt.md` rather than repeating long descriptions.

## Notes

- The repository appears to be a prototype with a staged roadmap. Avoid assuming full implementation of the logic graph editor or all visual design features.
- Keep generated code consistent with the project’s current React + TypeScript conventions and `jsx` `react-jsx` settings.
