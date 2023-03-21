<script lang="ts">
  import Link from "@/components/foundation/Link.svelte";

  export let active: boolean = false;
  export let clickable: boolean = false;
  export let to: string | undefined = undefined;

  let tag = "div";

  $: if (clickable) tag = "button";
</script>

<li class="relative flex flex-col py-2 pl-4 text-2xl" class:active>
  {#if to}
    <Link {to} on:navigate class="flex flex-1 items-center font-bold">
      <div class="flex-1">
        <slot name="main" />
      </div>
      <div class="flex-none">
        <slot name="right" />
      </div>
      <slot />
    </Link>
  {:else}
    <svelte:element
      this={tag}
      on:click
      on:keypress
      class="flex flex-1 items-center font-bold"
    >
      <div class="flex-1">
        <slot name="main" />
      </div>
      <div class="flex-none">
        <slot name="right" />
      </div>
    </svelte:element>
    <slot />
  {/if}
</li>

<style lang="postcss">
  .active::before {
    @apply absolute -left-px top-[18px] h-2 w-2 flex-none -translate-x-1/2 rounded-full bg-neutral-light content-[""];
  }
</style>
