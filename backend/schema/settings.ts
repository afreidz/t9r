import { z } from "zod";
import { PlainTime, PlainDate } from "./timer";

const SettingsSchema = z.object({
  _id: z.string().optional(),
  owner: z.string().optional(),
  sod: PlainTime.optional()
    .nullable()
    .default(Temporal.PlainTime.from({ hour: 9, minute: 0 }).toString()),
  eod: PlainTime.optional()
    .nullable()
    .default(Temporal.PlainTime.from({ hour: 17, minute: 0 }).toString()),
  fiscalYearStart: z.number().min(1).max(12).default(4),
  defaultUtilization: z.number().min(0).max(100).default(100),
  trackingStart: PlainDate.default(Temporal.Now.plainDateISO().toString()),
  hiddenTags: z.array(z.string()).default([]),
  savedQueries: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      })
    )
    .default([]),
});

export default SettingsSchema;
export type Settings = z.infer<typeof SettingsSchema>;
