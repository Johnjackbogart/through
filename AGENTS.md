# Repository Guidelines

## Project Structure & Module Organization
- Source: Next.js App Router under `app/` (`app/layout.tsx`, `app/page.tsx`).
- UI: Reusable components in `components/` (shared primitives in `components/ui/`).
- Utilities: `lib/` for helpers (e.g., `lib/utils.ts`).
- Styles: Global styles in `styles/globals.css` and `app/globals.css`.
- Assets: Static files in `public/`.
- Config: `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`.

## Build, Test, and Development Commands
- Install: `pnpm install` — install dependencies.
- Develop: `pnpm dev` — run local dev server with HMR.
- Lint: `pnpm lint` — run ESLint on the repo.
- Build: `pnpm build` — production build via Next.js.
- Start: `pnpm start` — serve the built app.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` enabled; prefer explicit types at module boundaries.
- Components: Default export PascalCase component names; filenames kebab-case (e.g., `theme-toggle.tsx`).
- Modules: Use path alias `@/*` (e.g., `import { cn } from '@/lib/utils'`).
- Styling: Tailwind CSS v4 utilities in JSX; keep class lists readable and co-locate variant logic with components.
- Linting: Fix issues or add clear justifications; do not ignore rules repo‑wide without discussion.

## Testing Guidelines
- Status: No tests configured yet. If adding, use Vitest + React Testing Library.
- Structure: Place tests near sources or under `__tests__/`. Name files `*.test.ts(x)`.
- Coverage: Target ≥80% for new code; focus on critical UI logic and utils.
- Run: add `"test": "vitest"` and use `pnpm test` once introduced.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`). Example: `fix: resolve dark mode toggle with next-themes`.
- PRs: Include purpose, screenshots for UI changes, and linked issues. Ensure `pnpm lint` and `pnpm build` pass.
- Scope: Keep PRs small and focused; note breaking changes clearly.

## Security & Configuration Tips
- Env: Never commit secrets. Use `.env.local`; client-exposed vars must start with `NEXT_PUBLIC_`.
- Assets: Place static images in `public/` and reference with `/path` URLs.
