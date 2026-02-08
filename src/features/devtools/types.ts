export const DevToolsOverlay = {
    Inspector: "devtools:inspector",
} as const;

declare module "@app/types" {
    interface OverlayParamsMap {
        [DevToolsOverlay.Inspector]: Record<string, never>;
    }
}
