<script lang="ts">
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let round: boolean = false;
  export let color: string = "inherit";
  export let closeable: boolean = false;
</script>

<strong
  class="m-1 flex h-8 max-w-fit items-center justify-center gap-1 rounded-full bg-white/30 font-normal ring-blue-500 focus-within:ring-2"
  class:px-2={!round}
  style={`color: ${color}`}
  class:aspect-square={round}
>
  <slot />
  {#if closeable}
    <button class="!ring-0 !ring-offset-0" on:click={() => dispatch("close")}>
      <Icon icon="ri:close-circle-line" />
    </button>
  {/if}
</strong>
