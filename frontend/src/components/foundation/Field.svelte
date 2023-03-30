<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";

  export let as: keyof HTMLElementTagNameMap = "label";
  export let label: string | undefined = undefined;
</script>

<svelte:element
  this={as}
  class={`${$$props.class} my-1 mb-2 flex rounded-md border border-neutral-900 bg-neutral-700 p-4 pt-2 ring-blue-500 ring-offset-2 ring-offset-neutral-800 focus-within:ring-2`}
>
  <div class="flex flex-1 flex-col">
    <Copy dim as="small" variant="pseudomono" class="my-1">{label || ""}</Copy>
    <slot />
  </div>
  <div class="mt-8 flex flex-none items-start">
    <slot name="icon" />
  </div>
</svelte:element>
