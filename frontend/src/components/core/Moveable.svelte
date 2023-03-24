<script lang="ts">
  import Icon from "@iconify/svelte";
  import { press } from "svelte-gestures";

  export let state: MoveableState = {
    x: 0,
    y: 0,
    moved: false,
  };

  export let enabled: boolean = true;
  export let as: keyof HTMLElementTagNameMap = "div";

  let moving = false;
  let elm: HTMLElement;

  $: if (elm) {
    const client = elm.getClientRects()[0];
    if (client) {
      state.y = client.top;
      state.x = client.left;
    }
  }

  function holdHandler() {
    if (enabled) {
      moving = true;
      const client = elm.getClientRects()[0];

      if (client) {
        state.y = client.top;
        state.x = client.left;
      }
    }
  }

  function move(e: MouseEvent) {
    if (moving && enabled) {
      state.moved = true;
      state.y += e.movementY;
      state.x += e.movementX;
    }
  }

  function moveTouch(e: TouchEvent) {
    if (moving && enabled) {
      const touch = e.touches[0];

      if (touch) {
        state.moved = true;
        state.y = touch.clientY;
        state.x = touch.clientX;
      }
    }
  }

  function stop() {
    moving = false;
  }
</script>

<svelte:window on:mouseup={stop} on:mousemove={move} on:touchmove={moveTouch} />
{#if $$slots.default}
  <svelte:element
    this={as}
    bind:this={elm}
    {...$$restProps}
    on:press={holdHandler}
    class:fixed={moving || state.moved}
    use:press={{ timeframe: 300, triggerBeforeFinished: true }}
    style={moving || state.moved
      ? `left: ${state.x}px; top: ${state.y}px;`
      : ""}
  >
    <slot />
    {#if state.moved && enabled}
      <button
        class="absolute top-1/2 right-full mr-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-blue-500 p-1"
        on:click={() => (state.moved = false)}
      >
        <Icon icon="ic:baseline-push-pin" class="text-white" />
      </button>
    {/if}
  </svelte:element>
{/if}
