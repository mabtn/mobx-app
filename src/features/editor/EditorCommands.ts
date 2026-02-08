import type { CommandDef } from "@core/commands/Command";
import type { CommandStore } from "@core/commands/CommandStore";
import { generateId } from "@core/utils/id";
import { imageCache } from "./ImageCache";
import type { EditorData, Layer } from "./types";
import { EditorCmd, EditorOp } from "./types";

function ed(deps: { document: { data: Record<string, any> } }): EditorData {
    return deps.document.data as unknown as EditorData;
}

function findLayer(
    deps: { document: { data: Record<string, any> } },
    id: string,
): Layer | undefined {
    return ed(deps).layers.find((l) => l.id === id);
}

// ── Load Image (async — opens file picker) ───────────────────────────

const loadImageCmd: CommandDef = {
    id: EditorCmd.LoadImage,
    title: "Load Image",
    locks: ["editor-load"],
    conflictPolicy: "reject",
    async run(_params, deps) {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        const file = await new Promise<File | null>((resolve) => {
            input.onchange = () => resolve(input.files?.[0] ?? null);
            // If user cancels the picker, resolve null after a delay
            const checkCancel = () => {
                setTimeout(() => {
                    if (!input.files?.length) resolve(null);
                }, 500);
            };
            window.addEventListener("focus", checkCancel, { once: true });
            input.click();
        });

        if (!file) return;

        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });

        const ref = generateId("img");
        await imageCache.load(ref, dataUrl);

        const img = imageCache.get(ref)!;
        const maxOrder = ed(deps).layers.reduce((m, l) => Math.max(m, l.order), -1);
        const layer: Layer = {
            id: generateId("layer"),
            name: file.name.replace(/\.[^.]+$/, ""),
            visible: true,
            opacity: 1,
            blendMode: "source-over",
            position: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            effects: {},
            imageRef: ref,
            order: maxOrder + 1,
        };

        // Resize canvas if the image is larger
        const d = ed(deps);
        const newWidth = Math.max(d.canvasWidth, img.naturalWidth);
        const newHeight = Math.max(d.canvasHeight, img.naturalHeight);
        d.canvasWidth = newWidth;
        d.canvasHeight = newHeight;

        deps.document.applyOps([
            { type: EditorOp.LayerAdd, payload: { layer, dataUrl } },
            { type: EditorOp.Select, payload: { id: layer.id } },
        ]);

        return {
            ops: [
                { type: EditorOp.LayerAdd, payload: { layer, dataUrl } },
                { type: EditorOp.Select, payload: { id: layer.id } },
            ],
            inverseOps: [
                { type: EditorOp.Select, payload: { id: d.selectedLayerId } },
                { type: EditorOp.LayerRemove, payload: { id: layer.id } },
            ],
        };
    },
};

// ── Add Layer (sync, used internally) ────────────────────────────────

const addLayerCmd: CommandDef<{ layer: Layer; dataUrl?: string }> = {
    id: EditorCmd.AddLayer,
    title: "Add Layer",
    toOps({ layer, dataUrl }, deps) {
        const prevSelected = ed(deps).selectedLayerId;
        return {
            ops: [
                { type: EditorOp.LayerAdd, payload: { layer, dataUrl } },
                { type: EditorOp.Select, payload: { id: layer.id } },
            ],
            inverseOps: [
                { type: EditorOp.Select, payload: { id: prevSelected } },
                { type: EditorOp.LayerRemove, payload: { id: layer.id } },
            ],
        };
    },
};

// ── Remove Layer ─────────────────────────────────────────────────────

const removeLayerCmd: CommandDef<{ id: string }> = {
    id: EditorCmd.RemoveLayer,
    title: "Remove Layer",
    toOps({ id }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };

        const dataUrl = imageCache.toDataUrl(layer.imageRef) ?? undefined;
        const prevSelected = ed(deps).selectedLayerId;

        return {
            ops: [
                { type: EditorOp.Select, payload: { id: null } },
                { type: EditorOp.LayerRemove, payload: { id } },
            ],
            inverseOps: [
                { type: EditorOp.LayerAdd, payload: { layer: { ...layer }, dataUrl } },
                { type: EditorOp.Select, payload: { id: prevSelected } },
            ],
        };
    },
};

// ── Duplicate Layer ──────────────────────────────────────────────────

