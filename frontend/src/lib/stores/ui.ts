import { writable } from "svelte/store";
import type { ResizeObserverValue } from "@/lib/resize";

export const showTimers = writable(true);
export const showLoader = writable(true);
export const showReports = writable(true);
export const showAccount = writable(false);
export const showProjects = writable(true);
export const showArchived = writable(false);
export const showForecasts = writable(true);
export const main = writable<HTMLElement>();
export const pinRight = writable<HTMLElement>();
export const defaultTimerView = writable<Views>("timeline");
export const mainResizeObserver = writable<ResizeObserverValue>(null);

export const timelineZoom = writable(Number(localStorage.getItem("zoom")) || 2);
timelineZoom.subscribe((zoom) => localStorage.setItem("zoom", `${zoom}`));
