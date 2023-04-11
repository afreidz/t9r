<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";
  export let label: string = "";
  export let as: keyof HTMLElementTagNameMap = "label";
</script>

<svelte:element
  this={as}
  class="flex w-full flex-1 items-center gap-4 rounded-full bg-white p-1 shadow-xl ring-blue-500 focus-within:ring md:p-2"
>
  <div class="flex-none">
    <slot name="secondary" />
  </div>
  <div class="flex flex-1 flex-col text-black">
    {#if label}<Copy dim as="span" variant="pseudomono" class="text-xs text-black"
        >{label}</Copy
      >{/if}
    <slot name="content" />
  </div>
  <div class="flex-none">
    <slot name="primary" />
  </div>
</svelte:element>
