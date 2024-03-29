<script lang="ts">
  import {
    isToday,
    getToday,
    getMonth,
    getSunday,
    isInThisWeek,
    getDurationHoursFromString,
  } from "@/lib/dates";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import now from "@/lib/stores/now";
  import clipboard from "clipboardy";
  import Tag from "@/core/Tag.svelte";
  import tags from "@/lib/stores/tags";
  import { pop, push } from "svelte-spa-router";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import HourSum from "@/core/SumChip.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import projects from "@/lib/stores/projects";
  import settings from "@/lib/stores/settings";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import Plan from "@/components/core/Plan.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { showRightSidebar } from "@/lib/stores/ui";
  import type { Timer } from "@/backend/schema/timer";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import type { Forecast } from "@/backend/schema/forecast";
  import type { Tag as TagType } from "@/backend/schema/tag";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionLook from "@/core/actions/Look.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionCopy from "@/core/actions/Copy.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  type Timesheet = {
    project: Project;
    forecast?: Forecast | null;
    days: {
      date: Temporal.PlainDate;
      timers: Timer[];
    }[];
  }[];

  type Tasks = {
    title: string;
    tags: TagType[];
  }[];

  export let params: { date: string } = { date: getToday().toString() };

  let key: unknown;
  let timesheet: Timesheet;
  let detailsProject: Project;
  let details: Tasks | undefined;
  let viewDate: Temporal.PlainDate;
  let scrollDay;
  let detailsDate: Temporal.PlainDate | undefined;
  let detailsEntry: Timesheet[number] | undefined;
  let week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  $: if (params.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if (viewDate) {
    Promise.all(
      $projects.map(async (project) => {
        const days = await Promise.all(
          week.map(async (d, i) => {
            const date = getSunday(viewDate).add({ days: i });
            const timers = await trpc.timers.getByDate.query({
              date: date.toString(),
              project: project._id,
            });
            return { date, timers };
          })
        );
        const forecast = await trpc.forecast.getByWeekAndProject.query({
          project: project._id || "",
          week: getSunday(viewDate).toString(),
        });

        return { project, days, forecast };
      })
    ).then((result: Timesheet) => (timesheet = result));
    if (isInThisWeek(viewDate)) key = $now;
  }

  function getTasksAndTagsFromTimers(timers: Timer[]) {
    const tasks: Tasks = timers.map((timer) => {
      let title = timer.title || "";

      if (timer.start && timer.end) {
        title += ` (${getDurationHoursFromString(timer.start, timer.end)}hrs)`;
      }

      return {
        title,
        tags: $tags.filter(
          (tag) => timer.tags && tag._id && timer.tags.includes(tag._id)
        ),
      };
    });

    return tasks;
  }

  function getAllTimersFromTimesheet(timesheet: Timesheet): Timer[] {
    const mapped = timesheet.map((entry) => entry.days.map((d) => d.timers));
    return mapped.flat(Infinity) as Timer[];
  }

  function getCopyTextFromTasks(t: Tasks) {
    return t
      .map(
        (task) =>
          "• " +
          task.title +
          (task.tags.length
            ? "\n" +
              task.tags
                .filter((t) => !$settings.hiddenTags?.includes(t._id ?? t.value))
                .map((tag) => `\t◦ ${tag.value}`)
                .join("\n")
            : "")
      )
      .join("\n");
  }
</script>

<Layout>
  {#if timesheet}
    <Header
      slot="header"
      sub="Timesheet for week of"
      main={`${getSunday(viewDate).day} ${getMonth(getSunday(viewDate))} ${
        getSunday(viewDate).year
      }`}
      class="mb-1"
    >
      <div slot="right">
        {#key key}
          <HourSum value={sumTimerHours(getAllTimersFromTimesheet(timesheet))} />
        {/key}
      </div>
      <ActionBar>
        <div slot="right">
          <ActionLook on:click={() => push(`/timers/week/${viewDate.toString()}`)} />
        </div>
        <ActionPrev on:click={() => (viewDate = viewDate.subtract({ weeks: 1 }))} />
        <ActionCurrent
          on:click={() => (viewDate = getToday())}
          disabled={isToday(viewDate)}
        />
        <ActionNext
          on:click={() => (viewDate = viewDate.add({ weeks: 1 }))}
          disabled={isToday(viewDate)}
        />
      </ActionBar>
    </Header>
    <div class="mt-8 flex flex-1 justify-center">
      <Container class="flex-1">
        <div
          slot="primary"
          class="grid w-full snap-x snap-mandatory auto-rows-min grid-cols-1 overflow-auto"
        >
          {#each timesheet as entry, e}
            {#if entry.days.some((day) => day.timers.length > 0) || entry.forecast}
              {@const hours = sumTimerHours(entry.days.map((d) => d.timers).flat())}
              {@const percent = entry.forecast
                ? (hours / entry.forecast.hours) * 100
                : 100}
              {@const variance = (percent - 100).toFixed(2)}
              <header class="sticky left-0 right-0 col-span-full">
                <div class="h-10 flex-1 items-center rounded-full bg-neutral-900 md:h-14">
                  <TimerComponent
                    href={`/#/project/${entry.project._id}`}
                    class="!mb-0 !h-full !min-w-[32%] !shadow-none md:!min-w-[48%] lg:!min-w-[32%] xl:!min-w-[auto]"
                    style="width: {Math.max(15, Math.min(percent, 100))}%;"
                    project={entry.project}
                    sub="Timesheet for"
                    title={entry.project.name}
                  >
                    <div slot="right">
                      {#key key}
                        <Tag>{hours}hrs</Tag>
                      {/key}
                    </div>
                  </TimerComponent>
                </div>
                {#if entry.forecast}
                  <div class="my-2 flex justify-between md:justify-end">
                    {#key key}
                      <Tag class="flex-none whitespace-nowrap"
                        >Forecast: {entry.forecast.hours}hrs</Tag
                      >
                      <Tag
                        class={Number(variance) >= 0
                          ? "flex-none !bg-emerald-500"
                          : "flex-none !bg-red-500"}
                        >Variance: {Number(variance) > 0 ? "+" : ""}{variance}%</Tag
                      >
                    {/key}
                  </div>
                {/if}
              </header>
              <ul
                class="mb-8 grid grid-cols-[repeat(7,16rem)] gap-4 md:grid-cols-[repeat(7,_minmax(10rem,_16rem))]"
              >
                {#each entry.days as day, i}
                  <li class="mb-6 flex snap-center flex-col">
                    {#key key}
                      <Plan
                        padded
                        readonly
                        class="w-full"
                        value={sumTimerHours(day.timers)}
                        highlight={day.date.equals(getToday())}
                        to={`/timers/day/${day.date.toString()}`}
                        scrollTo={day.date.equals(getToday()) && e === 0}
                        heading={`${day.date
                          .toLocaleString("en", { weekday: "short" })
                          .toUpperCase()} ${getSunday(viewDate).add({ days: i }).day}`}
                      >
                        <div slot="upper-right">
                          {#if day.timers.length > 0}
                            <ActionInfo
                              isStatic={true}
                              class="mr-2"
                              on:click={() => {
                                $showRightSidebar = true;
                                details = getTasksAndTagsFromTimers(day.timers);
                                detailsEntry = entry;
                                detailsDate = day.date;
                                detailsProject = entry.project;
                              }}
                            />
                          {/if}
                        </div>
                      </Plan>
                    {/key}
                  </li>
                {/each}
              </ul>
            {/if}
          {/each}
        </div>
      </Container>
    </div>
  {/if}

  <div slot="right" class="flex flex-1 flex-col overflow-auto md:min-w-[320px]">
    {#if details && $showRightSidebar}
      {@const text = getCopyTextFromTasks(details)}
      <header class="flex items-center justify-between px-2">
        <div class="flex flex-none items-center gap-2">
          <ActionPrev
            on:click={() => {
              if (!detailsDate || !detailsEntry) return;
              const prevDate = detailsDate.subtract({ days: 1 });
              const prev = detailsEntry.days.find((d) => d.date.equals(prevDate));
              details = prev ? getTasksAndTagsFromTimers(prev.timers) : undefined;
              detailsDate = prev?.date;
              detailsProject = detailsEntry.project;
            }}
            disabled={detailsDate &&
              detailsEntry &&
              detailsEntry.days.at(0)?.date.equals(detailsDate)}
          />
          <Copy as="strong" variant="gradient" class="flex-none py-4 uppercase">
            {#if detailsDate}
              {detailsDate.toLocaleString("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            {/if}
          </Copy>
          <ActionNext
            on:click={() => {
              if (!detailsDate || !detailsEntry) return;
              const nextDate = detailsDate.add({ days: 1 });
              const next = detailsEntry.days.find((d) => d.date.equals(nextDate));
              details = next ? getTasksAndTagsFromTimers(next.timers) : undefined;
              detailsDate = next?.date;
              detailsProject = detailsEntry.project;
            }}
            disabled={detailsDate &&
              detailsEntry &&
              detailsEntry.days.at(-1)?.date.equals(detailsDate)}
          />
        </div>
      </header>
      {#if details.length}
        <button
          on:click={async () => {
            await clipboard.write(text);
          }}
          class="relative m-4 rounded-md p-6 shadow-xl"
          style="background-color: {detailsProject.color}"
        >
          <ul>
            {#each details as task}
              <li class="my-1">
                <Copy class="whitespace-nowrap text-sm line-clamp-1">• {task.title}</Copy>
                <ul class="ml-4 list-disc">
                  {#each task.tags as tag}
                    <li class="flex">
                      <span class="sr-only">•</span>
                      <Tag
                        class="max-w-none flex-1 text-center !text-xs !leading-6 line-clamp-1"
                        >{tag.value}</Tag
                      >
                    </li>
                  {/each}
                </ul>
              </li>
            {/each}
          </ul>
          <ActionCopy title="copy details" class="absolute right-2 top-0" />
        </button>
      {:else}
        <Copy as="div" semibold variant="gradient" class="my-10 text-center uppercase"
          >No timers recorded for this project + day</Copy
        >
      {/if}
    {/if}
  </div>

  <div slot="cta">
    <DualAction as="div" label="Showing timesheet for">
      <span slot="content"
        >{getSunday(viewDate).day}
        {getMonth(viewDate)}
        {viewDate.year}</span
      >
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
