<script lang="ts">
  import {
    isToday,
    getToday,
    isBeforeDate,
    getWeeksArray,
    getQuarterByDate,
  } from "@/lib/dates";
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import Plan from "@/core/Plan.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import settings from "@/lib/stores/settings";
  import { sumTimerHours } from "@/lib/timers";
  import projects from "@/lib/stores/projects";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import Filters from "@/core/filters/Filters.svelte";
  import type { Project } from "@/backend/schema/project";
  import type { TimerQuery } from "@/backend/schema/timer";
  import type { Forecast } from "@/backend/schema/forecast";
  import { showLeftSidebar, showLoader } from "@/lib/stores/ui";
  import { pop, location, push, querystring } from "svelte-spa-router";
  import { getSunday, type FiscalQuarter, getFiscalYearStartMonth } from "@/lib/dates";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
  import ActionSave from "@/core/actions/Save.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
  import ActionFilter from "@/core/actions/Filter.svelte";
  import ActionCurrent from "@/core/actions/Current.svelte";

  type WorkplanData = {
    qtr: FiscalQuarter;
    projects: Project[];
    fy: Temporal.PlainYearMonth;
    plans: {
      week: string;
      forecasts: Forecast[];
    }[];
  };

  type WorkplanFilterCriteria = Extract<TimerQuery["criteria"], "project" | "date">;
  type WorkplanFilterPredicate = Extract<TimerQuery["predicate"], "contains" | "between">;
  type WorkplanFilterValue = string[];
  type WorkplanFilters = {
    criteria: WorkplanFilterCriteria;
    predicate: WorkplanFilterPredicate;
    value: WorkplanFilterValue;
  };

  let dirty = false;
  let workplan: WorkplanData;
  let showSaveQueryDialog = false;
  let saveQueryLabel: string = "";
  let filters: WorkplanFilters[] = [];
  let newPlans: WorkplanData["plans"];
  let thisWeek: Temporal.PlainDate | null;
  let viewDate: Temporal.PlainDate = getToday();

  $: dirty = !!newPlans && newPlans.some((w, i) => !same(w, workplan.plans[i]));
  $: if (viewDate) {
    thisWeek = getSunday(getToday()).equals(getSunday(viewDate))
      ? getSunday(viewDate)
      : null;
  }

  $: if (viewDate && $projects.length && $querystring) {
    const qs = new URLSearchParams($querystring);
    const f: WorkplanFilters[] = JSON.parse(qs.get("filters") || "");
    const fp = f.find((f) => f.criteria === "project");
    const fd = f.find((f) => f.criteria === "date");
    const d1 = fd ? Temporal.PlainDate.from(fd.value[0]) : viewDate;
    const d2 = fd ? Temporal.PlainDate.from(fd.value[1]) : undefined;

    getWorkplanData(
      $projects.filter((p) => p._id && fp && fp.value.includes(p._id)),
      d1,
      d2
    );
  }

  $: if (viewDate && $projects.length && !$querystring) {
    getWorkplanData(
      $projects.filter((p) => !p.archived),
      viewDate
    );
  }

  $: if ($querystring) {
    const qs = new URLSearchParams($querystring);
    if (qs.has("filters")) filters = JSON.parse(qs.get("filters") || "");
  }

  async function sumProjectTimersByWeek(
    week: Temporal.PlainDate | string,
    project: Project
  ) {
    const pd = Temporal.PlainDate.from(week);
    const timers = await trpc.timers.getByWeek.query({
      week: pd.toString(),
      project: project._id,
    });
    return sumTimerHours(timers);
  }

  async function getWorkplanData(
    projects: typeof $projects,
    d = viewDate,
    d2?: Temporal.PlainDate
  ) {
    $showLoader = true;
    const qtr = await getQuarterByDate(d);
    const fy = await getFiscalYearStartMonth(d);
    const pids = projects.filter((p) => p._id).map((p) => p._id) as string[];

    const forecasts = await trpc.forecast.getAllByDates.query({
      end: d2?.toString() || qtr.end.toString(),
      start: d.toString() || qtr.start.toString(),
      projects: pids,
    });

    const plans = getWeeksArray(qtr.start, 14).map((w) => ({
      week: w.toString(),
      forecasts: projects.map(
        (p) =>
          forecasts.find((f) => f.week === w.toString() && f.project === p._id) ?? {
            hours: 0,
            project: p._id,
            week: w.toString(),
          }
      ),
    }));

    newPlans = JSON.parse(JSON.stringify(plans));

    workplan = { qtr, fy, plans, projects };
    $showLoader = false;
    return workplan;
  }

  async function update(np: typeof newPlans, plans: WorkplanData["plans"]) {
    if (!np || !plans) return;

    const updatedPlans = np
      .map((plan, w) => {
        const existing = plans[w];
        return plan.forecasts.find((fc, f) => !same(fc, existing?.forecasts[f]));
      })
      .filter(Boolean);

    await Promise.all(
      updatedPlans.map((plan) => {
        if (!plan?.hours || !plan.week || !plan.project) return;
        return trpc.forecast.updateOrCreate.mutate({
          project: plan.project,
          hours: plan.hours,
          week: plan.week,
        });
      })
    );
    pop();
  }

  function handleClearFilters() {
    filters = [];
    push($location);
  }

  async function handleFilters(updateNav = true) {
    const fd = filters.find((f) => f.criteria === "date");
    const fp = filters.find((f) => f.criteria === "project");
    const d1 = fd ? Temporal.PlainDate.from(fd.value[0]) : viewDate;
    const d2 = fd ? Temporal.PlainDate.from(fd.value[1]) : undefined;

    workplan = await getWorkplanData(
      $projects.filter((p) => p._id && fp && fp.value.includes(p._id)),
      d1,
      d2
    );

    if (updateNav) {
      const filterQS = JSON.stringify(filters);
      const existingQS = new URLSearchParams($querystring);
      existingQS.set("filters", filterQS);
      push(`${$location}?${existingQS.toString()}`);
    }
  }

  async function saveQuery() {
    const newQueries = [
      ...($settings.savedQueries ?? []),
      {
        url: window.location.hash.replace("#", ""),
        label: saveQueryLabel,
        type: "workplan",
      },
    ];

    $showLoader = true;
    await trpc.settings.updateOrCreate.mutate({ ...$settings, savedQueries: newQueries });
    $settings = { ...$settings, savedQueries: newQueries };
    $showLoader = false;
    showSaveQueryDialog = false;
  }
