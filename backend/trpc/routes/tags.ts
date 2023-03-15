import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import TagSchema, { type Tag } from "../../schema/tag";
import getDBClient, { DBError, ObjectId } from "../../database";

const tagsRouter = router({
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("tags");

    if (!ObjectId.isValid(input)) return undefined;

    return collection.findOne<Tag>({ owner: userId, _id: new ObjectId(input) });
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("tags");

    const result = await collection.find<Tag>({ owner: userId }).toArray();

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
    .input(TagSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("tags");

      const { value } = input;

      const result = await collection.insertOne({
        value,
        owner: userId,
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
});

export default tagsRouter;
