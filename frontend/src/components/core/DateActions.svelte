<script lang="ts">
  import Icon from "@iconify/svelte";
  import { push } from "svelte-spa-router";
  import { getToday, isToday } from "@/lib/dates";
  import Button from "@/foundation/Button.svelte";

  export let page: number | undefined = undefined;
  export let disableTimelineView: boolean = false;
  export let view: "list" | "timeline" = "list";
  export let disablePicker: boolean = !!page;
  export let date: Temporal.PlainDate;
  export let baseRoute:
    | "/timers/daily"
    | "/timers/monthly"
    | "/timers/weekly"
    | "/timers/all" = "/timers/daily";

  let picker: HTMLInputElement;
  let buttonClasses =
    "my-2 w-8 h-8 rounded bg-neutral-light/5 flex items-center justify-center disabled:opacity-30";

  $: if (disableTimelineView) view = "list";
  $: if (picker) picker.max = Temporal.Now.plainDateISO().toString();

  function showPicker() {
    if (picker) picker.showPicker();
  }

  function updateDate(s: string) {
    push(`${baseRoute}/${s}`);
  }

  function next() {
    if (page) return page++;

    const dest =
      baseRoute === "/timers/monthly"
        ? date.add({ months: 1 })
        : baseRoute === "/timers/weekly"
        ? date.add({ weeks: 1 })
        : date.add({ days: 1 });

    push(`${baseRoute}/${dest}`);
  }

  function prev() {
    if (page) return page--;

    const dest =
      baseRoute === "/timers/monthly"
        ? date.subtract({ months: 1 })
        : baseRoute === "/timers/weekly"
        ? date.subtract({ weeks: 1 })
        : date.subtract({ days: 1 });

    push(`${baseRoute}/${dest}`);
  }

  function toggleView() {
    view = view === "list" ? "timeline" : "list";
  }
</script>

<div class="flex flex-none justify-between border-b border-neutral-900 px-3">
  <div>
    {#if !disablePicker}
      <Button class={buttonClasses} on:click={showPicker}>
        <Icon icon="material-symbols:calendar-month-outline-sharp" />
        <input
          type="date"
          bind:this={picker}
          on:change={(e) => updateDate(e.currentTarget.value)}
          class="invisible h-px w-px"
        />
      </Button>
    {/if}
  </div>
  <div class="flex gap-2">
    <Button class={buttonClasses} on:click={prev}>
      <Icon icon="ooui:previous-ltr" />
    </Button>
    {#if !page}
      <Button
        class={buttonClasses}
        disabled={isToday(date)}
        on:click={() => updateDate(getToday().toString())}
      >
        <Icon icon="ic:round-arrow-circle-down" />
      </Button>
    {/if}
    <Button class={buttonClasses} on:click={next} disabled={!page && isToday(date)}>
      <Icon icon="ooui:previous-rtl" />
    </Button>
  </div>
  <div>
    <Button class={buttonClasses} on:click={toggleView} disabled={disableTimelineView}>
      {#if view === "list"}
        <Icon icon="ri:file-list-line" />
      {:else if view === "timeline"}
        <Icon icon="material-symbols:view-timeline-outline-sharp" />
      {/if}
    </Button>
  </div>
</div>
