import { writable } from "svelte/store";

const cache: Set<string> = new Set();
const selectedTimers = writable<string[]>([]);

export function addToSelected(id: string) {
  cache.add(id);
  selectedTimers.update(() => [...cache]);
}

export function removeFromSelected(id: string) {
  cache.delete(id);
  selectedTimers.update(() => [...cache]);
}

export function clearSelected() {
  cache.clear();
  selectedTimers.update(() => []);
}

export default selectedTimers;
