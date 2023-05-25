<script lang="ts">
  import trpc from "@/lib/trpc";
  import same from "@/lib/same";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import Months from "./Months.svelte";
  import { pop } from "svelte-spa-router";
  import { user } from "@/lib/stores/user";
  import Header from "@/core/Header.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import Link from "@/foundation/Link.svelte";
  import { showLoader } from "@/lib/stores/ui";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import tags, { updateTags } from "@/lib/stores/tags";
  import Container from "@/foundation/Container.svelte";
  import ActionClose from "@/core/actions/Close.svelte";
  import type { Settings } from "@/backend/schema/settings";
  import type { Tag as TagType } from "@/backend/schema/tag";
  import settings, { updateSettings } from "@/lib/stores/settings";

  let dirty = false;
  let tagSearch: string = "";
  let filteredTags: TagType[] = [];
  let deletedTag: TagType | undefined;
  let trackStartInput: HTMLInputElement;
  let newValues: Partial<Settings> = $settings;

  $: if (!Object.keys($settings).length)
    trpc.settings.updateOrCreate.mutate($settings).then(updateSettings);

  $: if (!Object.keys(newValues).length && $settings)
    newValues = JSON.parse(JSON.stringify($settings));
  $: if (newValues && $settings) dirty = !same(newValues, $settings);

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
    pop();
  }

  function reset() {
    if (!$settings) return;
    newValues = { ...$settings };
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
</script>

<Layout>
  <Header slot="header" main="Settings" sub="Account">
    <aside slot="right" class="flex flex-col items-center justify-center">
      <Copy dim variant="pseudomono" as="small">Signed in as:</Copy>
      <Copy semibold as="strong" variant="gradient" class="uppercase">{$user?.email}</Copy
      >
    </aside>
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
      </div>
    </section>
    <section
      class="my-1 flex flex-1 flex-col rounded-md p-4 pt-0"
      slot="secondary"
      class:bg-neutral-900={$tags.length || $settings.savedQueries?.length}
    >
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
        <div class="h-96 overflow-auto">
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
      {#if newValues.savedQueries?.length}
        <Copy as="h3" semibold variant="gradient" class="my-4 mt-10 uppercase"
          >Saved Queries</Copy
        >
        <div class="max-h-96 overflow-auto">
          <ul class="border-t border-white/10">
            {#each newValues.savedQueries as savedQuery}
              <li class="flex items-center justify-between border-b border-inherit px-4">
                <Link to={savedQuery.url}>{savedQuery.label}</Link>
                <ActionClose on:click={() => deleteSavedQuery(savedQuery)} />
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </section>
  </Container>
  <div slot="cta">
    {#if dirty}
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
