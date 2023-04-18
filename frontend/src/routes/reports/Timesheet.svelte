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
  import { pop } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import HourSum from "@/core/HourSum.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import tags, { fetchTags } from "@/lib/stores/tags";
  import type { Timer } from "@/backend/schema/timer";
  import { mainResizeObserver } from "@/lib/stores/ui";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionCopy from "@/core/actions/Copy.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";
  import breakpoints from "@/lib/stores/breakpoints";

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

  let loader: Promise<Timesheet>;
  let viewDate: Temporal.PlainDate;
  let showDetailsFor: string | undefined;
  let week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

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
          <HourSum hours={sumTimerHours(getAllTimersFromTimesheet(timesheet))} />
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
    <Container class="flex-1">
      <div
        slot="primary"
        class="grid flex-1 items-center justify-items-center gap-2 pr-4"
        style="grid-template-rows: repeat({timesheet.length +
          1 +
          $projects.length}, max-content); grid-template-columns: repeat(7, minmax(130px, ${$breakpoints.md
          ? '320px'
          : '1fr'}));"
      >
        {#each week as day, i}
          <Copy as="strong" variant="gradient" class="sticky top-0"
            >{day} {getSunday(viewDate).add({ days: i }).day}</Copy
          >
        {/each}
        {#each timesheet as entry}
          {#if entry.days.some((day) => day.timers.length > 0)}
            <div class="relative col-span-7 w-full">
              <TimerComponent
                disableNav
                class="sticky left-0 !mb-0"
                project={entry.project}
                title={entry.project.name}
              />
            </div>
            {#each entry.days as day}
              {@const tasks = getTasksAndTagsFromTimers(day.timers)}
              {@const detailsString = `details_${
                entry.project._id
              }_${day.date.toString()}`}
              {@const details = tasks
                .map(
                  (task) =>
                    "• " +
                    task.title +
                    (task.tags.length
                      ? "\n" + task.tags.map((tag) => `\t◦ ${tag}`).join("\n")
                      : "")
                )
                .join("\n")}
              <Field
                as="div"
                label="Hours"
                class="h-56 w-full max-w-[288px] md:max-w-none"
              >
                <section class="flex flex-1 flex-col">
                  <div class="flex flex-1 items-center justify-center gap-6">
                    <Copy
                      as="strong"
                      variant="gradient"
                      class="flex flex-none items-center justify-center text-3xl"
                      >{sumTimerHours(day.timers)}</Copy
                    >
                    {#if showDetailsFor === detailsString}
                      {#if tasks.length}
                        <ul
                          in:fade
                          class="h-24 flex-1 overflow-auto border-l border-neutral-900 px-4 pr-6"
                        >
                          {#each tasks as task}
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
                    {/if}
                  </div>
                  <div class="flex flex-none items-stretch justify-evenly">
                    <ActionCopy
                      title="copy hours"
                      on:click={() => clipboard.write(`${sumTimerHours(day.timers)}`)}
                    />
                    {#if tasks.length}
                      <ActionInfo
                        isStatic={true}
                        on:click={() =>
                          (showDetailsFor =
                            showDetailsFor === detailsString ? undefined : detailsString)}
                      />
                    {/if}
                    {#if showDetailsFor === detailsString}
                      <ActionCopy
                        title="copy details"
                        on:click={async () => {
                          await clipboard.write(details);
                          showDetailsFor = undefined;
                        }}
                      />
                    {/if}
                  </div>
                </section>
              </Field>
            {/each}
          {/if}
        {/each}
        {#each week as _, i}
          <Field as="div" label="Total hours" class="w-full">
            <Copy
              as="strong"
              variant="gradient"
              class="my-8 flex flex-none items-center justify-center text-3xl"
              >{sumDayHours(timesheet, i)}</Copy
            >
          </Field>
        {/each}
      </div>
    </Container>
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
