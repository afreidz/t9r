<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import projects from "@/lib/projects";
  import { location } from "svelte-spa-router";
  import type { SvelteComponent } from "svelte";
  import Tag from "@/components/core/Tag.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import Layout from "@/components/core/Layout.svelte";
  import Header from "@/components/core/Header.svelte";
  import NewTimer from "@/components/core/NewTimer.svelte";
  import TimerComponent from "@/components/core/Timer.svelte";
  import DateActions from "@/components/core/DateActions.svelte";
  import { getWeekDay, getMonth, isToday, getToday } from "@/lib/dates";

  export let params: { date: string };

  let query:
    | typeof trpc.timers.getByDate.query
    | typeof trpc.timers.getByMonth.query;

  let timers: Timer[] = [];
  let viewDate: Temporal.PlainDate = getToday();

  $: if (params?.date) viewDate = Temporal.PlainDate.from(params.date);
  $: query = $location.includes("/timers/monthly")
    ? trpc.timers.getByMonth.query
    : trpc.timers.getByDate.query;
  $: if (viewDate) updateTimers();

  function updateTimers() {
    query(viewDate.toString()).then((results) => {
      timers = results;
    });
  }
</script>

<Layout>
  <Header as="h2">
    <div slot="sub" class="flex flex-1 items-center gap-2">
      {#if $location.startsWith("/timers/monthly")}
        <Icon icon="mdi:calendar-month-outline" class="text-neutral-light" />
      {:else if isToday(viewDate)}
        <Icon icon="ic:round-arrow-circle-down" class="text-neutral-light" />
      {:else}
        <Icon icon="mdi:calendar-today-outline" class="text-neutral-light" />
      {/if}
      <span>
        Timers for {#if $location.startsWith("/timers/daily")}{getWeekDay(
            viewDate
          )}{/if}
      </span>
    </div>
    <div slot="main">
      {#if $location.startsWith("/timers/monthly")}
        {getMonth(viewDate)}
        {viewDate.year}
      {:else}
        {viewDate.day} {getMonth(viewDate)} {viewDate.year}
      {/if}
    </div>
  </Header>
  <DateActions
    date={viewDate}
    disableTimelineView={$location.startsWith("/timers/monthly")}
    baseRoute={$location.startsWith("/timers/monthly")
      ? "/timers/monthly"
      : "/timers/daily"}
  />

  {#each timers as timer}
    <TimerComponent
      id={timer._id}
      project={$projects.find((p) => p._id === timer.project)}
    >
      {#if !timer.end}
        <Tag>running</Tag>
      {/if}
      <Tag>
        {timer.start}
      </Tag>
    </TimerComponent>
  {/each}

  <div slot="cta">
    <NewTimer on:timer-update={updateTimers} />
  </div>
</Layout>
