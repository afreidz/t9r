import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Project } from "@/backend/schema/project";

const projects = writable<Project[]>([]);
export const mostRecentProject = writable<Project>();

export async function updateProjects() {
  const p = await trpc.projects.list.query();
  projects.update(() => p);

  mostRecentProject.update((mrp) => {
    const existing = p.find((p) => mrp && p._id === mrp._id);
    return existing || p[0];
  });
}

export default projects;
