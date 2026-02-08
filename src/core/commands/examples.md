# Commands — usage examples

## Registering a simple synchronous command (op-based)

```ts
import type { CommandDef } from "@core/commands/Command";

const incrementCmd: CommandDef<{ amount: number }> = {
    id: "counter:increment",
    title: "Increment counter",
    shortcut: "mod+up",
    toOps({ amount }, deps) {
        return {
            ops: [{ type: "counter:set", payload: { delta: amount } }],
            inverseOps: [{ type: "counter:set", payload: { delta: -amount } }],
        };
    },
};

deps.commands.register(incrementCmd);
```

## Dispatching a command

```ts
await deps.commands.dispatch("counter:increment", { amount: 1 });
```

## Async command with prepare + commit

```ts
const importDataCmd: CommandDef<{ url: string }> = {
    id: "data:import",
    title: "Import data",
    locks: ["document"],
    conflictPolicy: "reject",
    async run({ url }, deps, signal) {
        const res = await fetch(url, { signal });
        const data = await res.json();
        // commit inside runInAction happens in applyOps
        const ops = [{ type: "data:merge", payload: data }];
        deps.document.applyOps(ops);
        return { ops, inverseOps: [{ type: "data:clear", payload: {} }] };
    },
};
```

## Coalescing (merge key)

Commands with the same `mergeKey` that fire within 1 s are merged into a
single history entry:

```ts
const sliderCmd: CommandDef<{ value: number }> = {
    id: "slider:set",
    title: "Set slider",
    mergeKey: () => "slider",
    toOps: ({ value }, deps) => ({
        /* ... */
    }),
};
```

## Undo / Redo

```ts
deps.history.undo(); // applies inverseOps of the last record
deps.history.redo(); // re-applies ops
```
