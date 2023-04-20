import "temporal-polyfill/global";
import { z } from "zod";
import TimerSchema, {
  type Timer,
  PlainDate,
  PlainYearMonth,
  type YearlyUtilizationReport,
} from "../../schema/timer";
import type { Sort } from "mongodb";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError, ObjectId } from "../../database";

const timerSort: Sort = { date: 1, start: 1 };

type Query = {
  project?: string;
  owner: string;
  date: string | RegExFilter;
};

type RegExFilter = {
  $regex: RegExp;
};

export function getSunday(d: Temporal.PlainDate = Temporal.Now.plainDateISO()) {
  if (d.dayOfWeek === 7) return d;
  return d.subtract({ days: d.dayOfWeek });
}

export function isToday(d: Temporal.PlainDate | string) {
  const pd = typeof d === "string" ? Temporal.PlainDate.from(d) : d;
  return pd.equals(Temporal.Now.plainDateISO());
}

export function sumTimerHours(timers: Timer[] = []) {
  return timers.reduce((hours, timer) => {
    const d = Temporal.PlainDate.from(timer.date);
    const start = Temporal.PlainTime.from(timer.start);
    const end = timer.end
      ? Temporal.PlainTime.from(timer.end)
      : isToday(d)
      ? Temporal.Now.plainTimeISO().round({
          smallestUnit: "minute",
          roundingIncrement: 15,
          roundingMode: "ceil",
        })
      : Temporal.PlainTime.from({ hour: 17, minute: 0 });
    const dur = end.since(start, {
      largestUnit: "hour",
      smallestUnit: "minute",
      roundingIncrement: 0.25,
      roundingMode: "ceil",
    });

    return (hours += dur.total("hours"));
  }, 0);
}

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
  getByPage: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");

      return collection
        .find<Timer>(
          { owner: userId },
          { limit: input.limit, skip: input.offset }
        )
        .sort(timerSort)
        .toArray();
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

  getByProject: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");

      return collection
        .find<Timer>({ owner: userId, project: input })
        .sort(timerSort)
        .toArray();
    }),
  getByDate: protectedProcedure
    .input(z.object({ date: PlainDate, project: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const date = Temporal.PlainDate.from(input.date).toString();
      const query: Query = { owner: userId, date };

      if (input.project) {
        query.project = input.project;
      }

      return collection.find<Timer>(query).sort(timerSort).toArray();
    }),
  getByMonth: protectedProcedure
    .input(PlainDate)
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const inputDate = Temporal.PlainDate.from(input);
      const date = Temporal.PlainDate.from({
        year: inputDate.year,
        month: inputDate.month,
        day: 1,
      });

      return collection
        .find<Timer>({
          owner: userId,
          date: {
            $gte: date.toString(),
            $lt: date.add({ months: 1 }).toString(),
          },
        })
        .sort(timerSort)
        .toArray();
    }),
  getByWeek: protectedProcedure
    .input(z.object({ week: PlainDate, project: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const date = Temporal.PlainDate.from(input.week);

      const Sunday = getSunday(date);
      return await collection
        .find<Timer>(
          input.project
            ? {
                owner: userId,
                project: input.project,
                date: {
                  $gte: Sunday.toString(),
                  $lt: Sunday.add({ weeks: 1 }).toString(),
                },
              }
            : {
                owner: userId,
                date: {
                  $gte: Sunday.toString(),
                  $lt: Sunday.add({ weeks: 1 }).toString(),
                },
              }
        )
        .sort(timerSort)
        .toArray();
    }),
  getUtilizationForYear: protectedProcedure
    .input(z.object({ date: PlainYearMonth }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("timers");
      const date = Temporal.PlainYearMonth.from(input.date);
      const months = new Array(12).fill(null);

      const yearlyTimers = await collection
        .find<Timer>({
          owner: userId,
          date: {
            $gte: date.toString(),
            $lte: date.add({ years: 1 }).toString(),
          },
        })
        .toArray();

      months.forEach((_, m) => {
        const pd = date.add({ months: m });

        months[m] = {
          year: pd.year,
          date: pd.toString(),
          month: pd.toLocaleString("en", { month: "short" }),
          days: new Array(pd.daysInMonth).fill(null).map((_, d) => {
            const day = Temporal.PlainDate.from({
              year: pd.year,
              month: pd.month,
              day: d + 1,
            });
            const timers = yearlyTimers.filter(
              (t) => t.date === day.toString() && t.utilized
            );
            return {
              date: day.toString(),
              day: day.toLocaleString("en", { weekday: "short" }),
              hours: sumTimerHours(timers),
            };
          }),
        };
      });

      return months as YearlyUtilizationReport;
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
