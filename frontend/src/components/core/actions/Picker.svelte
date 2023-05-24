<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let picker: HTMLInputElement;

  function showPicker() {
    if (picker) picker.showPicker();
  }
</script>

<Base {...$$restProps} on:click={showPicker}>
  <Icon icon="material-symbols:calendar-month-outline-sharp" />
  <input
    type="date"
    bind:this={picker}
    on:change={(e) => dispatch("change", e.currentTarget.value)}
    class="invisible h-px w-px"
  />
</Base>
