// ── Layer effects ─────────────────────────────────────────────────────

export interface LayerShadow {
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
}

export interface LayerFilter {
    property: string;
    value: number;
}

export interface LayerEffects {
    shadow?: LayerShadow;
    blur?: number;
    filters?: LayerFilter[];
}

// ── Layer ─────────────────────────────────────────────────────────────

export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    blendMode: string;
    position: { x: number; y: number };
    scale: { x: number; y: number };
    effects: LayerEffects;
    imageRef: string;
    order: number;
}

// ── Document data ────────────────────────────────────────────────────

export interface EditorData {
    layers: Layer[];
    selectedLayerId: string | null;
    canvasWidth: number;
    canvasHeight: number;
}

// ── Constants ────────────────────────────────────────────────────────

export const BLEND_MODES = [
    "source-over",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
] as const;

// ── Overlay params declaration merging ───────────────────────────────

declare module "@app/types" {
    interface OverlayParamsMap {
        "editor:delete-layer-confirm": { layerId: string; layerName: string };
    }
}
