<script lang="ts">
  import Icon from "@iconify/svelte";
</script>

<label
  class="inline-flex h-5 w-5 items-center justify-center rounded-sm text-white focus-within:ring-2 {$$props.checked
    ? 'bg-violet-600 ring-white'
    : 'bg-white ring-violet-600'} {$$props.class || ''}"
>
  <input class="hidden" {...$$restProps} type="checkbox" on:change />
  {#if $$props.checked}
    <Icon icon="material-symbols:check" class="h-full w-full flex-1" />
  {/if}
</label>
