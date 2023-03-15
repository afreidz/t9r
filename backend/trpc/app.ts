import { router } from "./lib";
import tagsRouter from "./routes/tags";
import timersRouter from "./routes/timers";
import projectsRouter from "./routes/projects";

export const appRouter = router({
  projects: projectsRouter,
  timers: timersRouter,
  tags: tagsRouter,
});

export type AppRouter = typeof appRouter;
