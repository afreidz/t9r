<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { pop } from "svelte-spa-router";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Colors from "@/core/Colors.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import { sumTimerHours } from "@/lib/timers";
  import Field from "@/foundation/Field.svelte";
  import Chart from "@/core/chart/Chart.svelte";
  import Switch from "@/foundation/Switch.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import ChartItem from "@/core/chart/ChartItem.svelte";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import projects, { fetchProjects } from "@/stores/projects";
  import { formatForForecastWeek, getWeeksArray } from "@/lib/dates";
  import { queryForecast, type ForecastAndActual } from "@/lib/forecast";

  export let params: { id: string };

  let dirty = false;
  let confirmDelete = false;
  let showGradientStops = false;
  let project: Project | undefined;
  let newValues: Project | undefined;
  let forecastWeeks = getWeeksArray(5, false);
  let projectTimers: Promise<Timer[]> | undefined;
  let forecasts: Promise<(ForecastAndActual | undefined)[]> | undefined;

  $: if (params.id && project?._id !== params.id) {
    forecasts = undefined;
    projectTimers = undefined;
    project = $projects.find((p: Project) => p._id === params.id);
    if (project) newValues = { ...project, budget: project.budget || null };
  }

  $: if (newValues && project) dirty = !same<Project>(newValues, project);

  $: if (forecastWeeks && project && !forecasts) {
    forecasts = Promise.all(
      forecastWeeks.map((week) => queryForecast(project?._id, week))
    );
  }

  $: if (project && project._id && !projectTimers) {
    projectTimers = trpc.timers.getByProject.query(project._id);
  }

  $: if (project && (project.color2 || project.color3)) showGradientStops = true;

  async function reset() {
    if (!project || !newValues) return;
    newValues = { ...project };
  }

  async function update() {
    if (!project || !project._id || !newValues?.name || !newValues?.color) return;

    await trpc.projects.update.mutate({
      id: project._id,
      details: {
        ...newValues,
        budget: newValues.budget === 0 ? null : newValues.budget,
        _id: undefined,
      },
    });
    await fetchProjects();
    pop();
  }

  async function handleDelete() {
    if (!project || !project._id) return;
    const result = await trpc.projects.delete.mutate({ id: project._id });

    if (result.acknowledged) {
      await fetchProjects();
      pop();
    }
  }

  function toggleGradientStops() {
    if (!newValues) return;
    showGradientStops = !showGradientStops;

    if (!showGradientStops) {
      newValues.color2 = null;
      newValues.color3 = null;
    }
  }
</script>

