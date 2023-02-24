import pingRouter from "./routes/ping";
import { mergeRouters, router } from "./lib";
import projectsRouter from "./routes/projects";

const endpoints = router({
  projects: projectsRouter,
});

export const appRouter = mergeRouters(pingRouter, endpoints);
export type AppRouter = typeof appRouter;
