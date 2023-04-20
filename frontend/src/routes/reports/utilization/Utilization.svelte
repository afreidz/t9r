<script lang="ts">
  import trpc from "@/lib/trpc";
  import Day from "./Day.svelte";
  import Icon from "@iconify/svelte";
  import { get } from "svelte/store";
  import { pop } from "svelte-spa-router";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import SumChip from "@/core/SumChip.svelte";
  import { Temporal } from "temporal-polyfill";
  import settings from "@/lib/stores/settings";
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
  import Field from "@/components/foundation/Field.svelte";

  let view = Temporal.Now.plainDateISO();
  let report: YearlyUtilizationReport;
  let newTarget: HTMLInputElement;
  let loader: Promise<void>;
  let target: number;
  let modify = false;

  $: if (view)
    loader = getFiscalYearStartMonth(view).then(async (pd) => {
      target =
        (await trpc.targets.getByYear.query({ year: view.year }))?.percent ||
        get(settings)?.defaultUtilization ||
        100;
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
    const today = Temporal.Now.plainDateISO();
    const date = Temporal.PlainDate.from(item.date);
    const trackingStart =
      $settings?.trackingStart && Temporal.PlainDate.from($settings.trackingStart);

    if (trackingStart && isBeforeDate(date, trackingStart)) return "bg-neutral-700";
    if (item.day === "" && item.hours === 0) return "transparent";
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

<Layout {loader}>
  <Header main="Utilization" sub="Fiscal Year {view.year}">
    <div slot="right">
      <SumChip value={target} unit="%" label="Target" />
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
              {@const actual = (day.hours / 8) * 100}
              <Day
                color={getColor(day)}
                highlight={isToday(day.date)}
                shift={![6, 7].includes(pd.dayOfWeek)}
                href={`/#/timers/day/${pd.toString()}`}
                info={isBeforeDate(pd, Temporal.Now.plainDateISO()) && day.day !== ""}
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
