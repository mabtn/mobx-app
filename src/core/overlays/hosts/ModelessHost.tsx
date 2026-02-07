import { observer } from "mobx-react-lite";
import { Dialog } from "@ariakit/react/dialog";
import { useRootStore } from "@app/RootProvider";
import { DraggableWindowFrame } from "../components/DraggableWindowFrame";

/**
 * Renders all modeless (non-modal) windows.
 *
 * Each window uses Ariakit Dialog with `modal={false}` so it doesn't trap
 * focus globally. Clicking inside a window brings it to the front.
 */
export const ModelessHost = observer(function ModelessHost() {
  const { overlays } = useRootStore();

  return (
    <>
      {overlays.modelessWindows.map((inst) => {
        const def = overlays.getDefinition(inst.key);
        if (!def) return null;
        const Component = def.component;
        const dismissOnEsc = def.options?.dismissOnEsc ?? false;

        return (
          <Dialog
            key={inst.id}
            open
            onClose={() => overlays.close(inst.id)}
            modal={false}
            hideOnEscape={dismissOnEsc}
            hideOnInteractOutside={false}
            autoFocusOnShow={false}
            className="contents"
            render={<div />}
          >
            <DraggableWindowFrame
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
          </Dialog>
        );
      })}
    </>
  );
});
