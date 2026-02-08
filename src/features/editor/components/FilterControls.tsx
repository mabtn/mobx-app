import { useCallback } from "react";
import type { LayerFilter } from "../types";

interface Props {
  filters: LayerFilter[] | undefined;
  onChange: (filters: LayerFilter[]) => void;
}

const FILTER_DEFS = [
  { property: "brightness", label: "Brightness", min: 0, max: 200, default: 100 },
  { property: "contrast", label: "Contrast", min: 0, max: 200, default: 100 },
  { property: "saturate", label: "Saturation", min: 0, max: 200, default: 100 },
  { property: "grayscale", label: "Grayscale", min: 0, max: 100, default: 0 },
  { property: "sepia", label: "Sepia", min: 0, max: 100, default: 0 },
  { property: "hue-rotate", label: "Hue Rotate", min: 0, max: 360, default: 0 },
] as const;

export function FilterControls({ filters, onChange }: Props) {
  const getValue = useCallback(
    (property: string) => {
      const f = filters?.find((f) => f.property === property);
      const def = FILTER_DEFS.find((d) => d.property === property);
      return f?.value ?? def?.default ?? 100;
    },
    [filters],
  );

  const handleChange = useCallback(
    (property: string, value: number) => {
      const current = filters ?? [];
      const existing = current.find((f) => f.property === property);
      const def = FILTER_DEFS.find((d) => d.property === property);

      let next: LayerFilter[];
      if (existing) {
        // If resetting to default, remove the filter
        if (value === def?.default) {
          next = current.filter((f) => f.property !== property);
        } else {
          next = current.map((f) =>
            f.property === property ? { ...f, value } : f,
          );
        }
      } else {
        if (value === def?.default) return;
        next = [...current, { property, value }];
      }

      onChange(next);
    },
    [filters, onChange],
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Filters</p>
      {FILTER_DEFS.map((def) => (
        <label
          key={def.property}
          className="flex items-center gap-2 text-xs text-gray-700"
        >
          <span className="w-16 shrink-0">{def.label}</span>
          <input
            type="range"
            min={def.min}
            max={def.max}
            value={getValue(def.property)}
            onChange={(e) =>
              handleChange(def.property, parseFloat(e.target.value))
            }
            className="h-1 flex-1 accent-blue-500"
          />
          <span className="w-10 text-right tabular-nums">
            {getValue(def.property)}
          </span>
        </label>
      ))}
    </div>
  );
}
