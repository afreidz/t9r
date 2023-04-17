<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
</script>

<Base {...$$restProps} on:click>
  <span class="sr-only">Filter items</span>
  <Icon icon="material-symbols:filter-alt-outline-sharp" />
</Base>
