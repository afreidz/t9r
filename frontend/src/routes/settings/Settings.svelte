<script lang="ts">
  import trpc from "@/lib/trpc";
  import same from "@/lib/same";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import Months from "./Months.svelte";
  import { user } from "@/lib/stores/user";
  import Header from "@/core/Header.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import Link from "@/foundation/Link.svelte";
  import projects from "@/lib/stores/projects";
  import { pop, push } from "svelte-spa-router";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { showLoader, dirty } from "@/lib/stores/ui";
  import ActionEdit from "@/core/actions/Edit.svelte";
  import tags, { updateTags } from "@/lib/stores/tags";
  import Container from "@/foundation/Container.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
  import ActionReorder from "@/core/actions/Reorder.svelte";
  import type { Settings } from "@/backend/schema/settings";
  import EmojiPicker from "@/components/core/Emojis.svelte";
  import type { Tag as TagType } from "@/backend/schema/tag";
  import settings, { updateSettings } from "@/lib/stores/settings";

  let tagSearch: string = "";
  let filteredTags: TagType[] = [];
  let deletedTag: TagType | undefined;
  let trackStartInput: HTMLInputElement;
  let newValues: Partial<Settings> = $settings;
  let editSavedQuery: Settings["savedQueries"][number] | undefined = undefined;

  updateSettings().then((s) => {
    if (!s) {
      trpc.settings.updateOrCreate.mutate({}).then(updateSettings);
    }
  });

  $: if (!Object.keys(newValues).length && $settings)
    newValues = JSON.parse(JSON.stringify($settings));
  $: if (newValues && $settings) $dirty = !same(newValues, $settings);

  $: if (tagSearch.length) {
    filteredTags = $tags.filter((tag) =>
      tag.value.toLowerCase().includes(tagSearch.toLowerCase())
    );
  } else {
    filteredTags = [];
  }

  async function update() {
    if (!newValues) return;
    $settings = newValues;
    $showLoader = true;
    await trpc.settings.updateOrCreate.mutate(newValues);
    $showLoader = false;
    await updateSettings();
    reset();
  }

  function reset() {
    if (!$settings) return;
    newValues = JSON.parse(JSON.stringify($settings));
  }

  async function handleDeleteTag() {
    if (!deletedTag?._id) return;
    const result = await trpc.tags.deleteTag.mutate({ id: deletedTag._id });

    if (result.acknowledged) {
      deletedTag = undefined;
      await updateTags();
    }
  }

  function toggleTagVisibility(t: TagType) {
    if (newValues.hiddenTags?.includes(t._id ?? t.value)) {
      newValues.hiddenTags = newValues.hiddenTags.filter(
        (ht) => ht !== (t._id ?? t.value)
      );
    } else {
      newValues.hiddenTags = [...(newValues.hiddenTags ?? []), t._id ?? t.value];
    }
  }

  function deleteSavedQuery(q: Settings["savedQueries"][number]) {
    newValues.savedQueries = newValues.savedQueries?.filter((sq) => sq.label !== q.label);
  }

  function reorder(e: DragEvent, i: number) {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData("text/plain", `${i}`);
  }

  function changeQueryOrder(e: DragEvent, i: number) {
    if (!e.dataTransfer || !newValues.savedQueries) return;
    e.dataTransfer.dropEffect = "move";
    const start = parseInt(e.dataTransfer.getData("text/plain"));
    const newOrder = newValues.savedQueries;

    if (start < i) {
      newOrder.splice(i + 1, 0, newOrder[start]);
      newOrder.splice(start, 1);
    } else {
      newOrder.splice(i, 0, newOrder[start]);
      newOrder.splice(start + 1, 1);
    }
    newValues.savedQueries = newOrder;
  }

  function changeProjectOrder(e: DragEvent, i: number) {
    if (!e.dataTransfer || !newValues.projectOrder) return;
    e.dataTransfer.dropEffect = "move";
    const start = parseInt(e.dataTransfer.getData("text/plain"));
    const newOrder = newValues.projectOrder;

    if (start < i) {
      newOrder.splice(i + 1, 0, newOrder[start]);
      newOrder.splice(start, 1);
    } else {
      newOrder.splice(i, 0, newOrder[start]);
      newOrder.splice(start + 1, 1);
    }
    newValues.projectOrder = newOrder;
  }

  async function handleEditSavedQuery() {
    newValues.savedQueries = newValues.savedQueries;
    editSavedQuery = undefined;
  }
</script>

