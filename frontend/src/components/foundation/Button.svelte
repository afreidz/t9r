<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  type $$Props = HTMLButtonAttributes;
</script>

<button
  on:click
  class:rounded-md={true}
  class:focus:ring={true}
  class:inline-block={true}
  class:outline-none={true}
  class:ring-blue-500={true}
  class:ring-offset-0={true}
  {...$$props}
>
  <slot />
</button>
