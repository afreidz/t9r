<script lang="ts">
  import trpc from "@/lib/trpc";
  import Day from "./Day.svelte";
  import Icon from "@iconify/svelte";
  import { get } from "svelte/store";
  import { pop } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import SumChip from "@/core/SumChip.svelte";
  import { Temporal } from "temporal-polyfill";
  import settings from "@/lib/stores/settings";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import Copy from "@/components/foundation/Copy.svelte";
  import Field from "@/components/foundation/Field.svelte";
  import { getFiscalYearStartMonth, isAfterDate } from "@/lib/dates";
  import type { YearlyUtilizationReport } from "@/backend/schema/timer";
  import { isBeforeDate, isToday, getToday, isAfterPYM, isBeforePYM } from "@/lib/dates";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";
  import Sub from "@/components/core/nav/Sub.svelte";

  type DonutChartData = {
    percent: number;
    color: "stroke-red-400" | "stroke-amber-400" | "stroke-emerald-400";
  };

  let view = Temporal.Now.plainDateISO();
  let fyStart: Temporal.PlainYearMonth;
  let report: YearlyUtilizationReport;
  let newTarget: HTMLInputElement;
  let showQTD = false;
  let showYTD = false;
  let target: number;
  let modify = false;

  let qtd: DonutChartData = {
    percent: 0,
    color: "stroke-red-400",
  };

  let ytd: DonutChartData = {
    percent: 0,
    color: "stroke-red-400",
  };

  $: if (view) {
    getFiscalYearStartMonth(view).then((startMonth) => {
      fyStart = startMonth;
      trpc.targets.getByYear.query({ year: view.year }).then((result) => {
        target = result?.percent || get(settings)?.defaultUtilization || 100;
      });
      trpc.timers.getUtilizationForYear
        .query({ date: startMonth.toString() })
        .then((result) => (report = result));
    });
  }

  $: if (report && target) {
    const fy = [
      fyStart,
      fyStart.add({ months: 3 }),
      fyStart.add({ months: 6 }),
      fyStart.add({ months: 9 }),
    ];
    const viewMonth = Temporal.PlainYearMonth.from(view);
    const average = (target / 3) * 2;

    const yearDays = report
      .map((r) => r.days)
      .flat()
      .filter((d) => {
        const day = Temporal.PlainDate.from(d.date);
        if (day.equals(view)) return true;
        return isBeforeDate(day, view);
      });

    const yearWeekDays = yearDays.filter((d) => !["Sat", "Sun"].includes(d.day));
    const yearTotalHours = yearWeekDays.length * 8;
    const yearActualHours = yearDays.reduce((hours, day) => {
      return (hours += day.hours);
    }, 0);

    const ytdPercent = (yearActualHours / yearTotalHours) * 100;
    if (ytdPercent <= average) ytd.color = "stroke-red-400";
    if (ytdPercent > average && ytdPercent < target) ytd.color = "stroke-amber-400";
    if (ytdPercent >= target) ytd.color = "stroke-emerald-400";
    ytd.percent = ytdPercent;

    const qtr = fy.find((q, i) => {
      if (q.equals(viewMonth)) return true;
      return isAfterPYM(viewMonth, q) && fy[i + 1] && isBeforePYM(viewMonth, fy[i + 1]);
    });

    const qtrMonths = report.filter((r) => {
      if (!qtr) return false;
      const month = Temporal.PlainYearMonth.from(r.date);
      if (month.equals(qtr)) return true;
      return isAfterPYM(month, qtr) && isBeforePYM(month, qtr.add({ months: 3 }));
    });

    const qtrDays = qtrMonths
      .map((m) => m.days)
      .flat()
      .filter((d) => {
        const day = Temporal.PlainDate.from(d.date);
        if (day.equals(view)) return true;
        return isBeforeDate(day, view);
      });

    const qtrWeekDays = qtrDays.filter((d) => !["Sat", "Sun"].includes(d.day));
    const qtrTotalHours = qtrWeekDays.length * 8;
    const qtrActualHours = qtrDays.reduce((hours, day) => {
      return (hours += day.hours);
    }, 0);

    const qtdPercent = (qtrActualHours / qtrTotalHours) * 100;
    if (qtdPercent <= average) qtd.color = "stroke-red-400";
    if (qtdPercent > average && qtdPercent < target) qtd.color = "stroke-amber-400";
    if (qtdPercent >= target) qtd.color = "stroke-emerald-400";
    qtd.percent = qtdPercent;
  }

  function pad(days: YearlyUtilizationReport[number]["days"]) {
    const firstOfMonth = Temporal.PlainDate.from(days[0].date);
    const offset = firstOfMonth.dayOfWeek === 7 ? 0 : firstOfMonth.dayOfWeek;
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
    const today = Temporal.Now.plainDateISO();
    const date = Temporal.PlainDate.from(item.date);
    const trackingStart =
      $settings.trackingStart &&
      Temporal.PlainDate.from($settings.trackingStart).subtract({ days: 1 });

    if (item.day === "" && item.hours === 0) return "transparent";
    if (trackingStart && isBeforeDate(date, trackingStart)) return "bg-neutral-700";
    if (isAfterDate(date, today) || !target) return "bg-neutral-700";
    if (["Sat", "Sun"].includes(item.day) && item.hours) return "bg-cyan-400";
    if (["Sat", "Sun"].includes(item.day) && !item.hours) return "bg-neutral-700";

    const actual = (item.hours / 8) * 100;
    const average = (target / 3) * 2;

    if (actual <= average) return "bg-red-400";
    if (actual > average && actual < target) return "bg-amber-400";
    if (actual >= target) return "bg-emerald-400";

    return "bg-neutral-700";
  }

  async function update() {
    if (!newTarget) return;

    await trpc.targets.updateOrCreate.mutate({
      year: view.year,
      percent: Number(newTarget.value),
    });

    modify = false;
    view = view;
  }
