<script lang="ts">
  import Tag from "@/core/Tag.svelte";
  import Field from "@/foundation/Field.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let elm: HTMLElement;

  $: if (elm && scrollTo) {
    elm.scrollIntoView({ inline: "start", behavior: "smooth" });
  }

  export let value: Number;
  export let color = "white";
  export let scrollTo = false;
  export let highlight = false;
  export let heading: string = "";
  export let actual: Promise<number> | number | undefined = undefined;
</script>

<div class="p-4">
  <strong
    bind:this={elm}
    class:ring-2={highlight}
    style={$$props.style || ""}
    class="m-2 flex items-center justify-center rounded-lg p-1 ring-blue-500"
  >
    {heading}
  </strong>
  <Field label="Hrs">
    <input
      {value}
      min={0}
      step={1}
      max={168}
      type="number"
      class="max-w-[80px]"
      readonly={$$props.readonly}
      on:change={(e) => dispatch("change", Number(e.currentTarget.value))}
    />
    <div slot="upper-right" class="h-full w-full">
      {#await actual then actual}
        {#if actual}
          <Tag
            title="Actual hours"
            background={color}
            class="!m-0 flex h-full w-full !max-w-none items-center justify-center !p-0 !shadow-xl"
            >{actual}</Tag
          >
        {/if}
      {/await}
    </div>
  </Field>
</div>
