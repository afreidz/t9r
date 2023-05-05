<script lang="ts">
  import {
    isToday,
    getToday,
    getMonth,
    getSunday,
    getDurationHoursFromString,
  } from "@/lib/dates";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import now from "@/lib/stores/now";
  import clipboard from "clipboardy";
  import Tag from "@/core/Tag.svelte";
  import { config } from "@/lib/theme";
  import tags from "@/lib/stores/tags";
  import { pop } from "svelte-spa-router";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import HourSum from "@/core/SumChip.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { showRightSidebar } from "@/lib/stores/ui";
  import type { Timer } from "@/backend/schema/timer";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import type { Forecast } from "@/backend/schema/forecast";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionCopy from "@/core/actions/Copy.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
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
    tags: string[];
  }[];

  export let params: { date: string } = { date: getToday().toString() };

  let timesheet: Timesheet;
  let detailsProject: Project;
  let details: Tasks | undefined;
  let viewDate: Temporal.PlainDate;
  let sections: HTMLElement[] = [];
  let detailsDate: Temporal.PlainDate | undefined;
  let detailsEntry: Timesheet[number] | undefined;
  let week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let totalColor = (config.theme?.colors?.neutral as any)["900"];

  $: if (params.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if (viewDate)
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

  function getTasksAndTagsFromTimers(timers: Timer[]) {
    const tasks: Tasks = timers.map((timer) => {
      let title = timer.title || "";

      if (timer.start && timer.end) {
        title += ` (${getDurationHoursFromString(timer.start, timer.end)}hrs)`;
      }

      return {
        title,
        tags: $tags
          .filter((tag) => timer.tags && tag._id && timer.tags.includes(tag._id))
          .map((tag) => tag.value),
      };
    });

    return tasks;
  }

  function sumDayHours(timesheet: Timesheet, d: number) {
    return timesheet.reduce((hours, projectTime) => {
      return (hours += sumTimerHours(projectTime.days[d].timers));
    }, 0);
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
          (task.tags.length ? "\n" + task.tags.map((tag) => `\t◦ ${tag}`).join("\n") : "")
      )
      .join("\n");
  }

  function syncScroll(e: { currentTarget: EventTarget & HTMLElement }) {
    sections.forEach((section) => {
      if (section !== e.currentTarget && section) {
        section.scrollLeft = e.currentTarget.scrollLeft;
      }
    });
  }
</script>

