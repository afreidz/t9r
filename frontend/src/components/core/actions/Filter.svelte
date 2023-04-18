<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import { mainResizeObserver } from "@/lib/stores/ui";

  export let enabled = false;
  let elm: HTMLElement;
</script>

<Base {...$$restProps} on:click={() => (enabled = !enabled)}>
  <span class="sr-only" bind:this={elm}>Filter items</span>
  <Icon icon="material-symbols:filter-alt-outline-sharp" />
</Base>

{#key $mainResizeObserver}
  {#if elm}
    {@const box = elm.getBoundingClientRect()}
    <div
      class:opacity-0={!enabled}
      class:opacity-100={enabled}
      class:translate-x-0={enabled}
      class:-translate-x-full={!enabled}
      class:pointer-events-auto={enabled}
      class:pointer-events-none={!enabled}
      class="fixed left-0 bottom-20 z-0 mt-6 flex w-full flex-col overflow-auto rounded-md border border-black/20 bg-neutral-900/80 p-2 backdrop-blur-md transition-all md:bottom-10 md:left-[344px] md:max-w-[350px]"
      style="top: {box.top}px;"
    >
      {#if enabled}
        <slot />
      {/if}
    </div>
  {/if}
{/key}
