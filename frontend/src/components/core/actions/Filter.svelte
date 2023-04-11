<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import tags from "@/lib/stores/tags";
  import { fly } from "svelte/transition";
  import projects from "@/lib/stores/projects";
  import Field from "@/foundation/Field.svelte";
  import breakpoints from "@/lib/stores/breakpoints";
  import Button from "@/components/foundation/Button.svelte";

  let shown = false;
  let elm: HTMLElement;
</script>

<Base {...$$restProps} on:click={() => (shown = !shown)}>
  <span class="sr-only" bind:this={elm}>Filter items</span>
  <Icon icon="material-symbols:filter-alt-outline-sharp" />
</Base>

{#if shown}
  {@const box = elm.getBoundingClientRect()}
  <div
    class="fixed z-30 mt-7 w-full min-w-min max-w-md px-2 md:mt-6 md:-translate-x-1/2"
    transition:fly={{ y: 80, duration: 300 }}
    style="left: {$breakpoints.md ? box.left : 0}px; top: {box.top}px;"
  >
    <div
      class="min-h-[400px] w-full rounded-md border border-black/20 bg-neutral-900/50 p-4 shadow-2xl backdrop-blur-md"
    >
      <Field label="Project">
        <select multiple>
          {#each $projects as project}
            <option value={project._id}>{project.name}</option>
          {/each}
        </select>
      </Field>
      <Field label="Tags">
        <select multiple>
          {#each $tags as tag}
            <option value={tag._id}>{tag.value}</option>
          {/each}
        </select>
      </Field>
      <Field label="Utilization">
        <select multiple>
          <option value={true}>Utilized</option>
          <option value={false}>Not Utilized</option>
        </select>
      </Field>
      <Button class="roun" />
    </div>
  </div>
{/if}
