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

export const PlainMonthDay = z.string().refine((s) => {
  try {
    Temporal.PlainMonthDay.from(s);
    return true;
  } catch (err) {
    return false;
  }
});

export const PlainYearMonth = z.string().refine((s) => {
  try {
    Temporal.PlainYearMonth.from(s);
    return true;
  } catch (err) {
    return false;
  }
});

const TimerSchema = z.object({
  date: PlainDate,
  start: PlainTime,
  project: z.string(),
  _id: z.string().optional(),
  owner: z.string().optional(),
  end: PlainTime.optional().nullable(),
  tags: z.array(z.string()).default([]),
  utilized: z.boolean().optional().default(false),
  title: z.string().min(2).max(60).optional().default("Timer"),
});

export default TimerSchema;
export type Timer = z.infer<typeof TimerSchema>;

export type MonthlyUtilizationReport = {
  year: number;
  month: string;
  date: string;
  days: {
    day: string;
    date: string;
    hours: number;
  }[];
};

export type YearlyUtilizationReport = [
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport,
  MonthlyUtilizationReport
];

export const StringPredicates = z.enum([
  "equals",
  "contains",
  "ends_with",
  "starts_with",
]);
export const DurationPredicates = z.enum([
  "eq",
  "gt",
  "lt",
  "lte",
  "gte",
  "running",
]);
export const DatePredicates = z.enum([
  "eq",
  "after",
  "before",
  "fiscal",
  "between",
]);

export const TimerQuerySchema = z.object({
  value: z.string().or(z.array(z.string())),
  criteria: z
    .enum(["tags", "date", "title", "project", "utilized", "duration"])
    .optional(),
  predicate: StringPredicates.or(DurationPredicates)
    .or(DatePredicates)
    .optional(),
});

export const TimerQuerySchemaCombinator = z.enum(["and", "or"]);
export type TimerQueryCombinator = z.infer<typeof TimerQuerySchemaCombinator>;
export type TimerQuery = z.infer<typeof TimerQuerySchema>;
