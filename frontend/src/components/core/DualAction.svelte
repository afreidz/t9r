<script lang="ts">
  type $$Props = {
    label?: string;
    as?: keyof HTMLElementTagNameMap;
  };

  let { label, as = "label" }: $$Props = $$props;
  export { label, as };
</script>

<svelte:element
  this={as}
  class="flex w-full flex-1 items-center gap-4 rounded-2xl
  bg-white p-1 shadow-xl ring-blue-500 focus-within:ring md:p-2"
>
  <div class="flex-none">
    <slot name="secondary" />
  </div>
  <div class="flex flex-1 flex-col text-black">
    {#if label}<span class="font-pseudoMono text-xs font-light text-black/50"
        >{label}</span
      >{/if}
    <slot name="content" />
  </div>
  <div class="flex-none">
    <slot name="primary" />
  </div>
</svelte:element>
