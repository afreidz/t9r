<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import projects, { mostRecentProject } from "@/lib/projects";
  let value: string;

  const dispatch = createEventDispatcher();

  function handleChange() {
    const match = $projects.find((p) => p._id === value);
    if (match) $mostRecentProject = match;
  }

  async function newTimer() {
    if (!$mostRecentProject._id) return;
    await trpc.timers.create.mutate({
      project: $mostRecentProject._id,
      title: $mostRecentProject.defaultTitle,
      date: Temporal.Now.plainDateISO().toString(),
      start: Temporal.Now.plainTimeISO().toString(),
    });
    dispatch("timer-update");
  }
</script>

<DualAction label="Select Project">
  <span slot="secondary" />
  <select
    slot="content"
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
  <Button
    slot="primary"
    on:click={newTimer}
    class="flex h-10 w-10 items-center justify-center !rounded-full text-white !ring-offset-white"
    style={`background-color: ${$mostRecentProject.color}`}
  >
    <Icon icon="ic:baseline-plus" />
  </Button>
</DualAction>
