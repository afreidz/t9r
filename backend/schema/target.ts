import { z } from "zod";

const TargetSchema = z.object({
  _id: z.string().optional(),
  owner: z.string().optional(),
  percent: z.number().min(0).max(100),
  year: z.number().min(1900).max(9999),
});

export default TargetSchema;
export type Target = z.infer<typeof TargetSchema>;
