<script lang="ts">
  import trpc from "@/lib/trpc";
  import { push, replace } from "svelte-spa-router";
  import Layout from "@/components/core/Layout.svelte";
  import Header from "@/components/core/Header.svelte";
  import type { Project } from "@/backend/schema/project";
  import projects, { fetchProjects } from "@/lib/projects";
  import Button from "@/components/foundation/Button.svelte";

  export let params = { id: null };

  const project = $projects.find((p: Project) => p._id === params.id);

  async function handleDelete() {
    if (!project || !project._id) return;
    const result = await trpc.projects.delete.mutate({ id: project._id });

    if (result.acknowledged) {
      await fetchProjects();
      return push("/timers");
    }
  }

  $: if (params.id !== null && !project) {
    replace("/404");
  }
</script>

<Layout>
  {#if project}
    <Header main={project.name} />
    <Button
      on:click={handleDelete}
      class="m-6 rounded-md bg-red-500 px-10 py-6 text-2xl"
      >Delete Project</Button
    >
  {/if}
</Layout>
