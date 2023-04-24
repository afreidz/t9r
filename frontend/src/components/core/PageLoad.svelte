<script lang="ts">
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
</script>

<div
  in:fade={{ duration: 300 }}
  out:fade={{ duration: 100 }}
  class="absolute left-1/2 top-1/2 flex flex-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
>
  <Icon icon="eos-icons:loading" class="h-20 w-20 text-white" />
</div>
