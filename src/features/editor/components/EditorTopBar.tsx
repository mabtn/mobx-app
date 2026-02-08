import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import { Button } from "@core/ui";
import { EditorCmd } from "@features/editor/types";

export const EditorTopBar = observer(function EditorTopBar() {
    const root = useRootStore();

    return (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-1.5">
            <Button
                className="px-3 py-1 text-sm"
                disabled={!root.history.canUndo}
                onClick={() => root.history.undo()}
            >
                Undo
            </Button>
            <Button
                className="px-3 py-1 text-sm"
                disabled={!root.history.canRedo}
                onClick={() => root.history.redo()}
            >
                Redo
            </Button>

            <div className="mx-2 h-4 w-px bg-gray-300" />

            <Button
                variant="primary"
                className="px-3 py-1 text-sm"
                onClick={() => root.commands.dispatch(EditorCmd.LoadImage, undefined)}
            >
                Load Layer
            </Button>
        </div>
    );
});
