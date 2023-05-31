<script lang="ts">
  import tags from "@/lib/stores/tags";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import type { Tag } from "@/backend/schema/tag";
  import type { TimerQuery } from "@/backend/schema/timer";
  import { getFiscalYearStartMonth, getToday } from "@/lib/dates";
  import Icon from "@iconify/svelte";

  export let showFY = false;
  export let value: string | string[];
  export let criteria: TimerQuery["criteria"] = undefined;
  export let predicate: TimerQuery["predicate"] = undefined;

  let tagSearch: string = "";
  let hiddenTags: Tag[] = [];
  $: if (tagSearch.length) {
    hiddenTags = $tags.filter(
      (t) => !t.value.toLowerCase().includes(tagSearch.toLowerCase())
    );
  } else {
    hiddenTags = [];
  }

  $: if (criteria === "utilized") predicate = "equals";
  $: if (criteria === "tags" || criteria === "project") predicate = "contains";
  $: if (criteria === "date" && predicate === "fiscal")
    getFiscalYearStartMonth(getToday()).then((fy) => (value = [fy.toString()]));

  function handleDurationChange(e: { currentTarget: HTMLInputElement }) {
    value = `${e.currentTarget.value}`;
  }

  function handleFirstDateChange(e: { currentTarget: HTMLInputElement }) {
    if (typeof value === "string") value = [];
    value[0] = e.currentTarget.value;
  }

  function handleSecondDateChange(e: { currentTarget: HTMLInputElement }) {
    if (typeof value === "string") value = [];
    value[1] = e.currentTarget.value;
  }
</script>

<Field label="Criteria">
  <select bind:value={criteria}>
    <option value={undefined}>Choose...</option>
    <option value="date">Date</option>
    <option value="project">Project</option>
    <option value="title">Title</option>
    <option value="utilized">Utilized</option>
    <option value="tags">Tags</option>
    <option value="duration">Duration</option>
  </select>
</Field>
{#if criteria && !["tags", "project", "utilized"].includes(criteria)}
  <Field label="Predicate">
    <select bind:value={predicate}>
      {#if criteria === "title"}
        <option value="starts_with">Starts with</option>
        <option value="ends_with">Ends with</option>
        <option value="contains">Contains</option>
        <option value="equals">Equals</option>
      {/if}
      {#if criteria === "date"}
        <option value="before">Before</option>
        <option value="after">After</option>
        <option value="equals">Equals</option>
        <option value="between">Between</option>
        {#if showFY}
          <option value="fiscal">Fiscal Year</option>
        {/if}
      {/if}
      {#if criteria === "duration"}
        <option value="running">Running</option>
        <option value="eq">Equal to</option>
        <option value="lt">Less than</option>
        <option value="gt">Greater than</option>
        <option value="lte">Less than or equal to</option>
        <option value="gte">Greater than or equal to</option>
      {/if}
    </select>
  </Field>
{/if}
{#if predicate}
  <Field label="Value">
    {#if criteria === "project"}
      <select bind:value multiple>
        {#each $projects as project}
          <option value={project._id}>{project.name}</option>
        {/each}
        <option value="null">unknown</option>
      </select>
    {:else if criteria === "title"}
      <input bind:value />
    {:else if criteria === "date"}
      {#if predicate !== "fiscal"}
        <input
          type="date"
          value={Array.isArray(value) && value[0]}
          on:change={handleFirstDateChange}
        />
        {#if predicate === "between"}
          <input
            type="date"
            value={Array.isArray(value) && value[1]}
            on:change={handleSecondDateChange}
          />
        {/if}
      {:else}
        {#await getFiscalYearStartMonth(getToday()) then fy}
          <span>{fy.toString()}</span>
        {/await}
      {/if}
    {:else if criteria === "duration"}
      {#if predicate !== "running"}
        <input on:change={handleDurationChange} type="number" min={0.25} max={24} />
      {:else}
        Is running
      {/if}
    {:else if criteria === "utilized"}
      <select bind:value>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    {:else if criteria === "tags"}
      <div class="mb-2 flex items-center border-b border-white/10">
        <input type="search" bind:value={tagSearch} class="flex-1" />
        <Icon slot="icon" icon="material-symbols:search" />
      </div>
      <select bind:value multiple>
        {#each $tags as tag}
          <option class:hidden={hiddenTags.includes(tag)} value={tag._id}
            >{tag.value}</option
          >
        {/each}
      </select>
    {/if}
  </Field>
{/if}

<style lang="postcss">
  option {
    @apply mr-2 mb-1 rounded-sm p-1 accent-violet-600 checked:appearance-none checked:bg-white/10 checked:text-white;
  }
</style>
