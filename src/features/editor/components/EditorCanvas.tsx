import { useEffect, useRef, useCallback } from "react";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import { imageCache } from "../ImageCache";
import type { EditorData, Layer } from "../types";

// ── Checkerboard pattern ─────────────────────────────────────────────

let checkerPattern: CanvasPattern | null = null;

function getCheckerPattern(ctx: CanvasRenderingContext2D): CanvasPattern {
    if (checkerPattern) return checkerPattern;
    const size = 16;
    const off = document.createElement("canvas");
    off.width = size * 2;
    off.height = size * 2;
    const oc = off.getContext("2d")!;
    oc.fillStyle = "#e0e0e0";
    oc.fillRect(0, 0, size * 2, size * 2);
    oc.fillStyle = "#ffffff";
    oc.fillRect(0, 0, size, size);
    oc.fillRect(size, size, size, size);
    checkerPattern = ctx.createPattern(off, "repeat")!;
    return checkerPattern;
}

// ── Rendering ────────────────────────────────────────────────────────

function renderCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layers: Layer[],
) {
    ctx.clearRect(0, 0, width, height);

    // Checkerboard background
    ctx.save();
    ctx.fillStyle = getCheckerPattern(ctx);
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // Sort layers by order (lowest first = bottom)
    const sorted = [...layers].sort((a, b) => a.order - b.order);

    for (const layer of sorted) {
        if (!layer.visible) continue;

        const img = imageCache.get(layer.imageRef);
        if (!img) continue;

        ctx.save();
        ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        ctx.globalAlpha = layer.opacity;

        // Position and scale
        ctx.translate(layer.position.x, layer.position.y);
        ctx.scale(layer.scale.x, layer.scale.y);

        // Build CSS filter string
        const filterParts: string[] = [];
        if (layer.effects.blur) {
            filterParts.push(`blur(${layer.effects.blur}px)`);
        }
        if (layer.effects.filters) {
            for (const f of layer.effects.filters) {
                filterParts.push(`${f.property}(${f.value}%)`);
            }
        }
        if (filterParts.length) {
            ctx.filter = filterParts.join(" ");
        }

        // Shadow
        if (layer.effects.shadow) {
            ctx.shadowColor = layer.effects.shadow.color;
            ctx.shadowOffsetX = layer.effects.shadow.offsetX;
            ctx.shadowOffsetY = layer.effects.shadow.offsetY;
            ctx.shadowBlur = layer.effects.shadow.blur;
        }

        ctx.drawImage(img, 0, 0);
        ctx.restore();
    }
}

// ── Hit testing ──────────────────────────────────────────────────────

function hitTest(x: number, y: number, layers: Layer[]): Layer | null {
    // Iterate in reverse order (top layer first)
    const sorted = [...layers].sort((a, b) => b.order - a.order);

    for (const layer of sorted) {
        if (!layer.visible) continue;
        const img = imageCache.get(layer.imageRef);
        if (!img) continue;

        const lx = (x - layer.position.x) / layer.scale.x;
        const ly = (y - layer.position.y) / layer.scale.y;

        if (lx >= 0 && lx < img.naturalWidth && ly >= 0 && ly < img.naturalHeight) {
            return layer;
        }
    }
    return null;
}

// ── Component ────────────────────────────────────────────────────────

export const EditorCanvas = observer(function EditorCanvas() {
    const root = useRootStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const data = root.document.data as unknown as EditorData;

    // MobX reaction → requestAnimationFrame redraw
    useEffect(() => {
        let rafId = 0;

        const dispose = reaction(
            () => {
                // Touch all observable properties that affect rendering
                const layers = data.layers;
                return layers.map((l) => ({
                    id: l.id,
                    visible: l.visible,
                    opacity: l.opacity,
                    blendMode: l.blendMode,
                    px: l.position.x,
                    py: l.position.y,
                    sx: l.scale.x,
                    sy: l.scale.y,
                    imageRef: l.imageRef,
                    order: l.order,
                    blur: l.effects.blur,
                    shadow: l.effects.shadow,
                    filters: l.effects.filters,
                }));
            },
            () => {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;
                    renderCanvas(ctx, data.canvasWidth, data.canvasHeight, data.layers);
                });
            },
            { fireImmediately: true },
        );

        return () => {
            dispose();
            cancelAnimationFrame(rafId);
        };
    }, [data]);

    // Click-to-select
    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = data.canvasWidth / rect.width;
            const scaleY = data.canvasHeight / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const hit = hitTest(x, y, data.layers);
            root.commands.dispatch("editor:selectLayer", { id: hit?.id ?? null });
        },
        [root, data],
    );

    return (
        <div
            ref={containerRef}
            className="flex flex-1 items-center justify-center overflow-auto bg-gray-100"
        >
            <canvas
                ref={canvasRef}
                width={data.canvasWidth}
                height={data.canvasHeight}
                onClick={handleClick}
                className="max-h-full max-w-full shadow-md"
                style={{ imageRendering: "auto" }}
            />
        </div>
    );
});
