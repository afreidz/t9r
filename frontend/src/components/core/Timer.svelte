<script lang="ts">
  import Link from "../foundation/Link.svelte";
  import type { Writable } from "svelte/store";
  import type { Project } from "@/backend/schema/project";
  import observeResize, { type ResizeObserverValue } from "@/lib/resize";

  export let project: Project | undefined = undefined;
  export let title: string | undefined = undefined;
  export let id: string | undefined = undefined;

  let size: Writable<ResizeObserverValue>;
  let timer: HTMLAnchorElement;
  let grad: string;

  $: if (project)
    grad = `linear-gradient(to right, ${project.color}80, ${project.color})`;

  $: if (timer) {
    size = observeResize(timer);
  }
</script>

{#if project && id}
  <Link
    bind:elm={timer}
    to={`/timer/${id}`}
    style={`background: ${grad}`}
    class="mb-2 flex items-center overflow-hidden !rounded-full leading-8 text-white"
  >
    <header
      style={`background: ${grad}`}
      class="flex flex-col justify-around rounded-full px-6 py-3"
    >
      <small class="font-mono leading-none opacity-50">{project.name}</small>
      <strong class="font-normal leading-tight">{title || "Timer"}</strong>
    </header>
    <div
      class="flex flex-1 items-center justify-end overflow-auto whitespace-nowrap pr-2 text-sm"
    >
      {#if size}
        <slot size={$size} />
      {/if}
    </div>
  </Link>
{/if}
