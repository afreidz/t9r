<script lang="ts">
  export let label: string;
  export let as: keyof HTMLElementTagNameMap = "label";
</script>

<svelte:element
  this={as}
  class="flex w-full min-w-max max-w-[300px] flex-1 items-center gap-4 rounded-full
  bg-white p-2 shadow-xl ring-blue-500 focus-within:ring"
>
  <slot name="secondary" />
  <div class="flex flex-1 flex-col text-black">
    <span class="font-mono text-xs text-black/50">{label}</span>
    <slot name="content" />
  </div>
  <slot name="primary" />
</svelte:element>
