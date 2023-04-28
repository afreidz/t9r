<script lang="ts">
  import Criteria from "./Criteria.svelte";
  import { createEventDispatcher } from "svelte";
  import ActionAdd from "@/core/actions/Add.svelte";
  import ActionRemove from "@/core/actions/Remove.svelte";

  let isFiltered = false;
  let dispatch = createEventDispatcher();

  export let filters: Filter.Set = [{ value: "" }];
  export let combinator: Filter.Combinator = "and";

  function clear() {
    filters = [{ value: "" }];
    dispatch("clear");
  }

  $: isFiltered = filters.some((f) => !!f.criteria && !!f.predicate && !!f.value);
</script>

<div class={$$props.class}>
  <header class="flex items-center justify-between">
    <span>clear all</span>
    <ActionRemove on:click={clear} />
  </header>
  {#each filters as filter, i}
    {#if i !== 0}
      <div class="flex w-full items-center justify-between">
        <select
          bind:value={combinator}
          class="my-2 h-8 rounded-md bg-neutral-light/5 px-4"
        >
          <option value="and">and</option>
          <option value="or">or</option>
        </select>
        <ActionRemove on:click={() => (filters = filters.filter((f) => f !== filter))} />
      </div>
    {/if}
    <Criteria
      bind:value={filter.value}
      bind:criteria={filter.criteria}
      bind:predicate={filter.predicate}
    />
  {/each}
  <footer class="flex items-center justify-between">
    <span>add filter</span>
    <ActionAdd on:click={() => (filters = [...filters, { value: "" }])} />
  </footer>
</div>
