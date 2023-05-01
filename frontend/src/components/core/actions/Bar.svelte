<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import breakpoints from "@/lib/stores/breakpoints";

  let expanded = false;
</script>

<div
  class="flex flex-none justify-between border-b border-neutral-900 {$$props.class || ''}"
>
  <div>
    <slot name="left" />
  </div>
  {#if $breakpoints.md}
    <div class="flex gap-2">
      <slot />
    </div>
  {:else}
    <div>
      <Base on:click={() => (expanded = !expanded)}>
        <Icon
          class={`${expanded ? "rotate-180" : ""}`}
          icon="material-symbols:keyboard-arrow-down"
        />
      </Base>
    </div>
  {/if}
  <div>
    <slot name="right" />
  </div>
</div>
{#if !$breakpoints.md && expanded}
  <div
    class="flex flex-none justify-between border-b border-neutral-900 {$$props.class ||
      ''}"
  >
    <slot />
  </div>
{/if}
