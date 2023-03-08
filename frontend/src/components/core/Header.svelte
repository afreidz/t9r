<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLElement> & {
    main?: string;
    sub?: string;
    as?: keyof HTMLElementTagNameMap;
  };

  let { as, main, sub, ...rest }: $$Props = $$props;
  export { main, as, sub };
</script>

<header
  class={`flex h-20 items-center border-b border-neutral-900 pb-6 ${rest.class}`}
>
  <svelte:element this={as || "h2"} class="flex-1">
    <small class="block font-mono text-text-light/50"
      >{#if sub}{sub}{/if}</small
    >
    <strong
      class="block bg-gradient-to-b from-white to-neutral-light bg-clip-text text-3xl text-transparent"
      >{main}</strong
    >
  </svelte:element>
  <slot />
</header>
