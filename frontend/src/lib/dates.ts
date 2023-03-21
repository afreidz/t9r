export const locale = "en-us";

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

  return date.toLocaleString("en", {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatForWeek(s: string) {
  const date = Temporal.PlainDate.from(s);

  return date.toLocaleString("en", {
    weekday: "short",
  });
}

export function formatTime(s: string) {
  const date = Temporal.PlainTime.from(s);

  const hh = date.hour === 12 || date.hour === 24 ? 12 : date.hour % 12;
  const mm = date.minute.toLocaleString("en", { minimumIntegerDigits: 2 });
  const ap = date.hour > 12 ? "PM" : "AM";

  return `${hh}:${mm} ${ap}`;
}
