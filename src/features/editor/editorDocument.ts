import type { DocumentStore } from "@core/state/DocumentStore";
import type { EditorData, Layer, LayerShadow, LayerFilter } from "./types";
import { imageCache } from "./ImageCache";
import backgroundUrl from "./assets/sample.png";
import aereoUrl from "./assets/aereo.webp";
import { generateId } from "@core/utils/id";

// ── Initial state ────────────────────────────────────────────────────

const INITIAL_DATA: EditorData = {
    layers: [],
    selectedLayerId: null,
    canvasWidth: 800,
    canvasHeight: 600,
};

// ── Typed data accessor ──────────────────────────────────────────────

function ed(data: Record<string, any>): EditorData {
    return data as unknown as EditorData;
}

// ── Registration ─────────────────────────────────────────────────────

export function registerEditorDocument(doc: DocumentStore): void {
    Object.assign(doc.data, INITIAL_DATA);

    // ── Layer CRUD ───────────────────────────────────────────────────

    doc.registerHandler<{ layer: Layer; dataUrl?: string }>("editor:layer:add", (payload, data) => {
        ed(data).layers.push(payload.layer);
        // Populate image cache from payload (for undo reconstruction)
        if (payload.dataUrl) {
            imageCache.load(payload.layer.imageRef, payload.dataUrl);
        }
    });

    doc.registerHandler<{ id: string }>("editor:layer:remove", (payload, data) => {
        const d = ed(data);
        d.layers = d.layers.filter((l) => l.id !== payload.id);
        if (d.selectedLayerId === payload.id) {
            d.selectedLayerId = null;
        }
    });

    // ── Selection ────────────────────────────────────────────────────

    doc.registerHandler<{ id: string | null }>("editor:select", (payload, data) => {
        ed(data).selectedLayerId = payload.id;
    });

    // ── Property setters ─────────────────────────────────────────────

    doc.registerHandler<{ id: string; visible: boolean }>(
        "editor:layer:setVisible",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.visible = payload.visible;
        },
    );

    doc.registerHandler<{ id: string; opacity: number }>(
        "editor:layer:setOpacity",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.opacity = payload.opacity;
        },
    );

    doc.registerHandler<{ id: string; blendMode: string }>(
        "editor:layer:setBlendMode",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.blendMode = payload.blendMode;
        },
    );

    doc.registerHandler<{ id: string; x: number; y: number }>(
        "editor:layer:setPosition",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.position = { x: payload.x, y: payload.y };
        },
    );

    doc.registerHandler<{ id: string; x: number; y: number }>(
        "editor:layer:setScale",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.scale = { x: payload.x, y: payload.y };
        },
    );

    doc.registerHandler<{ id: string; name: string }>("editor:layer:setName", (payload, data) => {
        const layer = ed(data).layers.find((l) => l.id === payload.id);
        if (layer) layer.name = payload.name;
    });

    doc.registerHandler<{ id: string; order: number }>("editor:layer:setOrder", (payload, data) => {
        const layer = ed(data).layers.find((l) => l.id === payload.id);
        if (layer) layer.order = payload.order;
    });

    // ── Effects setters ──────────────────────────────────────────────

    doc.registerHandler<{ id: string; shadow: LayerShadow | undefined }>(
        "editor:layer:setShadow",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.effects.shadow = payload.shadow;
        },
    );

    doc.registerHandler<{ id: string; blur: number | undefined }>(
        "editor:layer:setBlur",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.effects.blur = payload.blur;
        },
    );

    doc.registerHandler<{ id: string; filters: LayerFilter[] | undefined }>(
        "editor:layer:setFilters",
        (payload, data) => {
            const layer = ed(data).layers.find((l) => l.id === payload.id);
            if (layer) layer.effects.filters = payload.filters;
        },
    );
}

// ── Sample image initialiser ─────────────────────────────────────────

export async function initEditorSampleLayers(doc: DocumentStore): Promise<void> {
    // Fetch the bundled sample image and convert to data URL
    const backgroundDataUrl = await loadImageAsDataUrl(backgroundUrl);
    const aereoDataUrl = await loadImageAsDataUrl(aereoUrl);

    const backgroundImageRef = generateId("img");
    await imageCache.load(backgroundImageRef, backgroundDataUrl);
    const backgroundImg = imageCache.get(backgroundImageRef)!;
    const backgroundLayer: Layer = {
        id: generateId("layer"),
        name: "Background",
        visible: true,
        opacity: 1,
        blendMode: "source-over",
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        effects: {},
        imageRef: backgroundImageRef,
        order: 0,
    };

    const aereoImageRef = generateId("img");
    await imageCache.load(aereoImageRef, aereoDataUrl);
    const aereoLayer: Layer = {
        id: generateId("layer"),
        name: "Aereo",
        visible: true,
        opacity: 1,
        blendMode: "source-over",
        position: { x: 100, y: 100 },
        scale: { x: 1, y: 1 },
        effects: {},
        imageRef: aereoImageRef,
        order: 1,
    };

    // Resize canvas to match image
    doc.applyOps([{ type: "editor:layer:add", payload: { layer: backgroundLayer, dataUrl: backgroundDataUrl } }]);
    doc.applyOps([{ type: "editor:layer:add", payload: { layer: aereoLayer, dataUrl: aereoDataUrl } }]);

    // Update canvas size to match image dimensions
    const d = ed(doc.data);
    d.canvasWidth = backgroundImg.naturalWidth;
    d.canvasHeight = backgroundImg.naturalHeight;
}

async function loadImageAsDataUrl(url: string): Promise<string> {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}
