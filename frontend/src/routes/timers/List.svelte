<script lang="ts">
  import {
    isToday,
    getMonth,
    getToday,
    getWeekDay,
    formatTime,
    formatForWeek,
    formatForMonth,
    getDurationHoursFromString,
  } from "@/lib/dates";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import projects from "@/stores/projects";
  import { fetchTags } from "@/lib/stores/tags";
  import Tag from "@/components/core/Tag.svelte";
  import { location, push } from "svelte-spa-router";
  import type { Timer } from "@/backend/schema/timer";
  import Layout from "@/components/core/Layout.svelte";
  import Header from "@/components/core/Header.svelte";
  import NewTimer from "@/components/core/NewTimer.svelte";
  import TimerComponent from "@/components/core/Timer.svelte";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  export let params: { date: string };

  let page: number = 0;
  let per: number = 10;
  let timers: Timer[] = [];
  let loader: Promise<unknown>;
  let viewDate: Temporal.PlainDate = getToday();
  let view: "day" | "month" | "week" | "all" = "day";
  let mapping = {
    day: "days",
    week: "weeks",
    all: undefined,
    month: "months",
  };

  $: if ((view === "all" && page) || page === 0) loader = updateTimers();
  $: if (params?.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if (viewDate) loader = updateTimers();
  $: view = $location.includes("/timers/month")
    ? "month"
    : $location.includes("/timers/week")
    ? "week"
    : $location.includes("/timers/all")
    ? "all"
    : "day";

  function navigateNext() {
    if (view === "all") return page++;

    const mapped = mapping[view];
    if (!mapped) return;
    push(`/timers/${view}/${viewDate.add({ [mapped]: 1 })}`);
  }

  function navigatePrev() {
    if (view === "all") return page--;

    const mapped = mapping[view];
    if (!mapped) return;
    push(`/timers/${view}/${viewDate.subtract({ [mapped]: 1 })}`);
  }

  function navigateCurrent() {
    if (view === "all") return (page = 0);
    push(`/timers/${view}/${getToday()}`);
  }

  async function updateTimers() {
    switch (view) {
      case "all":
        timers = await trpc.timers.getByPage.query({
          limit: per,
          offset: per * page,
        });
        break;
      case "month":
        timers = await trpc.timers.getByMonth.query(viewDate.toString());
        break;
      case "week":
        timers = await trpc.timers.getByWeek.query(viewDate.toString());
        break;
      case "day":
        timers = await trpc.timers.getByDate.query(viewDate.toString());
        break;
    }
    await fetchTags();
  }
</script>

<Layout>
  {#await loader then}
    <Header as="h2">
      <div slot="sub" class="flex flex-1 items-center gap-2">
        {#if view === "all"}
          <Icon icon="mdi:hamburger-menu" />
        {:else if view === "month"}
          <Icon icon="mdi:calendar-month-outline" class="text-neutral-light" />
        {:else if view === "week"}
          <Icon icon="mdi:calendar-minus-outline" class="text-neutral-light" />
        {:else if isToday(viewDate)}
          <Icon icon="ic:round-arrow-circle-down" class="text-neutral-light" />
        {:else}
          <Icon icon="mdi:calendar-today-outline" class="text-neutral-light" />
        {/if}
        <span>
          Timers
          {#if view === "day"}
            for {getWeekDay(viewDate)}
          {:else if view === "week"}
            for week of
          {:else if view === "month"}
            for
          {/if}
        </span>
      </div>
      <div slot="main">
        {#if view === "month"}
          {getMonth(viewDate)}
          {viewDate.year}
        {:else if view !== "all"}
          {viewDate.day} {getMonth(viewDate)} {viewDate.year}
        {:else}
          All Timers
        {/if}
      </div>
    </Header>

    <ActionBar>
      <ActionPrev
        on:click={navigatePrev}
        disabled={view === "all" && page === 0}
      />
      {#if view !== "all"}
        <ActionCurrent
          on:click={navigateCurrent}
          disabled={isToday(viewDate)}
        />
      {/if}
      <ActionNext
        on:click={navigateNext}
        disabled={view === "all" ? timers.length === 0 : isToday(viewDate)}
      />
    </ActionBar>

    {#each timers as timer}
      <TimerComponent
        id={timer._id}
        title={timer.title}
        tags={timer.tags}
        project={$projects.find((p) => p._id === timer.project)}
      >
        <div slot="left">
          {#if view === "all"}
            <Tag>{timer.date}</Tag>
          {:else if view === "month"}
            <Tag>{formatForMonth(timer.date)}</Tag>
          {:else if view === "week"}
            <Tag>{formatForWeek(timer.date)}</Tag>
          {/if}
          <Tag>{formatTime(timer.start)}</Tag>
        </div>
        <div slot="right">
          {#if timer.utilized}
            <Tag>utilized</Tag>
          {/if}
          {#if timer.end}
            <Tag>{getDurationHoursFromString(timer.start, timer.end)}hrs</Tag>
          {/if}
          <Tag>
            {#if timer.end}
              {formatTime(timer.end)}
            {:else}
              running
            {/if}
          </Tag>
        </div>
      </TimerComponent>
    {/each}
  {/await}

  <div slot="cta">
    <NewTimer on:timer-update={() => (loader = updateTimers())} />
  </div>
</Layout>
