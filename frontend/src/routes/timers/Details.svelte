<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import { getToday } from "@/lib/dates";
  import { pop } from "svelte-spa-router";
  import projects from "@/stores/projects";
  import { fade } from "svelte/transition";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Time from "@/foundation/Time.svelte";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import { getDurationHoursFromString } from "@/lib/dates";
  import type { Tag as TagType } from "@/backend/schema/tag";
  import TimerComponent from "@/components/core/Timer.svelte";

  let title: string;
  let newTag: string;
  let tags: TagType[] = [];
  let dirty: boolean = false;
  let picker: HTMLInputElement;
  let timer: Timer | null = null;
  let loader: () => Promise<void>;
  let project: Project | undefined;
  let confirmDelete: boolean = false;
  let newValues: Timer | undefined = undefined;

  $: if (params.id && timer?._id !== params.id) {
    loader = async () => {
      tags = await trpc.tags.list.query();
      timer = await trpc.timers.get.query(params.id);

      if (timer) newValues = { ...timer };
      if (timer) project = $projects.find((p) => p._id === timer?.project);
      return;
    };
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

  function showPicker() {
    if (picker) picker.showPicker();
  }

  async function addTag(e: { currentTarget: HTMLInputElement }) {
    const val = e.currentTarget.value;
    const datalist = e.currentTarget.list as HTMLDataListElement;
    const option = [...datalist.options].find((o) => o.value === val);

    let existing =
      tags.find((t) => t._id === option?.id) ||
      (await trpc.tags.get.query(val));

    if (!existing && newValues) {
      const result = await trpc.tags.create.mutate({ value: val });

      if (result.acknowledged && result.insertedId) {
        tags = await trpc.tags.list.query();
        existing = await trpc.tags.get.query(result.insertedId);
      }
    }

    newTag = "";

    if (existing && existing._id && newValues) {
      const newTags = newValues.tags
        ? [...newValues.tags, existing._id]
        : [existing._id];
      newValues.tags = [...new Set(newTags)];
      return;
    }
  }

  function removeTag(id: string) {
    if (newValues) newValues.tags = newValues?.tags.filter((t) => t !== id);
  }

  async function stop() {
    if (!timer || !timer._id) return;

    await trpc.timers.update.mutate({
      id: timer._id,
      details: {
        end: Temporal.Now.plainTimeISO()
          .round({
            smallestUnit: "minute",
            roundingIncrement: 15,
            roundingMode: "ceil",
          })
          .toString(),
      },
    });

    timer = await trpc.timers.get.query(timer._id);
    if (timer) newValues = { ...timer };
  }

  export let params: { id: string };
</script>

<Layout loader={loader()}>
  {#if newValues}
    <Header sub="Timer details For" main={newValues.title} class="mb-1" />
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
        <Field label="Date">
          <button class="!ring-0 !ring-offset-0" on:click={showPicker}>
            <input
              type="date"
              bind:this={picker}
              max={getToday().toString()}
              bind:value={newValues.date}
            />
          </button>
          <Icon
            slot="icon"
            icon="mdi:calendar-today-outline"
            class="text-neutral-light"
          />
        </Field>
        <Field label="Tags">
          <input
            min={2}
            max={30}
            list="tags"
            class="mb-2 appearance-none"
            on:change={addTag}
            bind:value={newTag}
          />
          <Icon
            slot="icon"
            icon="material-symbols:search"
            class="text-neutral-light"
          />
          <datalist id="tags">
            {#each tags as tag}
              <option id={tag._id} value={tag.value} />
            {/each}
          </datalist>
          <div class="flex flex-wrap border-t border-neutral-900/50 pb-1 pt-5">
            {#if newValues.tags}
              {#each newValues.tags as tag}
                {#if tags.find((t) => t._id === tag)}
                  <Tag closeable on:close={() => removeTag(tag)}>
                    {tags.find((t) => t._id === tag)?.value}
                  </Tag>
                {/if}
              {/each}
            {/if}
          </div>
        </Field>
      </section>
      <section
        slot="secondary"
        class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4"
      >
        <h3 class="mb-3 text-center text-xl font-bold md:text-left">Timing</h3>
        <TimerComponent
          disableNav
          class="mt-3"
          title={newValues.title}
          project={$projects.find((p) => p._id === newValues?.project)}
        >
          {#if newValues.end}
            <Tag
              >{getDurationHoursFromString(
                newValues.start,
                newValues.end
              )}hrs</Tag
            >
          {/if}
        </TimerComponent>
        <div
          class="my-3 flex flex-col items-center gap-1 md:flex-row md:justify-evenly"
        >
          <Field label="Start Time">
            <Time bind:value={newValues.start} />
          </Field>
          <Icon
            icon="material-symbols:arrow-range"
            class="hidden text-4xl md:block"
          />
          <Field label={newValues.end ? "End Time" : "Running..."}>
            {#if !newValues.end}
              <Button
                on:click={stop}
                class="h-9 px-8 text-center font-mono text-xl text-white"
                style={` background-color: ${project?.color} `}>Stop</Button
              >
            {:else}
              <Time bind:value={newValues.end} />
            {/if}
          </Field>
        </div>
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

<style>
  [list]::-webkit-calendar-picker-indicator,
  [list]::-webkit-list-button {
    opacity: 0;
  }
</style>
