<script context="module">
  const tagCache = new Map();
</script>

<script lang="ts">
  import trpc from "@/lib/trpc";
  import Icon from "@iconify/svelte";
  import Tag from "@/core/Tag.svelte";
  import { formatTime } from "@/lib/dates";
  import Copy from "@/foundation/Copy.svelte";
  import type { Project } from "@/backend/schema/project";

  export let end: string | null | undefined = undefined;
  export let project: Project | undefined = undefined;
  export let title: string | undefined = undefined;
  export let date: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let tags: (string | undefined)[] = [];
  export let highlight = false;
  export let hours: number = 0;
  export let start: string;

  let grad: string;
  let elm: HTMLAnchorElement;

  $: if (project) {
    if (project.color2 && project.color3) {
      grad = `linear-gradient(to right, ${project.color}, ${project.color2}, ${project.color3})`;
    } else if (project.color2) {
      grad = `linear-gradient(to right, ${project.color}, ${project.color2})`;
    } else {
      grad = `linear-gradient(to right, ${project.color}, ${project.color})`;
    }
  }

  $: if (highlight) {
    setTimeout(() => {
      elm.scrollIntoView({ inline: "center", block: "center", behavior: "smooth" });
    }, 1);
  }

  async function getTagValue(t: string) {
    if (tagCache.has(t)) return tagCache.get(t);

    const existing = await trpc.tags.get.query(t);
    tagCache.set(t, existing?.value || t);

    return tagCache.get(t);
  }
</script>

{#if project}
  <a
    on:focus
    on:mouseover
    on:mouseleave
    bind:this={elm}
    href={`/#/timer/${id}`}
    class={`mx-auto mb-2 block max-w-[500px] rounded-md p-6 text-left text-white shadow-lg ${
      $$props.class || ""
    }`}
    class:ring-2={highlight}
    class:ring-white={highlight}
    style={`background: ${grad}; ${$$props.style || ""}`}
  >
    <header class="flex justify-between gap-2">
      <div class="flex max-w-[10rem] flex-1 flex-col items-center">
        <Copy as="small" dim variant="pseudomono" class="text-sm">Hours</Copy>
        <Copy as="strong" variant="gradient" class="text-4xl">
          {hours}
        </Copy>
      </div>
      <div class="flex flex-1 flex-col items-center">
        <div class="text-left">
          <Copy as="small" dim variant="pseudomono" class="text-sm">{project.name}</Copy>
          <span class="line-clamp-1">{title}</span>
        </div>
      </div>
    </header>
    {#if date}
      <div class="flex justify-center pt-4">
        <Tag>{date}</Tag>
      </div>
    {/if}
    <div
      class="mt-6 flex items-center justify-between border-b border-t border-white/20 py-4"
    >
      <Tag>{formatTime(start)}</Tag>
      <Icon icon="material-symbols:arrow-range" class="text-xl" />
      <Tag>{end ? formatTime(end) : "running"}</Tag>
    </div>
    <footer class="mt-6 flex flex-wrap justify-evenly text-sm">
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
    </footer>
  </a>
{/if}
