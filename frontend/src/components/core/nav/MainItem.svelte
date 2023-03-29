<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";
  import Link from "@/foundation/Link.svelte";

  export let active: boolean = false;
  export let clickable: boolean = false;
  export let to: string | undefined = undefined;

  let tag = "div";

  $: if (clickable) tag = "button";
</script>

<li class="relative flex flex-col py-2 pl-4" class:active={clickable && active}>
  {#if to}
    <Link {to} on:navigate class="flex flex-1 items-center font-bold">
      <Copy as="div" variant="gradient" class="flex-1 text-lg md:text-2xl">
        <slot name="main" />
      </Copy>
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
      <Copy as="div" variant="gradient" class="flex-1 text-lg md:text-2xl">
        <slot name="main" />
      </Copy>
      <div class="flex-none">
        <slot name="right" />
      </div>
    </svelte:element>
    <slot />
  {/if}
</li>
