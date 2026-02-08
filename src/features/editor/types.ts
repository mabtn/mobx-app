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

export const EditorCmd = {
    LoadImage: "editor:loadImage",
    AddLayer: "editor:addLayer",
    RemoveLayer: "editor:removeLayer",
    DuplicateLayer: "editor:duplicateLayer",
    SelectLayer: "editor:selectLayer",
    ToggleVisibility: "editor:toggleVisibility",
    SetOpacity: "editor:setOpacity",
    SetBlendMode: "editor:setBlendMode",
    MoveLayer: "editor:moveLayer",
    ScaleLayer: "editor:scaleLayer",
    SetShadow: "editor:setShadow",
    SetBlur: "editor:setBlur",
    ApplyFilter: "editor:applyFilter",
    RenameLayer: "editor:renameLayer",
    ReorderLayer: "editor:reorderLayer",
} as const;

export const EditorOp = {
    LayerAdd: "editor:layer:add",
    LayerRemove: "editor:layer:remove",
    Select: "editor:select",
    SetVisible: "editor:layer:setVisible",
    SetOpacity: "editor:layer:setOpacity",
    SetBlendMode: "editor:layer:setBlendMode",
    SetPosition: "editor:layer:setPosition",
    SetScale: "editor:layer:setScale",
    SetName: "editor:layer:setName",
    SetOrder: "editor:layer:setOrder",
    SetShadow: "editor:layer:setShadow",
    SetBlur: "editor:layer:setBlur",
    SetFilters: "editor:layer:setFilters",
} as const;

export const EditorOverlay = {
    DeleteLayerConfirm: "editor:delete-layer-confirm",
} as const;

// ── Overlay params declaration merging ───────────────────────────────

declare module "@app/types" {
    interface OverlayParamsMap {
        [EditorOverlay.DeleteLayerConfirm]: { layerId: string; layerName: string };
    }
}
