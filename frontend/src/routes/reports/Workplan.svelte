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
  import { pop } from "svelte-spa-router";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import type { Project } from "@/backend/schema/project";
  import type { Forecast } from "@/backend/schema/forecast";
  import { getSunday, type FiscalQuarter, getFiscalYearStartMonth } from "@/lib/dates";

  import ActionBar from "@/core/actions/Bar.svelte";
  import ActionPrev from "@/core/actions/Prev.svelte";
  import ActionNext from "@/core/actions/Next.svelte";
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

  let dirty = false;
  let workplan: WorkplanData;
  let newPlans: WorkplanData["plans"];
  let thisWeek: Temporal.PlainDate | null;
  let viewDate: Temporal.PlainDate = getToday();

  $: if (viewDate) getWorkplanData();
  $: dirty = !!newPlans && newPlans.some((w, i) => !same(w, workplan.plans[i]));
  $: if (viewDate)
    thisWeek = getSunday(getToday()).equals(getSunday(viewDate))
      ? getSunday(viewDate)
      : null;

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

  async function getWorkplanData(d = viewDate) {
    const qtr = await getQuarterByDate(d);
    const fy = await getFiscalYearStartMonth(d);
    const activeProjects = $projects.filter((p) => !p.archived);

    const forecasts = await trpc.forecast.getAllByDates.query({
      end: qtr.end.toString(),
      start: qtr.start.toString(),
    });

    const plans = getWeeksArray(qtr.start, 14).map((w) => ({
      week: w.toString(),
      forecasts: activeProjects.map(
        (p) =>
          forecasts.find((f) => f.week === w.toString() && f.project === p._id) ?? {
            hours: 0,
            project: p._id,
            week: w.toString(),
          }
      ),
    }));

    newPlans = JSON.parse(JSON.stringify(plans));

    workplan = { qtr, fy, plans, projects: activeProjects };
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
</script>

<Layout>
  <Header
    slot="header"
    sub="Workplan for"
    main="FY{workplan?.fy.year} Quarter {workplan?.qtr.qtr}"
  >
    <ActionBar>
      <ActionPrev on:click={() => (viewDate = viewDate.subtract({ months: 3 }))} />
      <ActionCurrent
        on:click={() => (viewDate = getToday())}
        disabled={isToday(viewDate)}
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
            disableNav
            title={project.name}
          />
        </header>
        <div
          style="grid-template-columns: repeat({newPlans.length}, 117px);"
          class="grid w-full gap-8"
        >
          {#each newPlans as plan, i}
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
        {#each newPlans as plan, i}
          <div class="flex items-center justify-center">
            <Tag>{plan.forecasts.reduce((h, f) => (h += f.hours), 0)}hrs</Tag>
          </div>
        {/each}
      </div>
    </div>
  {/if}

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
