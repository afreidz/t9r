import { router } from "./lib";
import tagsRouter from "./routes/tags";
import timersRouter from "./routes/timers";
import projectsRouter from "./routes/projects";
import forecastRouter from "./routes/forecasts";

export const appRouter = router({
  forecast: forecastRouter,
  projects: projectsRouter,
  timers: timersRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
