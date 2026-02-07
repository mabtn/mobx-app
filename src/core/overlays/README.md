# Overlay System

## Concepts

- **OverlayRegistry** — static map of overlay definitions (key → component + options).
- **OverlayService** — runtime manager: open/close instances, z-order, focus.
- **Hosts** — React components that render active overlay instances:
  - `ModalHost` — top modal with backdrop + focus trap (Ariakit `modal`).
  - `ModelessHost` — non-modal windows with drag support, z-order via click.
  - `PopoverHost` — lightweight global popovers (placeholder).

## Registering an overlay

```ts
// In your feature's bootstrap:
overlayRegistry.register({
  key: "myFeature:settings",
  kind: "modal",
  component: MySettingsPanel,
  options: { dismissOnEsc: true, dismissOnOutsideClick: true },
});
```

## Opening / closing

```ts
const id = overlays.open("myFeature:settings", { tab: "general" });
overlays.close(id);
overlays.closeTopModal();
overlays.closeAll("modeless");
```

## Typed params (declaration merging)

```ts
// myFeature/types.ts
declare module "@app/types" {
  interface OverlayParamsMap {
    "myFeature:settings": { tab?: string };
  }
}
```

## Modeless windows

Modeless windows use Ariakit Dialog with `modal={false}`. They do **not** trap
focus. Clicking a window calls `bringToFront(id)` to raise its z-index.
Windows are draggable via `DraggableWindowFrame`.

## Sessions

If a definition has `createSession(params, deps)`, the returned object is
stored on the instance and passed to the component as `session`. Call
`dispose()` on close to tear down subscriptions.
