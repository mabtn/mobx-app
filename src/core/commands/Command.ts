import type { Op } from "@core/sync/Op";
import type { Deps } from "@core/di/deps";

// ── Command descriptor ────────────────────────────────────────────────

export type ConflictPolicy = "reject" | "queue" | "supersede";

export interface CommandDef<P = void> {
  /** Unique command id. */
  id: string;
  /** Human-readable title (menus, palette). */
  title: string;
  /** Keyboard shortcut, e.g. "mod+s". "mod" maps to Cmd on macOS, Ctrl elsewhere. */
  shortcut?: string;
  /** Resource locks this command holds while running (e.g. "document"). */
  locks?: string[];
  /** What to do when a lock is already held. Default: "queue". */
  conflictPolicy?: ConflictPolicy;

  /** Pre-check. Default: always true. */
  canExecute?(params: P, deps: Deps): boolean;

  /**
   * Pure synchronous path: produce ops + inverse ops without side-effects.
   * Preferred when possible — enables undo/redo automatically.
   */
  toOps?(params: P, deps: Deps): { ops: Op[]; inverseOps: Op[] };

  /**
   * Imperative run. Use for async work, external I/O, or when toOps is not
   * feasible. Receives an AbortSignal for cancellation.
   *
   * Return ops+inverseOps if the command should be undoable.
   */
  run?(
    params: P,
    deps: Deps,
    signal: AbortSignal,
  ): void | Promise<void | { ops: Op[]; inverseOps: Op[] }>;

  /**
   * Optional merge key for coalescing consecutive records in history
   * (e.g. typing, slider drags). Records with the same non-null mergeKey
   * that arrive within the coalesce window are merged into one entry.
   */
  mergeKey?(params: P): string | null;
}

// ── Execution record (used by scheduler) ──────────────────────────────

export interface CommandExecution {
  id: string;
  commandId: string;
  abortController: AbortController;
  promise: Promise<void>;
}
