<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { pop } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Colors from "@/core/Colors.svelte";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import Dialog from "@/components/core/Dialog.svelte";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import Chart from "@/components/core/chart/Chart.svelte";
  import Switch from "@/components/foundation/Switch.svelte";
  import projects, { fetchProjects } from "@/stores/projects";
  import ChartItem from "@/components/core/chart/ChartItem.svelte";

  let dirty = false;
  let confirmDelete = false;
  let project: Project | undefined;
  let newValues: Project | undefined;
  export let params: { id: string };

  $: if (params.id && project?._id !== params.id) {
    project = $projects.find((p: Project) => p._id === params.id);
    if (project) newValues = { ...project, budget: project.budget || null };
  }

  $: if (newValues && project) dirty = !same<Project>(newValues, project);

  async function reset() {
    if (!project || !newValues) return;
    newValues = { ...project };
  }

  async function update() {
    if (!project || !project._id || !newValues?.name || !newValues?.color)
      return;

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

  async function archive() {
    if (!project || !project._id) return;
    await trpc.projects.update.mutate({
      id: project._id,
      details: {
        archived: !project.archived,
      },
    });
    await fetchProjects();
  }

  async function handleDelete() {
    if (!project || !project._id) return;
    const result = await trpc.projects.delete.mutate({ id: project._id });

    if (result.acknowledged) {
      await fetchProjects();
      pop();
    }
  }

  const maxVals = [40, 50, 30];
  const valVals = [22, 30, 10];
  let chartVals: { max: number; val: number }[];
  function random() {
    return Math.floor(Math.random() * (maxVals.length - 0)) + 0;
  }

  $: if (params.id) {
    chartVals = [
      { max: maxVals[random()], val: valVals[random()] },
      { max: maxVals[random()], val: valVals[random()] },
      { max: maxVals[random()], val: valVals[random()] },
      { max: maxVals[random()], val: valVals[random()] },
      { max: maxVals[random()], val: valVals[random()] },
    ];
  }
</script>

<Layout>
  {#if project && newValues}
    <Header sub="Details For" main={project.name} class="mb-1" />
    <Container class="flex-1">
      <section slot="primary" class="xl:flex-1">
        <Field label="Project Name">
          <input bind:value={newValues.name} />
        </Field>
        <Field label="Project Color">
          <div class="w-full overflow-hidden rounded-md">
            <input
              type="color"
              class="h-full w-full"
              bind:value={newValues.color}
              list="colors"
            />
          </div>
          <Colors id="colors" />
        </Field>
        <Field label="Default Timer Title">
          <input min={0} max={30} bind:value={newValues.defaultTitle} />
        </Field>
        <Field>
          <Switch
            class="justify-between"
            color={newValues.color}
            name="default_utilized"
            label="Timers default to utilized?"
            enabled={newValues.defaultUtilized}
            on:change={(e) => {
              if (newValues) newValues.defaultUtilized = e.detail;
            }}
          />
        </Field>
        <Field>
          <Switch
            class="justify-between"
            color={newValues.color}
            name="show_in_reports"
            label="Hide project from reports"
            enabled={newValues.hideInReport}
            on:change={(e) => {
              if (newValues) newValues.hideInReport = e.detail;
            }}
          />
        </Field>
        <Field label="Project Budget">
          <input
            class="text-2xl"
            type="number"
            min={0}
            bind:value={newValues.budget}
          />
        </Field>
        <Field label="Project Status">
          <strong class="flex flex-1 items-center justify-between gap-4"
            >{#if project.archived}Archived <Icon
                icon="mdi:eye-off-outline"
              />{:else}Active <Icon icon="mdi:eye-outline" />{/if}</strong
          >
        </Field>
      </section>
      <section
        slot="secondary"
        class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4"
      >
        {#if project.budget}
          <h3 class="font-pseudoMono text-sm font-light opacity-50">
            Project Lifetime
          </h3>
          <header class="my-1 flex justify-between">
            <strong class="my-2 flex-none text-4xl"
              >456 <span class="font-pseudoMono text-sm font-light opacity-50"
                >worked</span
              ></strong
            >
            {#if project.budget}
              <strong class="my-2 flex-none text-4xl"
                >{project.budget}
                <span class="font-pseudoMono text-sm font-light opacity-50"
                  >budget</span
                ></strong
              >
            {/if}
          </header>
          <div class="group my-2 mb-6 grid h-12 grid-cols-2">
            <ChartItem
              max={2}
              index={0}
              value={456}
              color={project.color}
              percent={(456 / project.budget) * 100}
            />
          </div>
        {/if}
        <h3 class="font-pseudoMono text-sm font-light opacity-50">
          Recent Hours
        </h3>
        <Chart cols={60} rows={5} height={320} axis={10}>
          <ChartItem
            max={chartVals[0].max}
            value={chartVals[0].val}
            index={0}
            label="3/13"
            color={project.color}
          />
          <ChartItem
            max={chartVals[1].max}
            value={chartVals[1].val}
            index={1}
            label="3/6"
            color={project.color}
          />
          <ChartItem
            max={chartVals[2].max}
            value={chartVals[2].val}
            index={2}
            label="2/27"
            color={project.color}
          />
          <ChartItem
            max={chartVals[3].max}
            value={chartVals[3].val}
            index={3}
            label="2/20"
            color={project.color}
          />
          <ChartItem
            max={chartVals[4].max}
            value={chartVals[4].val}
            index={4}
            label="2/13"
            color={project.color}
          />
        </Chart>
      </section>
    </Container>
  {/if}
  <div slot="cta">
    {#if dirty}
      <div in:fade>
        <DualAction as="div" label="Update Project?">
          <Button
            on:click={reset}
            slot="secondary"
            class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
          >
            <Icon icon="teenyicons:x-small-outline" />
          </Button>
          <span slot="content">{project?.name}</span>
          <Button
            on:click={update}
            slot="primary"
            class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-green-500 text-white !ring-offset-white"
          >
            <Icon icon="material-symbols:fitbit-check-small-sharp" />
          </Button>
        </DualAction>
      </div>
    {:else}
      <div in:fade>
        <DualAction as="div" label="Change Project Status" draggable={false}>
          <Button
            title="Delete project"
            on:click={() => (confirmDelete = true)}
            slot="secondary"
            class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
          >
            <Icon icon="material-symbols:skull-outline-sharp" />
          </Button>
          <span slot="content">{project?.name}</span>
          <Button
            title="Archive project"
            on:click={archive}
            slot="primary"
            class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-blue-500 text-white !ring-offset-white"
          >
            {#if project?.archived}
              <Icon icon="mdi:eye-off-outline" />
            {:else}
              <Icon icon="mdi:eye-outline" />
            {/if}
          </Button>
        </DualAction>
      </div>
    {/if}
  </div>
</Layout>

{#if confirmDelete}
  <Dialog open={true} title="Delete {project?.name}" sub="You are about to...">
    <Button
      slot="close"
      value="cancel"
      on:click={() => (confirmDelete = false)}
    >
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <section class="flex flex-1 flex-col items-center justify-center py-4">
      <DualAction>
        <Button
          slot="secondary"
          on:click={() => (confirmDelete = false)}
          class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <span slot="content">Are you sure?</span>
        <Button
          on:click={handleDelete}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    </section>
  </Dialog>
{/if}
