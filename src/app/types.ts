/**
 * App-level type helpers.
 *
 * Overlay registry uses a discriminated-union map so that
 * `overlays.open("myDialog", params)` is fully typed.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OverlayParamsMap {
    // Feature modules augment this via declaration merging:
    //   declare module "@app/types" {
    //     interface OverlayParamsMap {
    //       "sample:settings": { tab?: string };
    //     }
    //   }
}

/** All registered overlay keys. */
export type OverlayKey = string & keyof OverlayParamsMap;
