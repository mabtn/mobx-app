import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import { DraggableWindowFrame } from "../components/DraggableWindowFrame";

/**
 * Renders all modeless (non-modal) windows.
 *
 * Each window is a plain div with `role="dialog"` (provided by
 * DraggableWindowFrame) so it doesn't trap focus globally.
 * Clicking inside a window brings it to the front.
 */
export const ModelessHost = observer(function ModelessHost() {
    const { overlays } = useRootStore();

    return (
        <>
            {overlays.modelessWindows.map((inst) => {
                const def = overlays.getDefinition(inst.key);
                if (!def) return null;
                const Component = def.component;

                return (
                    <DraggableWindowFrame
                        key={inst.id}
                        title={inst.key}
                        width={inst.size.width}
                        height={inst.size.height}
                        x={inst.position.x}
                        y={inst.position.y}
                        zIndex={inst.zIndex}
                        onClose={() => overlays.close(inst.id)}
                        onPointerDown={() => overlays.bringToFront(inst.id)}
                        onMove={(x, y) => overlays.setPosition(inst.id, x, y)}
                    >
                        <Component
                            instanceId={inst.id}
                            params={inst.params}
                            session={inst.session}
                            close={() => overlays.close(inst.id)}
                        />
                    </DraggableWindowFrame>
                );
            })}
        </>
    );
});
