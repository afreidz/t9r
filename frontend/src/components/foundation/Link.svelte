<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { link, location } from "svelte-spa-router";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type $$Props = HTMLAnchorAttributes & {
    to?: string;
    disabled?: boolean;
    elm?: HTMLAnchorElement;
  };

  const dispatch = createEventDispatcher();

  export let disabled: boolean = false;
  export let to: string | undefined = undefined;
  export let elm: HTMLAnchorElement | undefined = undefined;
</script>

<a
  {...$$props}
  href={to}
  bind:this={elm}
  class:rounded-md={true}
  class:focus:ring={true}
  class:inline-block={true}
  class:outline-none={true}
  class:ring-blue-500={true}
  class:ring-offset-2={true}
  class:ring-offset-neutral-900={true}
  on:click={() => dispatch("navigate", to)}
  use:link={{ disabled: disabled || $location === to }}
>
  <slot />
</a>
