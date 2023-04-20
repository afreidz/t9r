<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { pop } from "svelte-spa-router";
  import { createEventDispatcher } from "svelte";
  import Button from "@/foundation/Button.svelte";
  import { isToday, roundDown } from "@/lib/dates";
  import DualAction from "@/core/DualAction.svelte";
  import type { Timer } from "@/backend/schema/timer";
  import settings, { getSettings } from "@/lib/stores/settings";
  import projects, { mostRecentProject } from "@/stores/projects";

  let dispatch = createEventDispatcher();
  export let lastTimer: Timer | undefined = undefined;
  export let date: Temporal.PlainDate = Temporal.Now.plainDateISO();

  function handleChange(e: { currentTarget: EventTarget & HTMLSelectElement }) {
    const match = $projects.find((p) => p._id === e.currentTarget.value);
    if (match) $mostRecentProject = match;
  }

  async function newTimer() {
    if (!$mostRecentProject._id) return;
    await getSettings();
    await trpc.timers.create.mutate({
      date: date.toString(),
      project: $mostRecentProject._id,
      title: $mostRecentProject.defaultTitle,
      end: isToday(date)
        ? null
        : $settings?.eod || Temporal.Now.plainTimeISO().round(roundDown).toString(),
      start:
        lastTimer && lastTimer.end
          ? Temporal.PlainTime.from(lastTimer.end).toString()
          : $settings?.sod || Temporal.Now.plainTimeISO().round(roundDown).toString(),
      utilized: $mostRecentProject.defaultUtilized === false ? false : true,
    });

    dispatch("timer-update");
  }
</script>

<DualAction label="Start new timer for">
  <Button
    slot="primary"
    title="Navigate back"
    on:click={pop}
    class="flex h-10 w-10 items-center justify-center !rounded-full bg-blue-500 text-white !ring-offset-white"
  >
    <Icon icon="ic:outline-arrow-back" />
  </Button>
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
    slot="secondary"
    on:click={newTimer}
    class="flex h-10 w-10 items-center justify-center !rounded-full text-white !ring-offset-white"
    style={`background-color: ${$mostRecentProject.color}`}
  >
    <Icon icon="ic:baseline-plus" />
  </Button>
</DualAction>