<Layout>
  <Header sub="Details For" main={project?.name} class="mb-1" />
  <Container class="flex-1">
    <section slot="primary" class="xl:flex-1">
      {#if newValues}
        <Field label="Project Name">
          <input bind:value={newValues.name} />
        </Field>
        <Field label="Project Color">
          <div class="w-full overflow-hidden rounded-full">
            <input
              type="color"
              class="h-full w-full"
              bind:value={newValues.color}
              list="colors"
            />
          </div>
          <Colors id="colors" />
          <Copy
            dim
            as="button"
            variant="pseudomono"
            on:click={toggleGradientStops}
            class="my-4 flex items-center justify-end gap-1 text-sm"
          >
            {#if showGradientStops}
              Remove gradient stops
              <Icon icon="mdi:remove-circle-outline" />
            {:else}
              Add gradient stops
              <Icon icon="material-symbols:add-circle-outline" />
            {/if}
          </Copy>
          {#if showGradientStops}
            <div class="flex gap-4">
              <label class="flex flex-1 flex-col">
                <Copy dim as="span" variant="pseudomono" class="text-xs">Stop 2</Copy>
                <div class="my-1 flex w-full items-stretch overflow-hidden rounded-full">
                  <input
                    type="color"
                    class="w-full"
                    bind:value={newValues.color2}
                    list="colors"
                  />
                </div>
              </label>
              <label class="flex flex-1 flex-col">
                <Copy dim as="span" variant="pseudomono" class="text-xs">Stop 3</Copy>
                <div class="my-1 flex w-full items-stretch overflow-hidden rounded-full">
                  <input
                    class="w-full"
                    type="color"
                    bind:value={newValues.color3}
                    list="colors"
                  />
                </div>
              </label>
            </div>
          {/if}
        </Field>
        <Field label="Default Timer Title">
          <input min={0} max={30} bind:value={newValues.defaultTitle} />
        </Field>
        <Field>
          <Switch
            class="justify-between"
            color={newValues.color}
            name="default_utilized"
            label="Default timers to utilized?"
            enabled={newValues.defaultUtilized}
            on:change={(e) => {
              if (newValues) newValues.defaultUtilized = e.detail;
            }}
          />
        </Field>
        <Field>
          <Switch
            class="justify-between"
            name="archived"
            label="Archived"
            color={newValues.color}
            enabled={newValues.archived}
            on:change={(e) => {
              if (newValues) newValues.archived = e.detail;
            }}
          />
        </Field>
        <Field label="Project Budget">
          <input
            class="w-full text-2xl"
            type="number"
            min={0}
            bind:value={newValues.budget}
          />
        </Field>
      {/if}
    </section>
    <section
      slot="secondary"
      class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4"
    >
      {#key projectTimers}
        <Copy as="h3" semibold variant="gradient" class="my-4 uppercase"
          >Project Lifetime</Copy
        >
        {#if project?._id}
          {#await projectTimers}
            <Icon icon="eos-icons:loading" class="h-7 w-7 text-white" />
          {:then timers}
            <header class="my-1 mx-4 flex flex-col justify-between md:mx-6 md:flex-row">
              <strong
                class="my-2 flex flex-none items-center justify-between text-4xl md:flex-col md:items-start"
              >
                <Copy dim as="span" variant="pseudomono" class="text-sm">Worked:</Copy>
                {sumTimerHours(timers)}
              </strong>
              {#if project.budget}
                <strong
                  class="my-2 flex flex-none items-center justify-between text-4xl md:flex-col md:items-start"
                >
                  <Copy dim as="span" variant="pseudomono" class="text-sm">Budget:</Copy>
                  {project.budget}
                </strong>
              {/if}
            </header>
            {#if project.budget}
              <div class="group my-2 mx-4 mb-6 grid h-12 grid-cols-2 md:mx-6">
                <ChartItem
                  max={2}
                  index={0}
                  value={sumTimerHours(timers)}
                  color={project.color}
                  percent={(sumTimerHours(timers) / project.budget) * 100}
                />
              </div>
            {/if}
          {/await}
        {/if}
        <Copy as="h3" semibold variant="gradient" class="my-4 uppercase"
          >Recent Weekly Hours</Copy
        >
        <div class="mx-4 md:mx-6">
          {#if forecasts}
            <Chart cols={60} rows={5} height={320} axis={10}>
              {#await forecasts}
                <Icon icon="eos-icons:loading" class="h-4 w-4 text-white" />
              {:then forecasts}
                {#each forecasts as forecast, i}
                  {#if forecast}
                    <ChartItem
                      index={i}
                      max={forecast?.hours}
                      color={project?.color}
                      value={forecast?.actual}
                      label={formatForForecastWeek(forecastWeeks[i])}
                    />
                  {/if}
                {/each}
              {/await}
            </Chart>
          {/if}
        </div>
      {/key}
    </section>
  </Container>
  <div slot="cta">
    {#if dirty}
      <DualAction as="div" label="Update Project?">
        <Button
          on:click={reset}
          slot="secondary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <span slot="content">{project?.name}</span>
        <Button
          on:click={update}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    {:else}
      <DualAction as="div" label="Delete Project">
        <Button
          title="Delete project"
          on:click={() => (confirmDelete = true)}
          slot="secondary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:skull-outline-sharp" />
        </Button>
        <span slot="content">{project?.name}</span>
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

{#if confirmDelete}
  <Dialog open={true} title="Delete {project?.name}" sub="You are about to...">
    <Button slot="close" value="cancel" on:click={() => (confirmDelete = false)}>
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <section class="flex flex-1 flex-col items-center justify-center py-4">
      <DualAction>
        <Button
          slot="secondary"
          on:click={() => (confirmDelete = false)}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <span slot="content">Are you sure?</span>
        <Button
          on:click={handleDelete}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    </section>
  </Dialog>
{/if}
