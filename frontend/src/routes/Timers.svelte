<script lang="ts">
  import trpc from "@/lib/trpc";
  import timers from "@/lib/timers";
  import Header from "@/components/core/Header.svelte";
  import DateActions from "@/components/core/DateActions.svelte";
  import { getWeekDay, getMonth, getToday, isToday } from "@/lib/dates";

  let viewDate = getToday();
  let main = "";
  let sub = "";

  $: main = `${viewDate.day} ${getWeekDay(viewDate)}`;
  $: sub = `${getMonth(viewDate)} ${viewDate.year} ${
    isToday(viewDate) ? "(Today)" : ""
  }`;

  $: if (viewDate) {
    trpc.timers.getByDate.query(viewDate.toString()).then((results) => {
      $timers = results;
    });
  }
</script>

<Header as="h2" {main} {sub} />
<DateActions bind:date={viewDate} />

{#each $timers as timer}
  <div>Timer: {timer._id}, Date: {timer.date}, Start: {timer.start}</div>
{/each}
