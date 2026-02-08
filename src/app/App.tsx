import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "./RootProvider";
import { OverlayBoundary } from "@core/overlays/components/OverlayBoundary";
import { EditorView } from "@features/editor/EditorView";

/**
 * App shell: header, main content area, overlay layers.
 */
export const App = observer(function App() {
    const root = useRootStore();

    // ── Global keyboard shortcuts ───────────────────────────────────────
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const mod = e.metaKey || e.ctrlKey;

            // Undo: Ctrl/Cmd+Z
            if (mod && !e.shiftKey && e.key === "z") {
                e.preventDefault();
                root.history.undo();
                return;
            }
            // Redo: Ctrl/Cmd+Shift+Z
            if (mod && e.shiftKey && e.key === "z") {
                e.preventDefault();
                root.history.redo();
                return;
            }

            // Match registered command shortcuts
            const shortcutMap = root.commands.shortcutMap;
            const pressed = buildShortcutString(e);
            const cmdId = shortcutMap.get(pressed);
            if (cmdId) {
                e.preventDefault();
                root.commands.dispatch(cmdId, { amount: 1 });
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [root]);

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <header className="flex items-center bg-gray-900 px-4 py-2">
                <h1 className="text-sm font-bold tracking-tight text-gray-100">MobX App Starter</h1>
            </header>

            {/* Main content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                <EditorView />
            </main>

            {/* Overlay layers */}
            <OverlayBoundary />
        </div>
    );
});

// ── helpers ──────────────────────────────────────────────────────────

function buildShortcutString(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.metaKey || e.ctrlKey) parts.push("mod");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");

    const key = e.key.toLowerCase();
    if (!["control", "meta", "shift", "alt"].includes(key)) {
        // Map arrow keys
        const mapped: Record<string, string> = {
            arrowup: "up",
            arrowdown: "down",
            arrowleft: "left",
            arrowright: "right",
        };
        parts.push(mapped[key] ?? key);
    }
    return parts.join("+");
}
