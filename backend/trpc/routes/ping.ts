import "temporal-polyfill/global";
import { router, publicProcedure } from "../lib";

const pingRouter = router({
  ping: publicProcedure.query(({ ctx }) => {
    return `Ping received from ${
      ctx.user?.userDetails || "anonymous"
    } at ${Temporal.Now.plainDateTimeISO()}`;
  }),
});

export default pingRouter;
