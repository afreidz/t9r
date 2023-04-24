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

<header class="px-4 pt-3 pb-1 md:px-6 md:pt-6 {rest.class}">
  <div class="flex items-center border-b border-neutral-900 pb-4">
    <svelte:element this={as || "h2"} class="flex-1">
      <Copy dim as="small" light variant="pseudomono" class="block">
        {#if sub}
          {sub}
        {:else if $$slots.sub}
          <slot name="sub" />
        {/if}
      </Copy>

      <Copy as="strong" variant="gradient" class="block text-lg md:text-3xl">
        {#if main}
          {main}
        {:else if $$slots.main}
          <slot name="main" />
        {/if}
      </Copy>
    </svelte:element>
    <div class="flex-none">
      <slot name="right" />
    </div>
  </div>
  <slot />
</header>
