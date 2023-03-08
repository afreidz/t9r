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
  import Dialog from "@/components/core/Dialog.svelte";

  type $$Props = {
    params?: { id?: string };
  };

  let dirty = false;
  let confirmDelete = false;
  let project: Project | undefined;
  let newValues: Project | undefined;
  let { params = { id: undefined } }: $$Props = $$props;

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

    console.log(result);

    if (result.acknowledged) {
      await fetchProjects();
      return push("/timers");
    }
  }

  $: if (!!params.id && !project && $projects.length) {
    replace("/404");
  }

  export { params };
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
        class="my-1 flex flex-1 flex-col justify-between rounded-md bg-neutral-900 p-4"
      >
        More details here...
        <!-- <Field as="footer" label="Danger Zone" class="border-red-500/50">
          <Button on:click={handleDelete} class="rounded-md bg-red-500 p-4 px-7"
            >Delete Project</Button
          >
        </Field> -->
      </section>
    </Container>
  {/if}
  <div slot="cta">
    {#if dirty}
      <div in:fade>
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
    {:else}
      <div in:fade>
        <DualAction label="Project Visibility">
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
              <Icon icon="mdi:eye-outline" />
            {:else}
              <Icon icon="mdi:eye-off-outline" />
            {/if}
          </Button>
        </DualAction>
      </div>
    {/if}
  </div>
</Layout>

<Dialog
  open={confirmDelete}
  title="Delete {project?.name}"
  sub="You are about to..."
>
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
