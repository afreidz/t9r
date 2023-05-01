<script context="module">
  const tagCache = new Map();
</script>

<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import Copy from "@/foundation/Copy.svelte";
  import selectedTimers from "@/lib/stores/selected";
  import type { Project } from "@/backend/schema/project";

  export let project: Project | undefined = undefined;
  export let disableNav: boolean | undefined = false;
  export let title: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let tags: (string | undefined)[] = [];
  export let compact: boolean = false;
  export let color: string = "black";
  export let selectMode = false;
  export let highlight = false;
  export let scrollto = false;

  let grad: string;
  let elm: HTMLElement;
  let as: keyof HTMLElementTagNameMap = "a";

  $: if (disableNav || selectMode) {
    as = selectMode ? "label" : "div";
  }

  $: if (elm && scrollto) {
    elm.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
  }

  $: if (highlight) {
    setTimeout(() => {
      elm.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
    }, 1);
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
  class:pr-2={!compact}
  class:md:pl-4={!compact}
  class:ring-2={highlight}
  class:ring-white={highlight}
  class:justify-center={compact}
  inert={!disableNav ? undefined : true}
  href={disableNav || selectMode ? `/#/timer/${id}` : undefined}
  class={`relative z-10 mb-2 flex h-10 flex-none items-center overflow-auto !rounded-full text-white shadow-md md:h-14 ${
    $$props.class || ""
  }`}
  style={`background: ${grad}; ${$$props.style || ""}`}
>
  {#if selectMode}
    <input type="checkbox" checked={!!id && $selectedTimers.includes(id)} on:change />
  {:else}
    <Tag class="h-8 w-8 !max-w-none flex-none justify-evenly text-2xl font-semibold"
      >{project?.name.charAt(0) || title?.charAt(0)}</Tag
    >
  {/if}
  {#if !compact}
    <header class="ml-2 flex flex-col">
      <Copy
        dim
        as="small"
        variant="pseudomono"
        class="text-left text-xs leading-none line-clamp-1">{project?.name || ""}</Copy
      >
      <strong class="text-sm font-normal !leading-none line-clamp-1 md:text-lg"
        >{title || "Timer"}</strong
      >
    </header>
  {/if}
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
  {#if $$slots.right && !compact}
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
