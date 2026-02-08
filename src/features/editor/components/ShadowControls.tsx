import { useCallback } from "react";
import type { LayerShadow } from "../types";

interface Props {
  shadow: LayerShadow | undefined;
  onChange: (shadow: LayerShadow | undefined) => void;
}

const DEFAULT_SHADOW: LayerShadow = {
  color: "rgba(0,0,0,0.5)",
  offsetX: 4,
  offsetY: 4,
  blur: 8,
};

export function ShadowControls({ shadow, onChange }: Props) {
  const enabled = !!shadow;
  const s = shadow ?? DEFAULT_SHADOW;

  const handleToggle = useCallback(() => {
    onChange(enabled ? undefined : { ...DEFAULT_SHADOW });
  }, [enabled, onChange]);

  const handleChange = useCallback(
    (field: keyof LayerShadow, value: string | number) => {
      onChange({ ...s, [field]: value });
    },
    [s, onChange],
  );

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          className="accent-blue-500"
        />
        <span className="font-medium">Shadow</span>
      </label>
      {enabled && (
        <div className="space-y-1 pl-5">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <span className="w-12 shrink-0">Color</span>
            <input
              type="color"
              value={s.color.startsWith("rgba") ? "#000000" : s.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="h-5 w-8"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <span className="w-12 shrink-0">X off</span>
            <input
              type="number"
              value={s.offsetX}
              onChange={(e) => handleChange("offsetX", parseFloat(e.target.value))}
              className="w-full rounded border border-gray-300 px-1 py-0.5 text-xs focus:border-blue-400 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <span className="w-12 shrink-0">Y off</span>
            <input
              type="number"
              value={s.offsetY}
              onChange={(e) => handleChange("offsetY", parseFloat(e.target.value))}
              className="w-full rounded border border-gray-300 px-1 py-0.5 text-xs focus:border-blue-400 focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <span className="w-12 shrink-0">Blur</span>
            <input
              type="range"
              min={0}
              max={50}
              value={s.blur}
              onChange={(e) => handleChange("blur", parseFloat(e.target.value))}
              className="h-1 flex-1 accent-blue-500"
            />
            <span className="w-8 text-right tabular-nums">{s.blur}</span>
          </label>
        </div>
      )}
    </div>
  );
}
