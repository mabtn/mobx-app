import { useCallback } from "react";

interface SelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    labelWidth?: string;
}

export function Select({ label, value, options, onChange, labelWidth = "w-16" }: SelectProps) {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange(e.target.value);
        },
        [onChange],
    );

    return (
        <label className="flex items-center gap-2 text-xs text-gray-700">
            <span className={`${labelWidth} shrink-0`}>{label}</span>
            <select
                value={value}
                onChange={handleChange}
                className="flex-1 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs focus:border-blue-400 focus:outline-none"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
}
