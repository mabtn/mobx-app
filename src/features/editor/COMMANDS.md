# Editor Commands Reference

## Command Table

| Command ID | Params | Sync/Async | mergeKey | Notes |
|---|---|---|---|---|
| `editor:loadImage` | — | async `run()` | — | Opens file picker, reads image, creates layer. `locks: ["editor-load"]` |
| `editor:addLayer` | `{ layer, dataUrl? }` | sync `toOps()` | — | Adds a pre-built layer (internal use) |
| `editor:removeLayer` | `{ id }` | sync | — | Captures `dataUrl` from cache for undo |
| `editor:duplicateLayer` | `{ id }` | sync | — | Deep-clones layer, copies image in cache |
| `editor:selectLayer` | `{ id: string \| null }` | sync | — | Sets `selectedLayerId` |
| `editor:toggleVisibility` | `{ id }` | sync | — | Flips `visible` boolean |
| `editor:setOpacity` | `{ id, opacity }` | sync | `editor:setOpacity:{id}` | Coalesces slider drags |
| `editor:setBlendMode` | `{ id, blendMode }` | sync | — | Dropdown change |
| `editor:moveLayer` | `{ id, x, y }` | sync | `editor:moveLayer:{id}` | Position change |
| `editor:scaleLayer` | `{ id, x, y }` | sync | `editor:scaleLayer:{id}` | Scale change |
| `editor:setShadow` | `{ id, shadow }` | sync | — | Shadow on/off + params |
| `editor:setBlur` | `{ id, blur }` | sync | `editor:setBlur:{id}` | Blur radius slider |
| `editor:applyFilter` | `{ id, filters }` | sync | — | Sets entire filters array |
| `editor:renameLayer` | `{ id, name }` | sync | — | Text input |
| `editor:reorderLayer` | `{ id, newOrder }` | sync | — | Shifts intermediate layers |

## Usage Examples

### Dispatch from a component

```tsx
const root = useRootStore();

// Select a layer
root.commands.dispatch("editor:selectLayer", { id: "layer_1_abc123" });

// Set opacity (coalesces within 1s)
root.commands.dispatch("editor:setOpacity", { id: "layer_1_abc123", opacity: 0.5 });

// Load a new image (opens file picker)
root.commands.dispatch("editor:loadImage", undefined);
```

### Undo/Redo behaviour

All commands produce `ops` and `inverseOps`. The `HistoryStore` records them:

- **Undo** applies `inverseOps` in order
- **Redo** re-applies `ops` in order
- Commands with `mergeKey` coalesce within a 1-second window — e.g. rapid opacity slider changes become a single undo step

Special handling for `editor:removeLayer`: the inverse op includes the full `dataUrl` so that `editor:layer:add` can reconstruct the `ImageCache` entry on undo.

## Extending

To add a new command:

1. Define a `CommandDef<P>` with `toOps()` (preferred) or `run()` (for async)
2. Register it in `registerEditorCommands()` in `EditorCommands.ts`
3. Add any required op handlers in `editorDocument.ts`
4. Use `mergeKey` for continuous-value controls (sliders, drags)
