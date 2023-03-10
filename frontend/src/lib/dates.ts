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

export function isToday(d: Temporal.PlainDate) {
  return d.equals(getToday());
}
