import { useCallback } from "react";
import type { LayerFilter } from "../types";
import { Slider } from "@core/ui";

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
                if (value === def?.default) {
                    next = current.filter((f) => f.property !== property);
                } else {
                    next = current.map((f) => (f.property === property ? { ...f, value } : f));
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
                <Slider
                    key={def.property}
                    label={def.label}
                    value={getValue(def.property)}
                    min={def.min}
                    max={def.max}
                    step={1}
                    onChange={(v) => handleChange(def.property, v)}
                    formatValue={(v) => String(v)}
                />
            ))}
        </div>
    );
}
