<button
  on:click
  type="button"
  class:focus:ring={true}
  class:rounded-full={true}
  class:inline-block={true}
  class:outline-none={true}
  class:ring-blue-500={true}
  class:ring-offset-0={true}
  {...$$props}
>
  <slot />
</button>
