<script lang="ts">
  import {
    isToday,
    getMonth,
    getToday,
    getWeekDay,
    getDurationHoursFromString,
    formatForMonth,
  } from "@/lib/dates";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import projects from "@/stores/projects";
  import { location } from "svelte-spa-router";
  import { fetchTags } from "@/lib/stores/tags";
  import Tag from "@/components/core/Tag.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import Layout from "@/components/core/Layout.svelte";
  import Header from "@/components/core/Header.svelte";
  import NewTimer from "@/components/core/NewTimer.svelte";
  import TimerComponent from "@/components/core/Timer.svelte";
  import DateActions from "@/components/core/DateActions.svelte";

  export let params: { date: string };

  let loader: Promise<unknown>;
  let view: "daily" | "monthly" = "daily";

  let query:
    | typeof trpc.timers.getByDate.query
    | typeof trpc.timers.getByMonth.query;

  let timers: Timer[] = [];
  let viewDate: Temporal.PlainDate = getToday();

  $: if (params?.date) viewDate = Temporal.PlainDate.from(params.date);
  $: query = $location.includes("/timers/monthly")
    ? trpc.timers.getByMonth.query
    : trpc.timers.getByDate.query;
  $: if (viewDate) loader = updateTimers();
  $: view = $location.includes("/timers/monthly") ? "monthly" : "daily";

  async function updateTimers() {
    timers = await query(viewDate.toString());
    await fetchTags();
  }

  function getAllTags(t: Timer) {
    const tags = [...(t.tags || [])];
    if (!t.end) tags.push("running");
    if (t.utilized) tags.push("utilized");
    if (t.end) tags.push(`${getDurationHoursFromString(t.start, t.end)}hrs`);
    return tags;
  }
</script>

<Layout>
  {#await loader then}
    <Header as="h2">
      <div slot="sub" class="flex flex-1 items-center gap-2">
        {#if view === "monthly"}
          <Icon icon="mdi:calendar-month-outline" class="text-neutral-light" />
        {:else if isToday(viewDate)}
          <Icon icon="ic:round-arrow-circle-down" class="text-neutral-light" />
        {:else}
          <Icon icon="mdi:calendar-today-outline" class="text-neutral-light" />
        {/if}
        <span>
          Timers for {#if view === "daily"}{getWeekDay(viewDate)}{/if}
        </span>
      </div>
      <div slot="main">
        {#if view === "monthly"}
          {getMonth(viewDate)}
          {viewDate.year}
        {:else}
          {viewDate.day} {getMonth(viewDate)} {viewDate.year}
        {/if}
      </div>
    </Header>
    <DateActions
      date={viewDate}
      disableTimelineView={view === "monthly"}
      baseRoute={view === "monthly" ? "/timers/monthly" : "/timers/daily"}
    />

    {#each timers as timer}
      <TimerComponent
        id={timer._id}
        title={timer.title}
        tags={getAllTags(timer)}
        project={$projects.find((p) => p._id === timer.project)}
      >
        <Tag slot="left">{formatForMonth(timer.date)}</Tag>
      </TimerComponent>
    {/each}
  {/await}

  <div slot="cta">
    <NewTimer on:timer-update={() => (loader = updateTimers())} />
  </div>
</Layout>
