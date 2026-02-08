import { makeAutoObservable } from "mobx";
import type { CommandDef } from "./Command";
import type { CommandScheduler } from "./CommandScheduler";
import type { Deps } from "@core/di/deps";

/**
 * Registry of all available commands.
 *
 * Holds definitions, exposes enable/disable state, and provides the
 * `dispatch` entry-point that delegates to the CommandScheduler.
 */
export class CommandStore {
    /** All registered command definitions keyed by id. */
    private defs = new Map<string, CommandDef<any>>();
    /** Manually disabled command ids. */
    private disabled = new Set<string>();

    private scheduler: CommandScheduler;
    private deps!: Deps;

    constructor(scheduler: CommandScheduler) {
        this.scheduler = scheduler;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    /** Late-bind deps (avoids circular construction order). */
    init(deps: Deps): void {
        this.deps = deps;
    }

    // ── Registration ────────────────────────────────────────────────────

    register<P>(def: CommandDef<P>): void {
        this.defs.set(def.id, def);
    }

    unregister(id: string): void {
        this.defs.delete(id);
    }

    get(id: string): CommandDef<any> | undefined {
        return this.defs.get(id);
    }

    get all(): CommandDef<any>[] {
        return [...this.defs.values()];
    }

    // ── Enable / disable ───────────────────────────────────────────────

    setEnabled(id: string, enabled: boolean): void {
        if (enabled) this.disabled.delete(id);
        else this.disabled.add(id);
    }

    isEnabled(id: string): boolean {
        const def = this.defs.get(id);
        if (!def) return false;
        if (this.disabled.has(id)) return false;
        if (def.canExecute && !def.canExecute(undefined as any, this.deps)) {
            return false;
        }
        return true;
    }

    // ── Dispatch ────────────────────────────────────────────────────────

    async dispatch<P>(id: string, params: P): Promise<void> {
        const def = this.defs.get(id);
        if (!def) {
            console.warn(`[CommandStore] Unknown command: ${id}`);
            return;
        }
        if (this.disabled.has(id)) return;
        if (def.canExecute && !def.canExecute(params, this.deps)) return;
        await this.scheduler.execute(def, params, this.deps);
    }

    // ── Keyboard shortcut map ──────────────────────────────────────────

    /** Returns a Map<normalizedShortcut, commandId> for use by a keydown handler. */
    get shortcutMap(): Map<string, string> {
        const map = new Map<string, string>();
        for (const def of this.defs.values()) {
            if (def.shortcut) map.set(def.shortcut, def.id);
        }
        return map;
    }
}
