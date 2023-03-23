<script lang="ts">
  import Icon from "@iconify/svelte";
  import { press } from "svelte-gestures";

  export let draggable = true;
  export let label: string = "";
  export let as: keyof HTMLElementTagNameMap = "label";

  let moved = false;
  let moving = false;
  let top: number = 0;
  let left: number = 0;

  function holdHandler() {
    if (draggable) {
      moving = true;
    }
  }

  function move(e: MouseEvent) {
    if (moving) {
      moved = true;
      left += e.movementX;
      top += e.movementY;
    }
  }

  function stop() {
    moving = false;
  }
</script>

<svelte:window on:mouseup={stop} on:mousemove={move} />
<svelte:element
  this={as}
  class:ring-2={moving}
  on:press={holdHandler}
  class:absolute={moving || moved}
  style={`left: ${left}px; top: ${top}px;`}
  use:press={{ timeframe: 600, triggerBeforeFinished: true }}
  class="flex w-full flex-1 items-center gap-4 rounded-2xl bg-white p-1 shadow-xl ring-blue-500 focus-within:ring md:p-2"
>
  <div class="flex-none">
    <slot name="secondary" />
  </div>
  <div class="flex flex-1 flex-col text-black">
    {#if label}<span class="font-pseudoMono text-xs font-light text-black/50"
        >{label}</span
      >{/if}
    <slot name="content" />
  </div>
  <div class="flex-none">
    <slot name="primary" />
  </div>
  {#if moved}
    <button
      class="absolute top-1/2 right-full mr-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-blue-500 p-1"
      on:click={() => (moved = false)}
    >
      <Icon icon="ic:baseline-push-pin" class="text-white" />
    </button>
  {/if}
</svelte:element>
