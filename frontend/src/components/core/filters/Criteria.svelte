<script lang="ts">
  import tags from "@/lib/stores/tags";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";

  export let value: string | string[];
  export let criteria: Filter.Criteria | undefined = undefined;
  export let predicate: Filter.Predicate | undefined = undefined;

  $: if (criteria) predicate = undefined;
  $: if (predicate)
    value = criteria && ["date", "tags", "project"].includes(criteria) ? [] : "";
  $: if (["date", "tags", "project"]) value = [];
  $: if (criteria === "utilized") predicate = "equals";
  $: if (criteria === "tags" || criteria === "project") predicate = "contains";
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
{#if criteria === "title"}
  <Field label="Predicate">
    <select bind:value={predicate}>
      <option value="starts_with">Starts with</option>
      <option value="ends_with">Ends with</option>
      <option value="contains">Contains</option>
      <option value="equals">Equals</option>
    </select>
  </Field>
{:else if criteria === "date"}
  <Field label="Predicate">
    <select bind:value={predicate}>
      <option value="before">Before</option>
      <option value="after">After</option>
      <option value="equals">Equals</option>
      <option value="between">Between</option>
    </select>
  </Field>
{:else if criteria === "duration"}
  <Field label="Predicate">
    <select bind:value={predicate}>
      <option value="eq">Equal to</option>
      <option value="lt">Less than</option>
      <option value="gt">Greater than</option>
      <option value="lte">Less than or equal to</option>
      <option value="gte">Greater than or equal to</option>
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
      </select>
    {:else if criteria === "title"}
      <input bind:value />
    {:else if criteria === "date"}
      <input type="date" bind:value={value[0]} />
      {#if predicate === "between"}
        <input type="date" bind:value={value[1]} />
      {/if}
    {:else if criteria === "duration"}
      <input bind:value type="number" min={0.25} max={24} />
    {:else if criteria === "utilized"}
      <select bind:value>
        <option value={true}>true</option>
        <option value={false}>false</option>
      </select>
    {:else if criteria === "tags"}
      <select bind:value multiple>
        {#each $tags as tag}
          <option value={tag._id}>{tag.value}</option>
        {/each}
      </select>
    {/if}
  </Field>
{/if}
