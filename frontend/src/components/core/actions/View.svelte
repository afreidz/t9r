<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let current: Views = "list";
  export let disableTimeline = false;
  export let disableReport = false;
  let views: Views[] = [];

  $: views = [
    "list",
    disableTimeline ? undefined : "timeline",
    disableReport ? undefined : "report",
  ].filter(Boolean) as Views[];

  function cycle() {
    const ci = views.indexOf(current);
    const ni = (ci + 1) % views.length;
    current = views[ni];
  }
</script>

<Base {...$$restProps} on:click={cycle}>
  {#if current === "report"}
    <Icon icon="mdi:report-bar" />
  {:else if current === "list"}
    <Icon icon="ic:sharp-list" />
  {:else if current === "timeline"}
    <Icon icon="material-symbols:view-timeline-outline-sharp" />
  {/if}
</Base>
