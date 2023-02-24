import { appRouter } from "../trpc/app";
import { azureFuncRequestHandler } from "../trpc/lib/adapter";

export default azureFuncRequestHandler({
  router: appRouter,
});
