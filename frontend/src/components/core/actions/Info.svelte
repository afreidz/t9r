<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import { mainResizeObserver } from "@/lib/stores/ui";

  export let enabled = true;
  let elm: HTMLElement;
</script>

<Base {...$$restProps} on:click={() => (enabled = !enabled)}>
  <span class="sr-only" bind:this={elm}>Info</span>
  {#if enabled}
    <Icon icon="mdi:information-off-outline" />
  {:else}
    <Icon icon="mdi:information-outline" />
  {/if}
</Base>

{#key $mainResizeObserver}
  {#if elm}
    {@const box = elm.getBoundingClientRect()}
    <div
      class:opacity-0={!enabled}
      class:opacity-100={enabled}
      class:translate-x-0={enabled}
      class:translate-x-full={!enabled}
      class:pointer-events-auto={enabled}
      class:pointer-events-none={!enabled}
      class="fixed right-0 bottom-20 z-20 mt-6 flex flex-col overflow-auto rounded-md border border-black/20 bg-neutral-900/80 p-2 backdrop-blur-md transition-all md:bottom-10 md:right-6"
      style="top: {box.top}px"
    >
      {#if enabled}
        <slot />
      {/if}
    </div>
  {/if}
{/key}
