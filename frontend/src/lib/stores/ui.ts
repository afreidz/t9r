import { writable } from "svelte/store";

export const showProjects = writable(true);
export const isSelecting = writable(false);
export const showArchived = writable(false);
export const selected = writable<string[]>([]);
