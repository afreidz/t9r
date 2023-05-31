import { z } from "zod";
import type { Sort } from "mongodb";
import { TRPCError } from "@trpc/server";
import { getSunday } from "../../lib/dates";
import { PlainDate } from "../../schema/timer";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError, ObjectId } from "../../database";
import ForecastSchema, { type Forecast } from "../../schema/forecast";

const forecastSort: Sort = { week: 1 };

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
  getAllByDates: protectedProcedure
    .input(
      z.object({
        start: PlainDate,
        end: PlainDate,
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("forecasts");

      const start = getSunday(Temporal.PlainDate.from(input.start));
      const end = getSunday(Temporal.PlainDate.from(input.end)).add({
        days: 6,
      });

      return collection
        .find<Forecast>({
          owner: userId,
          week: {
            $gte: start.toString(),
            $lte: end.toString(),
          },
        })
        .sort(forecastSort)
        .toArray();
    }),
  getByWeek: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("forecasts");

      return collection
        .find<Forecast>({
          owner: userId,
          week: input,
        })
        .toArray();
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

      const result =
        input.hours === 0
          ? await collection.deleteOne({ ...query, owner: userId })
          : await collection.updateOne(query, update, opts);

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
