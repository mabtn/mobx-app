import { observer } from "mobx-react-lite";
import type { OverlayComponentProps } from "@core/overlays/OverlayTypes";
import type { OverlayRegistry } from "@core/overlays/OverlayRegistry";
import { useRootStore } from "@app/RootProvider";
import type { Note } from "./sampleDocument";

// ── Modal: About dialog ───────────────────────────────────────────────

function AboutDialog({ close }: OverlayComponentProps) {
    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-600">
                This is a sample modal dialog registered via the overlay system.
            </p>
            <button
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                onClick={close}
            >
                Close
            </button>
        </div>
    );
}

// ── Modeless: Notes inspector ─────────────────────────────────────────

const NotesInspector = observer(function NotesInspector({ close }: OverlayComponentProps) {
    const { document } = useRootStore();
    const notes: Note[] = document.data.notes ?? [];

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">{notes.length} note(s) in document</p>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
                {notes.map((n) => (
                    <li key={n.id} className="rounded bg-gray-50 px-2 py-1 text-xs">
                        {n.text}
                    </li>
                ))}
                {notes.length === 0 && (
                    <li className="text-xs text-gray-400 italic">No notes yet.</li>
                )}
            </ul>
            <button className="text-xs text-gray-400 hover:text-gray-600" onClick={close}>
                dismiss
            </button>
        </div>
    );
});

// ── Registration ──────────────────────────────────────────────────────

export function registerSampleOverlays(registry: OverlayRegistry): void {
    registry.register({
        key: "sample:about",
        kind: "modal",
        component: AboutDialog,
        options: {
            dismissOnEsc: true,
            dismissOnOutsideClick: true,
            defaultWidth: 360,
        },
    });

    registry.register({
        key: "sample:notes-inspector",
        kind: "modeless",
        component: NotesInspector,
        options: {
            singleton: true,
            defaultWidth: 280,
            defaultHeight: 260,
            defaultPosition: { x: 500, y: 120 },
        },
    });
}
