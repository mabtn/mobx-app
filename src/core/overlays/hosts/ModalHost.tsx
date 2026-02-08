import { observer } from "mobx-react-lite";
import { Dialog, DialogHeading, DialogDismiss } from "@ariakit/react/dialog";
import { useRootStore } from "@app/RootProvider";

/**
 * Renders the topmost modal from the overlay service using Ariakit Dialog
 * with focus-trap and aria-modal behaviour.
 */
export const ModalHost = observer(function ModalHost() {
    const { overlays } = useRootStore();
    const top = overlays.modalStack.at(-1);

    if (!top) return null;

    const def = overlays.getDefinition(top.key);
    if (!def) return null;

    const Component = def.component;
    const dismissOnEsc = def.options?.dismissOnEsc ?? true;
    const dismissOnOutside = def.options?.dismissOnOutsideClick ?? true;

    return (
        <Dialog
            open
            onClose={() => {
                overlays.close(top.id);
            }}
            modal
            backdrop={<div className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm" />}
            hideOnEscape={dismissOnEsc}
            hideOnInteractOutside={dismissOnOutside}
            className="fixed left-1/2 top-1/2 z-[510] -translate-x-1/2 -translate-y-1/2
                 rounded-lg border border-gray-200 bg-white shadow-xl
                 focus:outline-none"
            style={{ width: top.size.width }}
        >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
                <DialogHeading className="text-sm font-semibold text-gray-700">
                    {top.key}
                </DialogHeading>
                <DialogDismiss className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    &times;
                </DialogDismiss>
            </div>
            <div className="p-4">
                <Component
                    instanceId={top.id}
                    params={top.params}
                    session={top.session}
                    close={() => overlays.close(top.id)}
                />
            </div>
        </Dialog>
    );
});
