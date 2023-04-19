<script lang="ts">
  import trpc from "@/lib/trpc";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import settings from "@/lib/stores/settings";
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

  $: if (view)
    loader = getFiscalYearStartMonth(view).then(async (pd) => {
      report = await trpc.timers.getUtilizationForYear.query({ date: pd.toString() });
    });

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
    if (isAfterDate(date, Temporal.Now.plainDateISO())) return "bg-neutral-700";
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
        <div>
          <Copy
            semibold
            variant="gradient"
            class="my-4 flex justify-center text-lg uppercase"
            >{item.month} {item.year}</Copy
          >
          <ul
            class="grid w-80 grid-cols-7 gap-3 rounded-md p-6 ring-blue-500 {isThisMonth(
              item.date
            )
              ? 'ring-2'
              : 'ring-0'}"
          >
            {#each item.days as day}
              <li
                class="aspect-square w-full rounded-sm ring-blue-500 {getColor(
                  day
                )} {isToday(day.date)
                  ? 'ring-2 ring-offset-4 ring-offset-neutral-800'
                  : 'ring-0'}"
              />
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</Layout>
