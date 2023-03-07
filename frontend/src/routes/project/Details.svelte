<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Colors from "@/core/Colors.svelte";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { push, replace } from "svelte-spa-router";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import projects, { fetchProjects } from "@/lib/projects";

  let newValues: Project | undefined;
  let project: Project | undefined;
  export let params = { id: null };
  let dirty = false;

  $: if (project && !newValues) newValues = { ...project };
  $: project = $projects.find((p: Project) => p._id === params.id);
  $: dirty =
    project?.name !== newValues?.name || project?.color !== newValues?.color;

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
        name: newValues.name,
        color: newValues.color,
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

  $: if (!!params.id && !project && $projects.length) {
    replace("/404");
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
          <input type="color" bind:value={newValues.color} list="colors" />
          <Colors id="colors" />
        </Field>
      </section>
      <section
        slot="secondary"
        class="my-1 flex flex-1 flex-col justify-between rounded-md bg-neutral-900 p-4"
      >
        More details here...
        <Field as="footer" label="Danger Zone" class="border-red-500/50">
          <Button on:click={handleDelete} class="rounded-md bg-red-500 p-4 px-7"
            >Delete Project</Button
          >
        </Field>
      </section>
    </Container>
  {/if}
  <div slot="cta">
    {#if dirty}
      <div in:fade out:fade>
        <DualAction label="Update Project?">
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
    {/if}
  </div>
</Layout>
