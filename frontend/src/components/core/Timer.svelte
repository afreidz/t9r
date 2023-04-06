<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import { press } from "svelte-gestures";
  import tagStore from "@/lib/stores/tags";
  import { push } from "svelte-spa-router";
  import Copy from "@/foundation/Copy.svelte";
  import { isSelecting, selected } from "@/lib/stores/ui";
  import type { Project } from "@/backend/schema/project";

  export let project: Project | undefined = undefined;
  export let disableNav: boolean | undefined = false;
  export let title: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let tags: (string | undefined)[] = [];
  export let scrollto = false;

  let grad: string;
  let elm: HTMLAnchorElement;

  $: if (elm && scrollto) {
    elm.scrollIntoView({ inline: "end", block: undefined, behavior: "smooth" });
  }

  $: if (project)
    grad = `linear-gradient(to right, ${project.color}80, ${project.color})`;

  function clickHandler() {
    if ($isSelecting && id) {
      if ($selected.includes(id)) return ($selected = $selected.filter((t) => t !== id));
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
    bind:this={elm}
    inert={!disableNav ? undefined : true}
    href={`/#/timer/${id}`}
    class={`relative mb-2 flex h-10 flex-none items-center overflow-auto !rounded-2xl text-white md:h-14 ${
      $$props.class || ""
    }`}
    style={`background: ${grad}; ${$$props.style || ""}`}
  >
    <button
      class="sticky top-0 bottom-0 left-0 right-[200px] flex h-full flex-col justify-center gap-1 rounded-2xl px-4"
      on:press={holdHandler}
      on:click|preventDefault={clickHandler}
      style={`background: ${project.color}`}
      use:press={{ timeframe: 600, triggerBeforeFinished: true }}
      class:flex-none={tags.length > 0 ||
        $$slots.default ||
        $$slots.left ||
        $$slots.right}
      class:flex-1={tags.length === 0 &&
        !$$slots.default &&
        !$$slots.left &&
        !$$slots.right}
    >
      <Copy
        dim
        as="small"
        variant="pseudomono"
        class="flex-none text-xs leading-none line-clamp-1">{project.name}</Copy
      >
      <strong class="flex-none text-sm font-normal !leading-none line-clamp-1 md:text-lg"
        >{title || "Timer"}</strong
      >
    </button>
    {#if $$slots.left}
      <div class="flex-none pl-2">
        <slot name="left" />
      </div>
    {/if}
    {#if tags.length || $$slots.default || $$slots.right}
      <div class="flex flex-1 justify-center whitespace-nowrap text-sm">
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
    {/if}
    {#if $$slots.right}
      <div class="flex-none pr-2">
        <slot name="right" />
      </div>
    {/if}
  </a>
{/if}

<style>
  a::-webkit-scrollbar {
    display: none;
  }

  a {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
