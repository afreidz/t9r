import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import TargetSchema, { type Target } from "../../schema/target";
import getDBClient, { DBError, ObjectId } from "../../database";

const targetsRouter = router({
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("targets");

    if (!ObjectId.isValid(input)) return undefined;
    return collection.findOne<Target>({
      owner: userId,
      _id: new ObjectId(input),
    });
  }),
  getByYear: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("targets");
      const query = { year: input.year, owner: userId };

      console.log("ANDY", query);

      return collection.findOne<Target>(query);
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("targets");

    const result = await collection.find<Target>({ owner: userId }).toArray();

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
      const collection = db.collection("targets");

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
  updateOrCreate: protectedProcedure
    .input(TargetSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("targets");

      const query = { year: input.year, owner: userId };
      const update = {
        $set: {
          owner: userId,
          year: input.year,
          percent: input.percent,
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

export default targetsRouter;
