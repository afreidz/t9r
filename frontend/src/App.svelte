<script lang="ts">
  import trpc from "./lib/trpc";
  import { onMount } from "svelte";
  import NewProject from "./views/project/New.svelte";
  let resp: string;

  onMount(async () => {
    resp = await trpc.ping.query();
    const projects = await trpc.projects.list.query();
    console.log(projects);
  });
</script>

<main class="flex flex-col items-center justify-center flex-1">
  <h1>Hello World</h1>
  <small>
    {#if resp}{resp}{:else}loading...{/if}
  </small>
  <NewProject />
</main>
