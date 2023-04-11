<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { roundDown } from "@/lib/dates";
  import { createEventDispatcher } from "svelte";
  import Button from "@/foundation/Button.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import projects, { mostRecentProject } from "@/stores/projects";

  let dispatch = createEventDispatcher();
  export let date: Temporal.PlainDate = Temporal.Now.plainDateISO();

  function handleChange(e: { currentTarget: EventTarget & HTMLSelectElement }) {
    const match = $projects.find((p) => p._id === e.currentTarget.value);
    if (match) $mostRecentProject = match;
  }

  async function newTimer() {
    if (!$mostRecentProject._id) return;
    await trpc.timers.create.mutate({
      date: date.toString(),
      project: $mostRecentProject._id,
      title: $mostRecentProject.defaultTitle,
      start: Temporal.Now.plainTimeISO().round(roundDown).toString(),
      utilized: $mostRecentProject.defaultUtilized === false ? false : true,
    });

    dispatch("timer-update");
  }
</script>

<DualAction label="Start new timer for">
  <span slot="secondary" />
  <select
    slot="content"
    class="appearance-none !bg-transparent text-black outline-none"
    on:change={handleChange}
    value={$mostRecentProject._id}
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
