<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLElement> & {
    main?: string;
    sub?: string;
    as?: keyof HTMLElementTagNameMap;
  };

  let { as, main, sub, ...rest } = $$props;
</script>

<header
  class={`flex h-20 items-center border-b border-neutral-900 pb-6 ${rest.class}`}
>
  <svelte:element this={as || "h2"} class="flex-1">
    <small class="block font-mono text-text-light/50">{sub}</small>
    <strong class="block text-3xl">{main}</strong>
  </svelte:element>
  <slot />
</header>
