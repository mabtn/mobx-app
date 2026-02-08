import { makeAutoObservable } from "mobx";

export const ZOOM_LEVELS = [0.5, 0.75, 1, 1.5, 2] as const;

class EditorViewStoreImpl {
    zoom = 1;

    constructor() {
        makeAutoObservable(this);
    }

    setZoom(zoom: number): void {
        this.zoom = zoom;
    }
}

export const editorViewStore = new EditorViewStoreImpl();
