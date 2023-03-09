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
  class="flex w-full flex-1 items-center gap-4 rounded-full
  bg-white p-2 shadow-xl ring-blue-500 focus-within:ring"
>
  <div class="flex-none">
    <slot name="secondary" />
  </div>
  <div class="flex flex-1 flex-col text-black">
    {#if label}<span class="font-mono text-xs text-black/50">{label}</span>{/if}
    <slot name="content" />
  </div>
  <div class="flex-none">
    <slot name="primary" />
  </div>
</svelte:element>
