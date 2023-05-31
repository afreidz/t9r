<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
</script>

<Base {...$$restProps} on:click>
  <Icon icon="ic:baseline-reorder" />
</Base>
