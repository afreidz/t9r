<script lang="ts">
  import same from "@/lib/same";
  import trpc from "@/lib/trpc";
  import { onMount } from "svelte";
  import now from "@/lib/stores/now";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import { pop } from "svelte-spa-router";
  import projects from "@/stores/projects";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import { showLoader } from "@/lib/stores/ui";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import Switch from "@/foundation/Switch.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import selectedTimers from "@/lib/stores/selected";
  import type { Timer } from "@/backend/schema/timer";
  import ActionEdit from "@/core/actions/Edit.svelte";
  import tags, { updateTags } from "@/lib/stores/tags";
  import Container from "@/foundation/Container.svelte";
  import type { Project } from "@/backend/schema/project";
  import { getDurationHoursFromString } from "@/lib/dates";
  import { formatForMonth, getToday, isToday } from "@/lib/dates";

  let newTag: string;
  let multiple = false;
  let dirty: boolean = false;
  let picker: HTMLInputElement;
  let timer: Timer | null = null;
  let editMultipleTimings = false;
  let project: Project | undefined;
  let confirmDelete: boolean = false;
  let timers: Timer[] | undefined = undefined;
  let newValues: Partial<Timer> | undefined = undefined;
  let emptyTimer: Partial<Timer> = { project: undefined };

  onMount(async () => {
    $showLoader = true;

    if (multiple) {
      timers = await trpc.timers.bulkGet.query($selectedTimers);
      if (timers)
        newValues = {
          title:
            timers && timers.every((t) => t.title === timers?.[0].title)
              ? timers?.[0]?.title
              : undefined,
          date:
            timers && timers.every((t) => t.date === timers?.[0].date)
              ? timers?.[0]?.date
              : undefined,
          utilized: timers && timers.every((t) => t.utilized),
          project:
            timers && timers.every((t) => t.project === timers?.[0].project)
              ? timers?.[0]?.project
              : undefined,
          tags: $tags
            .filter((tag) => {
              return timers && timers.every((t) => tag._id && t.tags?.includes(tag._id));
            })
            .map((t) => t._id) as string[],
        };
    } else {
      timer = await trpc.timers.get.query(params.id);
      if (timer) newValues = { ...timer };
      if (timer) project = $projects.find((p) => p._id === timer?.project);
    }

    $showLoader = false;
  });

  export let params: { id: string };

  $: if (newValues) dirty = !same(newValues, { ...timer });
  $: multiple = params?.id === "selected";
  $: if (editMultipleTimings && newValues) {
    newValues.start = "09:00:00";
    newValues.end = "17:00:00";
  }

  function reset() {
    newValues = multiple ? { ...emptyTimer } : { ...timer };
  }

  async function update() {
    if (multiple && timers) {
      await trpc.timers.bulkUpdate.mutate({
        ids: $selectedTimers,
        details: {
          ...newValues,
          _id: undefined,
        },
      });
    } else if (!multiple && timer?._id) {
      await trpc.timers.update.mutate({
        id: timer._id,
        details: {
          ...newValues,
          _id: undefined,
        },
      });
    }

    return pop();
  }

  async function handleDelete() {
    if (timers?.length) {
      await trpc.timers.bulkDelete.mutate(
        timers.map((t) => t._id).filter(Boolean) as string[]
      );
    } else if (timer?._id) {
      await trpc.timers.delete.mutate({ id: timer._id });
    }
    return pop();
  }

  function showPicker() {
    if (picker) picker.showPicker();
  }

  async function addTag(e: unknown) {
    const val = (e as { currentTarget: EventTarget & HTMLInputElement }).currentTarget
      .value;

    let existing = $tags.find((t) => t._id === val) || (await trpc.tags.get.query(val));

    if (!existing && newValues) {
      const result = await trpc.tags.create.mutate({ value: val });

      if (result.acknowledged && result.insertedId) {
        existing = await trpc.tags.get.query(result.insertedId);
        await updateTags();
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
    if (!timer || !timer._id || !newValues) return;

    newValues.end = Temporal.Now.plainTimeISO()
      .round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "ceil",
      })
      .toString();
  }

  async function restart() {
    if (newValues && ((timers && timers.length) || (timer && timer._id)))
      return (newValues.end = null);
  }
