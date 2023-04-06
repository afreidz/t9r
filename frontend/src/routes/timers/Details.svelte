<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import now from "@/lib/stores/now";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import { pop } from "svelte-spa-router";
  import projects from "@/stores/projects";
  import { fade } from "svelte/transition";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import Moveable from "@/core/Moveable.svelte";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import Switch from "@/foundation/Switch.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import { getDurationHoursFromString } from "@/lib/dates";
  import type { Tag as TagType } from "@/backend/schema/tag";
  import { formatForMonth, getToday, isToday } from "@/lib/dates";
  import { ctaPosition, isSelecting, selected } from "@/lib/stores/ui";

  let newTag: string;
  let multiple = false;
  let tags: TagType[] = [];
  let dirty: boolean = false;
  let picker: HTMLInputElement;
  let timer: Timer | null = null;
  let loader: () => Promise<void>;
  let project: Project | undefined;
  let confirmDelete: boolean = false;
  let timers: Timer[] | undefined = undefined;
  let newValues: Partial<Timer> | undefined = undefined;
  let emptyTimer: Partial<Timer> = { project: undefined };

  export let params: { id: string };

  if (params.id !== "selected") {
    loader = async () => {
      tags = await trpc.tags.list.query();
      timer = await trpc.timers.get.query(params.id);

      if (timer) newValues = { ...timer };
      if (timer) project = $projects.find((p) => p._id === timer?.project);
      return;
    };
  } else {
    loader = async () => {
      tags = await trpc.tags.list.query();
      timers = await trpc.timers.bulkGet.query($selected);

      if (timers) newValues = { ...emptyTimer };
    };
  }

  $: multiple = params.id === "selected";

  $: if (multiple && newValues && timers) {
    dirty = !same<Partial<Timer>>(newValues, { ...emptyTimer });
  } else if (!multiple && newValues && timer) {
    dirty = !same<Partial<Timer>>(newValues, { ...timer });
  }

  function reset() {
    newValues = multiple ? { ...emptyTimer } : { ...timer };
  }

  async function update() {
    if (multiple && timers && newValues) {
      await trpc.timers.bulkUpdate.mutate({
        ids: $selected,
        details: {
          ...newValues,
          _id: undefined,
        },
      });

      timers = await trpc.timers.bulkGet.query($selected);
      if (timers.length > 0) newValues = { ...emptyTimer };
    } else if (!multiple && timer && timer._id) {
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

    $selected = [];
    $isSelecting = false;
    return pop();
  }

  async function handleDelete() {
    if (multiple && $selected.length) {
      await trpc.timers.bulkDelete.mutate($selected);
    } else if (!multiple && timer && timer._id) {
      await trpc.timers.delete.mutate({ id: timer._id });
    }
    return pop();
  }

  function showPicker() {
    if (picker) picker.showPicker();
  }

  async function addTag(e: { currentTarget: HTMLInputElement }) {
    const val = e.currentTarget.value;

    let existing = tags.find((t) => t._id === val) || (await trpc.tags.get.query(val));

    if (!existing && newValues) {
      const result = await trpc.tags.create.mutate({ value: val });

      if (result.acknowledged && result.insertedId) {
        tags = await trpc.tags.list.query();
        existing = await trpc.tags.get.query(result.insertedId);
      }
    }

    newTag = "";

    if (existing && existing._id && newValues) {
      const newTags = newValues.tags ? [...newValues.tags, existing._id] : [existing._id];
      newValues.tags = [...new Set(newTags)];
      return;
    }
  }

  function removeTag(id: string) {
    if (newValues) newValues.tags = newValues?.tags?.filter((t) => t !== id);
  }

  async function stop() {
    if (multiple) return;
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

  async function restart() {
    if (multiple) return;
    if (!timer || !timer._id) return;

    await trpc.timers.update.mutate({
      id: timer._id,
      details: {
        end: null,
      },
    });

    timer = await trpc.timers.get.query(timer._id);
    if (timer) newValues = { ...timer };
  }
</script>

<Layout loader={loader()}>
  {#if newValues}
    <Header
      class="mb-1"
      sub="Timer details For"
      main={multiple ? $selected.length + " Timers" : newValues.title}
    />
    <Container class="flex-1">
      <section slot="primary" class="xl:flex-1">
        <Field label="Title">
          <input bind:value={newValues.title} />
        </Field>
        <Field label="Project">
          <select bind:value={newValues.project}>
            <option value={undefined}>Select one...</option>
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
            type="search"
            autocomplete="on"
            on:change={addTag}
            bind:value={newTag}
          />
          <Icon slot="icon" icon="material-symbols:search" class="text-neutral-light" />
          <datalist id="tags">
            {#each tags as tag}
              <option value={tag._id}>{tag.value}</option>
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
        <Field>
          <Switch
            class="justify-between"
            name="utilized"
            color={project?.color}
            label="Utilized?"
            enabled={newValues.utilized}
            on:change={(e) => {
              if (newValues) newValues.utilized = e.detail;
            }}
          />
        </Field>
      </section>
      <section
        slot="secondary"
        class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4"
      >
        {#if multiple && timers}
          <h3 class="mb-3 text-center text-xl font-bold md:text-left">Timers</h3>
          {#each timers as timer}
            <TimerComponent
              disableNav
              class="mt-3"
              title={timer.title}
              project={$projects.find((p) => p._id === timer?.project)}
            >
              <div slot="left">
                <Tag>{formatForMonth(timer.date)}</Tag>
              </div>
              <div slot="right">
                {#if timer.start && timer.end}
                  <Tag>{getDurationHoursFromString(timer.start, timer.end)}hrs</Tag>
                {/if}
              </div>
            </TimerComponent>
          {/each}
        {:else}
          <h3 class="mb-3 text-center text-xl font-bold md:text-left">Timing</h3>
          <TimerComponent
            disableNav
            class="mt-3"
            title={newValues.title}
            project={$projects.find((p) => p._id === newValues?.project)}
          >
            <div slot="right">
              {#if newValues.start && newValues.end}
                <Tag>{getDurationHoursFromString(newValues.start, newValues.end)}hrs</Tag>
              {:else if newValues.start}
                <Tag>
                  {getDurationHoursFromString(newValues.start, $now.toString())}hrs
                </Tag>
                <Tag>running</Tag>
              {/if}
            </div>
          </TimerComponent>
          <div
            class="my-3 flex flex-col items-center gap-1 md:flex-row md:justify-evenly"
          >
            <Field label="Start Time">
              {#if newValues.start}
                <Time bind:value={newValues.start} />
              {/if}
            </Field>
            <Icon icon="material-symbols:arrow-range" class="hidden text-4xl md:block" />
            <Field label={newValues.end ? "End Time" : "Running..."}>
              {#if !newValues.end && !multiple}
                <Button
                  on:click={stop}
                  class="h-9 px-8 text-center text-xl font-light text-white"
                  style={`background-color: ${project?.color}`}
                >
                  <Copy as="span" variant="pseudomono">Stop</Copy>
                </Button>
              {:else if newValues.end}
                <Time bind:value={newValues.end} />
              {/if}
            </Field>
          </div>
          {#if timer && timer.end && isToday(timer.date) && !multiple}
            <div class="flex justify-center">
              <Button
                on:click={restart}
                class="h-9 max-w-min px-8 text-center text-xl text-white"
                style={` background-color: ${project?.color} `}>Restart</Button
              >
            </div>
          {/if}
        {/if}
      </section>
    </Container>
  {/if}
  <div slot="cta">
    <Moveable state={$ctaPosition}>
      {#if dirty}
        <div in:fade>
          <DualAction as="div" label="Update Timer?">
            <Button
              on:click={reset}
              slot="secondary"
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
            >
              <Icon icon="teenyicons:x-small-outline" />
            </Button>
            <span slot="content"
              >{multiple ? $selected.length + " Timers" : timer?.title}</span
            >
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
          <DualAction as="div" label="Delete Timer(s)">
            <Button
              title="Delete project"
              on:click={() => (confirmDelete = true)}
              slot="secondary"
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
            >
              <Icon icon="material-symbols:skull-outline-sharp" />
            </Button>
            <span slot="content"
              >{multiple ? $selected.length + " Timers" : timer?.title}</span
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
      {/if}
    </Moveable>
  </div>
</Layout>

{#if confirmDelete}
  <Dialog open={true} title="Delete {timer?.title || ''}" sub="You are about to...">
    <Button slot="close" value="cancel" on:click={() => (confirmDelete = false)}>
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

<style>
  [list]::-webkit-calendar-picker-indicator,
  [list]::-webkit-list-button {
    opacity: 0;
  }
</style>
