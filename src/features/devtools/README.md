# DevTools Feature

Architecture-level self-inspection tool. Opens as a modeless (draggable, non-blocking) window from a button in the app header bar.

## Architecture

The feature is UI-only — no commands or document state. It reads from existing stores via `useRootStore()` and `observer` for live reactivity.

### Data Sources

| Section               | Store              | Property                                       |
| --------------------- | ------------------ | ---------------------------------------------- |
| Commands              | `CommandStore`     | `.all`                                         |
| Op Handlers           | `DocumentStore`    | `.handlerTypes`                                |
| Undo Stack            | `HistoryStore`     | `.undoStack`                                   |
| Redo Stack            | `HistoryStore`     | `.redoStack`                                   |
| Overlays (registered) | `OverlayRegistry`  | `.all`                                         |
| Overlays (open)       | `OverlayService`   | `.modalStack`, `.modelessWindows`, `.popovers` |
| Scheduler             | `CommandScheduler` | `.activeLocks`, `.executions`                  |
| Sync                  | `SyncEngine`       | `.pendingOps`                                  |

### Files

- **`types.ts`** — `DevToolsOverlay` constant and `OverlayParamsMap` declaration merging.
- **`DevToolsOverlays.tsx`** — Inspector component (observer) and `registerDevToolsOverlays`.

## Extension Points

To add a new section to the inspector, add a `<Section>` element inside `DevToolsInspector` and read from the relevant store. No registration is needed — the component has full access to `RootStore`.
