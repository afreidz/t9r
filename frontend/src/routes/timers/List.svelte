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
  import {
    showLoader,
    isSelecting,
    timelineZoom,
    showLeftSidebar,
    showRightSidebar,
  } from "@/lib/stores/ui";
  import trpc from "@/lib/trpc";
  import { onMount } from "svelte";
  import qs from "@/lib/stores/qs";
  import now from "@/lib/stores/now";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import projects from "@/stores/projects";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import HourSum from "@/core/SumChip.svelte";
  import settings from "@/lib/stores/settings";
  import NewTimer from "@/core/NewTimer.svelte";
  import EmojiPicker from "@/core/Emojis.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerCard from "@/core/TimerCard.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import breakpoints from "@/lib/stores/breakpoints";
  import Filters from "@/core/filters/Filters.svelte";
  import { shouldRefresh } from "@/lib/stores/visible";
  import type { TimerQuery } from "@/backend/schema/timer";
  import type { Settings } from "@/backend/schema/settings";
  import { filterTimers, sumTimerHours } from "@/lib/timers";
  import { location, push, querystring } from "svelte-spa-router";
  import { addToSelected, removeFromSelected } from "@/lib/stores/selected";
  import type { Timer, TimerQueryCombinator } from "@/backend/schema/timer";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionView from "@/core/actions/View.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionSave from "@/core/actions/Save.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
  import ActionSelect from "@/core/actions/Select.svelte";
  import ActionFilter from "@/core/actions/Filter.svelte";
  import ActionPicker from "@/core/actions/Picker.svelte";
  import ActionZoomIn from "@/core/actions/ZoomIn.svelte";
  import ActionZoomOut from "@/core/actions/ZoomOut.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  export let params: { date?: string } = {};

  let key: unknown;
  let loaded = false;
  let nowText: string;
  let page: number = 1;
  let per: number = 100;
  let stage: HTMLElement;
  let view: Views = "list";
  let timers: Timer[] = [];
  let sod: Temporal.PlainTime;
  let viewTimers: Timer[] = [];
  let filters: TimerQuery[] = [];
  let showSaveQueryDialog = false;
  let viewChanged: boolean = false;
  let viewDate: Temporal.PlainDate;
  let hourIndicators: HTMLElement[] = [];
  let filteredTimers: Timer[] | undefined;
  let combinator: TimerQueryCombinator = "and";
  let highlightCard: string | undefined = undefined;
  let highlightTimer: string | undefined = undefined;
  let duration: "days" | "months" | "weeks" | "all" = "days";
  let saveQueryData: Pick<Settings["savedQueries"][number], "label" | "icon"> = {
    icon: null,
    label: "",
  };

  $: if ($breakpoints.lg && duration === "days" && !viewChanged) view = "timeline";
  $: viewDate = params.date ? Temporal.PlainDate.from(params.date) : getToday();
  $: if ($settings?.sod) sod = Temporal.PlainTime.from($settings.sod);
  $: if (filteredTimers) viewTimers = filteredTimers;
  $: if (viewDate && isToday(viewDate)) key = $now;
  $: if ($now) nowText = formatForShortTime($now);
  $: if (!filteredTimers) viewTimers = timers;
  $: if ($shouldRefresh) viewDate = viewDate;
  $: if (view) loaded = false;

  $: if ($querystring && $location.startsWith("/timers/all")) {
    const qs = new URLSearchParams($querystring);
    if (qs.has("filters")) {
      filters = JSON.parse(qs.get("filters") || "");
    } else {
      filters = [];
    }
    updateTimers();
  }

  $: duration = $location.includes("/timers/month")
    ? "months"
    : $location.includes("/timers/week")
    ? "weeks"
    : $location.includes("/timers/all")
    ? "all"
    : "days";

  $: if (hourIndicators[sod?.hour]) {
    setTimeout(() => {
      if (loaded) return;
      if (!hourIndicators[sod.hour]) return (loaded = false);
      loaded = true;
      hourIndicators[sod.hour]?.scrollIntoView({
        inline: "start",
        behavior: "smooth",
      });
    }, 1);
  }

  $: if (!highlightCard && hourIndicators[sod?.hour]) {
    setTimeout(() => {
      hourIndicators[sod.hour]?.scrollIntoView({
        inline: "start",
        behavior: "smooth",
      });
    }, 300);
  }

  onMount(updateTimers);

  async function navigateNext() {
    if (duration === "all") return page++;
    viewDate = viewDate.add({ [duration]: 1 });
    await push(`/timers/${duration}/${viewDate}`);
    await updateTimers();
  }

  async function navigatePrev() {
    if (duration === "all") return page--;
    viewDate = viewDate.subtract({ [duration]: 1 });
    await push(`/timers/${duration}/${viewDate}`);
    await updateTimers();
  }

  async function navigateCurrent() {
    if (duration === "all") return (page = 0);
    viewDate = getToday();
    await push(`/timers/${duration}/${viewDate}`);
    await updateTimers();
  }

  async function navigateDate(e: CustomEvent) {
    await push(`/timers/${duration}/${e.detail}`);
    await updateTimers();
  }

  async function updateTimers() {
    loaded = false;
    $showLoader = true;
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
        timers = await trpc.timers.getByDate.query({
          date: viewDate.toString() ?? getToday().toString(),
        });
        break;
    }

    if (timers) handleFilter(false);
    $showLoader = false;
  }

  function calculateGridPosition(s: string, e: string | null | undefined, i: number) {
    const start = Temporal.PlainTime.from(s);
    const end = e
      ? Temporal.PlainTime.from(e)
      : Temporal.Now.plainTimeISO().round(roundUp);

    const startRow = i + 2;
    const endRow = startRow + 1;
    const startCol = start.hour * 4 + start.minute / 15;
    const endCol = Math.max(end.hour * 4 + end.minute / 15, startCol + 2);

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

    return pt.toLocaleString("en", { hour12: true, hour: "numeric" });
  }

  async function handleFilter(updateNav = true) {
    filteredTimers =
      duration === "all"
        ? await trpc.timers.getByFilter.query({ filters, combinator })
        : filterTimers(filters, timers, combinator);

    viewTimers = filteredTimers;
    if (updateNav) {
      const filterQS = JSON.stringify(filters);
      const existingQS = new URLSearchParams($querystring);
      existingQS.set("filters", filterQS);
      push(`${$location}?${existingQS.toString()}`);
    }
  }

  function handleClearFilters() {
    filters = [];
    viewTimers = timers;
    $showLeftSidebar = false;
    filteredTimers = undefined;
    push($location);
  }

  function toggleSelected(e: { currentTarget: EventTarget | null }, id?: string) {
    if (!id) return;
    const target = e.currentTarget as HTMLInputElement;
    if (target.checked) addToSelected(id);
    if (!target.checked) removeFromSelected(id);
  }

  async function saveQuery() {
    const newQueries = [
      ...($settings.savedQueries ?? []),
      {
        ...saveQueryData,
        url: window.location.hash.replace("#", ""),
        type: "timer",
      },
    ];

    $showLoader = true;
    await trpc.settings.updateOrCreate.mutate({ ...$settings, savedQueries: newQueries });
    $settings = { ...$settings, savedQueries: newQueries };
    $showLoader = false;
    showSaveQueryDialog = false;
    saveQueryData = { icon: "", label: "" };
  }
