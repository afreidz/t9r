<script lang="ts">
  import ActionClose from "@/core/actions/Close.svelte";
  import { showLeftSidebar, showRightSidebar } from "@/lib/stores/ui";

  export let direction: "left" | "right" = "right";
  export let enabled = false;

  function handleClose() {
    if (direction === "left") {
      $showLeftSidebar = false;
    } else {
      $showRightSidebar = false;
    }
  }
</script>

<div
  class:hidden={!enabled}
  class:pointer-events-auto={enabled}
  class:pointer-events-none={!enabled}
  class:left-0={direction === "left" && enabled}
  class:right-0={direction === "right" && enabled}
  class:md:left-1={direction === "left" && enabled}
  class:md:right-1={direction === "right" && enabled}
  class:-left-full={direction === "left" && !enabled}
  class:-right-full={direction === "right" && !enabled}
  class="absolute top-0 bottom-0 z-50 flex w-full flex-col rounded-md border border-black/20 bg-neutral-900/80 backdrop-blur-md transition-all md:top-40 md:mt-1 md:w-min {$$props.class ||
    ''}"
>
  {#if enabled}
    <slot />
    <ActionClose class="absolute top-1 right-2" on:click={handleClose} />
  {/if}
</div>
