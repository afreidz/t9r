<script lang="ts">
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
</script>

<div in:fade out:fade class="flex h-screen flex-1 items-center justify-center">
  <Icon icon="eos-icons:loading" class="h-20 w-20 text-white" />
</div>
