# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — TypeScript check (`tsc`) + Vite production build
- `npm run preview` — Preview production build
- `npx tsc --noEmit` — Type-check only (no emit)
- `npm run format` — Format all source files with Prettier
- `npm run format:check` — Check formatting without writing
- `npm run test:e2e` — Run Playwright E2E tests (headless)
- `npm run test:e2e:ui` — Open Playwright UI mode for interactive debugging

## Path Aliases

- `@core/*` → `src/core/*`
- `@app/*` → `src/app/*`
- `@features/*` → `src/features/*`

## Architecture

**Op-based state management** built on MobX. All state mutations flow through serializable `Op` objects (`{ type, payload }`), enabling undo/redo via inverse ops, sync between peers, and history coalescing.

### Core Stores (src/core/)

`RootStore` owns all sub-stores and implements the `Deps` interface. Stores receive `Deps` for dependency injection — never import sibling stores directly.

- **DocumentStore** — Single `data: Record<string, any>` object. Features register op handlers via `registerHandler(type, handler)`. Handlers mutate `data` in place inside MobX actions.
- **CommandStore** — Registry of `CommandDef` objects. `dispatch(id, params)` delegates to `CommandScheduler`.
- **CommandScheduler** — Concurrency control via resource locks and conflict policies (`"reject"` | `"queue"` | `"supersede"`).
- **HistoryStore** — Undo/redo stacks of `{ ops, inverseOps }` records. Records with the same `mergeKey` coalesce within a 1000ms window.
- **OverlayService** / **OverlayRegistry** — Three overlay kinds: modal, modeless, popover. Each with its own z-index band.
- **SyncEngine** — Broadcasts ops to peers via a Transport abstraction (currently LoopbackTransport for local dev).

### Command Definition Pattern

Commands prefer `toOps(params, deps)` (sync, auto-undoable) over `run(params, deps, signal)` (async/imperative). Use `mergeKey` for any slider or continuous-drag command to coalesce history entries.

```typescript
const cmd: CommandDef<P> = {
  id: "feature:action",
  title: "Human Title",
  toOps(params, deps) {
    return { ops: [...], inverseOps: [...] };
  },
  mergeKey(params) { return `feature:action:${params.id}`; }, // for continuous values
};
```

### Feature Module Pattern

Each feature in `src/features/` registers itself during bootstrap:

1. **Document registrar** — `registerXxxDocument(doc)`: seeds initial data slice on `doc.data` via `Object.assign`, registers op handlers.
2. **Command registrar** — `registerXxxCommands(commands)`: registers `CommandDef` objects.
3. **Overlay registrar** (optional) — `registerXxxOverlays(registry)`: registers overlay definitions.
4. **Bootstrap wiring** — Call all registrars in `src/app/bootstrap.ts`.

### Documentation

Every new feature or core module must include a `README.md` covering architecture, data model, and extension points. Features that define commands must also include a `COMMANDS.md` with the command table, usage examples, and undo/redo behaviour. When modifying an existing feature significantly, update its docs to reflect the changes.

### Keyboard Shortcuts

Global handler in `App.tsx`. Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z are hardcoded for undo/redo. Other shortcuts come from `CommandDef.shortcut` (format: `"mod+key"`, `"mod+shift+key"`).

## Styling

Tailwind CSS utility classes. No custom theme extensions. Standard patterns: `rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-40`.

## E2E Testing (Playwright)

Tests live in `e2e/` and run against Chromium only. The Playwright config (`playwright.config.ts`) auto-starts a Vite dev server on port 5175.

### Running tests

- `npm run test:e2e` — Run all tests headless.
- `npm run test:e2e:ui` — Open the interactive UI runner.
- `npx playwright test e2e/overlays.spec.ts` — Run a single spec file.
- `npx playwright test -g "undo"` — Run tests matching a grep pattern.

### Test structure

| File | Covers |
|---|---|
| `e2e/helpers.ts` | Shared utilities: `gotoAndWaitForApp`, `MOD` key constant, `setRangeValue` |
| `e2e/overlays.spec.ts` | Modal open/close (×, Escape, Cancel, backdrop), DevTools modeless window |
| `e2e/undo-redo.spec.ts` | Undo/redo via keyboard shortcuts and toolbar buttons |
| `e2e/layer-properties.spec.ts` | Layer list, property panel, opacity slider, blend mode, visibility toggle |

### Writing new tests

- **Wait for app ready.** Every test should call `gotoAndWaitForApp(page)` (usually in `beforeEach`) — it navigates to `/` and waits for the sample layers to render.
- **Prefer accessible selectors.** Use `getByRole`, `getByLabel`, `getByTitle`, and `getByText` over CSS selectors. This keeps tests resilient to style changes and documents the app's accessibility surface.
- **Scope ambiguous text.** If a text like "100%" appears in multiple places, scope the locator to a parent (e.g. `page.locator("aside").getByText("100%")`).
- **Range inputs.** `fill()` does not work on `<input type="range">`. Use the `setRangeValue(page, label, value)` helper from `e2e/helpers.ts`.
- **Platform modifier key.** Use the `MOD` constant (`Meta` on macOS, `Control` elsewhere) for keyboard shortcuts: `` await page.keyboard.press(`${MOD}+z`) ``.
- **Testing non-events.** When asserting that something does *not* happen (e.g. backdrop click should not dismiss), add a short `waitForTimeout(300)` before the assertion.
- **Separate tsconfig.** `e2e/tsconfig.json` is independent from the app's — no path aliases, no interference with `npm run build`.

## TypeScript

Strict mode enabled with `noUnusedLocals` and `noUnusedParameters`. Target ES2022.
