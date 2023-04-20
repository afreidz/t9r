<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";

  export let value: number = 0;
  export let unit: string = "";
  export let label: string = "hours";
  export let as: keyof HTMLElementTagNameMap = "div";
</script>

<svelte:element
  this={as}
  class="flex w-full flex-1 items-center gap-4 rounded-xl bg-white p-2 shadow-xl ring-blue-500 focus-within:ring md:p-3"
>
  <div class="flex flex-1 flex-col text-black">
    <Copy dim as="span" variant="pseudomono" class="text-center text-xs text-black"
      >{label}</Copy
    >
    <Copy bold as="strong" class="flex justify-center md:text-2xl">{value}{unit}</Copy>
  </div>
</svelte:element>
