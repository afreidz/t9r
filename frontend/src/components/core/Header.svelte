<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLElement> & {
    sub?: string;
    main?: string;
    as?: keyof HTMLElementTagNameMap;
  };

  let { as, main, sub, ...rest }: $$Props = $$props;
  export { main, as, sub };
</script>

<header
  class={`sticky top-0 left-0 z-[1] flex items-center border-b border-neutral-900 bg-neutral-800 py-3 md:py-6 ${rest.class}`}
>
  <svelte:element this={as || "h2"} class="flex-1">
    <Copy dim as="small" variant="pseudomono" class="block">
      {#if sub}
        {sub}
      {:else if $$slots.sub}
        <slot name="sub" />
      {/if}
    </Copy>

    <strong
      class="block bg-gradient-to-b from-white to-neutral-light bg-clip-text text-lg text-transparent md:text-3xl"
    >
      {#if main}
        {main}
      {:else if $$slots.main}
        <slot name="main" />
      {/if}
    </strong>
  </svelte:element>
  <slot />
</header>
