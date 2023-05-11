<script lang="ts">
  import trpc from "@/lib/trpc";
  import same from "@/lib/same";
  import Icon from "@iconify/svelte";
  import { get } from "svelte/store";
  import Tag from "@/core/Tag.svelte";
  import Months from "./Months.svelte";
  import { pop } from "svelte-spa-router";
  import Header from "@/core/Header.svelte";
  import Dialog from "@/core/Dialog.svelte";
  import Layout from "@/core/Layout.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import settings from "@/lib/stores/settings";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import tags, { updateTags } from "@/lib/stores/tags";
  import Container from "@/foundation/Container.svelte";
  import type { Settings } from "@/backend/schema/settings";
  import type { Tag as TagType } from "@/backend/schema/tag";

  let dirty = false;
  let deletedTag: TagType | undefined;
  let newValues: Settings | null = get(settings);

  $: if (!newValues && $settings) newValues = JSON.parse(JSON.stringify($settings));
  $: if (newValues && $settings) dirty = !same<Settings>(newValues, $settings);

  async function update() {
    if (!newValues) return;
    await trpc.settings.updateOrCreate.mutate(newValues);
    $settings = await trpc.settings.get.query();
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
</script>

<Layout>
  <Header slot="header" main="Settings" sub="Account" />
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
            <input type="date" bind:value={newValues.trackingStart} />
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
      class="my-1 flex flex-1 flex-col rounded-md bg-neutral-900 p-4 pt-0"
      slot="secondary"
    >
      <Copy as="h3" semibold variant="gradient" class="my-4 uppercase">Tags</Copy>
      <div>
        {#await $tags}
          <Icon icon="eos-icons:loading" class="h-7 w-7 text-white" />
        {:then tags}
          {#each tags as tag}
            <Tag closeable on:close={() => (deletedTag = tag)}>
              {tag.value}
            </Tag>
          {/each}
        {/await}
      </div>
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
