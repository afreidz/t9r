import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Settings } from "@/backend/schema/settings";

const settings = writable<Settings | null>(null);
export default settings;

export async function updateSettings() {
  const s = await trpc.settings.get.query();

  settings.update(() => s);
  return s;
}
