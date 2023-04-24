import { writable } from "svelte/store";
import type { Tag } from "@/backend/schema/tag";
import trpc from "../trpc";

const tags = writable<Tag[]>([]);
export default tags;

export async function updateTags() {
  const t = await trpc.tags.list.query();
  tags.update(() => t);
}
