import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import type { EditorData } from "./types";
import { EditorTopBar } from "./components/EditorTopBar";
import { EditorCanvas } from "./components/EditorCanvas";
import { LayerList } from "./components/LayerList";
import { LayerProperties } from "./components/LayerProperties";

export const EditorView = observer(function EditorView() {
    const root = useRootStore();
    const data = root.document.data as unknown as EditorData;

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <EditorTopBar />
            <div className="flex flex-1 overflow-hidden">
                {/* Canvas area */}
                <EditorCanvas />

                {/* Right panel */}
                <aside className="w-64 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-3">
                    {data.selectedLayerId ? <LayerProperties /> : <LayerList />}
                </aside>
            </div>
        </div>
    );
});
