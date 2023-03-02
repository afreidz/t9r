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
  class="flex min-w-max max-w-[200px] flex-1 items-center gap-4 rounded-full bg-white p-2 shadow-xl"
>
  {#if $mostRecentProject}
    <figure
      class="flex h-10 w-10 flex-none items-center justify-center rounded-full text-xs"
      style={`background-color: ${$mostRecentProject.color}`}
    >
      {$mostRecentProject.name.substring(0, 1)}
    </figure>
    <div class="flex flex-1 flex-col">
      <span class="text-xs text-black/50">Select Project</span>
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
      class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600"
    >
      <Icon icon="material-symbols:play-arrow-rounded" />
    </button>
  {/if}
</label>
