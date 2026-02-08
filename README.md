# MobX App

A layer-based image editor built on an **op-based state management** architecture with MobX. All mutations flow through serializable operations, giving you undo/redo, history coalescing, and real-time sync for free.

## Tech Stack

React 18 · MobX 6 · TypeScript · Vite · Tailwind CSS

## Getting Started

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Scripts

| Command                | Description                       |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start Vite dev server             |
| `npm run build`        | Type-check + production build     |
| `npm run preview`      | Preview the production build      |
| `npx tsc --noEmit`     | Type-check only                   |
| `npm run format`       | Format source files with Prettier |
| `npm run format:check` | Check formatting without writing  |

## Project Structure

```
src/
├── app/                  Application shell, bootstrap, global types
├── core/
│   ├── commands/         Command registry, scheduler, undo/redo history
│   ├── di/               Dependency injection (Deps interface)
│   ├── overlays/         Modal, modeless & popover overlay system
│   ├── root/             RootStore — top-level store aggregator
│   ├── state/            DocumentStore and auxiliary stores
│   ├── sync/             Op broadcast via pluggable transports
│   ├── ui/               Shared UI components (Button, Slider, Select…)
│   └── utils/            ID generation, dispose helpers
└── features/
    ├── editor/           Layer-based image editor
    └── sample/           Counter & notes demo feature
```

## Architecture

### Op-based state

Every state change is expressed as a serializable `Op` (`{ type, payload }`). Commands produce both forward and inverse ops, which enables:

- **Undo / redo** — inverse ops are replayed by `HistoryStore`
- **History coalescing** — ops sharing a `mergeKey` within a 1 s window collapse into a single history entry (useful for sliders and drag gestures)
- **Sync** — ops are broadcast to peers through `SyncEngine` and a pluggable `Transport`

### Commands

Features register `CommandDef` objects that declare how to produce ops. The preferred shape returns ops synchronously (`toOps`), but async side-effects are supported via `run`. `CommandScheduler` provides concurrency control with resource locks and conflict policies.

### Feature modules

Each feature is self-contained under `src/features/` and registers itself at boot time in `src/app/bootstrap.ts`:

1. **Document registrar** — seeds a data slice on `DocumentStore` and registers op handlers
2. **Command registrar** — registers `CommandDef` objects
3. **Overlay registrar** (optional) — registers overlay definitions

### Overlays

Three overlay kinds — modal, modeless, popover — each with its own z-index band. Modals use the native `<dialog>` element; modeless windows are draggable.

See [`src/core/overlays/README.md`](src/core/overlays/README.md) for details.

## Path Aliases

| Alias         | Target           |
| ------------- | ---------------- |
| `@core/*`     | `src/core/*`     |
| `@app/*`      | `src/app/*`      |
| `@features/*` | `src/features/*` |

## Further Reading

- [State & DocumentStore](src/core/state/README.md)
- [Overlay system](src/core/overlays/README.md)
- [Sync engine](src/core/sync/README.md)
- [UI components](src/core/ui/README.md)
- [Editor feature](src/features/editor/README.md)
- [Editor commands](src/features/editor/COMMANDS.md)
