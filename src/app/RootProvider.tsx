import { createContext, useContext, type ReactNode } from "react";
import type { RootStore } from "@core/root/RootStore";

const RootStoreContext = createContext<RootStore | null>(null);

export function RootProvider({ store, children }: { store: RootStore; children: ReactNode }) {
    return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>;
}

export function useRootStore(): RootStore {
    const store = useContext(RootStoreContext);
    if (!store) {
        throw new Error("useRootStore must be used within <RootProvider>");
    }
    return store;
}
