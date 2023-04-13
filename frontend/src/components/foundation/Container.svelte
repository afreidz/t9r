<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLDivElement>;
</script>

<div
  class={`${$$props.class} flex max-w-[100rem] flex-col gap-2 overflow-auto xl:flex-row`}
>
  <slot name="primary" />
  <slot name="secondary" />
</div>