</script>

<Layout>
  <Header
    slot="header"
    main={duration === "months"
      ? `${getMonth(viewDate)} ${viewDate.year}`
      : duration === "weeks"
      ? `${getSunday(viewDate).day} ${getMonth(getSunday(viewDate))} ${
          getSunday(viewDate).year
        }`
      : duration === "days"
      ? `${viewDate.day} ${getMonth(viewDate)} ${viewDate.year}`
      : $qs.has("label")
      ? $qs.get("label")
      : "All Timers"}
    sub={duration === "days"
      ? `Timers for ${getWeekDay(viewDate)}`
      : duration === "weeks"
      ? `Timers for week of`
      : "Timers for"}
  >
    <div slot="right">
      {#if timers.length}
        {#key $now}
          <HourSum value={sumTimerHours(viewTimers)} />
        {/key}
      {/if}
    </div>

    <ActionBar class={view === "timeline" ? "sticky left-0" : ""}>
      <div slot="left" class="flex gap-2">
        {#if timers.length}
          <ActionFilter
            direction="left"
            enabled={$showLeftSidebar}
            on:click={() => ($showLeftSidebar = !$showLeftSidebar)}
            class={`from-violet-600 to-cyan-600 ${filters.length && "bg-gradient-to-br"}`}
          />
        {/if}
        {#if duration !== "all"}
          <ActionPicker on:change={navigateDate} />
        {:else if filters.length}
          <ActionSave on:click={() => (showSaveQueryDialog = true)} />
        {/if}
      </div>
      {#if view === "timeline"}
        <ActionZoomOut on:click={() => ($timelineZoom *= 0.95)} />
      {/if}
      <ActionPrev
        on:click={navigatePrev}
        disabled={duration === "all" && (page === 0 || filters.length)}
      />
      {#if duration !== "all"}
        <ActionCurrent on:click={navigateCurrent} disabled={isToday(viewDate)} />
      {/if}
      <ActionNext
        on:click={navigateNext}
        disabled={duration === "all"
          ? timers.length === 0 || filters.length
          : isToday(viewDate)}
      />
      {#if view === "timeline"}
        <ActionZoomIn on:click={() => ($timelineZoom *= 1.05)} />
      {/if}

      <div slot="right" class="flex gap-2">
        {#if timers.length}
          <ActionSelect
            enabled={$isSelecting}
            on:click={() => ($isSelecting = !$isSelecting)}
            on:all={() => {
              viewTimers.forEach((t) => t._id && addToSelected(t._id));
            }}
            on:none={() => {
              viewTimers.forEach((t) => t._id && removeFromSelected(t._id));
            }}
          />
          {#if duration === "days" && $breakpoints.md}
            <ActionView
              bind:current={view}
              on:click={() => {
                viewChanged = true;
              }}
            />
          {/if}
          <ActionInfo
            direction="right"
            disabled={!timers.length}
            enabled={$showRightSidebar}
            on:click={() => {
              $showRightSidebar = !$showRightSidebar;
            }}
          />
        {/if}
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
          bind:this={hourIndicators[hour]}
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
          class="pointer-events-none relative z-0 h-full border-l border-red-500"
          style={calculateNowGridPosition(timers.length)}
        >
          <span
            class="absolute top-0 left-1 z-10 whitespace-nowrap rounded-md bg-red-500 p-2 text-xs"
          >
            {nowText}
          </span>
        </div>
      {/if}
      {#each viewTimers as timer, i}
        <TimerComponent
          id={timer._id}
          title={timer.title}
          selectMode={$isSelecting}
          highlight={highlightCard === timer._id}
          on:blur={() => (highlightTimer = undefined)}
          on:focus={() => (highlightTimer = timer._id)}
          on:change={(e) => toggleSelected(e, timer._id)}
          on:mouseover={() => (highlightTimer = timer._id)}
          on:mouseleave={() => (highlightTimer = undefined)}
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
              <Tag>{timer.end ? `${sumTimerHours([timer])}hrs` : "running"}</Tag>
            {/if}
          </div>
        </TimerComponent>
      {/each}
    {/key}
  </div>

  <div slot="right" class="overflow-auto md:min-w-[320px]">
    <header
      class="sticky top-0 z-10 flex flex-none items-center justify-between border-b border-black/20 bg-neutral-900 py-2 px-4"
    >
      <Copy as="h3" semibold variant="gradient" class="text-lg uppercase">Timer Info</Copy
      >
      <ActionClose on:click={() => ($showRightSidebar = false)} />
    </header>
    <div class="m-4">
      {#key key}
        {#if $showRightSidebar && timers.length}
          {#each viewTimers as timer}
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
      {/key}
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
        <ActionClose on:click={() => ($showLeftSidebar = false)} />
      </header>
      <Filters
        class="mx-4 flex-1"
        bind:filters
        bind:combinator
        showFY={duration === "all"}
        on:clear={() => handleClearFilters()}
      />
      <footer
        class="sticky bottom-0 z-10 flex flex-none border-t border-black/20 bg-neutral-900 py-2 px-4"
      >
        <Button
          class="flex-1 bg-gradient-to-br from-violet-600 to-cyan-600 py-4 text-center"
          on:click={() => handleFilter(true)}
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
        updateTimers();
      }}
    />
  </div>
</Layout>

{#if showSaveQueryDialog}
  <Dialog open={true} title="Save current query as a favorite?" sub="Do you want to...">
    <Button slot="close" value="cancel" on:click={() => (showSaveQueryDialog = false)}>
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <section class="flex flex-1 flex-col items-center justify-center py-4">
      <DualAction>
        <Button
          slot="secondary"
          on:click={() => (showSaveQueryDialog = false)}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <div slot="content" class="flex items-center">
          <input bind:value={saveQueryData.label} class="flex-1" />
          <EmojiPicker bind:value={saveQueryData.icon} class="flex-none" />
        </div>
        <Button
          on:click={saveQuery}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    </section>
  </Dialog>
{/if}
