<script lang="ts">
  import Link from "../foundation/Link.svelte";
  import type { Writable } from "svelte/store";
  import type { Project } from "@/backend/schema/project";
  import type { HTMLAnchorAttributes } from "svelte/elements";
  import observeResize, { type ResizeObserverValue } from "@/lib/resize";

  type $$Props = HTMLAnchorAttributes & {
    disableNav?: boolean;
    project?: Project;
    title?: string;
    id?: string;
  };

  export let project: Project | undefined = undefined;
  export let disableNav: boolean | undefined = false;
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

{#if project}
  <Link
    bind:elm={timer}
    to={`/timer/${id}`}
    disabled={disableNav}
    style={`background: ${grad}`}
    class={`mb-2 flex items-center overflow-hidden !rounded-full text-white ${$$props.class}`}
  >
    <header
      style={`background: ${grad}`}
      class="flex flex-col justify-around rounded-full px-6 py-2 md:py-3"
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
      {#if size}
        <slot size={$size} />
      {/if}
    </div>
  </Link>
{/if}
