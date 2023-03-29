import { writable } from "svelte/store";

export const showTimers = writable(true);
export const showReports = writable(true);
export const showProjects = writable(true);
export const isSelecting = writable(false);
export const showArchived = writable(false);
export const showForecasts = writable(true);
export const selected = writable<string[]>([]);
export const ctaPosition = writable<MoveableState>({
  x: 0,
  y: 0,
  moved: false,
});
