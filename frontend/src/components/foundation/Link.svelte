<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { link, location } from "svelte-spa-router";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type $$Props = HTMLAnchorAttributes & {
    to?: string;
  };

  const dispatch = createEventDispatcher();

  let { to = "/" }: $$Props = $$props;
  export { to };
</script>

<a
  {...$$props}
  href={to}
  class:rounded-md={true}
  class:focus:ring={true}
  class:inline-block={true}
  class:outline-none={true}
  class:ring-blue-500={true}
  class:ring-offset-2={true}
  class:ring-offset-neutral-900={true}
  on:click={() => dispatch("navigate", to)}
  use:link={{ disabled: $location === to }}
>
  <slot />
</a>
