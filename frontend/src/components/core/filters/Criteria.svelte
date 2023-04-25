<script lang="ts">
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";

  export let criteria: Filter.Criteria | undefined = undefined;
  export let predicate: Filter.Predicate | undefined = undefined;
  export let value: string | undefined = undefined;
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
{#if criteria === "project" || criteria === "title"}
  <Field label="Predicate">
    <select bind:value={predicate}>
      <option>Choose...</option>
      <option value="starts_with">Starts with</option>
      <option value="ends_with">Ends with</option>
      <option value="contains">Contains</option>
      <option value="equals">Equals</option>
    </select>
  </Field>
{/if}
{#if criteria === "project" || criteria === "title"}
  <Field label="Value">
    {#if criteria === "project" && predicate === "equals"}
      <select bind:value>
        {#each $projects as project}
          <option value={project._id}>{project.name}</option>
        {/each}
      </select>
    {:else}
      <input bind:value />
    {/if}
  </Field>
{/if}
