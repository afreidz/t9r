<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import Link from "@/foundation/Link.svelte";
  import Field from "@/foundation/Field.svelte";
  import { createEventDispatcher } from "svelte";
  import { formatForForecastWeek } from "@/lib/dates";

  const dispatch = createEventDispatcher();

  let elm: HTMLElement;

  $: if (elm && scrollTo) {
    elm.scrollIntoView({ inline: "center", behavior: "smooth" });
  }

  $: if (week) heading = formatForForecastWeek(week);

  export let value: number;
  export let showInfo = true;
  export let color = "white";
  export let scrollTo = false;
  export let highlight = false;
  export let heading: string = "";
  export let week: Temporal.PlainDate | string;
  export let actual: Promise<number> | number | undefined = undefined;
</script>

<div>
  <Link
    {highlight}
    to={`/reports/week/${week.toString()}`}
    style={$$props.style || ""}
    class="m-2 flex items-center justify-center rounded-lg p-1 ring-blue-500"
  >
    <strong bind:this={elm}>{heading}</strong>
  </Link>
  <Field label="Hrs">
    <input
      {value}
      min={0}
      step={1}
      max={168}
      type="number"
      class="max-w-[80px] text-center text-2xl font-bold"
      readonly={$$props.readonly}
      on:change={(e) => dispatch("change", Number(e.currentTarget.value))}
    />
    <div slot="upper-right" class="h-6 min-w-[1.75rem]">
      {#if showInfo && actual}
        {#await actual then actual}
          {#if actual}
            <Tag
              title="Actual hours"
              background={color}
              class="!m-0 flex h-full w-full !max-w-none items-center justify-center !py-0 !text-[11px] !leading-3 !shadow-xl"
              >{actual}</Tag
            >
          {/if}
        {/await}
      {/if}
    </div>
    <div slot="lower-right" class="h-6 min-w-[1.75rem]">
      {#if showInfo && actual}
        {#await actual then actual}
          {#if actual}
            {@const percent = Number(actual)
              ? value === 0
                ? 100
                : (Number(actual) / value) * 100
              : 100}
            {@const variance = value === 0 ? 100 : Number((percent - 100).toFixed(0))}
            <Tag
              title="Variance"
              class="!p1 !m-0 flex h-full w-full !max-w-none items-center justify-center !py-0 !text-[11px] !leading-none !shadow-xl {variance >=
              0
                ? '!bg-emerald-500'
                : '!bg-red-500'}">{variance > 0 ? "+" : ""}{variance}%</Tag
            >
          {/if}
        {/await}
      {/if}
    </div>
  </Field>
</div>
