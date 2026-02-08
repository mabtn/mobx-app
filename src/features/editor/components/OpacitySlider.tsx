import { useCallback } from "react";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export function OpacitySlider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange],
  );

  return (
    <label className="flex items-center gap-2 text-xs text-gray-700">
      <span className="w-16 shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="h-1 flex-1 accent-blue-500"
      />
      <span className="w-10 text-right tabular-nums">
        {max <= 1 ? `${Math.round(value * 100)}%` : value.toFixed(1)}
      </span>
    </label>
  );
}
