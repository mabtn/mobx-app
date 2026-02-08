import { useCallback } from "react";
import type { LayerShadow } from "../types";
import { Checkbox, ColorInput, NumberInput, Slider } from "@core/ui";

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

    const handleToggle = useCallback(
        (checked: boolean) => {
            onChange(checked ? { ...DEFAULT_SHADOW } : undefined);
        },
        [onChange],
    );

    const handleChange = useCallback(
        (field: keyof LayerShadow, value: string | number) => {
            onChange({ ...s, [field]: value });
        },
        [s, onChange],
    );

    return (
        <div className="space-y-2">
            <Checkbox label="Shadow" checked={enabled} onChange={handleToggle} />
            {enabled && (
                <div className="space-y-1 pl-5">
                    <ColorInput
                        label="Color"
                        value={s.color.startsWith("rgba") ? "#000000" : s.color}
                        onChange={(v) => handleChange("color", v)}
                    />
                    <NumberInput
                        label="X off"
                        value={s.offsetX}
                        onChange={(v) => handleChange("offsetX", v)}
                        labelWidth="w-12"
                    />
                    <NumberInput
                        label="Y off"
                        value={s.offsetY}
                        onChange={(v) => handleChange("offsetY", v)}
                        labelWidth="w-12"
                    />
                    <Slider
                        label="Blur"
                        value={s.blur}
                        min={0}
                        max={50}
                        step={1}
                        onChange={(v) => handleChange("blur", v)}
                        formatValue={(v) => String(v)}
                        labelWidth="w-12"
                    />
                </div>
            )}
        </div>
    );
}
