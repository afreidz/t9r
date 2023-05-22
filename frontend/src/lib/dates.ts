export * from "@/backend/lib/dates";
import { Temporal } from "temporal-polyfill";
import { updateSettings } from "@/lib/stores/settings";

export async function getFiscalYearStartMonth(d: Temporal.PlainDate | string) {
  const pd = typeof d === "string" ? Temporal.PlainDate.from(d) : d;
  const s = await updateSettings();

  if (!s) throw new Error("no settings for fiscal year start");

  if (pd.month === s.fiscalYearStart)
    return new Temporal.PlainYearMonth(pd.year, pd.month);

  if (pd.month < s.fiscalYearStart)
    return new Temporal.PlainYearMonth(pd.year - 1, s.fiscalYearStart);

  return new Temporal.PlainYearMonth(pd.year, s.fiscalYearStart);
}
