<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";

  export let enabled = true;
  export let isStatic = false;
</script>

<Base {...$$restProps} on:click>
  <span class="sr-only">Info</span>
  {#if enabled && !isStatic}
    <Icon icon="mdi:information-off-outline" />
  {:else}
    <Icon icon="mdi:information-outline" />
  {/if}
</Base>
