import { writable } from "svelte/store";
import type { ResizeObserverValue } from "@/lib/resize";

const gi = localStorage.getItem.bind(localStorage);
const si = localStorage.setItem.bind(localStorage);

export const showLoader = writable(true);
export const isSelecting = writable(false);
export const main = writable<HTMLElement>();
export const showLeftSidebar = writable(false);
export const showRightSidebar = writable(false);
export const mainResizeObserver = writable<ResizeObserverValue>(null);

export const timelineZoom = writable(Number(gi("zoom")) || 2);
timelineZoom.subscribe((zoom) => si("zoom", `${zoom}`));

export const defaultTimerView = writable<Views>((gi("view") as Views) || "timeline");
defaultTimerView.subscribe((view) => si("view", view));

export const showTimers = writable<Boolean>(
  gi("showTimers") ? gi("showTimers") === "true" : true
);
export const showReports = writable<Boolean>(
  gi("showReports") ? gi("showReports") === "true" : true
);
export const showAccount = writable<Boolean>(
  gi("showAccount") ? gi("showAccount") === "true" : true
);
export const showProjects = writable<Boolean>(
  gi("showProjects") ? gi("showProjects") === "true" : true
);
export const showArchived = writable<Boolean>(
  gi("showArchived") ? gi("showArchived") === "true" : false
);
export const showForecasts = writable<Boolean>(
  gi("showForecasts") ? gi("showForecasts") === "true" : true
);
export const showQueries = writable<Boolean>(
  gi("showQueries") ? gi("showQueries") === "true" : true
);

showTimers.subscribe((v) => si("showTimers", `${v}`));
showReports.subscribe((v) => si("showReports", `${v}`));
showAccount.subscribe((v) => si("showAccount", `${v}`));
showArchived.subscribe((v) => si("showArchived", `${v}`));
showProjects.subscribe((v) => si("showProjects", `${v}`));
showQueries.subscribe((v) => si("showForecasts", `${v}`));
showForecasts.subscribe((v) => si("showForecasts", `${v}`));
