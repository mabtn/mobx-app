import { useEffect, useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";

/**
 * Renders the topmost modal from the overlay service.
 *
 * Uses `dialog.show()` (not `showModal()`) so the dialog participates in
 * the normal CSS stacking context rather than the browser top-layer.
 * This allows modeless windows to render above modals via z-index.
 * A manual backdrop div provides the dimming overlay.
 */
export const ModalHost = observer(function ModalHost() {
    const { overlays } = useRootStore();
    const top = overlays.modalStack.at(-1);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Keep the native <dialog> open state in sync
    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (top && !el.open) el.show();
        if (!top && el.open) el.close();
    }, [top]);

    // Dismiss on Escape
    useEffect(() => {
        if (!top) return;
        const def = overlays.getDefinition(top.key);
        const dismissOnEsc = def?.options?.dismissOnEsc ?? true;
        if (!dismissOnEsc) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                overlays.close(top!.id);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [top, overlays]);

    const handleClose = useCallback(() => {
        if (top) overlays.close(top.id);
    }, [top, overlays]);

    if (!top) return null;

    const def = overlays.getDefinition(top.key);
    if (!def) return null;

    const Component = def.component;
    const dismissOnOutside = def.options?.dismissOnOutsideClick ?? true;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                style={{ zIndex: top.zIndex }}
                onClick={dismissOnOutside ? handleClose : undefined}
            />
            {/* Dialog */}
            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2
                     rounded-lg border border-gray-200 bg-white shadow-xl focus:outline-none"
                style={{ width: top.size.width, zIndex: top.zIndex + 1 }}
                onCancel={(e) => e.preventDefault()}
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                    <h2 className="text-sm font-semibold text-gray-700">{top.key}</h2>
                    <button
                        type="button"
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        onClick={handleClose}
                    >
                        &times;
                    </button>
                </div>
                <div className="p-4">
                    <Component
                        instanceId={top.id}
                        params={top.params}
                        session={top.session}
                        close={() => overlays.close(top.id)}
                    />
                </div>
            </dialog>
        </>
    );
});
