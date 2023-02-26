import { TRPCError } from "@trpc/server";
import ProjectSchema from "../../schema/project";
import { router, protectedProcedure } from "../lib";
import getDBClient, { DBError } from "../../database";

const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    const db = await getDBClient();
    const collection = db.collection("projects");

    return collection.find({ owner: userId }).toArray();
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
});

export default projectsRouter;
