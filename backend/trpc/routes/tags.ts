import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Timer } from "../../schema/timer";
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
  getAllByProject: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("tags");

      const result = await collection
        .find<Tag>({ owner: userId, project: input })
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
  deleteTag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const tags = db.collection("tags");
      const timers = db.collection<Timer>("timers");

      if (!ObjectId.isValid(input.id))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Id",
          cause: input.id,
        });

      const tag = await tags.findOne<Tag>({
        owner: userId,
        _id: new ObjectId(input.id),
      });

      if (!tag)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tag not found",
          cause: input.id,
        });

      const updateResults = await timers.updateMany(
        { owner: userId, tags: input.id },
        { $set: { "tags.$": tag.value } }
      );

      if (updateResults instanceof DBError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateResults.message,
          cause: updateResults,
        });
      }

      const deleteResult = await tags.deleteOne({ _id: new ObjectId(tag._id) });

      if (deleteResult instanceof DBError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: deleteResult.message,
          cause: deleteResult,
        });
      } else {
        return deleteResult;
      }
    }),
  create: protectedProcedure
    .input(TagSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("tags");

      const { value, project } = input;
      const regex = new RegExp(`^${value}$`, "i");
      const existing = await collection.findOne<Tag>({ value: regex, project });

      if (existing) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Project and value for tag already exists",
          cause: existing,
        });
      }

      const result = await collection.insertOne({
        value,
        project,
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