<Layout>
  <Header slot="header" main="Settings" sub="Account">
    <aside slot="right" class="flex flex-col items-center justify-center" />
  </Header>
  <Container>
    <section slot="primary" class="flex-1">
      <Copy as="h3" semibold variant="gradient" class="my-4 uppercase"
        >Dates and Times</Copy
      >
      <div class="md:ml-4">
        {#if newValues?.fiscalYearStart}
          <Field label="Start of fiscal year">
            <select bind:value={newValues.fiscalYearStart}>
              <Months />
            </select>
          </Field>
        {/if}
        {#if newValues?.trackingStart}
          <Field label="Track utilization as of">
            <input
              type="date"
              bind:this={trackStartInput}
              bind:value={newValues.trackingStart}
            />
            <button
              slot="icon"
              class="text-neutral-light"
              on:click={() => trackStartInput?.showPicker()}
            >
              <Icon icon="mdi:calendar-today-outline" />
            </button>
          </Field>
        {/if}
        {#if newValues?.sod}
          <Field label="Start of day">
            <Time bind:value={newValues.sod} />
          </Field>
        {/if}
        {#if newValues?.eod}
          <Field label="End of day">
            <Time bind:value={newValues.eod} />
          </Field>
        {/if}
      </div>
      <Copy as="h3" semibold variant="gradient" class="my-4 uppercase">Miscelaneous</Copy>
      <div class="md:ml-4">
        <Field label="Default Utilization Target %">
          {#if newValues?.defaultUtilization}
            <input
              type="number"
              max={100}
              bind:value={newValues.defaultUtilization}
              class="my-2 w-full text-center text-3xl"
            />
          {/if}
        </Field>
        <Field label="Signed in as">
          <Copy semibold as="strong" variant="gradient" class="my-4 text-center uppercase"
            >{$user?.email}</Copy
          >
        </Field>
      </div>
    </section>
    <section
      class="my-1 flex flex-1 flex-col rounded-md p-4 pt-0"
      slot="secondary"
      class:bg-neutral-900={$tags.length ||
        newValues.savedQueries?.length ||
        newValues.projectOrder?.length}
    >
      {#if newValues.savedQueries?.length && newValues.savedQueries.some((q) => q.type === "timer")}
        <Copy as="h3" semibold variant="gradient" class="my-4 mt-10 uppercase"
          >Saved Timer Queries</Copy
        >
        <div class="max-h-96 overflow-auto">
          <ul class="border-t border-white/10">
            {#each newValues.savedQueries as savedQuery, idx}
              {#if savedQuery.type === "timer"}
                <li
                  draggable={true}
                  on:dragover|preventDefault
                  on:dragenter|preventDefault
                  on:drop={(e) => changeQueryOrder(e, idx)}
                  on:dragstart={(e) => reorder(e, idx)}
                  class="flex items-center justify-between gap-4 border-b border-inherit px-2"
                >
                  {#if newValues.savedQueries.length > 1}<ActionReorder
                      class="flex-none"
                    />{/if}
                  <div class="flex flex-1 items-center gap-2">
                    <Link to={savedQuery.url}>
                      {savedQuery.icon || ""}
                      {savedQuery.label}
                    </Link>
                    <ActionEdit on:click={() => (editSavedQuery = savedQuery)} />
                  </div>
                  <ActionClose
                    class="flex-none"
                    on:click={() => deleteSavedQuery(savedQuery)}
                  />
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      {/if}
      {#if newValues.savedQueries?.length && newValues.savedQueries.some((q) => q.type === "workplan")}
        <Copy as="h3" semibold variant="gradient" class="my-4 mt-10 uppercase"
          >Saved Workplan Queries</Copy
        >
        <div class="max-h-96 overflow-auto">
          <ul class="border-t border-white/10">
            {#each newValues.savedQueries as savedQuery, idx}
              {#if savedQuery.type === "workplan"}
                <li
                  draggable={true}
                  on:dragover|preventDefault
                  on:dragenter|preventDefault
                  on:drop={(e) => changeQueryOrder(e, idx)}
                  on:dragstart={(e) => reorder(e, idx)}
                  class="flex items-center justify-between gap-4 border-b border-inherit px-2"
                >
                  {#if newValues.savedQueries.length > 1}<ActionReorder />{/if}
                  <div class="flex flex-1 items-center gap-2">
                    <Link to={savedQuery.url}>
                      {savedQuery.icon || ""}
                      {savedQuery.label}
                    </Link>
                    <ActionEdit on:click={() => (editSavedQuery = savedQuery)} />
                  </div>
                  <ActionClose on:click={() => deleteSavedQuery(savedQuery)} />
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      {/if}
      {#if newValues?.projectOrder?.length}
        <Copy as="h3" semibold variant="gradient" class="my-4 mt-10 uppercase"
          >Project Order</Copy
        >
        <div class="mb-6 max-h-96 overflow-auto">
          <ul class="border-t border-white/10">
            {#each newValues.projectOrder as pid, idx}
              {@const project = $projects.find((p) => p._id === pid)}
              {#if project}
                <li
                  draggable={true}
                  on:dragover|preventDefault
                  on:dragenter|preventDefault
                  on:dragstart={(e) => reorder(e, idx)}
                  on:drop={(e) => changeProjectOrder(e, idx)}
                  class="flex items-center justify-between gap-4 border-b border-inherit px-2"
                >
                  {#if newValues.projectOrder.length > 1}<ActionReorder
                      class="flex-none"
                    />{/if}
                  <div class="flex flex-1 items-center gap-2">
                    <i
                      class="flex h-5 w-5 items-center justify-center rounded-full text-center text-[11px] not-italic"
                      style="background-color: {project.color};">{project.icon || ""}</i
                    >
                    {project.name}
                    <ActionEdit
                      class="flex-none"
                      on:click={() => push(`/project/${pid}`)}
                    />
                  </div>
                  <!-- <ActionClose /> -->
                </li>
              {/if}
            {/each}
          </ul>
        </div>
      {/if}
      {#if $tags.length}
        <Copy as="h3" semibold variant="gradient" class="mt-4 mb-2 uppercase">Tags</Copy>
        <Field label="Search">
          <input
            min={2}
            max={30}
            list="tags"
            type="search"
            autocomplete="on"
            bind:value={tagSearch}
          />
          <Icon slot="icon" icon="material-symbols:search" class="text-neutral-light" />
        </Field>
        <div class="max-h-96 overflow-auto">
          {#await updateTags()}
            <Icon icon="eos-icons:loading" class="h-7 w-7 text-white" />
          {:then}
            {#each filteredTags.length ? filteredTags : $tags as tag}
              <Tag
                closeable
                on:close={() => (deletedTag = tag)}
                class={newValues.hiddenTags?.includes(tag._id ?? tag.value)
                  ? "!bg-white/10"
                  : ""}
              >
                <button type="button" on:click={() => toggleTagVisibility(tag)}>
                  {#if newValues.hiddenTags?.includes(tag._id ?? tag.value)}
                    <Icon slot="hide" icon="ant-design:eye-invisible-outlined" />
                  {:else}
                    <Icon slot="hide" icon="ant-design:eye-outlined" />
                  {/if}
                </button>
                {tag.value}
              </Tag>
            {/each}
          {/await}
        </div>
      {/if}
    </section>
  </Container>
  <div slot="cta">
    {#if $dirty}
      <DualAction as="div" label="Do you want to">
        <Button
          slot="secondary"
          on:click={reset}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <span slot="content">Update Settings?</span>
        <Button
          on:click={update}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    {:else}
      <DualAction as="div" label="Showing">
        <span slot="content">Account Settings</span>
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

{#if deletedTag}
  <Dialog
    open={true}
    title="Permanently delete tag {deletedTag.value}"
    sub="You are about to..."
  >
    <Button slot="close" value="cancel" on:click={() => (deletedTag = undefined)}>
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <section class="flex flex-1 flex-col items-center justify-center py-4">
      <DualAction>
        <Button
          slot="secondary"
          on:click={() => (deletedTag = undefined)}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <span slot="content">Are you sure?</span>
        <Button
          on:click={handleDeleteTag}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    </section>
  </Dialog>
{/if}

{#if editSavedQuery}
  <Dialog open={true} title="Edit {editSavedQuery.label}" sub="You are about to...">
    <Button slot="close" value="cancel" on:click={() => (editSavedQuery = undefined)}>
      <Icon icon="material-symbols:close" class="h-7 w-7" />
    </Button>
    <section class="flex flex-1 flex-col items-center justify-center py-4">
      <DualAction>
        <Button
          slot="secondary"
          on:click={() => (editSavedQuery = undefined)}
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-red-500 text-white !ring-offset-white"
        >
          <Icon icon="teenyicons:x-small-outline" />
        </Button>
        <div slot="content" class="flex items-center">
          <input bind:value={editSavedQuery.label} class="flex-1" />
          <EmojiPicker bind:value={editSavedQuery.icon} class="flex-none" />
        </div>
        <Button
          on:click={handleEditSavedQuery}
          slot="primary"
          class="flex h-10 w-10 items-center justify-center !rounded-full bg-green-500 text-white !ring-offset-white"
        >
          <Icon icon="material-symbols:fitbit-check-small-sharp" />
        </Button>
      </DualAction>
    </section>
  </Dialog>
{/if}
