import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";

export const EditorTopBar = observer(function EditorTopBar() {
    const root = useRootStore();

    return (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-1.5">
            <button
                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-40"
                disabled={!root.history.canUndo}
                onClick={() => root.history.undo()}
            >
                Undo
            </button>
            <button
                className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-40"
                disabled={!root.history.canRedo}
                onClick={() => root.history.redo()}
            >
                Redo
            </button>

            <div className="mx-2 h-4 w-px bg-gray-300" />

            <button
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                onClick={() => root.commands.dispatch("editor:loadImage", undefined)}
            >
                Load Image
            </button>
        </div>
    );
});