</script>

<Layout>
  {#if newValues}
    <Header
      slot="header"
      class="mb-1"
      main={newValues.title || "Timer"}
      sub="Timer details For"
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
            {#each $tags as tag}
              <option value={tag._id}>{tag.value}</option>
            {/each}
          </datalist>
          <div class="flex flex-wrap border-t border-neutral-900/50 pb-1 pt-5">
            {#if newValues.tags}
              {#each newValues.tags as tag}
                <Tag closeable on:close={() => removeTag(tag)}>
                  {$tags.find((t) => t._id === tag)?.value || tag}
                </Tag>
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
            {@const project = $projects.find((p) => p._id === timer?.project)}
            <TimerComponent class="mt-3" {project} disableNav={true} title={timer.title}>
              <div slot="left">
                <Tag>{formatForMonth(timer.date)}</Tag>
              </div>
              <div slot="right">
                {#if !timer.end}
                  <Tag>running...</Tag>
                {:else if timer.start}
                  <Tag>{getDurationHoursFromString(timer.start, timer.end)}hrs</Tag>
                {/if}
              </div>
            </TimerComponent>
          {/each}
          <div class="flex items-center gap-2">
            <ActionEdit on:click={() => (editMultipleTimings = true)} class="flex-none" />
            <span class="flex-1">Update Timing for {timers.length} timers</span>
          </div>
          {#if editMultipleTimings}
            <div
              class="my-3 flex flex-col items-center gap-1 md:flex-row md:justify-evenly"
            >
              <Field label="Start Time">
                {#if newValues.start}
                  <Time bind:value={newValues.start} />
                {/if}
              </Field>
              <Icon
                icon="material-symbols:arrow-range"
                class="hidden text-4xl md:block"
              />
              <Field label="End Time">
                {#if newValues.end}
                  <Time bind:value={newValues.end} />
                {/if}
              </Field>
            </div>
            {#if timers.some((t) => t.end)}
              <div class="flex justify-center">
                <Button
                  on:click={restart}
                  class="h-9 max-w-min bg-gradient-to-br from-violet-600 to-cyan-600 px-8 text-center text-xl text-white"
                  >Restart</Button
                >
              </div>
            {/if}
          {/if}
          <div class="flex flex-1 items-end justify-center">
            <Button
              on:click={() => (confirmDelete = true)}
              class="flex items-center gap-2 bg-red-600 px-8 py-4 text-center text-xl text-white"
            >
              <Icon icon="material-symbols:skull-outline-sharp" />
              <span>Delete {timers.length} Timers</span>
            </Button>
          </div>
        {:else}
          {@const project = $projects.find((p) => p._id === newValues?.project)}
          <h3 class="mb-3 text-center text-xl font-bold md:text-left">Timing</h3>
          <TimerComponent
            class="mt-3"
            {project}
            title={newValues.title}
            href={`/#/project/${project?._id}`}
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
    {#if dirty}
      <DualAction as="div" label="Update Timer{timers ? 's' : ''}?">
        <Button
          slot="secondary"
          title="Navigate back"
          on:click={() => (multiple ? pop() : reset())}
          class="flex h-10 w-10 items-center justify-center !rounded-full {multiple
            ? 'bg-blue-500'
            : 'bg-red-500'} text-white !ring-offset-white"
        >
          {#if multiple}
            <Icon icon="ic:outline-arrow-back" />
          {:else}
            <Icon icon="teenyicons:x-small-outline" />
          {/if}
        </Button>

        <span slot="content" class="line-clamp-1"
          >{timers ? timers.length + " selected" : timer?.title || "Timer"}</span
        >
        <Button
          on:click={update}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    {:else}
      <DualAction as="div" label="Details for timer">
        <Button
          title="Delete project"
          on:click={() => (confirmDelete = true)}
          slot="secondary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:skull-outline-sharp" />
        </Button>
        <span slot="content" class="line-clamp-1">{timer?.title || "Timer"}</span>
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
  <Dialog
    open={true}
    title="Delete {timers?.length ? `${timers.length} timers` : timer?.title || ''}"
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
{/if}
