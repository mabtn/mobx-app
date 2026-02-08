/**
 * Singleton image cache.
 *
 * Stores decoded HTMLImageElement instances keyed by a short `imageRef` string.
 * Lives outside MobX so large binary data never enters the observable graph.
 */
class ImageCacheImpl {
    private cache = new Map<string, HTMLImageElement>();

    /** Load an image from a data URL and store it under `ref`. */
    load(ref: string, dataUrl: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cache.set(ref, img);
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${ref}`));
            img.src = dataUrl;
        });
    }

    get(ref: string): HTMLImageElement | undefined {
        return this.cache.get(ref);
    }

    set(ref: string, img: HTMLImageElement): void {
        this.cache.set(ref, img);
    }

    delete(ref: string): void {
        this.cache.delete(ref);
    }

    /** Get the data URL for a cached image (for undo payload reconstruction). */
    toDataUrl(ref: string): string | null {
        const img = this.cache.get(ref);
        if (!img) return null;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/png");
    }
}

export const imageCache = new ImageCacheImpl();
