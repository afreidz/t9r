import getDBClient from "../../database";
import { router, protectedProcedure } from "../lib";

const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = ctx.user;
    console.log("User", userId);

    const db = await getDBClient();
    const collection = db.collection("projects");

    return collection.find({ owner: userId }).toArray();
  }),
});

export default projectsRouter;
