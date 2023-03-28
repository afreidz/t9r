<script lang="ts">
  import {
    roundUp,
    isToday,
    getMonth,
    getToday,
    getWeekDay,
    formatTime,
    formatForWeek,
    formatForMonth,
    formatForShortTime,
    getDurationHoursFromString,
  } from "@/lib/dates";
  import trpc from "@/lib/trpc";
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import projects from "@/stores/projects";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import { fetchTags } from "@/lib/stores/tags";
  import NewTimer from "@/core/NewTimer.svelte";
  import Moveable from "@/core/Moveable.svelte";
  import Tag from "@/components/core/Tag.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { location, push } from "svelte-spa-router";
  import type { Timer } from "@/backend/schema/timer";
  import { ctaPosition, isSelecting, selected } from "@/lib/stores/ui";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionView from "@/core/actions/View.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  export let params: { date: string };

  let loaded = false;
  let nowText: string;
  let page: number = 0;
  let per: number = 10;
  let timers: Timer[] = [];
  let view: Views = "list";
  let now: Date = new Date();
  let loader: Promise<unknown>;
  let nowIndicator: HTMLElement;
  let viewDate: Temporal.PlainDate = getToday();
  let duration: "day" | "month" | "week" | "all" = "day";
  let mapping = {
    day: "days",
    week: "weeks",
    all: undefined,
    month: "months",
  };

  onMount(() => {
    if (isToday(viewDate)) {
      setInterval(() => {
        loaded = true;
        now = new Date();
      }, 20000);
    }
  });

  $: if (now) nowText = now.toLocaleString("en", { timeStyle: "short" });
  $: if ((duration === "all" && page) || page === 0) loader = updateTimers();
  $: if (params?.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if (viewDate) loader = updateTimers();
  $: duration = $location.includes("/timers/month")
    ? "month"
    : $location.includes("/timers/week")
    ? "week"
    : $location.includes("/timers/all")
    ? "all"
    : "day";
  $: view = duration === "day" ? "timeline" : "list";
  $: if (isToday(viewDate) && nowIndicator && !loaded) {
    nowIndicator.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function navigateNext() {
    if (duration === "all") return page++;

    const mapped = mapping[duration];
    if (!mapped) return;
    push(`/timers/${duration}/${viewDate.add({ [mapped]: 1 })}`);
  }

  function navigatePrev() {
    if (duration === "all") return page--;

    const mapped = mapping[duration];
    if (!mapped) return;
    push(`/timers/${duration}/${viewDate.subtract({ [mapped]: 1 })}`);
  }

  function navigateCurrent() {
    if (duration === "all") return (page = 0);
    push(`/timers/${duration}/${getToday()}`);
  }

  async function updateTimers() {
    switch (duration) {
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

  function calculateGridPosition(
    s: string,
    e: string | null | undefined,
    i: number
  ) {
    const start = Temporal.PlainTime.from(s);
    const end = e
      ? Temporal.PlainTime.from(e)
      : Temporal.Now.plainTimeISO().round(roundUp);

    return `grid-column-start: ${
      start.hour * 4 + start.minute / 15
    }; grid-column-end: ${end.hour * 4 + end.minute / 15}; grid-row-start: ${
      i + 2
    }; grid-row-end: ${i + 3}`;
  }

  function calculateNowGridPosition(l: number = 0) {
    const now = Temporal.Now.plainTimeISO().round(roundUp);
    const start = now.hour * 4 + now.minute / 15;
    const end = start + 1;

    return `grid-column-start: ${start}; grid-column-end: ${end}; grid-row-start: 1; grid-row-end: ${
      l + 3
    }`;
  }

  function calculateHourGridPosition(h: number = 0, l: number = 0) {
    const start = h * 4;
    const end = start + 1;

    return `grid-column-start: ${start}; grid-column-end: ${end}; grid-row-start: 1; grid-row-end: ${
      l + 3
    }`;
  }

  function hourFromIndex(h: number = 0) {
    const pt = new Temporal.PlainDateTime(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h,
      0
    );
    return formatForShortTime(pt);
  }
</script>

<Layout {loader}>
  <Header as="h2">
    <div slot="sub" class="flex flex-1 items-center gap-2">
      {#if duration === "all"}
        <Icon icon="mdi:hamburger-menu" />
      {:else if duration === "month"}
        <Icon icon="mdi:calendar-month-outline" class="text-neutral-light" />
      {:else if duration === "week"}
        <Icon icon="mdi:calendar-minus-outline" class="text-neutral-light" />
      {:else if isToday(viewDate)}
        <Icon icon="ic:round-arrow-circle-down" class="text-neutral-light" />
      {:else}
        <Icon icon="mdi:calendar-today-outline" class="text-neutral-light" />
      {/if}
      <span>
        Timers
        {#if duration === "day"}
          for {getWeekDay(viewDate)}
        {:else if duration === "week"}
          for week of
        {:else if duration === "month"}
          for
        {/if}
      </span>
    </div>
    <div slot="main">
      {#if duration === "month"}
        {getMonth(viewDate)}
        {viewDate.year}
      {:else if duration !== "all"}
        {viewDate.day} {getMonth(viewDate)} {viewDate.year}
      {:else}
        All Timers
      {/if}
    </div>
  </Header>

  <ActionBar>
    <ActionPrev
      on:click={navigatePrev}
      disabled={duration === "all" && page === 0}
    />
    {#if duration !== "all"}
      <ActionCurrent on:click={navigateCurrent} disabled={isToday(viewDate)} />
    {/if}
    <ActionNext
      on:click={navigateNext}
      disabled={duration === "all" ? timers.length === 0 : isToday(viewDate)}
    />
    <ActionView
      slot="right"
      bind:current={view}
      disableReport={true}
      disableTimeline={duration !== "day"}
    />
  </ActionBar>

  <div
    class="flex-1"
    class:grid={view === "timeline"}
    class:grid-cols-[repeat(96,50px)]={view === "timeline"}
    style="grid-template-rows: 2rem repeat({timers.length}, minmax(min-content, 80px)) auto;"
  >
    {#if view === "timeline"}
      {#each new Array(24) as _, hour}
        <div
          class="relative h-full border-l border-white/10 opacity-50"
          style={calculateHourGridPosition(hour, timers.length)}
        >
          <span
            class="absolute top-0 left-1 whitespace-nowrap rounded-md bg-transparent p-2 text-xs"
          >
            {hourFromIndex(hour)}
          </span>
        </div>
      {/each}
    {/if}
    {#key now}
      {#if view === "timeline" && isToday(viewDate)}
        <div
          class="relative z-10 h-full border-l border-red-500"
          style={calculateNowGridPosition(timers.length)}
        >
          <span
            class="absolute top-0 left-1 whitespace-nowrap rounded-md bg-red-500 p-2 text-xs"
            bind:this={nowIndicator}
          >
            {nowText}
          </span>
        </div>
      {/if}
      {#each timers as timer, i}
        <TimerComponent
          id={timer._id}
          tags={timer.tags}
          title={timer.title}
          scrollto={i === timers.length - 1 && !isToday(viewDate)}
          project={$projects.find((p) => p._id === timer.project)}
          style={calculateGridPosition(timer.start, timer.end, i)}
        >
          <div slot="left">
            {#if duration === "all"}
              <Tag>{timer.date}</Tag>
            {:else if duration === "month"}
              <Tag>{formatForMonth(timer.date)}</Tag>
            {:else if duration === "week"}
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
    {/key}
  </div>

  {#if duration === "all"}
    <ActionBar>
      <ActionPrev on:click={navigatePrev} disabled={page === 0} />
      <ActionNext on:click={navigateNext} disabled={timers.length === 0} />
    </ActionBar>
  {/if}

  <div slot="cta">
    {#if $isSelecting || ["all", "day"].includes(duration)}
      <Moveable state={$ctaPosition}>
        {#if $isSelecting}
          <DualAction>
            <Button
              slot="secondary"
              on:click={() => {
                $selected = [];
                $isSelecting = false;
              }}
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
            >
              <Icon icon="teenyicons:x-small-outline" />
            </Button>
            <span slot="content">Edit {$selected.length} timers</span>
            <Button
              on:click={() => {
                push("/timer/selected");
                $isSelecting = false;
              }}
              slot="primary"
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-blue-500 text-white !ring-offset-white"
            >
              <Icon icon="ri:pencil-line" />
            </Button>
          </DualAction>
        {:else if duration === "all" || duration === "day"}
          <NewTimer
            date={viewDate}
            on:timer-update={() => (loader = updateTimers())}
          />
        {/if}
      </Moveable>
    {/if}
  </div>
</Layout>
