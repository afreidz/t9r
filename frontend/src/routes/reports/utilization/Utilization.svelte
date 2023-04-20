<script lang="ts">
  import trpc from "@/lib/trpc";
  import Day from "./Day.svelte";
  import Icon from "@iconify/svelte";
  import { pop } from "svelte-spa-router";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import SumChip from "@/core/SumChip.svelte";
  import { Temporal } from "temporal-polyfill";
  import settings, { getSettings } from "@/lib/stores/settings";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import Copy from "@/components/foundation/Copy.svelte";
  import { isBeforeDate, isToday, getToday } from "@/lib/dates";
  import { getFiscalYearStartMonth, isAfterDate } from "@/lib/dates";
  import type { YearlyUtilizationReport } from "@/backend/schema/timer";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  let report: YearlyUtilizationReport;
  let view = Temporal.Now.plainDateISO();
  let loader: Promise<void>;
  let target: number;

  trpc.targets.getByYear.query({ year: view.year }).then(() => console.log("foo"));

  $: if (view)
    loader = getFiscalYearStartMonth(view).then(async (pd) => {
      await getSettings();
      // target =
      //   (await trpc.targets.getByYear.query({ year: view.year }))?.percent ||
      //   $settings?.defaultUtilization ||
      //   100;
      report = await trpc.timers.getUtilizationForYear.query({ date: pd.toString() });
    });

  function pad(days: YearlyUtilizationReport[number]["days"]) {
    const firstOfMonth = Temporal.PlainDate.from(days[0].date);
    const offset = firstOfMonth.dayOfWeek;
    const pad: typeof days = new Array(offset).fill(null).map((_, i) => ({
      date: firstOfMonth.subtract({ days: i + 1 }).toString(),
      hours: 0,
      day: "",
    }));

    return [...pad, ...days];
  }

  function isThisMonth(d: string) {
    const pd = Temporal.PlainYearMonth.from(d);
    const today = Temporal.Now.plainDateISO();
    return pd.month === today.month && pd.year === today.year;
  }

  function getColor(item: YearlyUtilizationReport[number]["days"][number]) {
    const date = Temporal.PlainDate.from(item.date);

    if (
      $settings?.trackingStart &&
      isBeforeDate(date, Temporal.PlainDate.from($settings.trackingStart))
    )
      return "bg-neutral-700";
    if (item.day === "" && item.hours === 0) return "transparent";
    if (isAfterDate(date, Temporal.Now.plainDateISO()) || !target)
      return "bg-neutral-700";
    if (["Sat", "Sun"].includes(item.day) && item.hours) return "bg-cyan-400";
    if (["Sat", "Sun"].includes(item.day) && !item.hours) return "bg-neutral-700";
    if (item.hours < 3) return "bg-red-400";
    if (item.hours < 6) return "bg-amber-400";
    if (item.hours >= 6) return "bg-emerald-400";
    return "bg-neutral-700";
  }
</script>

<Layout {loader}>
  <Header main="Utilization" sub="Fiscal Year {view.year}">
    <div slot="right">
      <SumChip value={50} unit="%" label="Target" />
    </div>
    <ActionBar>
      <ActionPrev on:click={() => (view = view.subtract({ years: 1 }))} />
      <ActionCurrent on:click={() => (view = getToday())} disabled={isToday(view)} />
      <ActionNext
        on:click={() => (view = view.add({ years: 1 }))}
        disabled={isToday(view)}
      />
    </ActionBar>
  </Header>
  {#if report}
    <div class="my-10 flex flex-wrap gap-6">
      {#each report as item}
        <div class="relative w-64">
          <Copy
            semibold
            variant="gradient"
            class="my-4 flex justify-center text-lg uppercase"
            >{item.month} {item.year}</Copy
          >
          <ul
            class="grid w-full grid-cols-7 gap-2 rounded-md p-4 ring-blue-500 {isThisMonth(
              item.date
            )
              ? 'ring-2'
              : 'ring-0'}"
          >
            {#each pad(item.days) as day}
              {@const pd = Temporal.PlainDate.from(day.date)}
              <Day
                color={getColor(day)}
                highlight={isToday(day.date)}
                href={`/#/timers/day/${pd.toString()}`}
                info={isBeforeDate(pd, Temporal.Now.plainDateISO()) && day.day !== ""}
              >
                <span>
                  {pd.toLocaleString("en", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    weekday: "short",
                  })}
                </span>
                <span>{day.hours} hrs</span>
              </Day>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
  <div slot="cta">
    <DualAction as="div" label="Modify target for">
      <Button
        title="modify target"
        slot="secondary"
        class="flex h-10 w-10 items-center justify-center !rounded-full bg-violet-500 text-white !ring-offset-white"
      >
        <Icon icon="material-symbols:edit-outline" />
      </Button>
      <span slot="content">Fiscal Year {view.year}</span>
      <Button
        slot="primary"
        title="Navigate back"
        on:click={pop}
        class="flex h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
      >
        <Icon icon="ic:outline-arrow-back" />
      </Button>
    </DualAction>
  </div>
</Layout>
