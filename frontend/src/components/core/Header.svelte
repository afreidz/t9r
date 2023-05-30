<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";

  export let sub: string | null = null;
  export let main: string | null = null;
  export let as: keyof HTMLElementTagNameMap = "h2";
</script>

<header class="border-neutral-900 px-4 pt-3 md:px-6 md:pt-6 {$$restProps.class}">
  <div class="flex items-center border-b border-inherit pb-4">
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
