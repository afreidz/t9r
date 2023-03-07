<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLDivElement>;
</script>

<div class={`${$$props.class} flex flex-col gap-2 xl:flex-row`}>
  <slot name="primary" />
  <slot name="secondary" />
</div>
