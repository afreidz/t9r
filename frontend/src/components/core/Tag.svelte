<script lang="ts">
  type $$Props = {
    color?: string;
  };

  let { color = "inherit" }: $$Props = $$props;
  export { color };
</script>

<strong
  class="mx-1 flex items-center rounded-full bg-white/30 px-2 py-1 font-normal"
  style={`color: ${color}`}
>
  <slot />
</strong>
