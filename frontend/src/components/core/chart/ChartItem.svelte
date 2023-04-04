<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";

  export let index: number = 0;
  export let value: number = 0;
  export let label: string = "";
  export let color: string = "#cccccc";
  export let max: number | undefined = undefined;
  export let percent: number | undefined = undefined;

  let bg: string = "#cccccc";
  let grad = "";

  $: bg = `${color}66`;
  $: if (!percent) percent = max ? (value / max) * 100 : (value / 60) * 100;
  $: grad = `linear-gradient(to right, ${color}80, ${color})`;
</script>

{#if label}
  <Copy
    dim
    as="small"
    variant="pseudomono"
    style={`grid-row-start: ${index + 1}; grid-row-end: ${index + 2};`}
    class="col-start-1 col-end-2 cursor-pointer self-center text-xs"
    >{label}</Copy
  >
{/if}
<div
  style={`grid-column: ${label ? 2 : 1} / ${
    max ? "span " + max : -1
  }; grid-row-start: ${index + 1}; grid-row-end: ${index + 2}; ${
    max ? "background-color: " + bg : ""
  };`}
  class="my-2 flex flex-col justify-center overflow-hidden rounded-md transition-all ease-in-out"
>
  <Copy
    as="span"
    variant="pseudomono"
    style={`width: ${percent}%; background: ${grad};`}
    class="flex flex-1 items-center justify-center rounded-md bg-gradient-to-r from-indigo-400/50 to-indigo-400 px-3 text-xs transition-all ease-in-out group-hover:text-white/100 md:text-white/0"
    >{value}</Copy
  >
</div>
{#if label && max}
  <Copy
    as="small"
    variant="pseudomono"
    style={`grid-row-start: ${index + 1}; grid-row-end: ${
      index + 2
    }; grid-column-start: ${max + 3}; grid-column-end: ${max + 5}`}
    class="flex items-center justify-start px-2 text-xs transition-colors group-hover:text-white/100 md:text-white/0"
  >
    {max}
    {#if percent && percent > 100}<i
        class="ml-2 h-2 w-2 rounded-full bg-red-500 text-white/0 transition-opacity group-hover:opacity-100 md:opacity-0"
        >over</i
      >{/if}
  </Copy>
{/if}
