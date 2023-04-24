<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import Sidebar from "@/core/Sidebar.svelte";
  import { mainResizeObserver } from "@/lib/stores/ui";

  export let enabled = true;
  export let docked = false;
  export let isStatic = false;
  export let location: HTMLElement;
  export let direction: "left" | "right" = "right";

  let elm: HTMLElement;
</script>

<Base {...$$restProps} on:click>
  <span class="sr-only" bind:this={elm}>Info</span>
  {#if enabled && !isStatic}
    <Icon icon="mdi:information-off-outline" />
  {:else}
    <Icon icon="mdi:information-outline" />
  {/if}
</Base>

{#key $mainResizeObserver}
  {#if elm}
    <Sidebar {enabled} {docked} {direction} {location}>
      <slot />
    </Sidebar>
  {/if}
{/key}
