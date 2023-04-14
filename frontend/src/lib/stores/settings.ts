import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Settings } from "@/backend/schema/settings";

export type SettingsStore = Omit<Settings, "_id"> | null;

const settings = writable<SettingsStore>(null);

export async function getSettings() {
  let current = await trpc.settings.get.query();

  if (!current) {
    await trpc.settings.updateOrCreate.mutate({});
    current = await trpc.settings.get.query();
  }

  delete current?._id;
  settings.update(() => current);
}

export default settings;
