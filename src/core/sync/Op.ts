/**
 * Serializable operation — the unit of change in the system.
 *
 * Ops flow through:  Command → DocumentStore → SyncEngine → Transport
 */
export interface Op<T extends string = string, P = any> {
    type: T;
    payload: P;
}
