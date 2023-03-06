import { router } from "./lib";
import timersRouter from "./routes/timers";
import projectsRouter from "./routes/projects";

export const appRouter = router({
  projects: projectsRouter,
  timers: timersRouter,
});

export type AppRouter = typeof appRouter;
