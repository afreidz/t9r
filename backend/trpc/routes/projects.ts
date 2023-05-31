import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError, ObjectId } from "../../database";
import ProjectSchema, { type Project } from "../../schema/project";

const projectsRouter = router({
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("projects");

    return collection.findOne({ owner: userId, _id: new ObjectId(input) });
  }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("projects");

    const result = await collection.find<Project>({ owner: userId }).toArray();

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
      const timers = db.collection("timers");
      const collection = db.collection("projects");

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
      }

      const timersResult = await timers.updateMany(
        { project: input.id },
        { $set: { project: null } }
      );

      if (timersResult instanceof DBError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: timersResult.message,
          cause: timersResult,
        });
      } else {
        return result;
      }
    }),
  create: protectedProcedure
    .input(ProjectSchema)
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("projects");

      const { name, color } = input;

      const result = await collection.insertOne({
        name,
        color,
        owner: userId,
        archived: false,
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
    .input(
      z.object({
        id: z.string(),
        details: ProjectSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx.user;
      const db = await getDBClient();
      const collection = db.collection("projects");

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

export default projectsRouter;
