<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import { pop } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import Moveable from "@/core/Moveable.svelte";
  import { ctaPosition } from "@/lib/stores/ui";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import tags, { fetchTags } from "@/lib/stores/tags";
  import type { Timer } from "@/backend/schema/timer";
  import { mainResizeObserver } from "@/lib/stores/ui";
  import Copy from "@/components/foundation/Copy.svelte";
  import type { Project } from "@/backend/schema/project";
  import { isToday, getToday, getMonth, getSunday } from "@/lib/dates";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionCopy from "@/core/actions/Copy.svelte";
  import ActionInfo from "@/core/actions/Info.svelte";
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
    const taskMap = new Map<string, string[]>();
    const tasks: Tasks = [];

    timers.forEach((timer) => {
      if (!timer.title) return;
      if (!taskMap.has(timer.title)) taskMap.set(timer.title, []);

      const existing = taskMap.get(timer.title) || [];
      const newTasks = $tags
        .filter((t) => timer.tags && t._id && timer.tags.includes(t._id))
        .map((t) => t.value);

      taskMap.set(timer.title, [...existing, ...newTasks]);
    });

    const taskObject = Object.fromEntries(taskMap);

    Object.entries(taskObject).forEach(([title, tags]) => {
      tasks.push({ title, tags });
    });

    return tasks;
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
      <div class="flex flex-col items-center">
        <Copy dim as="small" variant="pseudomono">Timesheet Hours</Copy>
        <Copy as="strong" variant="gradient" class=" text-lg md:text-3xl">
          {sumTimerHours(getAllTimersFromTimesheet(timesheet))}
        </Copy>
      </div>
    </Header>

    <ActionBar>
      <ActionPrev
        on:click={() => (viewDate = viewDate.subtract({ weeks: 1 }))}
      />
      <ActionCurrent
        on:click={() => (viewDate = getToday())}
        disabled={isToday(viewDate)}
      />
      <ActionNext
        on:click={() => (viewDate = viewDate.add({ weeks: 1 }))}
        disabled={isToday(viewDate)}
      />
    </ActionBar>

    <div
      class="grid-cols-[repeat(7,_minmax(1fr,_320px)] grid items-center justify-items-center gap-2 pr-4"
      style="grid-template-rows: {timesheet.length + 1 + $projects.length}"
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
              style="width: calc({$mainResizeObserver?.width}px);"
            />
          </div>
          {#each entry.days as day}
            {@const tasks = getTasksAndTagsFromTimers(day.timers)}
            {@const detailsString = `details_${
              entry.project._id
            }_${day.date.toString()}`}
            <Field label="Hours" class="h-56 w-full">
              <section class="flex flex-1 flex-col">
                <div class="flex flex-1 items-center justify-center">
                  <Copy
                    as="strong"
                    variant="gradient"
                    class="m-6 min-w-[50px] flex-none text-center text-3xl"
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
                  <ActionCopy />
                  {#if tasks.length}
                    <ActionInfo
                      on:click={() =>
                        (showDetailsFor =
                          showDetailsFor === detailsString
                            ? undefined
                            : detailsString)}
                    />
                  {/if}
                  {#if showDetailsFor === detailsString}
                    <ActionCopy />
                  {/if}
                </div>
              </section>
            </Field>
          {/each}
        {/if}
      {/each}
    </div>
  {/await}
  <div slot="cta">
    <Moveable state={$ctaPosition}>
      <div in:fade>
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
            class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-blue-500 text-white !ring-offset-white"
          >
            <Icon icon="ic:outline-arrow-back" />
          </Button>
        </DualAction>
      </div>
    </Moveable>
  </div>
</Layout>
