import { writable } from "svelte/store";
import { Temporal } from "temporal-polyfill";

const interval = 10000;

let updateInterval: ReturnType<typeof setInterval> = setInterval(
  callback,
  interval
);

const now = writable<Temporal.PlainDateTime>(Temporal.Now.plainDateTimeISO());

export function pause() {
  clearInterval(updateInterval);
}

function callback() {
  const npdt = Temporal.Now.plainDateTimeISO();
  now.set(npdt);
}

export default now;
