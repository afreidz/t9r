<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { link, location } from "svelte-spa-router";

  const dispatch = createEventDispatcher();

  export let disabled = false;
  export let highlight = false;
  export let to: string | undefined = undefined;
  export let elm: HTMLAnchorElement | undefined = undefined;
</script>

<a
  {...$$props}
  href={to}
  bind:this={elm}
  class:ring={highlight}
  class:rounded-md={true}
  class:focus:ring={true}
  class:inline-block={true}
  class:outline-none={true}
  class:ring-blue-500={true}
  class:ring-offset-0={true}
  class:pointer-events-none={disabled}
  use:link={{ disabled: disabled || $location === to }}
  on:click={() => !disabled && dispatch("navigate", to)}
>
  <slot />
</a>
