<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";
  import Link from "@/foundation/Link.svelte";

  export let to: string | undefined = undefined;
  export let clickable: boolean = false;
  export let active: boolean = false;
  export let as = "div";

  $: if (clickable) as = "button";
</script>

<li class:active class="flex items-center border-neutral-light/20 {$$props.class}">
  {#if to}
    <Link {to} class="flex flex-1 items-center gap-2" on:navigate>
      <div class="flex-none">
        <slot name="icon" />
      </div>
      <Copy as="div" dim={!active} variant="pseudomono"><slot /></Copy>
    </Link>
    <div class="flex-none">
      <slot name="right" />
    </div>
  {:else}
    <svelte:element
      this={as}
      {...$$restProps}
      on:click
      on:keypress
      class="flex flex-1 items-center gap-2"
    >
      <div class="flex-none">
        <slot name="icon" />
      </div>
      <Copy as="div" dim={!active} variant="pseudomono"><slot /></Copy>
      <div class="flex-none">
        <slot name="right" />
      </div>
    </svelte:element>
  {/if}
</li>

<style lang="postcss">
  .active::before {
    @apply absolute left-0 h-2 w-2 flex-none -translate-x-1/2 rounded-full bg-neutral-light content-[""];
  }
</style>
