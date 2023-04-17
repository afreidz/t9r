<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";

  export let enabled = true;
</script>

<Base {...$$restProps} on:click>
  {#if enabled}
    <Icon icon="mdi:information-off-outline" />
  {:else}
    <Icon icon="mdi:information-outline" />
  {/if}
</Base>
