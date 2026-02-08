import { NumberInput } from "@core/ui";

interface Props {
    position: { x: number; y: number };
    scale: { x: number; y: number };
    onPositionChange: (x: number, y: number) => void;
    onScaleChange: (x: number, y: number) => void;
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
