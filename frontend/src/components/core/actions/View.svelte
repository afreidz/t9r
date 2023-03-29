<script lang="ts">
  import Base from "./Base.svelte";
  import Icon from "@iconify/svelte";

  export let current: Views = "list";
  export let disableTimeline = false;
  let views: Views[] = [];

  $: views = ["list", disableTimeline ? undefined : "timeline"].filter(
    Boolean
  ) as Views[];

  function cycle() {
    const ci = views.indexOf(current);
    const ni = (ci + 1) % views.length;
    current = views[ni];
  }
</script>

<Base {...$$restProps} on:click={cycle}>
  {#if current === "list"}
    <Icon icon="ic:baseline-list-alt" />
  {:else if current === "timeline"}
    <Icon icon="material-symbols:view-timeline-outline-sharp" />
  {/if}
</Base>
