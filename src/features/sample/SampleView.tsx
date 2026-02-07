import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useRootStore } from "@app/RootProvider";
import type { Note } from "./sampleDocument";

export const SampleView = observer(function SampleView() {
  const { document, commands, history, overlays } = useRootStore();
  const [noteText, setNoteText] = useState("");

  const counter: number = document.data.counter ?? 0;
  const notes: Note[] = document.data.notes ?? [];

  return (
    <div className="space-y-6">
      {/* Counter */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Counter</h2>
        <div className="flex items-center gap-3">
          <button
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => commands.dispatch("counter:decrement", { amount: 1 })}
          >
            &minus;
          </button>
          <span className="w-12 text-center text-lg font-mono tabular-nums">
            {counter}
          </span>
          <button
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            onClick={() => commands.dispatch("counter:increment", { amount: 1 })}
          >
            +
          </button>
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">Notes</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none"
            placeholder="New note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && noteText.trim()) {
                commands.dispatch("notes:add", { text: noteText.trim() });
                setNoteText("");
              }
            }}
          />
          <button
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-40"
            disabled={!noteText.trim()}
            onClick={() => {
              commands.dispatch("notes:add", { text: noteText.trim() });
              setNoteText("");
            }}
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {notes.map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-sm"
            >
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* History */}
      <section className="flex items-center gap-3">
        <button
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-40"
          disabled={!history.canUndo}
          onClick={() => history.undo()}
        >
          Undo
        </button>
        <button
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 disabled:opacity-40"
          disabled={!history.canRedo}
          onClick={() => history.redo()}
        >
          Redo
        </button>
        <span className="text-xs text-gray-400">
          {history.undoStack.length} undo &middot; {history.redoStack.length}{" "}
          redo
        </span>
      </section>

      {/* Overlays */}
      <section className="flex gap-2">
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => overlays.open("sample:about", {})}
        >
          Open About (modal)
        </button>
        <button
          className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => overlays.open("sample:notes-inspector", {})}
        >
          Notes Inspector (modeless)
        </button>
      </section>

      {/* Async command demo */}
      <section>
        <button
          className="rounded border border-dashed border-gray-400 px-3 py-1 text-sm text-gray-500 hover:bg-gray-50"
          onClick={() => commands.dispatch("notes:import", { url: "https://example.com/note" })}
        >
          Import Note (async demo)
        </button>
      </section>
    </div>
  );
});
