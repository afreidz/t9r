import { isToday, roundUp } from "./dates";
import type { Timer } from "@/backend/schema/timer";

export function sumTimerHours(timers: Timer[] = []) {
  return timers.reduce((hours, timer) => {
    const d = Temporal.PlainDate.from(timer.date);
    const start = Temporal.PlainTime.from(timer.start);
    const end = timer.end
      ? Temporal.PlainTime.from(timer.end)
      : isToday(d)
      ? Temporal.Now.plainTimeISO().round(roundUp)
      : Temporal.PlainTime.from({ hour: 17, minute: 0 });
    const dur = end.since(start);

    return (hours += dur.hours + dur.minutes / 60);
  }, 0);
}
