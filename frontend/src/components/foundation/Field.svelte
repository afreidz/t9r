<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let { as, label, ...rest } = $$props;

  type $$Props = HTMLAttributes<HTMLElement> & {
    as?: keyof HTMLElementTagNameMap;
    label?: string;
  };
</script>

<svelte:element
  this={as || "label"}
  class={`${rest.class} m-1 flex rounded-md border border-neutral-900 bg-white/5 p-4 pt-2 ring-blue-500 ring-offset-2 ring-offset-neutral-800 focus-within:ring-2`}
>
  <span class="flex flex-1 flex-col">
    <small class="my-1 font-mono opacity-50">{label}</small>
    <slot />
  </span>
</svelte:element>
