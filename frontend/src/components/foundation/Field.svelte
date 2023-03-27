<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  export let as: keyof HTMLElementTagNameMap | undefined = "label";
  export let label: string | undefined = undefined;

  type $$Props = HTMLAttributes<HTMLElement> & {
    as?: typeof as;
    label?: typeof label;
  };
</script>

<svelte:element
  this={as}
  class={`${$$props.class} my-1 mb-2 flex rounded-md border border-neutral-900 bg-neutral-700 p-4 pt-2 ring-blue-500 ring-offset-2 ring-offset-neutral-800 focus-within:ring-2`}
>
  <span class="flex flex-1 flex-col">
    <small class="my-1 font-pseudoMono font-light opacity-50"
      >{label || ""}</small
    >
    <slot />
  </span>
  <span class="mt-8 flex flex-none items-start">
    <slot name="icon" />
  </span>
</svelte:element>
