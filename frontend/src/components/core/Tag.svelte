<script lang="ts">
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let round: boolean = false;
  export let color: string = "white";
  export let closeable: boolean = false;
</script>

<strong
  class="m-1 inline-flex max-w-fit items-center gap-1 rounded-full bg-white/30 text-xs font-normal !leading-8 ring-blue-500 focus-within:ring-2 md:text-sm {$$props.class ||
    ''}"
  class:px-2={!round}
  style={`color: ${color}`}
  class:aspect-square={round}
>
  <slot name="hide" />
  <slot />
  {#if closeable}
    <button
      type="button"
      class="!ring-0 !ring-offset-0"
      on:click={() => dispatch("close")}
    >
      <Icon icon="ri:close-circle-line" />
    </button>
  {/if}
</strong>
