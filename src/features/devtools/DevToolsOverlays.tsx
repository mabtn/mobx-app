import { observer } from "mobx-react-lite";
import type { OverlayComponentProps } from "@core/overlays/OverlayTypes";
import type { OverlayRegistry } from "@core/overlays/OverlayRegistry";
import { useRootStore } from "@app/RootProvider";
import { DevToolsOverlay } from "./types";

// ── Section wrapper ──────────────────────────────────────────────────

function Section({
    title,
    count,
    children,
}: {
    title: string;
    count?: number;
    children: React.ReactNode;
}) {
    return (
        <details className="group">
            <summary className="cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
                {title}
                {count !== undefined && (
                    <span className="ml-1 font-normal text-gray-400">({count})</span>
                )}
            </summary>
            <div className="mt-1 mb-2">{children}</div>
        </details>
    );
}

// ── Table helpers ────────────────────────────────────────────────────

const thClass = "px-2 py-0.5 text-left text-[10px] font-medium uppercase text-gray-400";
const tdClass = "px-2 py-0.5 text-xs text-gray-700 font-mono";

// ── Inspector component ──────────────────────────────────────────────

const DevToolsInspector = observer(function DevToolsInspector(_props: OverlayComponentProps) {
    const root = useRootStore();

    const commands = root.commands.all;
    const handlerTypes = root.document.handlerTypes;
    const undoStack = root.history.undoStack;
    const redoStack = root.history.redoStack;
    const registeredOverlays = root.overlayRegistry.all;
    const openModals = root.overlays.modalStack;
    const openModeless = root.overlays.modelessWindows;
    const openPopovers = root.overlays.popovers;
    const activeLocks = root.scheduler.activeLocks;
    const executions = root.scheduler.executions;
    const pendingOps = root.sync.pendingOps;

    const now = Date.now();

    return (
        <div className="flex flex-col gap-2 overflow-y-auto text-xs" style={{ maxHeight: 500 }}>
            {/* Commands */}
            <Section title="Commands" count={commands.length}>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className={thClass}>ID</th>
                            <th className={thClass}>Title</th>
                            <th className={thClass}>Shortcut</th>
                            <th className={thClass}>Locks</th>
                            <th className={thClass}>Policy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commands.map((cmd) => (
                            <tr key={cmd.id} className="border-t border-gray-100">
                                <td className={tdClass}>{cmd.id}</td>
                                <td className={`${tdClass} font-sans`}>{cmd.title}</td>
                                <td className={tdClass}>{cmd.shortcut ?? "—"}</td>
                                <td className={tdClass}>{cmd.locks?.join(", ") || "—"}</td>
                                <td className={tdClass}>{cmd.conflictPolicy ?? "queue"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Op Handlers */}
            <Section title="Op Handlers" count={handlerTypes.length}>
                <ul className="flex flex-wrap gap-1">
                    {[...handlerTypes].sort().map((type) => (
                        <li
                            key={type}
                            className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600"
                        >
                            {type}
                        </li>
                    ))}
                </ul>
            </Section>

            {/* Undo Stack */}
            <Section title="Undo Stack" count={undoStack.length}>
                {undoStack.length === 0 ? (
                    <p className="text-gray-400 italic">Empty</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className={thClass}>#</th>
                                <th className={thClass}>Command</th>
                                <th className={thClass}>Ops</th>
                                <th className={thClass}>MergeKey</th>
                                <th className={thClass}>Age</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...undoStack].reverse().map((rec, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                    <td className={tdClass}>{undoStack.length - i}</td>
                                    <td className={tdClass}>{rec.commandId}</td>
                                    <td className={tdClass}>{rec.ops.length}</td>
                                    <td className={tdClass}>{rec.mergeKey ?? "—"}</td>
                                    <td className={`${tdClass} font-sans`}>
                                        {formatAge(now - rec.timestamp)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {/* Redo Stack */}
            <Section title="Redo Stack" count={redoStack.length}>
                {redoStack.length === 0 ? (
                    <p className="text-gray-400 italic">Empty</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className={thClass}>#</th>
                                <th className={thClass}>Command</th>
                                <th className={thClass}>Ops</th>
                                <th className={thClass}>MergeKey</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...redoStack].reverse().map((rec, i) => (
                                <tr key={i} className="border-t border-gray-100">
                                    <td className={tdClass}>{redoStack.length - i}</td>
                                    <td className={tdClass}>{rec.commandId}</td>
                                    <td className={tdClass}>{rec.ops.length}</td>
                                    <td className={tdClass}>{rec.mergeKey ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {/* Overlays (registered) */}
            <Section title="Overlays (Registered)" count={registeredOverlays.length}>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className={thClass}>Key</th>
                            <th className={thClass}>Kind</th>
                            <th className={thClass}>Singleton</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredOverlays.map((def) => (
                            <tr key={def.key} className="border-t border-gray-100">
                                <td className={tdClass}>{def.key}</td>
                                <td className={`${tdClass} font-sans`}>{def.kind}</td>
                                <td className={`${tdClass} font-sans`}>
                                    {def.options?.singleton ? "yes" : "no"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* Overlays (open) */}
            <Section
                title="Overlays (Open)"
                count={openModals.length + openModeless.length + openPopovers.length}
            >
                {openModals.length + openModeless.length + openPopovers.length === 0 ? (
                    <p className="text-gray-400 italic">None</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className={thClass}>ID</th>
                                <th className={thClass}>Key</th>
                                <th className={thClass}>Kind</th>
                                <th className={thClass}>Z</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...openModals, ...openModeless, ...openPopovers].map((inst) => (
                                <tr key={inst.id} className="border-t border-gray-100">
                                    <td className={tdClass}>{inst.id}</td>
                                    <td className={tdClass}>{inst.key}</td>
                                    <td className={`${tdClass} font-sans`}>{inst.kind}</td>
                                    <td className={tdClass}>{inst.zIndex}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {/* Scheduler */}
            <Section title="Scheduler" count={executions.size}>
                <div className="space-y-1">
                    <p className="text-gray-500">
                        Active locks:{" "}
                        {activeLocks.size === 0 ? (
                            <span className="italic">none</span>
                        ) : (
                            [...activeLocks.entries()].map(([lock, execId]) => (
                                <span
                                    key={lock}
                                    className="mr-1 rounded bg-yellow-100 px-1 py-0.5 font-mono"
                                >
                                    {lock} → {execId}
                                </span>
                            ))
                        )}
                    </p>
                    {executions.size > 0 && (
                        <ul className="space-y-0.5">
                            {[...executions.values()].map((exec) => (
                                <li key={exec.id} className="font-mono text-gray-600">
                                    {exec.id}: {exec.commandId}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Section>

            {/* Sync */}
            <Section title="Sync" count={pendingOps.length}>
                {pendingOps.length === 0 ? (
                    <p className="text-gray-400 italic">No pending ops</p>
                ) : (
                    <ul className="space-y-0.5">
                        {pendingOps.map((op, i) => (
                            <li key={i} className="font-mono text-gray-600">
                                {op.type}
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </div>
    );
});

// ── Helpers ──────────────────────────────────────────────────────────

function formatAge(ms: number): string {
    if (ms < 1000) return "<1s";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ── Registration ─────────────────────────────────────────────────────

export function registerDevToolsOverlays(registry: OverlayRegistry): void {
    registry.register({
        key: DevToolsOverlay.Inspector,
        kind: "modeless",
        component: DevToolsInspector,
        options: {
            singleton: true,
            defaultWidth: 520,
            defaultHeight: 400,
            defaultPosition: { x: 60, y: 60 },
        },
    });
}
