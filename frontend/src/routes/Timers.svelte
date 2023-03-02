<script lang="ts">
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
</script>

<Header as="h2" {main} {sub} />
<DateActions bind:date={viewDate} />
