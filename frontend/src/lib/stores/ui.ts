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
export const showLeftSidebar = writable(false);
export const showRightSidebar = writable(false);
export const mainResizeObserver = writable<ResizeObserverValue>(null);

export const timelineZoom = writable(Number(localStorage.getItem("zoom")) || 2);
timelineZoom.subscribe((zoom) => localStorage.setItem("zoom", `${zoom}`));

export const defaultTimerView = writable<Views>(
  (localStorage.getItem("view") as Views) || "timeline"
);
defaultTimerView.subscribe((view) => localStorage.setItem("view", view));
