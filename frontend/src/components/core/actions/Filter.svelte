<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import Sidebar from "@/core/Sidebar.svelte";
  import { mainResizeObserver } from "@/lib/stores/ui";

  export let enabled = false;
  export let direction: "left" | "right" = "left";

  let elm: HTMLElement;
</script>

<Base {...$$restProps} on:click>
  <span class="sr-only" bind:this={elm}>Filter items</span>
  <Icon icon="material-symbols:filter-alt-outline-sharp" />
</Base>

{#key $mainResizeObserver}
  {#if elm}
    <Sidebar {enabled} {direction}>
      <slot />
    </Sidebar>
  {/if}
{/key}
