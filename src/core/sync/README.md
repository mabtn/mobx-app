# Sync Engine

## Overview

The sync subsystem provides a skeleton for real-time collaborative editing.
It is intentionally minimal — no OT/CRDT algorithm is implemented — but all
the wiring is in place so you can plug one in.

## Flow

1. **Command** produces `ops` via `toOps()` or `run()`.
2. **DocumentStore.applyOps()** applies them locally (optimistic).
3. **SyncEngine.enqueueLocal()** sends ops to the **Transport**.
4. Remote peers receive ops via transport, call `DocumentStore.applyOps()`.

## Presence

Presence data (cursors, selections) flows through a separate channel on the
transport and is stored in **PresenceStore**.

## Testing locally

The included `LoopbackTransport` echoes ops back after a 10 ms delay, which is
useful for testing the pipeline without a real server.

```ts
import { LoopbackTransport } from "@core/sync/Transport";
const transport = new LoopbackTransport();
```

## Integrating a real backend

1. Implement the `Transport` interface over WebSocket / HTTP / WebRTC.
2. Pass it to `SyncEngine` in `bootstrap.ts`.
3. Add OT/CRDT transformation in `SyncEngine.handleRemoteOps` as needed.
