<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { get } from "svelte/store";
  import Months from "./Months.svelte";
  import { pop } from "svelte-spa-router";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Time from "@/foundation/Time.svelte";
  import Field from "@/foundation/Field.svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import Container from "@/foundation/Container.svelte";
  import settings, { getSettings, type SettingsStore } from "@/lib/stores/settings";

  let dirty = false;
  let newValues: SettingsStore = get(settings);

  $: if (!newValues && $settings) newValues = JSON.parse(JSON.stringify($settings));
  $: if (newValues && $settings) dirty = !same();

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

  function same() {
    if (!newValues?.fiscalYear || !$settings?.fiscalYear) return true;

    return (
      newValues.sod === $settings.sod &&
      newValues.eod === $settings.eod &&
      newValues.fiscalYear.every((quarter, q) => {
        return quarter.every(
          (time, t) =>
            $settings && $settings.fiscalYear && $settings.fiscalYear[q][t] === time
        );
      })
    );
  }
</script>

<Layout loader={getSettings()}>
  <Header main="Settings" sub="Account" />
  <Container>
    <section slot="primary" class="max-w-xs xl:flex-1">
      <Copy as="h3" semibold variant="gradient" class="my-4 uppercase">Business Day</Copy>
      <div class="ml-4">
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
      <Copy as="h3" semibold variant="gradient" class="my-4 uppercase">Fiscal Year</Copy>
      <div class="ml-4">
        {#if newValues?.fiscalYear}
          {#each newValues.fiscalYear as _, i}
            <Field label={`Quarter ${i + 1}`}>
              <div class="flex items-center gap-2">
                <label class="flex-1 rounded-md bg-white/5 p-3 ">
                  <select
                    bind:value={newValues.fiscalYear[i][0]}
                    class="w-full ring-blue-500 focus:ring-2"
                  >
                    <Months />
                  </select>
                </label>
                <span class="flex-none">-</span>
                <label class="flex-1 rounded-md bg-white/5 p-3">
                  <select
                    bind:value={newValues.fiscalYear[i][1]}
                    class="w-full ring-blue-500 focus:ring-2"
                  >
                    <Months />
                  </select>
                </label>
              </div>
            </Field>
          {/each}
        {/if}
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
