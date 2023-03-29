import trpc from "@/lib/trpc";
import { sumTimerHours } from "@/lib/timers";
import type { Project } from "@/backend/schema/project";
import type { Forecast } from "@/backend/schema/forecast";

type ForecastAndActual = Partial<Forecast> & {
  actual?: number;
};

export async function queryForecast(
  project: Project["_id"],
  weekPD: Temporal.PlainDate
): Promise<ForecastAndActual | undefined> {
  if (!project) return;
  const week = weekPD.toString();
  const forecast = await trpc.forecast.getByWeekAndProject.query({
    week,
    project,
  });
  const timers = await trpc.timers.getByWeek.query({ week, project });

  if (!forecast) return { actual: sumTimerHours(timers) };

  return { ...forecast, actual: sumTimerHours(timers) };
}
