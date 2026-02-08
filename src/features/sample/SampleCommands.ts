import type { CommandDef } from "@core/commands/Command";
import type { CommandStore } from "@core/commands/CommandStore";
import { generateId } from "@core/utils/id";
import type { Note } from "./sampleDocument";

// ── Counter ───────────────────────────────────────────────────────────

const incrementCmd: CommandDef<{ amount: number }> = {
    id: "counter:increment",
    title: "Increment counter",
    shortcut: "mod+up",
    toOps({ amount }) {
        return {
            ops: [{ type: "counter:set", payload: { delta: amount } }],
            inverseOps: [{ type: "counter:set", payload: { delta: -amount } }],
        };
    },
    mergeKey: () => "counter:inc",
};

const decrementCmd: CommandDef<{ amount: number }> = {
    id: "counter:decrement",
    title: "Decrement counter",
    shortcut: "mod+down",
    toOps({ amount }) {
        return {
            ops: [{ type: "counter:set", payload: { delta: -amount } }],
            inverseOps: [{ type: "counter:set", payload: { delta: amount } }],
        };
    },
    mergeKey: () => "counter:dec",
};

// ── Notes ─────────────────────────────────────────────────────────────

const addNoteCmd: CommandDef<{ text: string }> = {
    id: "notes:add",
    title: "Add note",
    toOps({ text }) {
        const id = generateId("note");
        const note: Note = { id, text };
        return {
            ops: [{ type: "notes:add", payload: note }],
            inverseOps: [{ type: "notes:remove", payload: { id } }],
        };
    },
};

/**
 * Example async command with prepare + commit.
 * Simulates fetching a note from an API.
 */
const importNoteCmd: CommandDef<{ url: string }> = {
    id: "notes:import",
    title: "Import note from URL",
    locks: ["document"],
    conflictPolicy: "reject",
    async run({ url }, deps, signal) {
        // Simulate async fetch
        await new Promise<void>((resolve, reject) => {
            const t = setTimeout(resolve, 500);
            signal.addEventListener("abort", () => {
                clearTimeout(t);
                reject(new DOMException("Aborted", "AbortError"));
            });
        });

        const id = generateId("note");
        const note: Note = { id, text: `Imported from ${url}` };
        deps.document.applyOps([{ type: "notes:add", payload: note }]);
        return {
            ops: [{ type: "notes:add", payload: note }],
            inverseOps: [{ type: "notes:remove", payload: { id } }],
        };
    },
};

// ── Registration ──────────────────────────────────────────────────────

export function registerSampleCommands(commands: CommandStore): void {
    commands.register(incrementCmd);
    commands.register(decrementCmd);
    commands.register(addNoteCmd);
    commands.register(importNoteCmd);
}
