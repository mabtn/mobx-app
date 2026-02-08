import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "./RootProvider";
import { OverlayBoundary } from "@core/overlays/components/OverlayBoundary";
import { EditorView } from "@features/editor/EditorView";

/**
 * App shell: header, sidebar placeholder, main content area, overlay layers.
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
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
                <h1 className="text-sm font-bold tracking-tight text-gray-800">MobX App Starter</h1>
                <div className="flex items-center gap-2">
                    <button
                        className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                        onClick={() => root.ui.toggleSidebar()}
                    >
                        {root.ui.sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                {root.ui.sidebarOpen && (
                    <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-400">Sidebar</p>
                        <p className="mt-2 text-xs text-gray-500">
                            Feature navigation, tool panels, etc.
                        </p>
                    </aside>
                )}

                {/* Main content */}
                <main className="flex-1 overflow-hidden">
                    <EditorView />
                </main>
            </div>

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
