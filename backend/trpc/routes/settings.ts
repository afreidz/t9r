import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError } from "../../database";
import SettingsSchema, { type Settings } from "../../schema/settings";

const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("settings");

    return collection.findOne<Settings>({
      owner: userId,
    });
  }),
  updateOrCreate: protectedProcedure
    .input(SettingsSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("settings");

      const query = { owner: userId };
      const update = {
        $set: {
          ...input,
          owner: userId,
        },
      };
      const opts = { upsert: true };
      const result = await collection.updateOne(query, update, opts);

      if (result instanceof DBError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
          cause: result,
        });
      } else {
        return result;
      }
    }),
});

export default settingsRouter;
