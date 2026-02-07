let counter = 0;

/** Generate a unique id with an optional prefix. */
export function generateId(prefix = "id"): string {
  return `${prefix}_${++counter}_${Math.random().toString(36).slice(2, 8)}`;
}
