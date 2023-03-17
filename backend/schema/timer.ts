import { z } from "zod";

export const PlainTime = z.string().refine((s) => {
  try {
    Temporal.PlainTime.from(s);
    return true;
  } catch (err) {
    return false;
  }
});

export const PlainDate = z.string().refine((s) => {
  try {
    Temporal.PlainDate.from(s);
    return true;
  } catch (err) {
    return false;
  }
});

const TimerSchema = z
  .object({
    date: PlainDate,
    start: PlainTime,
    _id: z.string().optional(),
    owner: z.string().optional(),
    project: z.string().optional(),
    end: PlainTime.optional().nullable(),
    tags: z.array(z.string()).default([]),
    title: z.string().min(2).max(30).optional(),
    utilized: z.boolean().optional().default(false),
  })
  .passthrough();

export default TimerSchema;
export type Timer = z.infer<typeof TimerSchema>;
