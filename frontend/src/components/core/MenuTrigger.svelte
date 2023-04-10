<script lang="ts">
  type $$Props = {
    enabled?: boolean;
    class?: string;
  };

  let { enabled = false }: $$Props = $$props;
  export { enabled };
</script>

<button on:click>
  <svg viewBox="0 0 60 60" fill="currentColor" class={$$props.class}>
    <rect
      x="10"
      y="17"
      height="4"
      width="40"
      class:rotate-45={enabled}
      class:translate-y-[6px]={enabled}
      class:translate-x-[-6px]={enabled}
      class="origin-center transition-transform ease-in-out"
    />
    <rect
      x="10"
      y="37"
      height="4"
      width="40"
      class:-rotate-45={enabled}
      class:translate-y-[-8px]={enabled}
      class:translate-x-[-6px]={enabled}
      class="origin-center transition-transform ease-in-out"
    />
  </svg>
</button>
