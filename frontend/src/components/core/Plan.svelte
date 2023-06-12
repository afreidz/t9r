<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import Link from "@/foundation/Link.svelte";
  import Field from "@/foundation/Field.svelte";
  import { createEventDispatcher } from "svelte";
  import { formatForForecastWeek } from "@/lib/dates";

  const dispatch = createEventDispatcher();

  let elm: HTMLElement;

  $: if (elm && scrollTo) {
    elm.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  export let value: number;
  export let padded = false;
  export let showInfo = true;
  export let color = "white";
  export let scrollTo = false;
  export let highlight = false;
  export let heading: string = "";
  export let to: string | undefined = undefined;
  export let actual: Promise<number> | number | undefined = undefined;
</script>

<div class={$$props.class || ""}>
  <Link
    {highlight}
    to={to || "/"}
    disabled={!to}
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
      class:my-6={padded}
      readonly={$$props.readonly}
      class="w-full text-center text-2xl font-bold"
      on:change={(e) => dispatch("change", Number(e.currentTarget.value))}
    />
    <div slot="upper-right" class="h-6 min-w-[1.75rem]">
      {#if $$slots["upper-right"]}
        <slot name="upper-right" />
      {:else if showInfo && actual}
        {#await actual then actual}
          {#if actual}
            <Tag
              title="Actual hours"
              background={color}
              class="!m-0 flex h-full w-full !max-w-none translate-x-1/4 -translate-y-1/4 items-center justify-center !py-0 !text-[11px] !leading-3 !shadow-xl"
              >{actual}</Tag
            >
          {/if}
        {/await}
      {/if}
    </div>
    <div slot="lower-right" class="h-6 min-w-[1.75rem]">
      {#if $$slots["lower-right"]}
        <slot name="lower-right" />
      {:else if showInfo && actual}
        {#await actual then actual}
          {#if actual}
            {@const variance = actual - value}
            <Tag
              title="Variance"
              class="!m-0 flex h-full w-full !max-w-none translate-x-1/4 translate-y-1/4 items-center justify-center !py-0 !text-[11px] !leading-3 !shadow-xl {variance >=
              0
                ? '!bg-emerald-500'
                : '!bg-red-500'}">{variance > 0 ? "+" : ""}{variance}</Tag
            >
          {/if}
        {/await}
      {/if}
    </div>
  </Field>
</div>
