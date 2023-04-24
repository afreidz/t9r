<script lang="ts">
  import { main } from "@/lib/stores/ui";
  import { onDestroy } from "svelte";

  let ref: HTMLElement;
  export let location: HTMLElement = $main;

  $: if (location && ref) {
    location.appendChild(ref);
  }

  onDestroy(() => {
    location.removeChild(ref);
  });
</script>

<div bind:this={ref}>
  <slot />
</div>
