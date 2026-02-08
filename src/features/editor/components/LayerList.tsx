import { useRef, useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import { imageCache } from "../ImageCache";
import type { EditorData, Layer } from "../types";

// ── Thumbnail ────────────────────────────────────────────────────────

function LayerThumbnail({ layer }: { layer: Layer }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = imageCache.get(layer.imageRef);
        ctx.clearRect(0, 0, 40, 30);
        if (img) {
            const scale = Math.min(40 / img.naturalWidth, 30 / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;
            ctx.drawImage(img, (40 - w) / 2, (30 - h) / 2, w, h);
        }
    }, [layer.imageRef]);

    return (
        <canvas
            ref={canvasRef}
            width={40}
            height={30}
            className="shrink-0 rounded border border-gray-300 bg-white"
        />
    );
}

// ── Layer List ───────────────────────────────────────────────────────

export const LayerList = observer(function LayerList() {
    const root = useRootStore();
    const data = root.document.data as unknown as EditorData;
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // Sort layers by order (highest at top in the list)
    const sorted = [...data.layers].sort((a, b) => b.order - a.order);

    const handleSelect = useCallback(
        (id: string) => {
            root.commands.dispatch("editor:selectLayer", { id });
        },
        [root],
    );

    const handleToggleVisibility = useCallback(
        (e: React.MouseEvent, id: string) => {
            e.stopPropagation();
            root.commands.dispatch("editor:toggleVisibility", { id });
        },
        [root],
    );

    // ── Drag & Drop ─────────────────────────────────────────────────

    const dragSrcId = useRef<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        dragSrcId.current = id;
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverId(id);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverId(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetId: string) => {
            e.preventDefault();
            setDragOverId(null);
            const srcId = dragSrcId.current;
            if (!srcId || srcId === targetId) return;

            const target = data.layers.find((l) => l.id === targetId);
            if (!target) return;

            root.commands.dispatch("editor:reorderLayer", {
                id: srcId,
                newOrder: target.order,
            });
        },
        [root, data.layers],
    );

    const handleDragEnd = useCallback(() => {
        dragSrcId.current = null;
        setDragOverId(null);
    }, []);

    return (
        <div className="flex flex-col gap-1">
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Layers
            </h3>
            {sorted.map((layer) => (
                <div
                    key={layer.id}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${
                        data.selectedLayerId === layer.id
                            ? "bg-blue-100 text-blue-800"
                            : "hover:bg-gray-100"
                    } ${dragOverId === layer.id ? "ring-2 ring-blue-400" : ""}`}
                    onClick={() => handleSelect(layer.id)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, layer.id)}
                    onDragOver={(e) => handleDragOver(e, layer.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, layer.id)}
                    onDragEnd={handleDragEnd}
                >
                    <LayerThumbnail layer={layer} />
                    <span className="flex-1 truncate">{layer.name}</span>
                    <button
                        className={`shrink-0 px-1 text-xs ${
                            layer.visible ? "text-gray-600" : "text-gray-300"
                        } hover:text-gray-800`}
                        onClick={(e) => handleToggleVisibility(e, layer.id)}
                        title={layer.visible ? "Hide" : "Show"}
                    >
                        {layer.visible ? "👁" : "—"}
                    </button>
                </div>
            ))}
            {sorted.length === 0 && (
                <p className="px-2 py-4 text-center text-xs text-gray-400">
                    No layers yet. Load an image to begin.
                </p>
            )}
        </div>
    );
});
