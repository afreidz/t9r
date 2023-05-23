import "temporal-polyfill/global";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../lib";

const pingRouter = router({
  ping: publicProcedure.query(({ ctx }) => {
    return `Ping received from ${
      ctx.user?.userDetails || "anonymous"
    } at ${Temporal.Now.plainDateTimeISO()}`;
  }),
  error: publicProcedure.query(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `This is just a test error`,
      cause: { router: "ping", procedure: "error" },
    });
  }),
});

export default pingRouter;
