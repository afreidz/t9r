<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
</script>

<Base {...$$restProps} on:click>
  <Icon icon="material-symbols:content-copy-outline-sharp" />
</Base>
