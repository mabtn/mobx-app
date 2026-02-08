import type { OverlayComponentProps } from "@core/overlays/OverlayTypes";
import type { OverlayRegistry } from "@core/overlays/OverlayRegistry";
import { useRootStore } from "@app/RootProvider";
import { Button } from "@core/ui";

// ── Modal: Delete layer confirmation ─────────────────────────────────

function DeleteLayerConfirm({
    params,
    close,
}: OverlayComponentProps<{ layerId: string; layerName: string }>) {
    const root = useRootStore();

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Delete layer &ldquo;{params.layerName}&rdquo;? This action can be undone.
            </p>
            <div className="flex justify-end gap-2">
                <Button onClick={close}>Cancel</Button>
                <Button
                    variant="danger"
                    onClick={() => {
                        root.commands.dispatch("editor:removeLayer", { id: params.layerId });
                        close();
                    }}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}

// ── Registration ─────────────────────────────────────────────────────

export function registerEditorOverlays(registry: OverlayRegistry): void {
    registry.register({
        key: "editor:delete-layer-confirm",
        kind: "modal",
        component: DeleteLayerConfirm,
        options: {
            dismissOnEsc: true,
            dismissOnOutsideClick: false,
            defaultWidth: 340,
        },
    });
}
