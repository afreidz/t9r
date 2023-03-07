<script lang="ts">
  export let color: string | undefined = "inherit";
</script>

<strong
  class="mx-1 flex items-center rounded-full bg-white/30 px-2 py-1 font-normal"
  style={`color: ${color}`}
>
  <slot />
</strong>
