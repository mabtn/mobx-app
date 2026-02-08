import { ModalHost } from "../hosts/ModalHost";
import { ModelessHost } from "../hosts/ModelessHost";
import { PopoverHost } from "../hosts/PopoverHost";

/**
 * Mount this once at the app root to render all overlay layers.
 *
 * Layer order (lowest → highest z-index):
 *   1. Modeless windows  (z-100+)
 *   2. Modal dialogs     (z-500+)
 *   3. Popovers          (z-800+)
 */
export function OverlayBoundary() {
    return (
        <>
            <ModelessHost />
            <ModalHost />
            <PopoverHost />
        </>
    );
}
