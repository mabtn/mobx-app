import { useEffect, useCallback, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";

/**
 * Renders the topmost modal from the overlay service using a native
 * dialog element with focus-trap and aria-modal behaviour.
 */
export const ModalHost = observer(function ModalHost() {
    const { overlays } = useRootStore();
    const top = overlays.modalStack.at(-1);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Keep the native <dialog> open state in sync
    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (top && !el.open) el.showModal();
        if (!top && el.open) el.close();
    }, [top]);

    const handleClose = useCallback(() => {
        if (top) overlays.close(top.id);
    }, [top, overlays]);

    if (!top) return null;

    const def = overlays.getDefinition(top.key);
    if (!def) return null;

    const Component = def.component;
    const dismissOnEsc = def.options?.dismissOnEsc ?? true;
    const dismissOnOutside = def.options?.dismissOnOutsideClick ?? true;

    return (
        <dialog
            ref={dialogRef}
            className="fixed left-1/2 top-1/2 z-[510] -translate-x-1/2 -translate-y-1/2
                 rounded-lg border border-gray-200 bg-white shadow-xl
                 backdrop:bg-black/40 backdrop:backdrop-blur-sm
                 focus:outline-none"
            style={{ width: top.size.width }}
            onCancel={(e) => {
                if (!dismissOnEsc) e.preventDefault();
                else handleClose();
            }}
            onClick={(e) => {
                if (dismissOnOutside && e.target === e.currentTarget) handleClose();
            }}
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
    );
});
