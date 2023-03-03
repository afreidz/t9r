<script lang="ts">
  import Icon from "@iconify/svelte";
  import Button from "@/foundation/Button.svelte";
  import projects, { mostRecentProject } from "@/lib/projects";
  let value: string;

  function handleChange() {
    const match = $projects.find((p) => p._id === value);
    if (match) $mostRecentProject = match;
  }
</script>

<label
  class="flex min-w-max max-w-[280px] flex-1 items-center gap-4 rounded-full bg-white p-2 pl-6 shadow-xl ring-blue-500 focus-within:ring"
>
  {#if $mostRecentProject}
    <div class="flex flex-1 flex-col">
      <span class="text-xs text-black/50">Select Project</span>
      <select
        class="appearance-none !bg-transparent text-black outline-none"
        bind:value
        on:change={handleChange}
      >
        {#each $projects.filter((p) => !p.archived) as project}
          <option selected={project === $mostRecentProject} value={project._id}
            >{project.name}</option
          >
        {/each}
      </select>
    </div>
    <Button
      class="flex h-10 w-10 items-center justify-center !rounded-full text-white !ring-offset-white"
      style={`background-color: ${$mostRecentProject.color}`}
    >
      <Icon icon="ic:baseline-plus" />
    </Button>
  {/if}
</label>
