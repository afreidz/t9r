<script lang="ts">
  export let direction: "left" | "right" = "right";
  export let enabled = false;
</script>

<div
  class:pointer-events-auto={enabled}
  class:pointer-events-none={!enabled}
  class:left-0={direction === "left" && enabled}
  class:right-0={direction === "right" && enabled}
  class:md:left-1={direction === "left" && enabled}
  class:md:right-1={direction === "right" && enabled}
  class:-left-full={direction === "left" && !enabled}
  class:-right-full={direction === "right" && !enabled}
  class="absolute top-32 bottom-4 z-50 mt-1 flex w-full flex-col rounded-md border border-black/20 bg-neutral-900/80 backdrop-blur-md transition-all md:top-40 md:w-min {$$props.class ||
    ''}"
>
  {#if enabled}
    <slot />
  {/if}
</div>
