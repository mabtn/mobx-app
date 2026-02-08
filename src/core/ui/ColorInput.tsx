import { useCallback } from "react";

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    labelWidth?: string;
}

export function ColorInput({ label, value, onChange, labelWidth = "w-12" }: ColorInputProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange],
    );

    return (
        <label className="flex items-center gap-2 text-xs text-gray-700">
            <span className={`${labelWidth} shrink-0`}>{label}</span>
            <input type="color" value={value} onChange={handleChange} className="h-5 w-8" />
        </label>
    );
}
