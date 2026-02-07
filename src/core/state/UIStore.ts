import { makeAutoObservable } from "mobx";

/**
 * Transient UI / session state.
 *
 * View preferences, active selection, sidebar open/close, theme, etc.
 * None of this is undoable or synced.
 */
export class UIStore {
  sidebarOpen = true;
  theme: "light" | "dark" = "light";
  /** Generic key-value bag for view-level flags. */
  viewPrefs: Record<string, any> = {};

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setTheme(theme: "light" | "dark"): void {
    this.theme = theme;
  }

  setViewPref(key: string, value: any): void {
    this.viewPrefs[key] = value;
  }
}
