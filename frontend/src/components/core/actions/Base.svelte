<script lang="ts">
  import Button from "@/foundation/Button.svelte";
</script>

<Button
  on:click
  {...$$restProps}
  class="my-2 flex h-8 w-8 items-center justify-center rounded bg-neutral-light/5 disabled:opacity-30 {$$props.class ||
    ''}"
>
  <slot />
</Button>
