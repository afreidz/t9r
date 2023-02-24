import { appRouter } from "../trpc/app";
import { createContext } from "../trpc/lib/context";
import { azureFuncRequestHandler } from "../trpc/lib/adapter";

export default azureFuncRequestHandler({
  router: appRouter,
  createContext,
});
