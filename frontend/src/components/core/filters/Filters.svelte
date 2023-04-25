<script lang="ts">
  import Criteria from "./Criteria.svelte";
  import ActionRemove from "@/core/actions/Remove.svelte";

  export let filters: Filter.Set = [{}];
  export let combinator: Filter.Combinator = "and";
</script>

<div class={$$props.class}>
  {#each filters as filter, i}
    {#if i !== 0}
      <div class="flex w-full items-center justify-between">
        <select bind:value={combinator} class="my-2 h-8 rounded-md bg-neutral-700 px-4">
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
</div>
