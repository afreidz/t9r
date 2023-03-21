<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";

  let picker: HTMLInputElement;

  function showPicker() {
    if (picker) picker.showPicker();
  }
</script>

<Base {...$$restProps} on:click={showPicker}>
  <Icon icon="material-symbols:calendar-month-outline-sharp" />
  <input type="date" bind:this={picker} on:change class="invisible h-px w-px" />
</Base>
