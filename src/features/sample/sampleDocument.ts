import type { DocumentStore } from "@core/state/DocumentStore";

/**
 * Sample domain model: a simple notes list.
 *
 * Demonstrates how a feature module initialises data and registers op handlers.
 */

export interface Note {
  id: string;
  text: string;
}

export interface SampleData {
  counter: number;
  notes: Note[];
}

const INITIAL_DATA: SampleData = {
  counter: 0,
  notes: [],
};

export function registerSampleDocument(doc: DocumentStore): void {
  // Initialise data slice
  Object.assign(doc.data, INITIAL_DATA);

  // Op handlers
  doc.registerHandler<{ delta: number }>("counter:set", (payload, data) => {
    data.counter += payload.delta;
  });

  doc.registerHandler<Note>("notes:add", (payload, data) => {
    data.notes.push(payload);
  });

  doc.registerHandler<{ id: string }>("notes:remove", (payload, data) => {
    data.notes = data.notes.filter((n: Note) => n.id !== payload.id);
  });

  doc.registerHandler<{ id: string; text: string }>("notes:update", (payload, data) => {
    const note = data.notes.find((n: Note) => n.id === payload.id);
    if (note) note.text = payload.text;
  });
}
