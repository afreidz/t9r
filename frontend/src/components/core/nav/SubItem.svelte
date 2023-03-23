<script lang="ts">
  import Link from "@/components/foundation/Link.svelte";

  export let to: string | undefined = undefined;
  export let clickable: boolean = false;
  export let active: boolean = false;

  let tag = "div";

  $: if (clickable) tag = "button";
</script>

<li
  class:active
  class:text-text-light={active}
  class={`flex items-center ${$$props.class || ""}`}
>
  {#if to}
    <Link {to} class="flex flex-1 items-center gap-2" on:navigate>
      <div class="flex-none">
        <slot name="icon" />
      </div>
      <slot />
      <div class="flex-none">
        <slot name="right" />
      </div>
    </Link>
  {:else}
    <svelte:element
      this={tag}
      on:click
      on:keypress
      class="flex flex-1 items-center gap-2"
    >
      <div class="flex-none">
        <slot name="icon" />
      </div>
      <slot />
      <div class="flex-none">
        <slot name="right" />
      </div>
    </svelte:element>
  {/if}
</li>

<style lang="postcss">
  .active::before {
    @apply absolute -left-px h-2 w-2 flex-none -translate-x-1/2 rounded-full bg-neutral-light content-[""];
  }
</style>
