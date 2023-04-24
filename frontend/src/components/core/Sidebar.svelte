<script lang="ts">
  import Portal from "@/core/Portal.svelte";

  export let location: HTMLElement | undefined = undefined;
  export let direction: "left" | "right" = "right";
  export let enabled = false;
  export let docked = false;
</script>

<Portal {location}>
  <div
    class:top-0={!docked}
    class:bottom-0={!docked}
    class:absolute={!docked}
    class:pointer-events-auto={enabled}
    class:pointer-events-none={!enabled}
    class:border-r={direction === "left"}
    class:border-l={direction === "right"}
    class:left-0={direction === "left" && enabled}
    class:right-0={direction === "right" && enabled}
    class:-left-full={direction === "left" && !enabled}
    class:-right-full={direction === "right" && !enabled}
    class="z-50 flex w-full flex-col overflow-auto border-black/20 bg-neutral-900/80 p-2 backdrop-blur-md transition-all md:max-w-[350px] {$$props.class ||
      ''}"
  >
    {#if enabled || docked}
      <slot />
    {/if}
  </div>
</Portal>
