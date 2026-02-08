import { makeAutoObservable } from "mobx";

export type ConnectionState = "disconnected" | "connecting" | "connected";

/**
 * Connection-level state for real-time collaboration.
 */
export class CollabStore {
    state: ConnectionState = "disconnected";
    latencyMs = 0;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setState(s: ConnectionState): void {
        this.state = s;
    }

    setLatency(ms: number): void {
        this.latencyMs = ms;
    }
}
