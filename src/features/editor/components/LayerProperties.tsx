import { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import type { EditorData, Layer } from "../types";
import { OpacitySlider } from "./OpacitySlider";
import { BlendModeSelect } from "./BlendModeSelect";
import { TransformControls } from "./TransformControls";
import { ShadowControls } from "./ShadowControls";
import { FilterControls } from "./FilterControls";

export const LayerProperties = observer(function LayerProperties() {
  const root = useRootStore();
  const data = root.document.data as unknown as EditorData;
  const layer = data.layers.find(
    (l) => l.id === data.selectedLayerId,
  ) as Layer | undefined;

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const dispatch = root.commands.dispatch.bind(root.commands);

  const handleBack = useCallback(() => {
    dispatch("editor:selectLayer", { id: null });
  }, [dispatch]);

  if (!layer) return null;

  const id = layer.id;

  const handleStartRename = () => {
    setNameValue(layer.name);
    setEditingName(true);
  };

  const handleFinishRename = () => {
    setEditingName(false);
    if (nameValue.trim() && nameValue !== layer.name) {
      dispatch("editor:renameLayer", { id, name: nameValue.trim() });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          className="rounded px-1 py-0.5 text-xs text-gray-500 hover:bg-gray-100"
          title="Back to layer list"
        >
          &larr;
        </button>
        {editingName ? (
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleFinishRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFinishRename();
              if (e.key === "Escape") setEditingName(false);
            }}
            className="flex-1 rounded border border-blue-400 px-1 py-0.5 text-sm focus:outline-none"
            autoFocus
          />
        ) : (
          <span
            className="flex-1 cursor-pointer truncate text-sm font-medium"
            onDoubleClick={handleStartRename}
            title="Double-click to rename"
          >
            {layer.name}
          </span>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Opacity */}
      <OpacitySlider
        label="Opacity"
        value={layer.opacity}
        onChange={(opacity) => dispatch("editor:setOpacity", { id, opacity })}
      />

      {/* Blend Mode */}
      <BlendModeSelect
        value={layer.blendMode}
        onChange={(blendMode) =>
          dispatch("editor:setBlendMode", { id, blendMode })
        }
      />

      <hr className="border-gray-200" />

      {/* Transform */}
      <TransformControls
        position={layer.position}
        scale={layer.scale}
        onPositionChange={(x, y) =>
          dispatch("editor:moveLayer", { id, x, y })
        }
        onScaleChange={(x, y) =>
          dispatch("editor:scaleLayer", { id, x, y })
        }
      />

      <hr className="border-gray-200" />

      {/* Shadow */}
      <ShadowControls
        shadow={layer.effects.shadow}
        onChange={(shadow) => dispatch("editor:setShadow", { id, shadow })}
      />

      {/* Blur */}
      <OpacitySlider
        label="Blur"
        value={layer.effects.blur ?? 0}
        min={0}
        max={20}
        step={0.5}
        onChange={(blur) =>
          dispatch("editor:setBlur", { id, blur: blur || undefined })
        }
      />

      <hr className="border-gray-200" />

      {/* Filters */}
      <FilterControls
        filters={layer.effects.filters}
        onChange={(filters) =>
          dispatch("editor:applyFilter", { id, filters })
        }
      />

      <hr className="border-gray-200" />

      {/* Actions */}
      <div className="flex flex-wrap gap-1">
        <button
          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
          onClick={() => {
            const maxOrder = data.layers.reduce(
              (m, l) => Math.max(m, l.order),
              -1,
            );
            if (layer.order < maxOrder) {
              dispatch("editor:reorderLayer", {
                id,
                newOrder: layer.order + 1,
              });
            }
          }}
        >
          Bring Forward
        </button>
        <button
          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
          onClick={() => {
            if (layer.order > 0) {
              dispatch("editor:reorderLayer", {
                id,
                newOrder: layer.order - 1,
              });
            }
          }}
        >
          Send Back
        </button>
        <button
          className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
          onClick={() => dispatch("editor:duplicateLayer", { id })}
        >
          Duplicate
        </button>
        <button
          className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
          onClick={() => dispatch("editor:removeLayer", { id })}
        >
          Delete
        </button>
      </div>
    </div>
  );
});
