<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";

  export let as: keyof HTMLElementTagNameMap = "label";
  export let label: string | undefined = undefined;
</script>

<svelte:element
  this={as}
  class={`${
    $$props.class || ""
  } relative my-1 mb-2 flex flex-wrap rounded-md border border-neutral-900 bg-neutral-700 p-4 pt-2 ring-blue-500 ring-offset-0 focus-within:ring-2`}
>
  <div class="flex flex-1 flex-col">
    <Copy dim light as="small" variant="pseudomono" class="my-1">{label || ""}</Copy>
    <slot />
  </div>
  <div class="mt-8 flex flex-none items-start">
    <slot name="icon" />
  </div>
  <div class="absolute top-0 right-0 z-10 translate-x-1/4 -translate-y-1/4">
    <slot name="upper-right" />
  </div>
  <div class="absolute bottom-0 right-0 z-10 translate-x-1/4 translate-y-1/4">
    <slot name="lower-right" />
  </div>
</svelte:element>
