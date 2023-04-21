<script lang="ts">
  import Icon from "@iconify/svelte";
  import Link from "../foundation/Link.svelte";
</script>

<h1 class="relative flex items-center justify-center gap-2 py-6 text-2xl">
  <Link to="/timers/day">
    <Icon
      icon="ic:outline-watch-later"
      class="relative z-[1] h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 p-2 text-white"
    />
    <span class="sr-only">t9r</span>
  </Link>
</h1>
