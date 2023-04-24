import { get } from "svelte/store";
import { Temporal } from "temporal-polyfill";
import settings from "@/lib/stores/settings";

export const locale = "en-us";

export const roundDown: Temporal.RoundTo<"minute"> = {
  smallestUnit: "minute",
  roundingIncrement: 15,
  roundingMode: "floor",
};
export const roundUp: Temporal.RoundTo<"minute"> = {
  smallestUnit: "minute",
  roundingIncrement: 15,
  roundingMode: "ceil",
};

export function getToday() {
  return Temporal.Now.plainDateISO();
}

export function getMonth(d: Temporal.PlainDate) {
  return d.toLocaleString(locale, { month: "long" });
}

export function getWeekDay(d: Temporal.PlainDate) {
  return d.toLocaleString(locale, { weekday: "long" });
}

export function isToday(d: Temporal.PlainDate | string) {
  const pd = typeof d === "string" ? Temporal.PlainDate.from(d) : d;
  return pd.equals(getToday());
}

export function getFiscalYearStartMonth(d: Temporal.PlainDate | string) {
  const pd = typeof d === "string" ? Temporal.PlainDate.from(d) : d;
  const s = get(settings);

  if (!s) throw new Error("no settings for fiscal year start");

  if (pd.month === s.fiscalYearStart)
    return new Temporal.PlainYearMonth(pd.year, pd.month);

  if (pd.month < s.fiscalYearStart)
    return new Temporal.PlainYearMonth(pd.year - 1, s.fiscalYearStart);

  return new Temporal.PlainYearMonth(pd.year, s.fiscalYearStart);
}

export function getDurationHoursFromString(a: string, b: string) {
  const start = Temporal.PlainTime.from(a).round(roundUp);
  const end = Temporal.PlainTime.from(b).round(roundUp);

  return end.since(start).total("hour");
}

export function formatForMonth(s: string) {
  const date = Temporal.PlainDate.from(s);

  return date.toLocaleString(locale, {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatForWeek(s: string) {
  const date = Temporal.PlainDate.from(s);

  return date.toLocaleString(locale, {
    weekday: "short",
  });
}

export function formatTime(s: string) {
  const date = Temporal.PlainTime.from(s);

  const hh = date.hour === 12 || date.hour === 24 ? 12 : date.hour % 12;
  const mm = date.minute.toLocaleString(locale, { minimumIntegerDigits: 2 });
  const ap = date.hour > 12 ? "PM" : "AM";

  return `${hh}:${mm} ${ap}`;
}

export function getSunday(d: Temporal.PlainDate = getToday()) {
  if (d.dayOfWeek === 7) return d;
  return d.subtract({ days: d.dayOfWeek });
}

export function getWeeksArray(n: number = 1, forward = true) {
  const Sunday = getSunday();

  const opp = forward ? "add" : "subtract";
  const weeks: Temporal.PlainDate[] = [];

  Array.from({ length: n }, (_, i) => {
    weeks.push(Sunday[opp]({ weeks: i }));
  });

  return weeks;
}

export function plainDateToLegacy(d: Temporal.PlainDate | Temporal.PlainDateTime) {
  const timeZone = Temporal.Now.timeZone();
  const zoned = d.toZonedDateTime({ timeZone });
  return new Date(zoned.epochMilliseconds);
}

export function formatForForecastWeek(d: Temporal.PlainDate) {
  const date = plainDateToLegacy(d);
  return date.toLocaleString(locale, { dateStyle: "short" });
}

export function formatForShortTime(d: Temporal.PlainDateTime) {
  const date = plainDateToLegacy(d);
  return date.toLocaleString(locale, { timeStyle: "short" });
}

export function isBeforeDate(d1: Temporal.PlainDate, d2: Temporal.PlainDate) {
  return Temporal.PlainDate.compare(d1, d2) <= 0;
}

export function isAfterDate(d1: Temporal.PlainDate, d2: Temporal.PlainDate) {
  return !isBeforeDate(d1, d2);
}
