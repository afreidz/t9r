<script lang="ts">
  import {
    roundUp,
    isToday,
    getMonth,
    getToday,
    getSunday,
    getWeekDay,
    formatTime,
    formatForMonth,
    formatForShortTime,
  } from "@/lib/dates";
  import trpc from "@/lib/trpc";
  import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import { get } from "svelte/store";
  import now from "@/lib/stores/now";
  import Tag from "@/core/Tag.svelte";
  import projects from "@/stores/projects";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import HourSum from "@/core/HourSum.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import { fetchTags } from "@/lib/stores/tags";
  import NewTimer from "@/core/NewTimer.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { location, push } from "svelte-spa-router";
  import breakpoints from "@/lib/stores/breakpoints";
  import type { Timer } from "@/backend/schema/timer";
  import { isSelecting, selected } from "@/lib/stores/ui";
  import TimerCard from "@/components/core/TimerCard.svelte";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionView from "@/core/actions/View.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionFilter from "@/core/actions/Filter.svelte";
  import ActionPicker from "@/core/actions/Picker.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  export let params: { date: string } = { date: Temporal.Now.plainDateISO().toString() };

  let loaded = false;
  let nowText: string;
  let page: number = 1;
  let per: number = 100;
  let view: Views = "list";
  let timers: Timer[] = [];
  let nowIndicator: HTMLElement;
  let showInfo: boolean = false;
  let showFilters: boolean = false;
  let viewChanged: boolean = false;
  let viewDate: Temporal.PlainDate;
  let loader: Promise<unknown> | undefined;
  let hovered: string | undefined = undefined;
  let key: Temporal.PlainDateTime | null = null;
  let duration: "days" | "months" | "weeks" | "all" = "days";

  onMount(() => {
    showInfo = get(breakpoints).xxxl;
  });

  $: if ($breakpoints.lg && duration === "days" && !viewChanged) view = "timeline";
  $: if (viewDate || (duration === "all" && page)) loader = updateTimers();
  $: if (viewDate && view === "timeline" && isToday(viewDate)) key = $now;
  $: if (params?.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if ($now) nowText = formatForShortTime($now);
  $: if (view) loaded = false;

  $: duration = $location.includes("/timers/month")
    ? "months"
    : $location.includes("/timers/week")
    ? "weeks"
    : $location.includes("/timers/all")
    ? "all"
    : "days";

  $: if (nowIndicator && !loaded) {
    loaded = true;
    nowIndicator.scrollIntoView({
      inline: "center",
      block: undefined,
      behavior: "smooth",
    });
  }

  function navigateNext() {
    if (duration === "all") return page++;
    push(`/timers/${duration}/${viewDate.add({ [duration]: 1 })}`);
  }

  function navigatePrev() {
    if (duration === "all") return page--;
    push(`/timers/${duration}/${viewDate.subtract({ [duration]: 1 })}`);
  }

  function navigateCurrent() {
    if (duration === "all") return (page = 0);
    push(`/timers/${duration}/${getToday()}`);
  }

  async function updateTimers() {
    loaded = false;
    switch (duration) {
      case "all":
        timers = await trpc.timers.getByPage.query({
          limit: per,
          offset: per * (page - 1),
        });
        break;
      case "months":
        if (!viewDate) break;
        timers = await trpc.timers.getByMonth.query(viewDate.toString());
        break;
      case "weeks":
        if (!viewDate) break;
        timers = await trpc.timers.getByWeek.query({
          week: viewDate.toString(),
        });
        break;
      case "days":
        if (!viewDate) break;
        timers = await trpc.timers.getByDate.query({
          date: viewDate.toString(),
        });
        break;
    }
    await fetchTags();
  }

  function calculateGridPosition(s: string, e: string | null | undefined, i: number) {
    const start = Temporal.PlainTime.from(s);
    const end = e
      ? Temporal.PlainTime.from(e)
      : Temporal.Now.plainTimeISO().round(roundUp);

    const startRow = i + 2;
    const endRow = startRow + 1;
    const startCol = start.hour * 4 + start.minute / 15;
    const endCol = Math.max(end.hour * 4 + end.minute / 15, startCol);

    return `grid-column-start: ${startCol}; grid-column-end: ${endCol}; grid-row-start: ${startRow}; grid-row-end: ${endRow};`;
  }

  function calculateNowGridPosition(l: number = 0) {
    const now = Temporal.Now.plainTimeISO().round(roundUp);
    const start = now.hour * 4 + now.minute / 15;
    const end = start + 1;

    return `grid-column-start: ${start}; grid-column-end: ${end}; grid-row-start: 1; grid-row-end: ${
      l + 3
    };`;
  }

  function calculateHourGridPosition(h: number = 0, l: number = 0) {
    const start = h * 4;
    const end = start + 1;

    return `grid-column-start: ${start}; grid-column-end: ${end}; grid-row-start: 1; grid-row-end: ${
      l + 3
    };`;
  }

  function hourFromIndex(h: number = 0) {
    const pt = Temporal.PlainDateTime.from({
      year: $now.year,
      month: $now.month,
      day: $now.day,
      hour: h,
      minute: 0,
      second: 0,
    });

    return formatForShortTime(pt);
  }

  function shouldScrollTo(i: number) {
    if (i !== timers.length - 1) return false;
    if (view !== "timeline") return false;
    if (isToday(viewDate)) return false;
    if (!viewDate) return false;
    if (loaded) return false;
    return true;
  }
</script>

<Layout {loader}>
  <Header as="h2">
    <div slot="sub" class="flex flex-1 items-center gap-2">
      {#if duration === "all"}
        <Icon icon="mdi:hamburger-menu" />
      {:else if duration === "months"}
        <Icon icon="mdi:calendar-month-outline" class="text-neutral-light" />
      {:else if duration === "weeks"}
        <Icon icon="mdi:calendar-minus-outline" class="text-neutral-light" />
      {:else if isToday(viewDate)}
        <Icon icon="ic:round-arrow-circle-down" class="text-neutral-light" />
      {:else}
        <Icon icon="mdi:calendar-today-outline" class="text-neutral-light" />
      {/if}
      <span>
        Timers
        {#if duration === "days"}
          for {getWeekDay(viewDate)}
        {:else if duration === "weeks"}
          for week of
        {:else if duration === "months"}
          for
        {/if}
      </span>
    </div>
    <div slot="main">
      {#if duration === "months"}
        {getMonth(viewDate)}
        {viewDate.year}
      {:else if duration !== "all"}
        {getSunday(viewDate).day} {getMonth(viewDate)} {viewDate.year}
      {:else}
        All Timers
      {/if}
    </div>

    <div slot="right">
      {#key key}
        <HourSum hours={sumTimerHours(timers)} />
      {/key}
    </div>

    <ActionBar class={view === "timeline" ? "sticky left-0" : ""}>
      <div slot="left" class="flex gap-2">
        <ActionFilter on:click={() => (showFilters = !showFilters)} />
        {#if duration !== "all"}
          <ActionPicker />
        {/if}
      </div>
      <ActionPrev on:click={navigatePrev} disabled={duration === "all" && page === 0} />
      {#if duration !== "all"}
        <ActionCurrent on:click={navigateCurrent} disabled={isToday(viewDate)} />
      {/if}
      <ActionNext
        on:click={navigateNext}
        disabled={duration === "all" ? timers.length === 0 : isToday(viewDate)}
      />
      <div slot="right" class="flex gap-2">
        {#if duration === "days"}
          <ActionView
            bind:current={view}
            on:click={() => {
              viewChanged = true;
            }}
          />
        {/if}
        <ActionInfo enabled={showInfo} on:click={() => (showInfo = !showInfo)} />
      </div>
    </ActionBar>
  </Header>

  <div
    class="flex flex-1 flex-col gap-y-1"
    class:grid={view === "timeline"}
    class:max-w-7xl={view !== "timeline"}
    style={`grid-template-columns: repeat(96, ${
      $breakpoints.xxl
        ? "2%"
        : $breakpoints.xl
        ? "4%"
        : $breakpoints.lg
        ? "6%"
        : $breakpoints.md
        ? "8%"
        : "10%"
    }); grid-template-rows: 2rem repeat(${timers.length}, min-content) auto;`}
  >
    {#if view === "timeline"}
      {#each new Array(24) as _, hour}
        <div
          class="relative h-full border-l border-dotted border-white/10 opacity-50"
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
    {#key key}
      {#if view === "timeline" && isToday(viewDate)}
        <div
          class="pointer-events-none relative z-10 h-full border-l border-red-500"
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
          title={timer.title}
          scrollto={shouldScrollTo(i)}
          highlight={hovered === timer._id}
          on:focus={() => (hovered = timer._id)}
          on:mouseover={() => (hovered = timer._id)}
          on:mouseleave={() => (hovered = undefined)}
          project={$projects.find((p) => p._id === timer.project)}
          style={calculateGridPosition(timer.start, timer.end, i)}
        >
          <div slot="left">
            {#if view !== "timeline"}
              <Tag>{formatTime(timer.start)}</Tag>
            {/if}
          </div>
          {#if view !== "timeline"}
            <Tag>{formatForMonth(timer.date)}</Tag>
          {/if}
          <div slot="right">
            {#if view !== "timeline"}
              <Tag>{timer.end ? formatTime(timer.end) : "running"}</Tag>
            {/if}
          </div>
        </TimerComponent>
      {/each}
    {/key}
  </div>
  <aside
    class="fixed right-4 bottom-20 top-48 z-10 mx-4 mt-1 flex w-[320px] origin-right flex-col overflow-auto rounded-md border border-black/20 bg-neutral-900/80 p-2 backdrop-blur-md transition-all md:bottom-10 md:top-44 md:right-6 md:mx-6 md:p-4 {showInfo
      ? 'flex translate-x-0 opacity-100'
      : 'translate-x-full opacity-0'}"
  >
    {#each timers as timer}
      <TimerCard
        id={timer._id}
        end={timer.end}
        tags={timer.tags}
        title={timer.title}
        start={timer.start}
        hours={sumTimerHours([timer])}
        highlight={hovered === timer._id}
        date={formatForMonth(timer.date)}
        on:focus={() => (hovered = timer._id)}
        on:mouseover={() => (hovered = timer._id)}
        on:mouseleave={() => (hovered = undefined)}
        project={$projects.find((p) => p._id === timer.project)}
      />
    {/each}
  </aside>
  <aside
    class="fixed left-0 bottom-20 top-48 z-10 mx-4 mt-1 flex w-[320px] origin-right flex-col overflow-auto rounded-md border border-black/20 bg-neutral-900/80 p-2 backdrop-blur-md transition-all md:top-44 md:bottom-10 md:mx-6 md:p-4 {showFilters
      ? 'translate-x-[16px] opacity-100 md:translate-x-[344px]'
      : '-translate-x-full opacity-0'}"
  >
    Filters
  </aside>

  <div slot="cta">
    {#if $isSelecting || ["all", "days"].includes(duration)}
      {#if $isSelecting}
        <DualAction>
          <Button
            slot="secondary"
            on:click={() => {
              $selected = [];
              $isSelecting = false;
            }}
            class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
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
            class="flex h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
          >
            <Icon icon="ri:pencil-line" />
          </Button>
        </DualAction>
      {:else if duration === "all" || duration === "days"}
        <NewTimer
          lastTimer={timers.at(-1)}
          date={viewDate}
          on:timer-update={() => {
            loaded = false;
            loader = updateTimers();
          }}
        />
      {/if}
    {/if}
  </div>
</Layout>
