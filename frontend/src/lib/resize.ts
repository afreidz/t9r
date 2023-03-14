import { writable, type Writable } from "svelte/store";

export type ResizeObserverValue = null | ResizeObserverEntry["contentRect"];

const observerMap = new WeakMap<Element, Writable<ResizeObserverValue>>();
const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const store = observerMap.get(entry.target);
    if (store) store.update(() => entry.contentRect);
  });
});

export default function observeResize(elm: Element) {
  const store = writable<ResizeObserverValue>(null);
  observerMap.set(elm, store);
  observer.observe(elm);
  return store;
}
