import "temporal-polyfill/global";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError, ObjectId } from "../../database";
import TimerSchema, { type Timer, PlainDate } from "../../schema/timer";

const timersRouter = router({
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("timers");

    return collection.findOne<Timer>({
      owner: userId,
      _id: new ObjectId(input),
    });
  }),
  getByDate: protectedProcedure
    .input(PlainDate)
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const date = Temporal.PlainDate.from(input).toString();

      return collection.find<Timer>({ owner: userId, date }).toArray();
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("timers");

    const result = await collection.find<Timer>({ owner: userId }).toArray();

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
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");

      const result = await collection.deleteOne({
        owner: userId,
        _id: new ObjectId(input.id),
      });

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
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("timers");

    const result = await collection.deleteMany({ owner: userId });
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
  create: protectedProcedure
    .input(TimerSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");

      const { date, start, end, project } = input;
      const dateISO = Temporal.PlainDate.from(date).toString();

      const result = await collection.insertOne({
        end,
        start,
        project,
        owner: userId,
        date: dateISO,
      });

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
  update: protectedProcedure
    .input(z.object({ id: z.string(), details: TimerSchema }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");

      const result = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(input.id),
          owner: userId,
        },
        {
          $set: {
            ...input.details,
          },
        }
      );

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

export default timersRouter;
