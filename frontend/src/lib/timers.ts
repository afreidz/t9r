import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Timer } from "@/backend/schema/timer";
import { getToday } from "./dates";

const timers = writable<Timer[]>([]);
export const timer = writable<Timer>();

export async function updateTimers(d?: string) {
  timers.set(await trpc.timers.getByDate.query(d || getToday().toString()));
}

export default timers;
