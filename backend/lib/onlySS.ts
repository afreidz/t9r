import type { User } from "../trpc/lib/context";
import settingsRouter from "../trpc/routes/settings";

export default async function getFiscalYearStartMonthSS(
  d: Temporal.PlainDate | string,
  user: User
) {
  const pd = typeof d === "string" ? Temporal.PlainDate.from(d) : d;
  const settingsCaller = settingsRouter.createCaller({ user });
  const s = await settingsCaller.get();

  if (!s || !s.fiscalYearStart)
    throw new Error("no fiscal year settings found");

  if (pd.month === s.fiscalYearStart)
    return new Temporal.PlainYearMonth(pd.year, pd.month);

  if (pd.month < s.fiscalYearStart)
    return new Temporal.PlainYearMonth(pd.year - 1, s.fiscalYearStart);

  return new Temporal.PlainYearMonth(pd.year, s.fiscalYearStart);
}