const duplicateLayerCmd: CommandDef<{ id: string }> = {
    id: EditorCmd.DuplicateLayer,
    title: "Duplicate Layer",
    toOps({ id }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };

        const newId = generateId("layer");
        const newRef = generateId("img");
        const maxOrder = ed(deps).layers.reduce((m, l) => Math.max(m, l.order), -1);

        // Copy the image in the cache
        const existing = imageCache.get(layer.imageRef);
        if (existing) imageCache.set(newRef, existing);

        const dataUrl = imageCache.toDataUrl(layer.imageRef) ?? undefined;
        const newLayer: Layer = {
            ...layer,
            id: newId,
            name: `${layer.name} copy`,
            imageRef: newRef,
            order: maxOrder + 1,
            position: { x: layer.position.x + 20, y: layer.position.y + 20 },
            effects: { ...layer.effects },
        };

        const prevSelected = ed(deps).selectedLayerId;

        return {
            ops: [
                { type: EditorOp.LayerAdd, payload: { layer: newLayer, dataUrl } },
                { type: EditorOp.Select, payload: { id: newId } },
            ],
            inverseOps: [
                { type: EditorOp.Select, payload: { id: prevSelected } },
                { type: EditorOp.LayerRemove, payload: { id: newId } },
            ],
        };
    },
};

// ── Select Layer ─────────────────────────────────────────────────────

const selectLayerCmd: CommandDef<{ id: string | null }> = {
    id: EditorCmd.SelectLayer,
    title: "Select Layer",
    toOps({ id }, deps) {
        const prev = ed(deps).selectedLayerId;
        return {
            ops: [{ type: EditorOp.Select, payload: { id } }],
            inverseOps: [{ type: EditorOp.Select, payload: { id: prev } }],
        };
    },
};

// ── Toggle Visibility ────────────────────────────────────────────────

const toggleVisibilityCmd: CommandDef<{ id: string }> = {
    id: EditorCmd.ToggleVisibility,
    title: "Toggle Layer Visibility",
    toOps({ id }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetVisible, payload: { id, visible: !layer.visible } }],
            inverseOps: [
                { type: EditorOp.SetVisible, payload: { id, visible: layer.visible } },
            ],
        };
    },
};

// ── Set Opacity ──────────────────────────────────────────────────────

const setOpacityCmd: CommandDef<{ id: string; opacity: number }> = {
    id: EditorCmd.SetOpacity,
    title: "Set Opacity",
    toOps({ id, opacity }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetOpacity, payload: { id, opacity } }],
            inverseOps: [
                { type: EditorOp.SetOpacity, payload: { id, opacity: layer.opacity } },
            ],
        };
    },
    mergeKey({ id }) {
        return `editor:setOpacity:${id}`;
    },
};

// ── Set Blend Mode ───────────────────────────────────────────────────

const setBlendModeCmd: CommandDef<{ id: string; blendMode: string }> = {
    id: EditorCmd.SetBlendMode,
    title: "Set Blend Mode",
    toOps({ id, blendMode }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetBlendMode, payload: { id, blendMode } }],
            inverseOps: [
                { type: EditorOp.SetBlendMode, payload: { id, blendMode: layer.blendMode } },
            ],
        };
    },
};

// ── Move Layer (position) ────────────────────────────────────────────

const moveLayerCmd: CommandDef<{ id: string; x: number; y: number }> = {
    id: EditorCmd.MoveLayer,
    title: "Move Layer",
    toOps({ id, x, y }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetPosition, payload: { id, x, y } }],
            inverseOps: [
                {
                    type: EditorOp.SetPosition,
                    payload: { id, x: layer.position.x, y: layer.position.y },
                },
            ],
        };
    },
    mergeKey({ id }) {
        return `editor:moveLayer:${id}`;
    },
};

// ── Scale Layer ──────────────────────────────────────────────────────

const scaleLayerCmd: CommandDef<{ id: string; x: number; y: number }> = {
    id: EditorCmd.ScaleLayer,
    title: "Scale Layer",
    toOps({ id, x, y }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetScale, payload: { id, x, y } }],
            inverseOps: [
                {
                    type: EditorOp.SetScale,
                    payload: { id, x: layer.scale.x, y: layer.scale.y },
                },
            ],
        };
    },
    mergeKey({ id }) {
        return `editor:scaleLayer:${id}`;
    },
};

// ── Set Shadow ───────────────────────────────────────────────────────