</script>

<Layout>
  <Header
    slot="header"
    sub="Workplan for"
    main="FY{workplan?.fy.year} Quarter {workplan?.qtr.qtr}"
  >
    <ActionBar>
      <div slot="left" class="flex gap-2">
        <ActionFilter
          direction="left"
          enabled={$showLeftSidebar}
          on:click={() => ($showLeftSidebar = !$showLeftSidebar)}
          class={`from-violet-600 to-cyan-600 ${filters.length && "bg-gradient-to-br"}`}
        />
        {#if filters.length}
          <ActionSave on:click={() => (showSaveQueryDialog = true)} />
        {/if}
      </div>
      <ActionPrev on:click={() => (viewDate = viewDate.subtract({ months: 3 }))} />
      <ActionCurrent
        on:click={() => (viewDate = getToday())}
        disabled={viewDate && isToday(viewDate)}
      />
      <ActionNext on:click={() => (viewDate = viewDate.add({ months: 3 }))} />
    </ActionBar>
  </Header>
  {#if viewDate && workplan && newPlans}
    <div
      class="grid w-full snap-x snap-mandatory auto-rows-min grid-cols-1 gap-y-2 overflow-auto"
    >
      {#each workplan.projects as project, z}
        <header class="sticky left-0 right-0 col-span-full">
          <TimerComponent
            class="!mb-0"
            {project}
            buttonFlex
            sub="Workplan for"
            title={project.name}
            href={`/#/project/${project._id}`}
          />
        </header>
        <div
          style="grid-template-columns: repeat({newPlans.length}, 117px);"
          class="grid w-full gap-8"
        >
          {#each newPlans as plan}
            <Plan
              week={plan.week}
              color={project.color}
              value={plan.forecasts[z].hours}
              scrollTo={thisWeek?.equals(plan.week)}
              highlight={thisWeek?.equals(plan.week)}
              on:change={(e) => (plan.forecasts[z].hours = e.detail)}
              actual={isBeforeDate(plan.week, getToday())
                ? sumProjectTimersByWeek(plan.week, project)
                : undefined}
            />
          {/each}
        </div>
      {/each}
      <div
        style="grid-template-columns: repeat({newPlans.length}, 117px);"
        class="my-4 grid w-full gap-8"
      >
        {#each newPlans as plan}
          <div class="flex items-center justify-center">
            <Tag>{plan.forecasts.reduce((h, f) => (h += f.hours), 0)}hrs</Tag>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div slot="left" class="flex flex-1 flex-col overflow-auto md:min-w-[320px]">
    {#if $showLeftSidebar}
      <header
        class="sticky top-0 z-10 flex flex-none items-center justify-between border-b border-black/20 bg-neutral-900 py-2 px-4"
      >
        <Copy as="h3" semibold variant="gradient" class="text-lg uppercase"
          >Filter Workplan</Copy
        >
        <ActionClose on:click={() => ($showLeftSidebar = false)} />
      </header>
      <Filters
        class="mx-4 flex-1"
        bind:filters
        staticCombinator="and"
        on:clear={() => handleClearFilters()}
        disabledPredicates={["equals", "after", "before", "fiscal"]}
        disabledCriteria={["duration", "tags", "title", "utilized", "date"]}
      />
      <footer
        class="sticky bottom-0 z-10 flex flex-none border-t border-black/20 bg-neutral-900 py-2 px-4"
      >
        <Button
          class="flex-1 bg-gradient-to-br from-violet-600 to-cyan-600 py-4 text-center"
          on:click={() => handleFilters()}
        >
          <Copy as="span" variant="gradient" bold class="uppercase">Apply Filters</Copy>
        </Button>
      </footer>
    {/if}
  </div>

  <div slot="cta">
    {#if workplan && dirty}
      <DualAction as="div" label="Do you want to">
        <Button
          slot="secondary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <span slot="content">Update Forecast?</span>
        <Button
          slot="primary"
          on:click={() => update(newPlans, workplan.plans)}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    {:else}
      <DualAction as="div" label="Showing workplan for">
        <span slot="content">FY{workplan?.fy.year} Quarter {workplan?.qtr.qtr}</span>
        <Button
          slot="primary"
          title="Navigate back"
          on:click={pop}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
        >
          <Icon icon="ic:outline-arrow-back" />
        </Button>
      </DualAction>
    {/if}
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
        <input
          bind:value={saveQueryLabel}
          slot="content"
          placeholder="Query label"
          class="max-w-[128px] sm:max-w-none"
        />
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
