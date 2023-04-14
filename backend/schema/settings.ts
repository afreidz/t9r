import { z } from "zod";
import { PlainTime } from "./timer";

const SettingsSchema = z.object({
  _id: z.string().optional(),
  owner: z.string().optional(),
  sod: PlainTime.optional()
    .nullable()
    .default(Temporal.PlainTime.from({ hour: 9, minute: 0 }).toString()),
  eod: PlainTime.optional()
    .nullable()
    .default(Temporal.PlainTime.from({ hour: 17, minute: 0 }).toString()),
  fiscalYear: z
    .array(z.array(z.number().min(1).max(12)).min(2).max(2))
    .min(4)
    .max(4)
    .default([
      [4, 7],
      [7, 9],
      [9, 1],
      [1, 4],
    ]),
});

export default SettingsSchema;
export type Settings = z.infer<typeof SettingsSchema>;
