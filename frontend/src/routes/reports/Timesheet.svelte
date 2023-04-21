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
  import tags, { fetchTags } from "@/lib/stores/tags";
  import type { Timer } from "@/backend/schema/timer";
  import type { Project } from "@/backend/schema/project";

  import ActionBar from "@/core/actions/Bar.svelte";
  import breakpoints from "@/lib/stores/breakpoints";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionCopy from "@/core/actions/Copy.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  type Timesheet = {
    project: Project;
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

  let detailsProject: Project;
  let details: Tasks | undefined;
  let loader: Promise<Timesheet>;
  let headerLocation: HTMLElement;
  let viewDate: Temporal.PlainDate;
  let sections: HTMLElement[] = [];
  let detailsDate: Temporal.PlainDate;
  let week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  let totalColor = (config.theme?.colors?.neutral as any)["900"];

  $: if (params.date) viewDate = Temporal.PlainDate.from(params.date);
  $: if (viewDate && $projects)
    loader = Promise.all(
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
        return { project, days };
      })
    );

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
      if (section !== e.currentTarget) {
        section.scrollLeft = e.currentTarget.scrollLeft;
      }
    });
  }
</script>

<Layout loader={fetchTags()}>
  {#await loader}
    <div class="flex h-full w-full flex-1 items-center justify-center">
      <Icon icon="eos-icons:loading" class="h-12 w-12 text-white" />
    </div>
  {:then timesheet}
    <Header
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
      <span class="sr-only" bind:this={headerLocation}>Actions</span>
    </Header>
    <ul class="flex-1">
      {#each timesheet as entry, e}
        {#if entry.days.some((day) => day.timers.length > 0)}
          <li class="mb-6">
            <TimerComponent
              disableNav
              class="sticky left-0 !mb-0"
              project={entry.project}
              title={entry.project.name}
            />
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
                          enabled={!!details}
                          direction={$breakpoints.xxxl ? "left" : "right"}
                          top={headerLocation?.getBoundingClientRect().top}
                          on:click={() => {
                            details = getTasksAndTagsFromTimers(day.timers);
                            detailsDate = day.date;
                            detailsProject = entry.project;
                          }}
                        >
                          {#if details}
                            {@const text = getCopyTextFromTasks(details)}
                            <header class="flex justify-between px-2">
                              <ActionCopy
                                title="copy details"
                                on:click={async () => {
                                  await clipboard.write(text);
                                  details = undefined;
                                }}
                              />
                              <Copy
                                as="strong"
                                variant="gradient"
                                class="flex-none py-4 uppercase"
                              >
                                {detailsDate.toLocaleString("en", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Copy>
                              <ActionClose on:click={() => (details = undefined)} />
                            </header>
                            <ul
                              class="my-4 rounded-md p-6 shadow-xl"
                              style="background-color: {detailsProject.color}"
                            >
                              {#each details as task}
                                <li class="my-1">
                                  <Copy class="whitespace-nowrap text-sm line-clamp-1"
                                    >• {task.title}</Copy
                                  >
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
                          {/if}
                        </ActionInfo>
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
  {/await}
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
