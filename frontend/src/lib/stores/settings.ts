import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Settings } from "@/backend/schema/settings";

const settings = writable<Partial<Settings>>({});
export default settings;

export async function updateSettings() {
  const s = await trpc.settings.get.query();

  if (s?._id) delete s._id;
  if (s) settings.update(() => s);
  return s;
}
