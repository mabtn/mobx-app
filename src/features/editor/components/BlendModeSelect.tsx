import { useCallback } from "react";
import { BLEND_MODES } from "../types";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function BlendModeSelect({ value, onChange }: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <label className="flex items-center gap-2 text-xs text-gray-700">
      <span className="w-16 shrink-0">Blend</span>
      <select
        value={value}
        onChange={handleChange}
        className="flex-1 rounded border border-gray-300 bg-white px-1 py-0.5 text-xs focus:border-blue-400 focus:outline-none"
      >
        {BLEND_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
    </label>
  );
}
