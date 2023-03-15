import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Tag } from "@/backend/schema/tag";

const tags = writable<Tag[]>([]);

export async function fetchTags() {
  const data = await trpc.tags.list.query();
  tags.set(data);
}

export default tags;
