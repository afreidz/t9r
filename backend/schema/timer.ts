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
    end: PlainTime.optional(),
    _id: z.string().optional(),
    owner: z.string().optional(),
    project: z.string().optional(),
  })
  .passthrough();

export default TimerSchema;
export type Timer = z.infer<typeof TimerSchema>;
