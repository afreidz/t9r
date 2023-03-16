<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Link from "@/components/foundation/Link.svelte";

  export let to: string | undefined = undefined;
  export let clickable: boolean = false;

  type $$Props = HTMLAttributes<HTMLLIElement> & {
    to?: string;
    clickable?: boolean;
  };

  let tag = "div";

  $: if (clickable) tag = "button";
</script>

<li class={`flex items-center ${$$props.class || ""}`}>
  {#if to}
    <Link {to} class="flex flex-1 items-center gap-2" on:navigate>
      <div class="flex-none">
        <slot name="icon" />
      </div>
      <slot />
      <div class="flex-none">
        <slot name="right" />
      </div>
    </Link>
  {:else}
    <svelte:element
      this={tag}
      on:click
      on:keypress
      class="flex flex-1 items-center gap-2"
    >
      <div class="flex-none">
        <slot name="icon" />
      </div>
      <slot />
      <div class="flex-none">
        <slot name="right" />
      </div>
    </svelte:element>
  {/if}
</li>
