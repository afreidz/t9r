<script lang="ts">
  import trpc from "@/lib/trpc";
  import projects from "@/lib/projects";
  import Tag from "@/components/core/Tag.svelte";
  import Timer from "@/components/core/Timer.svelte";
  import timers, { updateTimers } from "@/lib/timers";
  import Layout from "@/components/core/Layout.svelte";
  import Header from "@/components/core/Header.svelte";
  import NewTimer from "@/components/core/NewTimer.svelte";
  import DateActions from "@/components/core/DateActions.svelte";
  import { getWeekDay, getMonth, getToday, isToday } from "@/lib/dates";

  let viewDate = getToday();
  let main = "";
  let sub = "";

  $: if (viewDate) {
    trpc.timers.getByDate.query(viewDate.toString()).then((results) => {
      $timers = results;
    });
    main = `${viewDate.day} ${getWeekDay(viewDate)}`;
    sub = `${getMonth(viewDate)} ${viewDate.year} ${
      isToday(viewDate) ? "(Today)" : ""
    }`;
  }
</script>

<Layout>
  <Header as="h2" {main} {sub} />
  <DateActions bind:date={viewDate} />

  {#each $timers as timer}
    <Timer
      id={timer._id}
      project={$projects.find((p) => p._id === timer.project)}
    >
      {#if !timer.end}
        <Tag>running</Tag>
      {/if}
      <Tag>
        {timer.start}
      </Tag>
    </Timer>
  {/each}

  <div slot="cta">
    <NewTimer on:timer-update={() => updateTimers(viewDate.toString())} />
  </div>
</Layout>
