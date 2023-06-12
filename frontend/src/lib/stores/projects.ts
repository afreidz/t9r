import trpc from "@/lib/trpc";
import { writable } from "svelte/store";
import type { Project } from "@/backend/schema/project";
import { updateSettings } from "@/lib/stores/settings";

const projects = writable<Project[]>([]);
export const mostRecentProject = writable<Project>();

export async function updateProjects() {
  const p = await trpc.projects.list.query();
  const settings = await updateSettings();

  if (!settings) {
    projects.update(() => p);
    mostRecentProject.set(p[0]);
  } else {
    if (settings.projectOrder) {
      const others = p.filter(
        (p) => p._id && !settings.projectOrder.includes(p._id)
      ) as Project[];

      const ordered = settings.projectOrder
        .map((id) => p.find((p) => p._id === id))
        .filter(Boolean) as Project[];

      projects.update(() => [...ordered, ...others]);
      mostRecentProject.set([...ordered, ...others][0]);

      if (others.length) {
        await trpc.settings.updateOrCreate.mutate({
          ...settings,
          projectOrder: [...ordered, ...others]
            .map((p) => p._id)
            .filter(Boolean) as string[],
        });
        await updateSettings();
      }
    } else {
      await trpc.settings.updateOrCreate.mutate({
        ...settings,
        projectOrder: p.map((p) => p._id).filter(Boolean) as string[],
      });
      await updateSettings();
    }
  }
}

export default projects;
