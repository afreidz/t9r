<script lang="ts">
  import trpc from "@/lib/trpc";
  import same from "@/lib/same";
  import Icon from "@iconify/svelte";
  import { get } from "svelte/store";
  import Months from "./Months.svelte";
  import { pop } from "svelte-spa-router";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import settings from "@/lib/stores/settings";
  import Field from "@/foundation/Field.svelte";
  import { timelineZoom } from "@/lib/stores/ui";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import Container from "@/foundation/Container.svelte";
  import type { Settings } from "@/backend/schema/settings";

  let dirty = false;
  let newValues: Settings | null = get(settings);

  $: if (!newValues && $settings) newValues = JSON.parse(JSON.stringify($settings));
  $: if (newValues && $settings) dirty = !same<Settings>(newValues, $settings);

  async function update() {
    if (!newValues) return;
    if (newValues.zoom) {
      $timelineZoom = newValues.zoom;
    }
    await trpc.settings.updateOrCreate.mutate(newValues);
    $settings = await trpc.settings.get.query();
    pop();
  }

  function reset() {
    if (!$settings) return;
    newValues = { ...$settings };
  }
</script>

<Layout>
  <Header slot="header" main="Settings" sub="Account" />
  <Container>
    <section slot="primary" class="max-w-xs xl:flex-1">
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
        <Field label="Default Timeline Zoom">
          {#if newValues?.zoom}
            <input
              type="number"
              step={0.1}
              bind:value={newValues.zoom}
              class="my-2 w-full text-center text-3xl"
            />
          {:else}
            <input
              type="number"
              step={0.1}
              bind:value={$timelineZoom}
              class="my-2 w-full text-center text-3xl"
            />
          {/if}
        </Field>
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
    <section class="flex-1" slot="secondary" />
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
