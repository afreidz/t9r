import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Project } from "@/backend/schema/project";

const projects = writable<Project[]>([]);
export const mostRecentProject = writable<Project>();

export async function fetchProjects() {
  const data = await trpc.projects.list.query();
  projects.set(data);

  mostRecentProject.update((mr) => {
    const match = data.find((p) => p._id === mr?._id);
    return match || data[0] || undefined;
  });
}

export default projects;