</script>

<Layout>
  <Header slot="header" main="Utilization" sub="Fiscal Year {view.year}">
    <div slot="right">
      {#if target}
        <SumChip value={target} unit="%" label="Target" />
      {/if}
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
    {@const thisMonth = Temporal.PlainYearMonth.from(getToday())}
    {@const tmResult = report.find((r) => thisMonth.equals(r.date))}
    <div class="my-10 flex flex-wrap justify-evenly gap-6">
      <div class="relative flex w-64 flex-col items-center">
        <Copy
          semibold
          variant="gradient"
          class="my-4 flex justify-center text-lg uppercase">Average</Copy
        >
        <figure class="relative p-4">
          <svg viewBox="0 0 120 120" class="h-44">
            <path
              class="stroke-neutral-700"
              d="M60 10
                a 50 50 0 0 1 0 100
                a 50 50 0 0 1 0 -100"
              fill="none"
              stroke-width="10"
            />
            <path
              class={ytd.color}
              d="M60 10
                a 50 50 0 0 1 0 100
                a 50 50 0 0 1 0 -100"
              fill="none"
              pathLength="100"
              stroke-width="10"
              on:blur={() => (showYTD = false)}
              on:focus={() => (showYTD = true)}
              on:mouseout={() => (showYTD = false)}
              on:mouseover={() => (showYTD = true)}
              stroke-dasharray="{ytd.percent}, 100"
            />
            <path
              class="stroke-neutral-700"
              d="M60 25
                a 35 35 0 0 1 0 70
                a 35 35 0 0 1 0 -70"
              fill="none"
              stroke-width="10"
            />
            <path
              class={qtd.color}
              d="M60 25
                a 35 35 0 0 1 0 70
                a 35 35 0 0 1 0 -70"
              fill="none"
              pathLength="100"
              stroke-width="10"
              on:blur={() => (showQTD = false)}
              on:focus={() => (showQTD = true)}
              on:mouseout={() => (showQTD = false)}
              on:mouseover={() => (showQTD = true)}
              stroke-dasharray="{qtd.percent}, 100"
            />
            <text
              x="60"
              y="50"
              text-anchor="middle"
              class="fill-white/50 font-pseudoMono text-[0.5em] italic">Target</text
            >
            <text
              x="60"
              y="70"
              text-anchor="middle"
              class="fill-white font-sans font-semibold">{target}%</text
            >
          </svg>
          {#if showQTD}
            <div
              in:fade={{ duration: 100, delay: 300 }}
              out:fade={{ duration: 100, delay: 300 }}
              class="absolute top-0 left-0 -mt-10 w-full rounded-md bg-neutral-700 p-3 text-sm shadow-lg before:absolute before:left-1/2 before:top-[100%] before:-translate-x-1/2 before:border-8 before:border-x-transparent before:border-b-transparent before:border-t-neutral-700 before:content-['']"
            >
              QTD: {qtd.percent.toFixed(2)}%
            </div>
          {/if}
          {#if showYTD}
            <div
              in:fade={{ duration: 100, delay: 300 }}
              out:fade={{ duration: 100, delay: 300 }}
              class="absolute top-0 left-0 -mt-10 w-full rounded-md bg-neutral-700 p-3 text-sm shadow-lg before:absolute before:left-1/2 before:top-[100%] before:-translate-x-1/2 before:border-8 before:border-x-transparent before:border-b-transparent before:border-t-neutral-700 before:content-['']"
            >
              YTD: {ytd.percent.toFixed(2)}%
            </div>
          {/if}
        </figure>
      </div>
      {#each tmResult ? [tmResult, ...report] : report as item, i}
        <div class="relative w-64" class:sm:hidden={i === 0 && item === tmResult}>
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
              {@const actual = (day.hours / 8) * 100}
              <Day
                color={getColor(day)}
                highlight={isToday(day.date)}
                shift={![6, 7].includes(pd.dayOfWeek)}
                href={`/#/timers/day/${pd.toString()}`}
                info={isBeforeDate(pd, Temporal.Now.plainDateISO()) &&
                  !!$settings.trackingStart &&
                  isAfterDate(
                    pd,
                    Temporal.PlainDate.from($settings.trackingStart).subtract({ days: 1 })
                  ) &&
                  day.day !== ""}
              >
                <div class="flex justify-between font-light">
                  <span>
                    {pd.toLocaleString("en", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      weekday: "short",
                    })}
                  </span>
                  <span class="font-semibold">{day.hours} hrs</span>
                </div>
                {#if ![6, 7].includes(pd.dayOfWeek)}
                  <div class="flex justify-between font-light">
                    <span>Target: <span class="font-semibold">{target}%</span></span>
                    <span>Actual: <span class="font-semibold">{actual}%</span></span>
                  </div>
                  <div class="my-2 w-full text-center">
                    <span
                      >Variance: <span class="font-semibold"
                        >{actual > target ? "+" : ""}{actual - target}%</span
                      >
                    </span>
                  </div>
                {/if}
              </Day>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
  <div slot="cta">
    <DualAction as="div" label="Modify target % for">
      <Button
        on:click={() => (modify = true)}
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

{#if modify}
  <Dialog
    open={true}
    sub="You are about to modify..."
    title="Target percentage for {view.year}"
  >
    <Button slot="close" value="cancel" on:click={() => (modify = false)}>
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <Field>
      <input
        min={0}
        max={100}
        type="number"
        value={target}
        bind:this={newTarget}
        class="my-2 w-full text-center text-3xl"
      />
    </Field>
    <DualAction>
      <Button
        on:click={() => (modify = false)}
        slot="secondary"
        class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
      >
        <Icon icon="teenyicons:x-small-outline" />
      </Button>
      <span slot="content" class="block text-center">Confirm?</span>
      <Button
        on:click={update}
        slot="primary"
        class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
      >
        <Icon icon="material-symbols:fitbit-check-small-sharp" />
      </Button>
    </DualAction>
  </Dialog>
{/if}
