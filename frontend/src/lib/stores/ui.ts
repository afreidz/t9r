import { writable } from "svelte/store";
import type { ResizeObserverValue } from "@/lib/resize";

export const showTimers = writable(true);
export const showReports = writable(true);
export const showAccount = writable(false);
export const showProjects = writable(true);
export const isSelecting = writable(false);
export const showArchived = writable(false);
export const showForecasts = writable(true);
export const selected = writable<string[]>([]);
export const defaultTimerView = writable<Views>("timeline");
export const mainResizeObserver = writable<ResizeObserverValue>(null);

export const ctaPosition = writable<MoveableState>({
  x: 0,
  y: 0,
  moved: false,
});
