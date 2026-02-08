import { observer } from "mobx-react-lite";
import { editorViewStore, ZOOM_LEVELS } from "../EditorViewStore";

export const ZoomBar = observer(function ZoomBar() {
    const zoom = editorViewStore.zoom;

    return (
        <div className="flex items-center gap-0.5">
            {ZOOM_LEVELS.map((level) => (
                <button
                    key={level}
                    className={`rounded px-1.5 py-0.5 text-[11px] ${
                        zoom === level
                            ? "bg-blue-100 font-medium text-blue-700"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                    onClick={() => editorViewStore.setZoom(level)}
                >
                    {level * 100}%
                </button>
            ))}
        </div>
    );
});
