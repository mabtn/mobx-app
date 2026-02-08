import { makeAutoObservable, runInAction } from "mobx";
import type { Op } from "@core/sync/Op";
import type { DocumentStore } from "@core/state/DocumentStore";

// ── History record ────────────────────────────────────────────────────

export interface HistoryRecord {
    commandId: string;
    ops: Op[];
    inverseOps: Op[];
    timestamp: number;
    mergeKey: string | null;
}

/** Window (ms) within which records with the same mergeKey are coalesced. */
const COALESCE_WINDOW = 1000;

/**
 * Undo/redo stack based on inverse operations (not snapshots).
 */
export class HistoryStore {
    undoStack: HistoryRecord[] = [];
    redoStack: HistoryRecord[] = [];
    /** When true, undo/redo is suspended (e.g. async command mid-commit). */
    locked = false;

    private document!: DocumentStore;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    init(document: DocumentStore): void {
        this.document = document;
    }

    // ── Queries ─────────────────────────────────────────────────────────

    get canUndo(): boolean {
        return !this.locked && this.undoStack.length > 0;
    }

    get canRedo(): boolean {
        return !this.locked && this.redoStack.length > 0;
    }

    // ── Mutators ────────────────────────────────────────────────────────

    push(record: Omit<HistoryRecord, "timestamp">): void {
        const now = Date.now();
        const top = this.undoStack.at(-1);

        // Coalesce with previous record if same mergeKey within window
        if (
            record.mergeKey !== null &&
            top &&
            top.mergeKey === record.mergeKey &&
            now - top.timestamp < COALESCE_WINDOW
        ) {
            // Accumulate ops for redo; prepend new inverseOps for undo (reverse order)
            top.ops = [...top.ops, ...record.ops];
            top.inverseOps = [...record.inverseOps, ...top.inverseOps];
            top.timestamp = now;
        } else {
            this.undoStack.push({ ...record, timestamp: now });
        }

        // Any new edit clears the redo stack
        this.redoStack.length = 0;
    }

    undo(): void {
        if (!this.canUndo) return;
        const record = this.undoStack.pop()!;
        runInAction(() => {
            this.document.applyOps(record.inverseOps);
            this.redoStack.push(record);
        });
    }

    redo(): void {
        if (!this.canRedo) return;
        const record = this.redoStack.pop()!;
        runInAction(() => {
            this.document.applyOps(record.ops);
            this.undoStack.push(record);
        });
    }

    clear(): void {
        this.undoStack.length = 0;
        this.redoStack.length = 0;
    }
}
