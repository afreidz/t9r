<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import { writable } from "svelte/store";
  import { press } from "svelte-gestures";
  import tagStore from "@/lib/stores/tags";
  import { push } from "svelte-spa-router";
  import Copy from "@/foundation/Copy.svelte";
  import breakpoints from "@/lib/stores/breakpoints";
  import { isSelecting, selected } from "@/lib/stores/ui";
  import type { Project } from "@/backend/schema/project";
  import observeResize, { type ResizeObserverValue } from "@/lib/resize";

  export let project: Project | undefined = undefined;
  export let disableNav: boolean | undefined = false;
  export let size = writable<ResizeObserverValue>();
  export let title: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let tags: (string | undefined)[] = [];
  export let compact: boolean = true;
  export let buttonFlex = false;
  export let scrollto = false;

  let grad: string;
  let elm: HTMLAnchorElement;

  $: if (elm && scrollto) {
    elm.scrollIntoView({ inline: "end", block: undefined, behavior: "smooth" });
  }

  $: if (project) {
    if (project.color2 && project.color3) {
      grad = `linear-gradient(to right, ${project.color}, ${project.color2}, ${project.color3})`;
    } else if (project.color2) {
      grad = `linear-gradient(to right, ${project.color}, ${project.color2})`;
    } else {
      grad = `linear-gradient(to right, ${project.color}80, ${project.color})`;
    }
  }

  $: if (elm) observeResize(elm, size);
  $: if ($size && $size.width > ($breakpoints.md ? 112 : 80)) compact = false;

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
    href={`/#/timer/${id}`}
    inert={!disableNav ? undefined : true}
    class={`relative mb-2 flex h-10 flex-none items-center overflow-auto !rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-700 to-sky-900 text-white shadow-2xl md:h-14 ${
      $$props.class || ""
    }`}
    style={`background: ${grad}; ${$$props.style || ""}`}
  >
    <button
      class="sticky top-0 bottom-0 left-0 right-[200px] flex h-full items-center justify-center gap-1 rounded-full drop-shadow-timer"
      on:press={holdHandler}
      class:px-4={!compact}
      class:flex-col={!compact}
      class:flex-1={buttonFlex || compact}
      style={`background: ${project.color}`}
      on:click|preventDefault={clickHandler}
      class:flex-none={!buttonFlex && !compact}
      use:press={{ timeframe: 600, triggerBeforeFinished: true }}
    >
      {#if compact}
        <Tag class="h-8 w-8 !max-w-none flex-none text-center text-2xl font-semibold"
          >{project.name.charAt(0)}</Tag
        >
      {:else}
        <Copy
          dim
          as="small"
          variant="pseudomono"
          class="w-full flex-none text-left text-xs leading-none line-clamp-1"
          >{project.name}</Copy
        >
        <strong
          class="flex-none text-sm font-normal !leading-none line-clamp-1 md:text-lg"
          >{title || "Timer"}</strong
        >
      {/if}
    </button>
    {#if $$slots.left && !compact}
      <div class="flex-none pl-2">
        <slot name="left" />
      </div>
    {/if}
    {#if (tags.length || $$slots.default || $$slots.right) && !compact}
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
    {#if $$slots.right && !compact}
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
