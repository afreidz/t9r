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
  export let selectedCriteria: TimerQuery["criteria"][] = [];
  export let disabledCriteria: Exclude<TimerQuery["criteria"], undefined>[] = [];
  export let disabledPredicates: Exclude<TimerQuery["predicate"], undefined>[] = [];

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
    {#if !disabledCriteria.includes("date")}<option
        disabled={selectedCriteria.includes("date")}
        value="date">Date</option
      >{/if}
    {#if !disabledCriteria.includes("project")}<option
        disabled={selectedCriteria.includes("project")}
        value="project">Project</option
      >{/if}
    {#if !disabledCriteria.includes("title")}<option
        disabled={selectedCriteria.includes("title")}
        value="title">Title</option
      >{/if}
    {#if !disabledCriteria.includes("utilized")}<option
        disabled={selectedCriteria.includes("utilized")}
        value="utilized">Utilized</option
      >{/if}
    {#if !disabledCriteria.includes("tags")}<option
        disabled={selectedCriteria.includes("tags")}
        value="tags">Tags</option
      >{/if}
    {#if !disabledCriteria.includes("duration")}<option
        disabled={selectedCriteria.includes("duration")}
        value="duration">Duration</option
      >{/if}
  </select>
</Field>
{#if criteria && !["tags", "project", "utilized"].includes(criteria)}
  <Field label="Predicate">
    <select bind:value={predicate}>
      {#if criteria === "title"}
        {#if !disabledPredicates.includes("starts_with")}<option value="starts_with"
            >Starts with</option
          >{/if}
        {#if !disabledPredicates.includes("ends_with")}<option value="ends_with"
            >Ends with</option
          >{/if}
        {#if !disabledPredicates.includes("contains")}<option value="contains"
            >Contains</option
          >{/if}
        {#if !disabledPredicates.includes("equals")}<option value="equals">Equals</option
          >{/if}
      {/if}
      {#if criteria === "date"}
        {#if !disabledPredicates.includes("before")}<option value="before">Before</option
          >{/if}
        {#if !disabledPredicates.includes("after")}<option value="after">After</option
          >{/if}
        {#if !disabledPredicates.includes("equals")}<option value="equals">Equals</option
          >{/if}
        {#if !disabledPredicates.includes("between")}<option value="between"
            >Between</option
          >{/if}
        {#if showFY && !disabledPredicates.includes("fiscal")}
          <option value="fiscal">Fiscal Year</option>
        {/if}
      {/if}
      {#if criteria === "duration"}
        {#if !disabledPredicates.includes("running")}<option value="running"
            >Running</option
          >{/if}
        {#if !disabledPredicates.includes("eq")}<option value="eq">Equal to</option>{/if}
        {#if !disabledPredicates.includes("lt")}<option value="lt">Less than</option>{/if}
        {#if !disabledPredicates.includes("gt")}<option value="gt">Greater than</option
          >{/if}
        {#if !disabledPredicates.includes("lte")}<option value="lte"
            >Less than or equal to</option
          >{/if}
        {#if !disabledPredicates.includes("gte")}<option value="gte"
            >Greater than or equal to</option
          >{/if}
      {/if}
    </select>
  </Field>
{/if}
{#if predicate}
  <Field label="Value {criteria === 'duration' ? '(hours)' : ''}">
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
        <input
          on:change={handleDurationChange}
          type="number"
          min={0.25}
          max={24}
          step={0.25}
        />
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
