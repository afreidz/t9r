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

export function getDurationHoursFromString(a: string, b: string) {
  const start = Temporal.PlainTime.from(a);
  const end = Temporal.PlainTime.from(b);

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

export function getWeeksArray(n: number = 1, forward = true) {
  const date = getToday();
  const Sunday = Temporal.PlainDate.from({
    year: date.year,
    month: date.month,
    day: date.day - date.dayOfWeek,
  });

  const opp = forward ? "add" : "subtract";
  const weeks: Temporal.PlainDate[] = [];

  Array.from({ length: n }, (_, i) => {
    weeks.push(Sunday[opp]({ weeks: i }));
  });

  return weeks;
}

export function formatForForecastWeek(d: Temporal.PlainDate) {
  const timeZone = Temporal.Now.timeZone();
  const zoned = d.toZonedDateTime({ timeZone });
  const date = new Date(zoned.epochMilliseconds);

  return date.toLocaleString(locale, { dateStyle: "short" });
}

export function formatForShortTime(d: Temporal.PlainDateTime) {
  const timeZone = Temporal.Now.timeZone();
  const zoned = d.toZonedDateTime({ timeZone });
  const date = new Date(zoned.epochMilliseconds);

  return date.toLocaleString(locale, { timeStyle: "short" });
}
