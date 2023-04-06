<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import { pop } from "svelte-spa-router";
  import { fade } from "svelte/transition";
  import Header from "@/core/Header.svelte";
  import Layout from "@/core/Layout.svelte";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import Moveable from "@/core/Moveable.svelte";
  import { ctaPosition } from "@/lib/stores/ui";
  import { queryForecast } from "@/lib/forecast";
  import Button from "@/foundation/Button.svelte";
  import TimerComponent from "@/core/Timer.svelte";
  import DualAction from "@/core/DualAction.svelte";
  import { formatForForecastWeek, getToday, getWeeksArray } from "@/lib/dates";

  export let params: { num: number };

  type LocalForecast = {
    hours: number;
    project?: string;
    week: Temporal.PlainDate;
  };

  const newForecasts = new Map<string, LocalForecast>();
  let weeksArray: Temporal.PlainDate[] = [];

  let dirty = false;
  let thisWeek: Temporal.PlainDate | undefined = undefined;

  $: if (params.num) {
    weeksArray =
      params.num > 5
        ? [
            ...getWeeksArray(5, false).reverse(),
            ...getWeeksArray(params.num - 5).slice(1),
          ]
        : getWeeksArray(params.num);
  }

  $: thisWeek = weeksArray.find((w, i) => {
    const today = getToday();

    return (
      Temporal.PlainDate.compare(today, w) >= 0 &&
      Temporal.PlainDate.compare(today, weeksArray[i + 1]) <= 0
    );
  });

  function changeForecast({ hours, project, week }: LocalForecast) {
    if (!project || !week) return;
    newForecasts.set(`${project}_${week}`, { project, week, hours });
    dirty = true;
  }

  async function update() {
    await Promise.all(
      [...newForecasts.values()].map(({ project, week, hours }) => {
        const weekString = week.toString();
        return trpc.forecast.updateOrCreate.mutate({
          project,
          week: weekString,
          hours,
        });
      })
    );
    pop();
  }
</script>

<Layout>
  <Header sub="Forecasted hours for" main="All Projects" class="mb-1" />
  <div
    style="grid-template-rows: 2rem repeat({$projects.length}, minmax(40px, 1fr)); grid-template-columns: max-content repeat({params.num}, 1fr);"
    class="relative grid overflow-auto"
  >
    <div
      class="sticky left-0 top-0 z-[1] col-start-1 row-start-1 bg-neutral-800 shadow-2xl"
    >
      <span class="sr-only">Forecased hours for the week of </span>
    </div>
    {#each weeksArray as week, i}
      <strong
        id="forecast_{formatForForecastWeek(week)}"
        style="grid-column-start: {i + 2}"
        class:border-t-2={week === thisWeek}
        class:border-r-2={week === thisWeek}
        class:border-l-2={week === thisWeek}
        class="flex items-center justify-center rounded-t-lg border-blue-500 p-2"
      >
        {formatForForecastWeek(week)}
      </strong>
      {#each $projects as project, z}
        <div
          style="grid-column-start: {i + 2}; grid-row-start: {z + 2}"
          class:border-l-2={week === thisWeek}
          class:border-r-2={week === thisWeek}
          class:border-b-2={week === thisWeek && z === $projects.length - 1}
          class:rounded-b-lg={week === thisWeek && z === $projects.length - 1}
          class="border-blue-500 px-2"
        >
          <Field label="Hrs">
            {#await queryForecast(project._id, week)}
              <Icon icon="eos-icons:loading" class="h-4 w-4 text-white" />
            {:then forecast}
              <input
                class="max-w-[80px]"
                value={forecast?.hours || ""}
                type="number"
                step={1}
                min={0}
                max={168}
                on:change={(e) =>
                  changeForecast({
                    week,
                    project: project._id,
                    hours: Number(e.currentTarget.value),
                  })}
              />
            {/await}
          </Field>
        </div>
      {/each}
    {/each}
    {#each $projects as project, i}
      <div
        style="grid-row-start: {i + 2}"
        class="sticky left-0 z-[1] col-start-1 flex items-center bg-neutral-800 py-1 pr-2 shadow-2xl"
      >
        <TimerComponent class="!mb-0 !flex-1" disableNav {project} title={project.name} />
      </div>
    {/each}
  </div>

  <div slot="cta">
    <Moveable state={$ctaPosition}>
      {#if dirty}
        <div in:fade>
          <DualAction as="div" label="Do you want to">
            <Button
              slot="secondary"
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-red-500 text-white !ring-offset-white"
            >
              <Icon icon="teenyicons:x-small-outline" />
            </Button>
            <span slot="content">Update Forecast?</span>
            <Button
              on:click={update}
              slot="primary"
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-green-500 text-white !ring-offset-white"
            >
              <Icon icon="material-symbols:fitbit-check-small-sharp" />
            </Button>
          </DualAction>
        </div>
      {:else}
        <div in:fade>
          <DualAction as="div" label="Showing forecast for">
            <span slot="content">{params.num} Weeks</span>
            <Button
              slot="primary"
              title="Navigate back"
              on:click={pop}
              class="flex h-10 w-10 items-center justify-center !rounded-2xl bg-blue-500 text-white !ring-offset-white"
            >
              <Icon icon="ic:outline-arrow-back" />
            </Button>
          </DualAction>
        </div>
      {/if}
    </Moveable>
  </div>
</Layout>

<style>
  div::-webkit-scrollbar {
    display: none;
  }
  div {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
