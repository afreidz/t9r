<script lang="ts">
  import Copy from "@/foundation/Copy.svelte";
  import { createEventDispatcher } from "svelte";

  let dispatch = createEventDispatcher();
  export let color: string = "";
  export let enabled = false;
  export let name: string;
  export let label = "";

  function handleChange(e: { currentTarget: { checked: boolean } }) {
    enabled = e.currentTarget.checked;
    dispatch("change", enabled);
  }
</script>

<label class={`flex items-center ${$$props.class || ""}`}>
  <Copy dim as="span" light variant="pseudomono" class="mr-2 text-sm">{label}</Copy>
  <input
    {name}
    id={name}
    type="checkbox"
    checked={enabled}
    class={`peer hidden`}
    on:change={handleChange}
  />
  <div
    style={`background-color: ${enabled ? color : "bg-neutral-800"}`}
    class="relative flex h-9 w-[65px] shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-neutral-800 align-middle shadow-xl transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
  >
    <span class="sr-only">{enabled ? "enabled" : "disabled"}</span>
    <span
      aria-hidden="true"
      class={`pointer-events-none inline-grid h-8 w-8 transform place-content-center rounded-full bg-white text-neutral-600 shadow-lg ring-0 transition duration-200 ease-in-out ${
        enabled ? "translate-x-7" : "translate-x-0"
      } `}
    />
  </div>
</label>
