<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import projects from "@/lib/projects";
  import { pop } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";

  let title: string;
  let loader: Promise<void>;
  let dirty: boolean = false;
  let timer: Timer | null = null;
  let project: Project | undefined;
  let confirmDelete: boolean = false;
  let newValues: Timer | undefined = undefined;

  $: if (params.id && timer?._id !== params.id) {
    loader = trpc.timers.get.query(params.id).then((r) => {
      timer = r;
      if (timer) newValues = { ...timer };
      if (timer) project = $projects.find((p) => p._id === timer?.project);
      if (timer && project) title = `${project.name}/${timer.title || "timer"}`;
      return;
    });
  }

  $: if (newValues && timer) dirty = !same<Timer>(newValues, timer);

  function reset() {
    if (!timer || !newValues) return;
    newValues = { ...timer };
  }

  async function update() {
    if (!timer || !timer._id) return;

    await trpc.timers.update.mutate({
      id: timer._id,
      details: {
        ...newValues,
        _id: undefined,
        end: undefined,
        start: undefined,
      },
    });

    timer = await trpc.timers.get.query(timer._id);
    if (timer) newValues = { ...timer };
  }

  async function handleDelete() {
    if (!timer || !timer._id) return;
    const result = await trpc.timers.delete.mutate({ id: timer._id });

    if (result.acknowledged) {
      return pop();
    }
  }

  export let params: { id: string };
</script>

<Layout {loader}>
  {#if newValues}
    <Header sub="Details For" main={title} class="mb-1" />
    <Container class="flex-1">
      <section slot="primary" class="xl:flex-1">
        <Field label="Title">
          <input bind:value={newValues.title} />
        </Field>
        <Field label="Project">
          <select bind:value={newValues.project}>
            {#each $projects as project}
              <option value={project._id}>{project.name}</option>
            {/each}
          </select>
        </Field>
      </section>
      <section
        slot="secondary"
        class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4"
      >
        Hello!
      </section>
    </Container>
  {/if}

  <div slot="cta">
    {#if dirty}
      <div in:fade>
        <DualAction as="div" label="Update Timer?">
          <Button
            on:click={reset}
            slot="secondary"
            class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
          >
            <Icon icon="teenyicons:x-small-outline" />
          </Button>
          <span slot="content">{timer?.title || "Timer"}</span>
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
        <DualAction as="div" label="Delete Timer">
          <Button
            title="Delete project"
            on:click={() => (confirmDelete = true)}
            slot="secondary"
            class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
          >
            <Icon icon="material-symbols:skull-outline-sharp" />
          </Button>
          <span slot="content">{timer?.title || "Timer"}</span>
        </DualAction>
      </div>
    {/if}
  </div>
</Layout>

{#if confirmDelete}
  <Dialog open={true} title="Delete {title}" sub="You are about to...">
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
