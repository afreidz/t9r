<script lang="ts">
  export let direction: "left" | "right" = "right";
  export let enabled = false;
  export let top = 0;
</script>

<div
  class:opacity-0={!enabled}
  class:opacity-100={enabled}
  class:translate-x-0={enabled}
  class:pointer-events-auto={enabled}
  class:left-0={direction === "left"}
  class:pointer-events-none={!enabled}
  class:right-0={direction === "right"}
  class:md:right-6={direction === "right"}
  class:md:left-[344px]={direction === "left"}
  class:translate-x-full={direction === "right" && !enabled}
  class:-translate-x-full={direction === "left" && !enabled}
  class="fixed bottom-20 z-30 flex w-full flex-col overflow-auto rounded-md border border-black/20 bg-neutral-900/80 p-2 backdrop-blur-md transition-all md:bottom-10 md:max-w-[350px] {$$props.class ||
    ''}"
  style="top: {top}px;"
>
  {#if enabled}
    <slot />
  {/if}
</div>
