import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError, ObjectId } from "../../database";
import ForecastSchema, { type Forecast } from "../../schema/forecast";

const forecastRouter = router({
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("forecasts");

    if (!ObjectId.isValid(input)) return undefined;

    return collection.findOne<Forecast>({
      owner: userId,
      _id: new ObjectId(input),
    });
  }),
  getByWeekAndProject: protectedProcedure
    .input(
      z.object({
        week: z.string(),
        project: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("forecasts");

      return collection.findOne<Forecast>({
        owner: userId,
        week: input.week,
        project: input.project,
      });
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("forecasts");

    const result = await collection.find<Forecast>({ owner: userId }).toArray();

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
  updateOrCreate: protectedProcedure
    .input(ForecastSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("forecasts");

      const query = { project: input.project, week: input.week };
      const update = {
        $set: {
          owner: userId,
          week: input.week,
          hours: input.hours,
          project: input.project,
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

export default forecastRouter;
