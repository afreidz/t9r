import { z } from "zod";

const TagSchema = z.object({
  _id: z.string().optional(),
  owner: z.string().optional(),
  value: z.string().min(2).max(30),
});

export default TagSchema;
export type Tag = z.infer<typeof TagSchema>;
