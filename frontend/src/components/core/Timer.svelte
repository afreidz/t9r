<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import { press } from "svelte-gestures";
  import tagStore from "@/lib/stores/tags";
  import { push } from "svelte-spa-router";
  import { isSelecting, selected } from "@/lib/stores/ui";
  import type { Project } from "@/backend/schema/project";
  import type { HTMLAnchorAttributes } from "svelte/elements";

  type $$Props = HTMLAnchorAttributes & {
    tags?: (string | undefined)[];
    disableNav?: boolean;
    project?: Project;
    title?: string;
    id?: string;
  };

  export let project: Project | undefined = undefined;
  export let disableNav: boolean | undefined = false;
  export let title: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let tags: (string | undefined)[] = [];

  let grad: string;

  $: if (project)
    grad = `linear-gradient(to right, ${project.color}80, ${project.color})`;

  function clickHandler() {
    if ($isSelecting && id) {
      if ($selected.includes(id))
        return ($selected = $selected.filter((t) => t !== id));
      return ($selected = [...new Set([...$selected, id])]);
    }
    if (!disableNav) return push(`/timer/${id}`);
    return;
  }

  function holdHandler() {
    $isSelecting = true;
    return clickHandler();
  }
</script>

{#if project}
  <a
    class={`mb-2 flex items-center overflow-hidden !rounded-2xl text-white ${$$props.class}`}
    on:press={holdHandler}
    href={`/#/timer/${id}`}
    style={`background: ${grad}`}
    on:click|preventDefault={clickHandler}
    class:focus-within:ring-0={$isSelecting}
    class:!ring-2={id && $selected.includes(id)}
    use:press={{ timeframe: 600, triggerBeforeFinished: true }}
  >
    <header
      style={`background: ${grad}`}
      class="flex flex-col justify-around rounded-2xl px-6 py-2 md:py-3"
    >
      <small class="font-mono text-xs leading-none opacity-50 md:text-sm"
        >{project.name}</small
      >
      <strong class="text-sm font-normal leading-tight md:text-base"
        >{title || "Timer"}</strong
      >
    </header>
    <div
      class="flex flex-1 items-center justify-end overflow-auto whitespace-nowrap pr-2 text-sm"
    >
      {#if tags && tags.length > 0}
        {#each tags as tag}
          {#if tag}
            <Tag>{$tagStore.find((t) => t._id === tag)?.value || tag}</Tag>
          {/if}
        {/each}
      {:else}
        <slot />
      {/if}
    </div>
  </a>
{/if}
