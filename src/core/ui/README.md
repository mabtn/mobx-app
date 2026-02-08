# Core UI Components

Shared, styled UI primitives for building feature panels. Each component bakes in the
app's Tailwind styling so consumers don't repeat utility classes.

## Components

| Component     | Wraps                     | Key props                                                                         |
| ------------- | ------------------------- | --------------------------------------------------------------------------------- |
| `Button`      | `<button>`                | `variant?: "secondary" \| "primary" \| "danger"`, native button props             |
| `NumberInput` | `<input type="number">`   | `label`, `value`, `step`, `onChange(value: number)`, `labelWidth`                 |
| `Slider`      | `<input type="range">`    | `label`, `value`, `min`, `max`, `step`, `onChange(value: number)`, `formatValue?` |
| `Select`      | `<select>`                | `label`, `value`, `options: {value, label}[]`, `onChange(value: string)`          |
| `Checkbox`    | `<input type="checkbox">` | `label`, `checked`, `onChange(checked: boolean)`                                  |
| `ColorInput`  | `<input type="color">`    | `label`, `value`, `onChange(value: string)`, `labelWidth`                         |

## Usage

```tsx
import { Button, Slider, Select } from "@core/ui";

<Button variant="primary" onClick={handleSave}>Save</Button>
<Slider label="Opacity" value={0.5} onChange={setOpacity} />
<Select label="Mode" value={mode} options={options} onChange={setMode} />
```

## Extension points

To add a new component, create the file in `src/core/ui/`, then re-export it from `index.ts`.
