<input {...$$props} on:change on:focus on:focus={(e) => e.currentTarget.select()} />

<style>
  [list]::-webkit-calendar-picker-indicator,
  [list]::-webkit-list-button {
    opacity: 0;
  }
</style>
