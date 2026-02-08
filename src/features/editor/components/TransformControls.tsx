import { useCallback } from "react";

interface Props {
    position: { x: number; y: number };
    scale: { x: number; y: number };
    onPositionChange: (x: number, y: number) => void;
    onScaleChange: (x: number, y: number) => void;
}

function NumberInput({
    label,
    value,
    step,
    onChange,
}: {
    label: string;
    value: number;
    step?: number;
    onChange: (v: number) => void;
}) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
        },
        [onChange],
    );

    return (
        <label className="flex items-center gap-1 text-xs text-gray-700">
            <span className="w-6 shrink-0 text-gray-500">{label}</span>
            <input
                type="number"
                value={value}
                step={step ?? 1}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-1 py-0.5 text-xs tabular-nums focus:border-blue-400 focus:outline-none"
            />
        </label>
    );
}

export function TransformControls({ position, scale, onPositionChange, onScaleChange }: Props) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Position</p>
            <div className="grid grid-cols-2 gap-2">
                <NumberInput
                    label="X"
                    value={position.x}
                    onChange={(v) => onPositionChange(v, position.y)}
                />
                <NumberInput
                    label="Y"
                    value={position.y}
                    onChange={(v) => onPositionChange(position.x, v)}
                />
            </div>
            <p className="text-xs font-medium text-gray-500">Scale</p>
            <div className="grid grid-cols-2 gap-2">
                <NumberInput
                    label="X"
                    value={scale.x}
                    step={0.1}
                    onChange={(v) => onScaleChange(v, scale.y)}
                />
                <NumberInput
                    label="Y"
                    value={scale.y}
                    step={0.1}
                    onChange={(v) => onScaleChange(scale.x, v)}
                />
            </div>
        </div>
    );
}
