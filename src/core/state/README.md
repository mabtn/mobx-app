# Document Store

## Overview

`DocumentStore` is a generic, domain-agnostic container for your application's
source-of-truth data. It holds a single `data` object and a map of **op
handlers** that know how to mutate that data in response to operations.

Feature modules register their own data slices and handlers at bootstrap time —
`DocumentStore` itself has no knowledge of your domain.

## Registering a document model

### 1. Define your data types

```ts
// features/todos/todosDocument.ts
export interface Todo {
    id: string;
    text: string;
    done: boolean;
}

export interface TodosData {
    todos: Todo[];
}
```

### 2. Create a registrar function

The registrar receives the `DocumentStore` instance, seeds initial data, and
registers one handler per op type. Handlers mutate `data` in place — they run
inside a MobX action automatically.

```ts
export function registerTodosDocument(doc: DocumentStore): void {
    // Seed initial data
    Object.assign(doc.data, { todos: [] } satisfies TodosData);

    // Register op handlers
    doc.registerHandler<Todo>("todos:add", (payload, data) => {
        data.todos.push(payload);
    });

    doc.registerHandler<{ id: string }>("todos:remove", (payload, data) => {
        data.todos = data.todos.filter((t: Todo) => t.id !== payload.id);
    });

    doc.registerHandler<{ id: string; done: boolean }>("todos:toggle", (payload, data) => {
        const todo = data.todos.find((t: Todo) => t.id === payload.id);
        if (todo) todo.done = payload.done;
    });
}
```

### 3. Wire it up in bootstrap

```ts
// app/bootstrap.ts
import { registerTodosDocument } from "@features/todos/todosDocument";

export function createRootStore(): RootStore {
    const root = new RootStore();
    registerTodosDocument(root.document);
    // ...
    return root;
}
```

## Op handlers

Each handler corresponds to one op type (`string`). An op is a plain
serializable object `{ type, payload }` — see `core/sync/Op.ts`.

```ts
doc.registerHandler<PayloadType>(opType, (payload, data) => {
    // mutate data in place
});
```

- Handlers are called inside `applyOp()` / `applyOps()`, which are MobX
  actions, so mutations are tracked and batched.
- `applyOps(ops)` wraps the entire batch in a single `runInAction`, so
  observers see one atomic update regardless of how many ops are in the batch.
- If no handler is registered for an op type, a warning is logged and the op
  is skipped.

## Reading data in components

Access `document.data` from any `observer` component via `useRootStore()`:

```tsx
const { document } = useRootStore();
const todos: Todo[] = document.data.todos ?? [];
```

## Commands produce ops

Commands are the intended way to mutate document state. A command's `toOps()`
returns `{ ops, inverseOps }` — the ops are applied via `DocumentStore.applyOps()`
and the inverse ops are stored in `HistoryStore` for undo. See
`core/commands/examples.md` for details.

## Multiple feature modules

Each feature owns a disjoint slice of `data`. Use namespaced keys or a top-level
property per feature to avoid collisions:

```ts
Object.assign(doc.data, { todos: [] }); // todos feature
Object.assign(doc.data, { canvas: {} }); // canvas feature
```

Op types should also be namespaced (e.g. `"todos:add"`, `"canvas:addShape"`)
to prevent handler conflicts.
