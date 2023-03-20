<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import { press } from "svelte-gestures";
  import tagStore from "@/lib/stores/tags";
  import { push } from "svelte-spa-router";
  import { isSelecting, selected } from "@/lib/stores/ui";
  import type { Project } from "@/backend/schema/project";

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
    if (disableNav) return;
    $isSelecting = true;
    return clickHandler();
  }
</script>

{#if project}
  <a
    href={`/#/timer/${id}`}
    class={`relative mb-2 flex items-center overflow-auto !rounded-2xl text-white ${
      $$restProps.class || ""
    }`}
    style={`background: ${grad}`}
  >
    <button
      class="sticky top-0 bottom-0 left-0 right-[200px] flex h-full flex-none flex-col justify-around rounded-2xl py-2 px-6 md:py-3"
      on:press={holdHandler}
      on:click|preventDefault={clickHandler}
      style={`background: ${project.color}`}
      use:press={{ timeframe: 600, triggerBeforeFinished: true }}
    >
      <small
        class="font-mono text-xs leading-none opacity-50 line-clamp-1 md:text-sm"
        >{project.name}</small
      >
      <strong
        class="text-sm font-normal leading-tight line-clamp-1 md:text-base"
        >{title || "Timer"}</strong
      >
    </button>
    <div class="flex-none">
      {#if $$slots.left}
        <slot name="left" />
      {/if}
    </div>
    <div class="flex flex-1 justify-end whitespace-nowrap pr-2 text-sm">
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