const setShadowCmd: CommandDef<{ id: string; shadow: Layer["effects"]["shadow"] }> = {
    id: EditorCmd.SetShadow,
    title: "Set Shadow",
    toOps({ id, shadow }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetShadow, payload: { id, shadow } }],
            inverseOps: [
                { type: EditorOp.SetShadow, payload: { id, shadow: layer.effects.shadow } },
            ],
        };
    },
    mergeKey({ id }) {
        return `editor:setShadow:${id}`;
    },
};

// ── Set Blur ─────────────────────────────────────────────────────────

const setBlurCmd: CommandDef<{ id: string; blur: number | undefined }> = {
    id: EditorCmd.SetBlur,
    title: "Set Blur",
    toOps({ id, blur }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetBlur, payload: { id, blur } }],
            inverseOps: [
                { type: EditorOp.SetBlur, payload: { id, blur: layer.effects.blur } },
            ],
        };
    },
    mergeKey({ id }) {
        return `editor:setBlur:${id}`;
    },
};

// ── Apply Filter ─────────────────────────────────────────────────────

const applyFilterCmd: CommandDef<{ id: string; filters: Layer["effects"]["filters"] }> = {
    id: EditorCmd.ApplyFilter,
    title: "Apply Filter",
    toOps({ id, filters }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetFilters, payload: { id, filters } }],
            inverseOps: [
                {
                    type: EditorOp.SetFilters,
                    payload: { id, filters: layer.effects.filters },
                },
            ],
        };
    },
    mergeKey({ id }) {
        return `editor:applyFilter:${id}`;
    },
};

// ── Rename Layer ─────────────────────────────────────────────────────

const renameLayerCmd: CommandDef<{ id: string; name: string }> = {
    id: EditorCmd.RenameLayer,
    title: "Rename Layer",
    toOps({ id, name }, deps) {
        const layer = findLayer(deps, id);
        if (!layer) return { ops: [], inverseOps: [] };
        return {
            ops: [{ type: EditorOp.SetName, payload: { id, name } }],
            inverseOps: [{ type: EditorOp.SetName, payload: { id, name: layer.name } }],
        };
    },
};

// ── Reorder Layer ────────────────────────────────────────────────────

const reorderLayerCmd: CommandDef<{ id: string; newOrder: number }> = {
    id: EditorCmd.ReorderLayer,
    title: "Reorder Layer",
    toOps({ id, newOrder }, deps) {
        const layers = ed(deps).layers;
        const layer = layers.find((l) => l.id === id);
        if (!layer) return { ops: [], inverseOps: [] };

        const oldOrder = layer.order;
        if (oldOrder === newOrder) return { ops: [], inverseOps: [] };

        const ops: { type: string; payload: any }[] = [];
        const inverseOps: { type: string; payload: any }[] = [];

        // Shift intermediate layers
        for (const l of layers) {
            if (l.id === id) continue;
            let shifted = l.order;
            if (oldOrder < newOrder) {
                // Moving up: shift layers in (oldOrder, newOrder] down by 1
                if (l.order > oldOrder && l.order <= newOrder) shifted = l.order - 1;
            } else {
                // Moving down: shift layers in [newOrder, oldOrder) up by 1
                if (l.order >= newOrder && l.order < oldOrder) shifted = l.order + 1;
            }
            if (shifted !== l.order) {
                ops.push({ type: EditorOp.SetOrder, payload: { id: l.id, order: shifted } });
                inverseOps.push({
                    type: EditorOp.SetOrder,
                    payload: { id: l.id, order: l.order },
                });
            }
        }

        ops.push({ type: EditorOp.SetOrder, payload: { id, order: newOrder } });
        inverseOps.push({ type: EditorOp.SetOrder, payload: { id, order: oldOrder } });

        return { ops, inverseOps };
    },
};

// ── Registration ─────────────────────────────────────────────────────

export function registerEditorCommands(commands: CommandStore): void {
    commands.register(loadImageCmd);
    commands.register(addLayerCmd);
    commands.register(removeLayerCmd);
    commands.register(duplicateLayerCmd);
    commands.register(selectLayerCmd);
    commands.register(toggleVisibilityCmd);
    commands.register(setOpacityCmd);
    commands.register(setBlendModeCmd);
    commands.register(moveLayerCmd);
    commands.register(scaleLayerCmd);
    commands.register(setShadowCmd);
    commands.register(setBlurCmd);
    commands.register(applyFilterCmd);
    commands.register(renameLayerCmd);
    commands.register(reorderLayerCmd);
}
