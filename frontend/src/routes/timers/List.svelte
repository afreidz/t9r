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
  import { get } from "svelte/store";
  import now from "@/lib/stores/now";
  import Tag from "@/core/Tag.svelte";
  import projects from "@/stores/projects";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import HourSum from "@/core/SumChip.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import NewTimer from "@/core/NewTimer.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerCard from "@/core/TimerCard.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import { location, push } from "svelte-spa-router";
  import breakpoints from "@/lib/stores/breakpoints";
  import type { Timer } from "@/backend/schema/timer";
  import Filters from "@/core/filters/Filters.svelte";
  import { showLeftSidebar, showRightSidebar, timelineZoom } from "@/lib/stores/ui";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionAdd from "@/core/actions/Add.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionView from "@/core/actions/View.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
  import ActionFilter from "@/core/actions/Filter.svelte";
  import ActionPicker from "@/core/actions/Picker.svelte";
  import ActionZoomIn from "@/core/actions/ZoomIn.svelte";
  import ActionZoomOut from "@/core/actions/ZoomOut.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  export let params: { date: string } = { date: Temporal.Now.plainDateISO().toString() };

  let loaded = false;
  let nowText: string;
  let page: number = 1;
  let per: number = 100;
  let stage: HTMLElement;
  let view: Views = "list";
  let timers: Timer[] = [];
  let loader: Promise<void>;
  let nowIndicator: HTMLElement;
  let filters: Filter.Set = [{}];
  let viewChanged: boolean = false;
  let viewDate: Temporal.PlainDate;
  let combinator: Filter.Combinator = "and";
  let highlightCard: string | undefined = undefined;
  let highlightTimer: string | undefined = undefined;
  let duration: "days" | "months" | "weeks" | "all" = "days";

  onMount(() => {
    $showRightSidebar = get(breakpoints).xxxl;
  });

  $: if ($breakpoints.lg && duration === "days" && !viewChanged) view = "timeline";
  $: if (viewDate || (duration === "all" && page)) loader = updateTimers();
  $: if (params?.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if ($now) nowText = formatForShortTime($now);
  $: if (view) loaded = false;
  $: console.log(filters);

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
</script>

<Layout>
  <Header
    as="h2"
    slot="header"
    main={duration === "months"
      ? `${getMonth(viewDate)} ${viewDate.year}`
      : duration !== "all"
      ? `${getSunday(viewDate).day} ${getMonth(viewDate)} ${viewDate.year}`
      : "All Timers"}
    sub={duration === "days"
      ? `Timers for ${getWeekDay(viewDate)}`
      : duration === "weeks"
      ? `Timers for week of`
      : "Timers for"}
  >
    <div slot="right">
      {#key $now}
        <HourSum value={sumTimerHours(timers)} />
      {/key}
    </div>

    <ActionBar class={view === "timeline" ? "sticky left-0" : ""}>
      <div slot="left" class="flex gap-2">
        <ActionFilter
          direction="left"
          enabled={$showLeftSidebar}
          on:click={() => ($showLeftSidebar = !$showLeftSidebar)}
        />
        {#if duration !== "all"}
          <ActionPicker />
        {/if}
      </div>
      {#if view === "timeline" && $breakpoints.md}
        <ActionZoomOut on:click={() => ($timelineZoom *= 0.95)} />
      {/if}
      <ActionPrev on:click={navigatePrev} disabled={duration === "all" && page === 0} />
      {#if duration !== "all"}
        <ActionCurrent on:click={navigateCurrent} disabled={isToday(viewDate)} />
      {/if}
      <ActionNext
        on:click={navigateNext}
        disabled={duration === "all" ? timers.length === 0 : isToday(viewDate)}
      />
      {#if view === "timeline" && $breakpoints.md}
        <ActionZoomIn on:click={() => ($timelineZoom *= 1.05)} />
      {/if}
      <div slot="right" class="flex gap-2">
        {#if duration === "days"}
          <ActionView
            bind:current={view}
            on:click={() => {
              viewChanged = true;
            }}
          />
        {/if}
        <ActionInfo
          direction="right"
          enabled={$showRightSidebar}
          on:click={() => {
            $showRightSidebar = !$showRightSidebar;
          }}
        />
      </div>
    </ActionBar>
  </Header>

  <div
    class="flex flex-1 flex-col gap-y-1"
    bind:this={stage}
    class:grid={view === "timeline"}
    class:max-w-7xl={view !== "timeline"}
    style={`grid-template-columns: repeat(96, ${$timelineZoom}vw); grid-template-rows: 2rem repeat(${timers.length}, min-content) auto;`}
  >
    {#if view === "timeline"}
      {#each new Array(24) as _, hour}
        <div
          class="relative z-10 h-full border-l border-dotted border-white/10 opacity-50"
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
    {#key $now}
      {#if view === "timeline" && isToday(viewDate)}
        <div
          class="pointer-events-none relative z-0 h-full border-l border-red-500"
          style={calculateNowGridPosition(timers.length)}
        >
          <span
            class="absolute top-0 left-1 z-10 whitespace-nowrap rounded-md bg-red-500 p-2 text-xs"
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
          highlight={highlightCard === timer._id}
          on:blur={() => (highlightTimer = undefined)}
          on:focus={() => (highlightTimer = timer._id)}
          on:mouseover={() => (highlightTimer = timer._id)}
          on:mouseleave={() => (highlightTimer = undefined)}
          project={$projects.find((p) => p._id === timer.project)}
          style={calculateGridPosition(timer.start, timer.end, i)}
          scrollto={!isToday(viewDate) && timers[i] === timers.at(-1)}
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

  <div slot="right" class="overflow-auto md:min-w-[320px]">
    <header class="flex items-center justify-between px-2">
      <Copy as="h3" semibold variant="gradient" class="text-lg uppercase">Timer Info</Copy
      >
      <ActionClose on:click={() => ($showRightSidebar = false)} />
    </header>
    <div class="m-4">
      {#if $showRightSidebar}
        {#each timers as timer}
          <TimerCard
            id={timer._id}
            end={timer.end}
            tags={timer.tags}
            title={timer.title}
            start={timer.start}
            hours={sumTimerHours([timer])}
            date={formatForMonth(timer.date)}
            highlight={highlightTimer === timer._id}
            on:blur={() => (highlightCard = undefined)}
            on:focus={() => (highlightCard = timer._id)}
            on:mouseover={() => (highlightCard = timer._id)}
            on:mouseleave={() => (highlightCard = undefined)}
            project={$projects.find((p) => p._id === timer.project)}
          />
        {/each}
      {/if}
    </div>
  </div>

  <div slot="left" class="flex flex-1 flex-col overflow-auto md:min-w-[320px]">
    {#if $showLeftSidebar}
      <header
        class="sticky top-0 z-10 flex flex-none items-center justify-between border-b border-black/20 bg-neutral-900 py-2 px-4"
      >
        <Copy as="h3" semibold variant="gradient" class="text-lg uppercase"
          >Filter Timers</Copy
        >
        <div class="flex gap-2">
          <ActionAdd on:click={() => (filters = [...filters, {}])} />
          <ActionClose on:click={() => ($showLeftSidebar = false)} />
        </div>
      </header>
      <Filters bind:filters bind:combinator class="mx-4 flex-1" />
      <footer
        class="sticky bottom-0 z-10 flex flex-none border-t border-black/20 bg-neutral-900 py-2 px-4"
      >
        <Button
          class="flex-1 bg-gradient-to-br from-violet-600 to-cyan-600 py-4 text-center"
        >
          <Copy as="span" variant="gradient" bold class="uppercase">Apply Filters</Copy>
        </Button>
      </footer>
    {/if}
  </div>

  <div slot="cta">
    <NewTimer
      lastTimer={timers.at(-1)}
      date={viewDate}
      on:timer-update={() => {
        loaded = false;
        loader = updateTimers();
      }}
    />
  </div>
</Layout>
