<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
  import { push } from "svelte-spa-router";
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
  import projects, { fetchProjects } from "@/lib/projects";
  import Switch from "@/components/foundation/Switch.svelte";
  import ChartItem from "@/components/core/chart/ChartItem.svelte";

  let dirty = false;
  let confirmDelete = false;
  let project: Project | undefined;
  let newValues: Project | undefined;
  export let params: { id: string };

  $: if (params.id && project?._id !== params.id) {
    project = $projects.find((p: Project) => p._id === params.id);
    if (project) newValues = { ...project, budget: project.budget || 0 };
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
        _id: undefined,
      },
    });
    await fetchProjects();
    project = $projects.find((p: Project) => p._id === params.id);
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
      return push("/timers");
    }
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
        <Field>
          <Switch
            class="justify-between"
            name="show_in_reports"
            label="Show in project reports?"
          />
        </Field>
      </section>
      <section
        slot="secondary"
        class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4"
      >
        <h3 class="font-mono text-sm opacity-50">Project Hours</h3>
        <header class="my-1 flex justify-between">
          <strong class="my-2 flex-none text-4xl"
            >456 <span class="font-mono text-sm font-light opacity-50"
              >worked</span
            ></strong
          >
          {#if project.budget}
            <strong class="my-2 flex-none text-4xl"
              >{project.budget}
              <span class="font-mono text-sm font-light opacity-50">budget</span
              ></strong
            >
          {/if}
        </header>
        <Chart cols={60} rows={5} height={320} axis={10}>
          <ChartItem
            max={40}
            index={0}
            value={32}
            label="3/13"
            color={project.color}
          />
          <ChartItem index={1} value={22} label="3/6" color={project.color} />
          <ChartItem
            max={20}
            index={2}
            value={30}
            label="2/27"
            color={project.color}
          />
          <ChartItem
            max={40}
            index={3}
            value={40}
            label="2/20"
            color={project.color}
          />
          <ChartItem
            max={48}
            index={4}
            value={48}
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
      </div>
    {:else}
      <div in:fade>
        <DualAction as="div" label="Change Project Status">
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
            title="Archive project"
            on:click={archive}
            slot="primary"
            class="flex h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
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
