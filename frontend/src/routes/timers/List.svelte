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

<Layout {loader}>
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
      <ActionCurrent on:click={navigateCurrent} disabled={isToday(viewDate)} />
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

  {#if view === "all"}
    <ActionBar>
      <ActionPrev on:click={navigatePrev} disabled={page === 0} />
      <ActionNext on:click={navigateNext} disabled={timers.length === 0} />
    </ActionBar>
  {/if}

  <div slot="cta">
    {#if $isSelecting || ["all", "day"].includes(view)}
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
        {:else if view === "all" || view === "day"}
          <NewTimer
            date={viewDate}
            on:timer-update={() => (loader = updateTimers())}
          />
        {/if}
      </Moveable>
    {/if}
  </div>
</Layout>
