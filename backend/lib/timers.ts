import type { TimerQuery, Timer, TimerQueryCombinator } from "../schema/timer";
import { getDurationHoursFromString, isAfterDate, isBeforeDate } from "./dates";

function internalFilter(f: TimerQuery, t: Timer, defaultReturn = true) {
  if (f.criteria === "title" && typeof f.value === "string") {
    if (f.predicate === "contains") {
      return (t[f.criteria as keyof Timer] as string).includes(f.value);
    } else if (f.predicate === "ends_with") {
      return (t[f.criteria as keyof Timer] as string).endsWith(f.value);
    } else if (f.predicate === "starts_with") {
      return (t[f.criteria as keyof Timer] as string).startsWith(f.value);
    } else {
      return (t[f.criteria as keyof Timer] as string) === f.value;
    }
  } else if (
    f.criteria === "date" &&
    f.predicate === "fiscal" &&
    typeof f.value === "string"
  ) {
    const td = Temporal.PlainDate.from(t.date);
    const vd = Temporal.PlainYearMonth.from(f.value);
    const d1 = new Temporal.PlainDate(vd.year, vd.month, 1);
    const d2 = d1.add({ years: 1 });
    return isAfterDate(td, d1) && isBeforeDate(td, d2);
  } else if ((f.criteria === "tags" || f.criteria === "project") && f.value) {
    const search = Array.isArray(f.value) ? f.value : [f.value as string];
    return search.some((s) => {
      return (
        t[f.criteria as keyof Timer] &&
        (t[f.criteria as keyof Timer] as string[]).includes(s)
      );
    });
  } else if (f.criteria === "utilized") {
    if (f.value === "true") return t.utilized;
    return !t.utilized;
  } else if (f.criteria === "duration") {
    if (f.predicate === "running") return !t.end;

    const val = Number(f.value ?? 0);
    const dur = getDurationHoursFromString(
      t.start,
      t.end || Temporal.Now.plainTimeISO().toString()
    );
    if (f.predicate === "gt") {
      return dur > val;
    } else if (f.predicate === "gte") {
      return dur >= val;
    } else if (f.predicate === "lt") {
      return dur < val;
    } else if (f.predicate === "lte") {
      return dur <= val;
    } else {
      return dur === val;
    }
  } else if (f.criteria === "date" && Array.isArray(f.value)) {
    if (f.predicate === "between") {
      const td = Temporal.PlainDate.from(t.date);
      const vd1 = Temporal.PlainDate.from(f.value[0]);
      const vd2 = Temporal.PlainDate.from(f.value[1]);
      return isAfterDate(td, vd1) && isBeforeDate(td, vd2);
    } else if (f.predicate === "after") {
      const td = Temporal.PlainDate.from(t.date);
      const vd1 = Temporal.PlainDate.from(f.value[0]);
      return isAfterDate(td, vd1);
    } else if (f.predicate === "before") {
      const td = Temporal.PlainDate.from(t.date);
      const vd1 = Temporal.PlainDate.from(f.value[0]);
      return isBeforeDate(td, vd1);
    } else if (f.predicate === "equals") {
      const td = Temporal.PlainDate.from(t.date);
      const vd1 = Temporal.PlainDate.from(f.value[0]);
      return td.toString() === vd1.toString();
    }
  }
  return defaultReturn;
}

export function filterTimers(
  filters: TimerQuery[],
  timers: Timer[] = [],
  combinator: TimerQueryCombinator
) {
  if (combinator === "and") {
    return timers.filter((t) =>
      filters.every((f) => internalFilter(f, t, true))
    );
  } else if (combinator === "or") {
    return timers.filter((t) =>
      filters.some((f) => internalFilter(f, t, false))
    );
  } else {
    return timers;
  }
}
