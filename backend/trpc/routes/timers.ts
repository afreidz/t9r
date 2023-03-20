import "temporal-polyfill/global";

import { z } from "zod";
import type { Sort } from "mongodb";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError, ObjectId } from "../../database";
import TimerSchema, { type Timer, PlainDate } from "../../schema/timer";

const timerSort: Sort = { date: 1, start: 1 };

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
  bulkGet: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const ids = input.map((id) => new ObjectId(id));

      return collection
        .find<Timer>({ owner: userId, _id: { $in: ids } })
        .sort(timerSort)
        .toArray();
    }),
  getByDate: protectedProcedure
    .input(PlainDate)
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const date = Temporal.PlainDate.from(input).toString();

      return collection
        .find<Timer>({ owner: userId, date })
        .sort(timerSort)
        .toArray();
    }),
  getByMonth: protectedProcedure
    .input(PlainDate)
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const date = Temporal.PlainDate.from(input);

      const year = date.year;
      const month = `${date.month}`.padStart(2, "0");
      const $regex = new RegExp(`^${year}-${month}-\\d{2}`);

      return collection
        .find<Timer>({ owner: userId, date: { $regex } })
        .sort(timerSort)
        .toArray();
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("timers");

    const result = await collection
      .find<Timer>({ owner: userId })
      .sort(timerSort)
      .toArray();

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
  bulkDelete: protectedProcedure
    .input(z.array(z.string()))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const ids = input.map((id) => new ObjectId(id));

      const result = await collection.deleteMany({
        owner: userId,
        _id: { $in: ids },
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

      const { date, start, end, project, title, utilized } = input;
      const dateISO = Temporal.PlainDate.from(date).toString();

      const result = await collection.insertOne({
        end,
        start,
        title,
        project,
        utilized,
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
    .input(z.object({ id: z.string(), details: TimerSchema.partial() }))
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

  bulkUpdate: protectedProcedure
    .input(
      z.object({ ids: z.array(z.string()), details: TimerSchema.partial() })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const ids = input.ids.map((id) => new ObjectId(id));

      const result = await collection.updateMany(
        { owner: userId, _id: { $in: ids } },
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
