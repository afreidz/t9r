<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";

  export let cols: number = 2;
  export let rows: number = 2;
  export let axis: number = 10;
  export let height: number = 320;
  let gridCols = "";
  let gridRows = "";

  $: gridCols = `4.5rem repeat(${cols}, minmax(0, 1fr))`;
  $: gridRows = `repeat(${rows}, minmax(0, 1fr)) 2.5rem`;
</script>

<section
  style={`grid-template-columns: ${gridCols}; grid-template-rows: ${gridRows}; height: ${height}px; `}
  class="group grid gap-y-1 rounded-md py-3"
>
  {#each new Array(cols / axis) as _, idx}
    <strong
      class:border-l={idx === 0}
      class="flex flex-col items-end justify-end border-r border-dotted border-white/10 text-xs font-light"
      style={`grid-column: ${idx * axis + 2} / span ${axis}; grid-row: 1 / span ${
        rows + 1
      }`}
    >
      <Copy dim as="span" variant="pseudomono" class="px-2">
        {axis * (idx + 1)}
      </Copy>
    </strong>
  {/each}
  <slot />
</section>
