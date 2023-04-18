import { z } from "zod";
import { PlainTime } from "./timer";

const SettingsSchema = z.object({
  _id: z.string().optional(),
  owner: z.string().optional(),
  zoom: z.number().optional().default(2),
  sod: PlainTime.optional()
    .nullable()
    .default(Temporal.PlainTime.from({ hour: 9, minute: 0 }).toString()),
  eod: PlainTime.optional()
    .nullable()
    .default(Temporal.PlainTime.from({ hour: 17, minute: 0 }).toString()),
  fiscalYearStart: z.number().min(1).max(12).default(4),
});

export default SettingsSchema;
export type Settings = z.infer<typeof SettingsSchema>;
