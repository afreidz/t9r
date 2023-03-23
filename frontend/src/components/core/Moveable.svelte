<script lang="ts">
  import Icon from "@iconify/svelte";
  import { press } from "svelte-gestures";

  export let enabled: boolean = true;
  export let as: keyof HTMLElementTagNameMap = "div";

  let t: number;
  let l: number;
  let moved = false;
  let moving = false;
  let elm: HTMLElement;

  $: if (elm) {
    const client = elm.getClientRects()[0];
    if (client) {
      t = client.top;
      l = client.left;
    }
  }

  function holdHandler() {
    if (enabled) {
      moving = true;
      const client = elm.getClientRects()[0];
      if (client) {
        t = client.top;
        l = client.left;
      }
    }
  }

  function move(e: MouseEvent) {
    if (moving) {
      moved = true;
      t += e.movementY;
      l += e.movementX;
    }
  }

  function moveTouch(e: TouchEvent) {
    if (moving) {
      const touch = e.touches[0];

      if (touch) {
        moved = true;
        t = touch.clientY;
        l = touch.clientX;
      }
    }
  }

  function stop() {
    moving = false;
  }
</script>

<svelte:window on:mouseup={stop} on:mousemove={move} on:touchmove={moveTouch} />

<svelte:element
  this={as}
  bind:this={elm}
  {...$$restProps}
  on:press={holdHandler}
  class:fixed={moving || moved}
  style={moving || moved ? `left: ${l}px; top: ${t}px;` : ""}
  use:press={{ timeframe: 300, triggerBeforeFinished: true }}
>
  <slot />
  {#if moved}
    <button
      class="absolute top-1/2 right-full mr-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-blue-500 p-1"
      on:click={() => (moved = false)}
    >
      <Icon icon="ic:baseline-push-pin" class="text-white" />
    </button>
  {/if}
</svelte:element>
