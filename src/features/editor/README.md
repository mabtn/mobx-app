# Photo Editor Feature

Layer-based image editor with undo/redo, blend modes, filters, and a composited canvas.

## Architecture

### ImageCache Side-Channel

Large image data (HTMLImageElement) lives in a plain `Map<string, HTMLImageElement>` **outside MobX**. The document model stores only a short `imageRef` string per layer. This keeps MobX data lean — no multi-MB blobs in the observable graph.

The `editor:layer:add` op payload includes a `dataUrl` field so that undo/redo can reconstruct the cache entry when a layer is re-added.

### Document Model

```
editor: {
  layers: Layer[]
  selectedLayerId: string | null
  canvasWidth: number
  canvasHeight: number
}
```

**Layer fields**: `id`, `name`, `visible`, `opacity`, `blendMode`, `position: {x,y}`, `scale: {x,y}`, `effects: { shadow?, blur?, filters? }`, `imageRef`, `order`.

Layers are ordered by the `order` field (0 = bottom). The layer list UI displays them in reverse (highest order at top).

### Layer Lifecycle

1. **Create**: Load image file → read as data URL → `imageCache.load(ref, dataUrl)` → apply `editor:layer:add` op with `{ layer, dataUrl }`
2. **Duplicate**: Deep-clone layer object, copy image reference in cache, assign new `imageRef`
3. **Delete**: Capture `dataUrl` from cache (via `imageCache.toDataUrl()`) into the inverse op payload, then apply `editor:layer:remove`
4. **Undo restore**: The `editor:layer:add` handler repopulates `ImageCache` from the stored `dataUrl`

### Canvas Rendering

A MobX `reaction()` watches all layer properties that affect rendering and schedules a single `requestAnimationFrame` to redraw. This avoids redundant redraws when multiple properties change in the same MobX action.

Per visible layer, the renderer: saves context → sets `globalCompositeOperation` (blend mode) → sets `globalAlpha` (opacity) → translates/scales → applies CSS `filter` string (blur + brightness/contrast/etc.) → sets shadow properties → `drawImage` → restores context.

A checkerboard pattern is drawn as the background to indicate transparency.

### Hit Testing

Click events on the canvas are converted to document coordinates (accounting for CSS scaling), then layers are checked in reverse order (top first). A click is a hit if the point falls within the layer's transformed image bounds.

## UI Structure

- **EditorTopBar**: Undo/Redo buttons + Load Image
- **EditorCanvas**: Central canvas area with composited rendering
- **Right Panel** (state machine):
    - No selection → **LayerList**: layers sorted by order (highest at top), thumbnails, visibility toggles, drag-to-reorder
    - Layer selected → **LayerProperties**: back button, editable name, opacity slider, blend mode dropdown, transform controls, shadow controls, blur slider, filter sliders, action buttons (bring forward, send back, duplicate, delete)

## Adding New Tools/Effects

1. Add a new interface/field to `LayerEffects` in `types.ts`
2. Add an op handler in `editorDocument.ts` (e.g. `editor:layer:setMyEffect`)
3. Add a `CommandDef` in `EditorCommands.ts` with ops + inverseOps
4. Create a UI control component in `components/`
5. Compose it into `LayerProperties.tsx`
