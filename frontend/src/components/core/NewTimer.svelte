<script lang="ts">
  import Icon from "@iconify/svelte";
  import projects, { mostRecentProject } from "@/lib/projects";
  let value: string;

  function handleChange() {
    const match = $projects.find((p) => p._id === value);
    if (match) $mostRecentProject = match;
  }
</script>

<label
  class="flex-1 max-w-[200px] min-w-max flex items-center gap-4 rounded-full p-2 bg-white shadow-xl"
>
  {#if $mostRecentProject}
    <figure
      class="rounded-full h-10 w-10 flex items-center justify-center text-xs flex-none"
      style={`background-color: ${$mostRecentProject.color}`}
    >
      {$mostRecentProject.name.substring(0, 1)}
    </figure>
    <div class="flex flex-col flex-1">
      <span class="text-black/50 text-xs">Select Project</span>
      <select
        class="appearance-none text-black"
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
    <button
      class="bg-blue-600 rounded-full flex items-center justify-center h-10 w-10"
    >
      <Icon icon="material-symbols:play-arrow-rounded" />
    </button>
  {/if}
</label>
