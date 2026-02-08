import { useCallback } from "react";

interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
    const handleChange = useCallback(() => {
        onChange(!checked);
    }, [checked, onChange]);

    return (
        <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className="accent-blue-500"
            />
            <span className="font-medium">{label}</span>
        </label>
    );
}
