import { useCallback } from "react";

interface NumberInputProps {
    label: string;
    value: number;
    step?: number;
    onChange: (value: number) => void;
    labelWidth?: string;
}

export function NumberInput({
    label,
    value,
    step = 1,
    onChange,
    labelWidth = "w-6",
}: NumberInputProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(v);
        },
        [onChange],
    );

    return (
        <label className="flex items-center gap-1 text-xs text-gray-700">
            <span className={`${labelWidth} shrink-0 text-gray-500`}>{label}</span>
            <input
                type="number"
                value={value}
                step={step}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-1 py-0.5 text-xs tabular-nums focus:border-blue-400 focus:outline-none"
            />
        </label>
    );
}
