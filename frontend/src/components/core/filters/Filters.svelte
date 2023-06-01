<script lang="ts">
  import Criteria from "./Criteria.svelte";
  import { createEventDispatcher } from "svelte";
  import ActionAdd from "@/core/actions/Add.svelte";
  import ActionRemove from "@/core/actions/Remove.svelte";
  import type { TimerQuery, TimerQueryCombinator } from "@/backend/schema/timer";

  let isFiltered = false;
  let dispatch = createEventDispatcher();

  export let showFY = false;
  export let filters: TimerQuery[] = [{ value: "" }];
  export let combinator: TimerQueryCombinator | undefined = undefined;
  export let staticCombinator: TimerQueryCombinator | undefined = undefined;
  export let disabledCriteria: Exclude<TimerQuery["criteria"], undefined>[] = [];
  export let disabledPredicates: Exclude<TimerQuery["predicate"], undefined>[] = [];

  function clear() {
    filters = [{ value: "" }];
    dispatch("clear");
  }

  $: isFiltered = filters.some((f) => !!f.criteria && !!f.predicate);
</script>

<div class={$$props.class}>
  <header class="flex items-center justify-between">
    <span>clear all</span>
    <ActionRemove on:click={clear} />
  </header>
  {#each filters as filter, i}
    {#if i !== 0}
      <div class="flex w-full items-center justify-between">
        {#if staticCombinator}
          <select
            disabled={true}
            value={staticCombinator}
            class="my-2 h-8 rounded-md bg-neutral-light/5 px-4"
          >
            <option value="and">and</option>
            <option value="or">or</option>
          </select>
        {:else}
          <select
            bind:value={combinator}
            class="my-2 h-8 rounded-md bg-neutral-light/5 px-4"
          >
            <option value="and">and</option>
            <option value="or">or</option>
          </select>
        {/if}
        <ActionRemove on:click={() => (filters = filters.filter((f) => f !== filter))} />
      </div>
    {/if}
    <Criteria
      {showFY}
      {disabledCriteria}
      {disabledPredicates}
      bind:value={filter.value}
      bind:criteria={filter.criteria}
      bind:predicate={filter.predicate}
      selectedCriteria={filters.map((f) => f.criteria)}
    />
  {/each}
  {#if combinator || staticCombinator || (!combinator && !staticCombinator && !filters.length)}
    <footer class="flex items-center justify-between">
      <span>add filter</span>
      <ActionAdd on:click={() => (filters = [...filters, { value: "" }])} />
    </footer>
  {/if}
</div>
