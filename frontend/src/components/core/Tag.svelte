<script lang="ts">
  export let color: string = "inherit";
  export let round: boolean = false;
</script>

<strong
  class="mx-1 flex h-8 min-w-fit items-center justify-center rounded-full bg-white/30 font-normal"
  class:px-2={!round}
  style={`color: ${color}`}
  class:aspect-square={round}
>
  <slot />
</strong>
