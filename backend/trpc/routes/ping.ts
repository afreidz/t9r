import "temporal-polyfill/global";
import { router, publicProcedure } from "../lib";

const pingRouter = router({
  ping: publicProcedure.query(() => {
    return `Ping received at ${Temporal.Now.plainDateTimeISO()}`;
  }),
});

export default pingRouter;
