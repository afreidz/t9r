<script context="module">
  const tagCache = new Map();
</script>

<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import Check from "@/foundation/Check.svelte";
  import selectedTimers from "@/lib/stores/selected";
  import type { Project } from "@/backend/schema/project";

  export let project: Project | undefined = undefined;
  export let disableNav: boolean | undefined = false;
  export let title: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let tags: (string | undefined)[] = [];
  export let color: string = "black";
  export let selectMode = false;
  export let highlight = false;

  let grad: string;
  let elm: HTMLElement;
  let timer: ReturnType<typeof setTimeout>;
  let as: keyof HTMLElementTagNameMap = "a";

  $: if (disableNav || selectMode) {
    as = selectMode ? "label" : "div";
  }

  $: if (highlight) {
    timer = setTimeout(() => {
      elm?.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
    }, 600);
  } else {
    clearTimeout(timer);
  }

  $: if (project) {
    if (project.color2 && project.color3) {
      grad = `linear-gradient(to right, ${project.color}, ${project.color2}, ${project.color3})`;
    } else if (project.color2) {
      grad = `linear-gradient(to right, ${project.color}, ${project.color2})`;
    } else {
      grad = `linear-gradient(to right, ${project.color}, ${project.color})`;
    }
  }

  $: if (!project && color) {
    grad = color;
  }

  async function getTagValue(t: string) {
    if (tagCache.has(t)) return tagCache.get(t);

    const existing = await trpc.tags.get.query(t);
    tagCache.set(t, existing?.value || t);

    return tagCache.get(t);
  }
</script>

<svelte:element
  this={as}
  on:focus
  on:mouseover
  on:mouseleave
  bind:this={elm}
  class:ring-2={highlight}
  class:ring-white={highlight}
  inert={!disableNav ? undefined : true}
  href={!disableNav && !selectMode ? $$props.href || `/#/timer/${id}` : undefined}
  class={`relative z-10 mb-2 flex h-10 flex-none items-center overflow-auto !rounded-full text-white shadow-md md:h-14 ${
    $$props.class || ""
  }`}
  style={`background: ${grad}; ${$$props.style || ""}`}
>
  <figure
    class="flex w-full max-w-[40px] shrink-0 items-center justify-center md:max-w-[56px]"
  >
    {#if selectMode}
      <Check checked={!!id && $selectedTimers.includes(id)} on:change />
    {:else}
      <Tag class="!m-0 h-8 w-8 !max-w-none justify-center !p-0 text-2xl font-semibold"
        >{project?.name.charAt(0) || title?.charAt(0)}</Tag
      >
    {/if}
  </figure>
  <header class="flex flex-col">
    <Copy
      dim
      as="small"
      variant="pseudomono"
      class="shrink text-left text-xs leading-none line-clamp-1"
      >{project?.name || ""}</Copy
    >
    <strong class="text-sm font-normal !leading-none line-clamp-1 md:text-lg"
      >{title || "Timer"}</strong
    >
  </header>
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
            <Tag>
              {#await getTagValue(tag)}
                <Icon icon="eos-icons:loading" class="h-3 w-3 text-white" />
              {:then tagValue}
                {tagValue}
              {/await}
            </Tag>
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
</svelte:element>

<style>
  ::-webkit-scrollbar {
    display: none;
  }

  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
