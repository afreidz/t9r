<script lang="ts">
  export let index: number = 0;
  export let value: number = 0;
  export let label: string = "";
  export let color: string = "#cccccc";
  export let max: number | undefined = undefined;

  let percent: number | undefined;
  let bg: string = "#cccccc";
  let grad = "";

  $: bg = `${color}66`;
  $: percent = max ? (value / max) * 100 : value;
  $: grad = `linear-gradient(to right, ${color}80, ${color})`;
</script>

<small
  style={`grid-row-start: ${index + 1}; grid-row-end: ${index + 2};`}
  class="col-start-1 col-end-2 cursor-pointer self-center font-mono text-xs opacity-50"
  >{label}</small
>
<div
  style={`grid-column: 2 / ${max ? "span " + max : -1}; grid-row-start: ${
    index + 1
  }; grid-row-end: ${index + 2}; ${max ? "background-color: " + bg : ""};`}
  class="my-2 flex flex-col justify-center overflow-hidden rounded-md"
>
  <span
    style={`width: ${percent}%; background: ${grad};`}
    class="flex flex-1 items-center justify-center rounded-md bg-gradient-to-r from-indigo-400/50 to-indigo-400 px-3 font-mono text-xs transition-colors group-hover:text-white/100 md:text-white/0"
    >{value}</span
  >
</div>
{#if max}
  <small
    style={`grid-row-start: ${index + 1}; grid-row-end: ${
      index + 2
    }; grid-column-start: ${max + 3}; grid-column-end: ${max + 5}`}
    class="flex items-center justify-start px-2 font-mono text-xs transition-colors group-hover:text-white/100 md:text-white/0"
  >
    {max}
    {#if percent && percent > 100}<i
        class="ml-2 h-2 w-2 rounded-full bg-red-500 text-white/0 transition-opacity group-hover:opacity-100 md:opacity-0"
        >over</i
      >{/if}
  </small>
{/if}
