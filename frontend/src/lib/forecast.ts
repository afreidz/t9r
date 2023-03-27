import trpc from "@/lib/trpc";
import type { Project } from "@/backend/schema/project";

export async function queryForecast(
  project: Project["_id"],
  weekPD: Temporal.PlainDate
) {
  if (!project) return;
  const week = weekPD.toString();
  return await trpc.forecast.getByWeekAndProject.query({ week, project });
}
