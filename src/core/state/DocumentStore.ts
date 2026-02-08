import { makeAutoObservable, runInAction } from "mobx";
import type { Op } from "@core/sync/Op";

/**
 * Generic document state container.
 *
 * Holds the "source of truth" data and knows how to apply ops.
 * Feature modules extend this with domain-specific data and op handlers.
 */
export class DocumentStore {
    /** Application-specific data — features populate via `registerHandler`. */
    data: Record<string, any> = {};

    private handlers = new Map<string, (payload: any, data: Record<string, any>) => void>();

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    /** All registered op types. */
    get handlerTypes(): string[] {
        return [...this.handlers.keys()];
    }

    /**
     * Register a handler for a given op type.
     * The handler mutates `data` in place (inside a MobX action).
     */
    registerHandler<P>(
        type: string,
        handler: (payload: P, data: Record<string, any>) => void,
    ): void {
        this.handlers.set(type, handler);
    }

    /** Apply a single op. */
    applyOp(op: Op): void {
        const handler = this.handlers.get(op.type);
        if (!handler) {
            console.warn(`[DocumentStore] No handler for op type: ${op.type}`);
            return;
        }
        handler(op.payload, this.data);
    }

    /** Apply a batch of ops as a single MobX action (atomic update). */
    applyOps(ops: Op[]): void {
        runInAction(() => {
            for (const op of ops) this.applyOp(op);
        });
    }
}
