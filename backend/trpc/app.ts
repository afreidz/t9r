import { router } from "./lib";
import tagsRouter from "./routes/tags";
import pingRouter from "./routes/ping";
import timersRouter from "./routes/timers";
import targetsRouter from "./routes/targets";
import settingsRouter from "./routes/settings";
import projectsRouter from "./routes/projects";
import forecastRouter from "./routes/forecasts";

export const appRouter = router({
  settings: settingsRouter,
  forecast: forecastRouter,
  projects: projectsRouter,
  targets: targetsRouter,
  timers: timersRouter,
  tags: tagsRouter,
  ping: pingRouter,
});

export type AppRouter = typeof appRouter;
