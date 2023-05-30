export * from "@/backend/lib/dates";
import { Temporal } from "temporal-polyfill";
import { updateSettings } from "@/lib/stores/settings";
import { isBeforeDate, isAfterDate } from "@/backend/lib/dates";

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

export type FiscalQuarter = {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
  qtr: number;
};

export async function getQuarterByDate(d: Temporal.PlainDate) {
  const fyStartMonth = await getFiscalYearStartMonth(d);
  const fyStart = new Temporal.PlainDate(fyStartMonth.year, fyStartMonth.month, 1);

  const qtr1: FiscalQuarter = { start: fyStart, end: fyStart.add({ months: 3 }), qtr: 1 };
  const qtr2: FiscalQuarter = {
    start: fyStart.add({ months: 3 }),
    end: fyStart.add({ months: 6 }),
    qtr: 2,
  };
  const qtr3: FiscalQuarter = {
    start: fyStart.add({ months: 6 }),
    end: fyStart.add({ months: 9 }),
    qtr: 3,
  };
  const qtr4: FiscalQuarter = {
    start: fyStart.add({ months: 9 }),
    end: fyStart.add({ years: 1 }),
    qtr: 4,
  };

  if (d.equals(qtr1.start) || (isAfterDate(d, qtr1.start) && isBeforeDate(d, qtr1.end)))
    return qtr1;
  if (d.equals(qtr2.start) || (isAfterDate(d, qtr2.start) && isBeforeDate(d, qtr2.end)))
    return qtr2;
  if (d.equals(qtr3.start) || (isAfterDate(d, qtr3.start) && isBeforeDate(d, qtr3.end)))
    return qtr3;
  if (d.equals(qtr4.start) || (isAfterDate(d, qtr4.start) && isBeforeDate(d, qtr4.end)))
    return qtr4;

  return qtr1;
}
