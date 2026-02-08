/** A teardown function returned by subscriptions / side-effects. */
export type DisposeFn = () => void;

/** Collects disposables and tears them all down at once. */
export class DisposeBag {
    private fns: DisposeFn[] = [];

    add(fn: DisposeFn): void {
        this.fns.push(fn);
    }

    dispose(): void {
        for (const fn of this.fns.splice(0)) fn();
    }
}

export interface Disposable {
    dispose(): void;
}
