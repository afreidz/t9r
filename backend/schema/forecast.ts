import { z } from "zod";
import { PlainDate } from "./timer";

const ForecastSchema = z.object({
  week: PlainDate,
  hours: z.number(),
  _id: z.string().optional(),
  owner: z.string().optional(),
  project: z.string().optional(),
});

export default ForecastSchema;
export type Forecast = z.infer<typeof ForecastSchema>;
