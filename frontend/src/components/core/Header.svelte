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
  class="sticky top-0 left-0 z-[1] -mx-4 bg-neutral-800 pt-3 pb-1 md:-mx-6 md:pt-6 {rest.class}"
>
  <div class="px-4 md:px-6">
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
  </div>
</header>