<Layout>
  {#if timesheet}
    <Header
      slot="header"
      sub="Timesheet for week of"
      main={`${getSunday(viewDate).day} ${getMonth(viewDate)} ${viewDate.year}`}
      class="mb-1"
    >
      <div slot="right">
        {#key $now}
          <HourSum value={sumTimerHours(getAllTimersFromTimesheet(timesheet))} />
        {/key}
      </div>
      <ActionBar>
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
    <ul class="flex-1">
      {#each timesheet as entry, e}
        {#if entry.days.some((day) => day.timers.length > 0)}
          {@const hours = sumTimerHours(entry.days.map((d) => d.timers).flat())}
          {@const percent = entry.forecast ? (hours / entry.forecast.hours) * 100 : 100}
          {@const variance = (percent - 100).toFixed(2)}
          <li class="mb-6">
            <div class="sticky left-0 flex items-center gap-4">
              <div
                class="relative flex flex-1 items-center overflow-hidden rounded-full bg-neutral-900"
              >
                <TimerComponent
                  disableNav
                  class="mb-0 h-full"
                  style="width: {Math.min(percent, 100)}%;"
                  project={entry.project}
                  title={entry.project.name}
                >
                  <div slot="right">
                    <Tag>{hours}hrs</Tag>
                  </div>
                </TimerComponent>
                {#if entry.forecast}
                  <div class="absolute right-0 mx-4">
                    <Tag>{entry.forecast.hours}hrs</Tag>
                  </div>
                {/if}
              </div>
              {#if entry.forecast}
                <div>
                  <Tag class={Number(variance) > 0 ? "!bg-emerald-500" : "!bg-red-500"}
                    >{Number(variance) > 0 ? "+" : ""}{variance}%</Tag
                  >
                </div>
              {/if}
            </div>
            <ul
              on:scroll={syncScroll}
              bind:this={sections[e + 1]}
              class="flex w-full flex-none snap-x items-center gap-8 overflow-auto md:snap-none md:justify-between"
            >
              {#each entry.days as day, i}
                <div class="flex snap-center flex-col items-center">
                  <Copy as="strong" variant="gradient" class="flex-none py-4 uppercase">
                    {day.date.toLocaleString("en", { weekday: "short" })}
                    {getSunday(viewDate).add({ days: i }).day}
                  </Copy>
                  <Field
                    as="div"
                    label="Hours"
                    class="w-64 min-w-[140px] flex-none md:w-fit"
                  >
                    <Copy
                      as="strong"
                      variant="gradient"
                      class="flex flex-none items-center justify-center p-6 text-3xl"
                      >{sumTimerHours(day.timers)}</Copy
                    >
                    <footer class="flex items-stretch justify-evenly">
                      <ActionCopy
                        title="copy hours"
                        on:click={() => clipboard.write(`${sumTimerHours(day.timers)}`)}
                      />
                      {#if day.timers.length > 0}
                        <ActionInfo
                          isStatic={true}
                          on:click={() => {
                            $showRightSidebar = true;
                            details = getTasksAndTagsFromTimers(day.timers);
                            detailsEntry = entry;
                            detailsDate = day.date;
                            detailsProject = entry.project;
                          }}
                        />
                      {/if}
                    </footer>
                  </Field>
                </div>
              {/each}
            </ul>
          </li>
        {/if}
      {/each}
      <li>
        <TimerComponent disableNav title="Totals" color={totalColor} />
        <ul
          on:scroll={syncScroll}
          bind:this={sections[0]}
          class="flex w-full flex-none snap-x items-center gap-8 overflow-auto md:snap-none md:justify-between"
        >
          {#each week as date, i}
            <li>
              <div class="flex snap-center flex-col items-center">
                <Copy as="strong" variant="gradient" class="flex-none py-4 uppercase">
                  {date}
                </Copy>
                <Field
                  as="div"
                  label="Total hours"
                  class="w-64 min-w-[140px] flex-none md:w-fit"
                >
                  <Copy
                    as="strong"
                    variant="gradient"
                    class="my-8 flex flex-none items-center justify-center text-3xl"
                    >{sumDayHours(timesheet, i)}</Copy
                  >
                </Field>
              </div>
            </li>
          {/each}
        </ul>
      </li>
    </ul>
  {/if}

  <div slot="right" class="flex flex-1 flex-col overflow-auto md:min-w-[320px]">
    {#if details && $showRightSidebar}
      {@const text = getCopyTextFromTasks(details)}
      <header class="flex items-center justify-between px-2">
        <ActionCopy
          title="copy details"
          disabled={details.length === 0}
          on:click={async () => {
            await clipboard.write(text);
          }}
        />
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
        <ActionClose
          on:click={() => {
            details = undefined;
            $showRightSidebar = false;
          }}
        />
      </header>
      {#if details.length}
        <ul
          class="m-4 rounded-md p-6 shadow-xl"
          style="background-color: {detailsProject.color}"
        >
          {#each details as task}
            <li class="my-1">
              <Copy class="whitespace-nowrap text-sm line-clamp-1">• {task.title}</Copy>
              <ul class="ml-4 list-disc">
                {#each task.tags as tag}
                  <li class="flex">
                    <span class="sr-only">•</span>
                    <Tag
                      class="max-w-none flex-1 text-center !text-xs !leading-6 line-clamp-1"
                      >{tag}</Tag
                    >
                  </li>
                {/each}
              </ul>
            </li>
          {/each}
        </ul>
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
