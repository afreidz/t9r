<script lang="ts">
  import trpc from "./lib/trpc";
  import { onMount } from "svelte";
  let resp: string;

  onMount(async () => {
    resp = await trpc.ping.query();
  });
</script>

<main class="flex flex-col items-center justify-center flex-1">
  <h1>Hello World</h1>
  <small>{resp}</small>
</main>
