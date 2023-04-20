<script lang="ts">
  import { fade } from "svelte/transition";

  let as: "div" | "a" = "div";
  let active: boolean = false;

  export let info: boolean = false;
  export let shift: boolean = false;
  export let highlight: boolean = false;
  export let color: string = "transparent";
  export let href: string | undefined = undefined;

  $: if (href && info) as = "a";
</script>

<li class="aspect-square w-full">
  <svelte:element
    this={as}
    {href}
    on:focus={() => (active = true)}
    on:blur={() => (active = false)}
    on:mouseover={() => (active = true)}
    on:mouseout={() => (active = false)}
    class="block h-full w-full rounded-sm ring-blue-500 {color} {highlight
      ? 'ring-2 ring-offset-4 ring-offset-neutral-800'
      : 'ring-0'}"
  >
    {#if info && active}
      <div
        class:-mt-10={shift}
        in:fade={{ duration: 100, delay: 300 }}
        out:fade={{ duration: 100, delay: 300 }}
        class="absolute top-0 left-0 w-full rounded-md bg-neutral-700 p-3 text-sm shadow-lg before:absolute before:left-1/2 before:top-[100%] before:-translate-x-1/2 before:border-8 before:border-x-transparent before:border-b-transparent before:border-t-neutral-700 before:content-['']"
      >
        <slot />
      </div>
    {/if}
  </svelte:element>
</li>
