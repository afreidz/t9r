<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let enabled = false;
  export let allSelected = false;
</script>

<div class="flex flex-row-reverse gap-2">
  <Base {...$$restProps} on:click>
    <Icon icon="material-symbols:check-box-outline-sharp" />
  </Base>
  {#if enabled && !allSelected}
    <Base
      {...$$restProps}
      on:click={() => (allSelected = true)}
      on:click={() => dispatch("all")}
    >
      <Icon icon="material-symbols:select-all-sharp" />
    </Base>
  {:else if enabled && allSelected}
    <Base
      {...$$restProps}
      on:click={() => (allSelected = false)}
      on:click={() => dispatch("none")}
    >
      <Icon icon="mdi:border-none-variant" />
    </Base>
  {/if}
</div>
