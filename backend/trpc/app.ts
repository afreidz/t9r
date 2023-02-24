import { mergeRouters } from "./lib";
import pingRouter from "./routes/ping";

export const appRouter = mergeRouters(pingRouter);
export type AppRouter = typeof appRouter;
