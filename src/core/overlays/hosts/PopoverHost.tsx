import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";

/**
 * Placeholder host for popovers.
 *
 * Popovers are typically anchored to a trigger element, so they are often
 * rendered inline via hooks. This host exists
 * as a fallback for "global" popovers managed through OverlayService.
 */
export const PopoverHost = observer(function PopoverHost() {
    const { overlays } = useRootStore();

    if (overlays.popovers.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[800]">
            {overlays.popovers.map((inst) => {
                const def = overlays.getDefinition(inst.key);
                if (!def) return null;
                const Component = def.component;

                return (
                    <div
                        key={inst.id}
                        className="pointer-events-auto absolute rounded-lg border border-gray-200 bg-white shadow-lg"
                        style={{
                            left: inst.position.x,
                            top: inst.position.y,
                            zIndex: inst.zIndex,
                            width: inst.size.width,
                        }}
                    >
                        <Component
                            instanceId={inst.id}
                            params={inst.params}
                            session={inst.session}
                            close={() => overlays.close(inst.id)}
                        />
                    </div>
                );
            })}
        </div>
    );
});
