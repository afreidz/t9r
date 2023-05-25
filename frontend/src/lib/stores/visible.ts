import { writable } from "svelte/store";

const visible = writable<boolean>(true, () => {
  document.addEventListener("visibilitychange", set);
  return () => document.removeEventListener("visibilitychange", set);
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
