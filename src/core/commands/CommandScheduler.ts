import { makeAutoObservable, runInAction } from "mobx";
import type { CommandDef, CommandExecution, ConflictPolicy } from "./Command";
import type { Deps } from "@core/di/deps";
import { generateId } from "@core/utils/id";

/**
 * Manages concurrency for command execution.
 *
 * Tracks active locks and applies the command's conflict policy
 * (reject / queue / supersede) when a lock is contended.
 */
export class CommandScheduler {
  /** Currently held locks → execution id. */
  activeLocks = new Map<string, string>();
  /** Queue of pending executions per lock. */
  private queues = new Map<string, Array<() => void>>();
  /** All live executions. */
  executions = new Map<string, CommandExecution>();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /** True if any lock in `locks` is currently held. */
  isBusy(locks: string[]): boolean {
    return locks.some((l) => this.activeLocks.has(l));
  }

  /** Schedule & run a command, respecting locks and conflict policy. */
  async execute<P>(
    def: CommandDef<P>,
    params: P,
    deps: Deps,
  ): Promise<void> {
    const locks = def.locks ?? [];
    const policy: ConflictPolicy = def.conflictPolicy ?? "queue";

    // Fast path: no locks requested
    if (locks.length === 0) {
      await this.runNow(def, params, deps);
      return;
    }

    // Check contention
    if (this.isBusy(locks)) {
      switch (policy) {
        case "reject":
          return; // silently drop
        case "supersede": {
          // Cancel the current holder then run
          for (const lock of locks) {
            const execId = this.activeLocks.get(lock);
            if (execId) this.cancel(execId);
          }
          break;
        }
        case "queue": {
          // Wait until the lock is released
          await new Promise<void>((resolve) => {
            for (const lock of locks) {
              let q = this.queues.get(lock);
              if (!q) {
                q = [];
                this.queues.set(lock, q);
              }
              q.push(resolve);
            }
          });
          break;
        }
      }
    }

    await this.runNow(def, params, deps);
  }

  /** Cancel a running execution by id. */
  cancel(execId: string): void {
    const exec = this.executions.get(execId);
    if (exec) exec.abortController.abort();
  }

  // ── internal ─────────────────────────────────────────────────────────

  private async runNow<P>(
    def: CommandDef<P>,
    params: P,
    deps: Deps,
  ): Promise<void> {
    const locks = def.locks ?? [];
    const execId = generateId("exec");
    const abortController = new AbortController();

    const execution: CommandExecution = {
      id: execId,
      commandId: def.id,
      abortController,
      promise: Promise.resolve(),
    };

    runInAction(() => {
      this.executions.set(execId, execution);
      for (const lock of locks) this.activeLocks.set(lock, execId);
    });

    try {
      // Prefer toOps (synchronous, op-based) path
      if (def.toOps) {
        const { ops, inverseOps } = def.toOps(params, deps);
        deps.document.applyOps(ops);
        deps.history.push({
          commandId: def.id,
          ops,
          inverseOps,
          mergeKey: def.mergeKey?.(params) ?? null,
        });
        return;
      }

      // Imperative run path
      if (def.run) {
        const result = await def.run(params, deps, abortController.signal);
        if (result && "ops" in result) {
          deps.history.push({
            commandId: def.id,
            ops: result.ops,
            inverseOps: result.inverseOps,
            mergeKey: def.mergeKey?.(params) ?? null,
          });
        }
      }
    } finally {
      runInAction(() => {
        this.executions.delete(execId);
        for (const lock of locks) {
          if (this.activeLocks.get(lock) === execId) {
            this.activeLocks.delete(lock);
          }
        }
      });
      // Drain queue
      for (const lock of locks) {
        const q = this.queues.get(lock);
        if (q?.length) q.shift()!();
      }
    }
  }
}
