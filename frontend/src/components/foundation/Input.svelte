<script lang="ts">
  export let value: unknown = "";
</script>

<input
  {...$$restProps}
  on:focus
  on:change
  bind:value
  on:focus={(e) => e.currentTarget.select()}
/>

<style>
  [list]::-webkit-calendar-picker-indicator,
  [list]::-webkit-list-button {
    opacity: 0;
  }
</style>
