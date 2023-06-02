import { writable } from "svelte/store";

let internalTrigger = false;
let timer: ReturnType<typeof setTimeout>;
const visible = writable<boolean>(true, () => {
  document.addEventListener("visibilitychange", set);
  return () => document.removeEventListener("visibilitychange", set);
});

export const shouldRefresh = writable<boolean>(false);

visible.subscribe((value) => {
  if (!value) {
    timer = setTimeout(() => (internalTrigger = true), 30000);
  } else {
    clearTimeout(timer);
    shouldRefresh.set(internalTrigger);
    internalTrigger = false;
  }
});

const prefixes = ["webkit", "moz", "ms", "o"];
const key =
  "hidden" in document
    ? "hidden"
    : prefixes.find((prefix) => `${prefix}Hidden` in document);

function set() {
  if (typeof key === "string") visible.set(!(document as any)[key]);
}

export default visible;
