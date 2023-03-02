<script lang="ts">
  import Icon from "@iconify/svelte";
  import { getToday, isToday } from "@/lib/dates";

  let date: Temporal.PlainDate = getToday();
  let picker: HTMLInputElement;
  let buttonClasses =
    "my-2 w-8 h-8 rounded bg-neutral-light/5 flex items-center justify-center disabled:opacity-30";

  $: {
    if (picker) picker.max = Temporal.Now.plainDateISO().toString();
  }

  function showPicker() {
    if (picker) picker.showPicker();
  }

  function updateDate(s: string) {
    const d = Temporal.PlainDate.from(s);
    date = d;
  }

  function nextDate() {
    date = date.add({ days: 1 });
  }

  function prevDate() {
    date = date.subtract({ days: 1 });
  }

  export { date };
</script>

<div class="flex flex-none justify-between border-b border-neutral-900 px-3">
  <div>
    <button
      class={buttonClasses}
      disabled={isToday(date)}
      on:click={() => (date = getToday())}
    >
      <Icon icon="ic:round-arrow-circle-down" />
    </button>
  </div>
  <div class="flex gap-2">
    <button class={buttonClasses} on:click={prevDate}>
      <Icon icon="ooui:previous-ltr" />
    </button>
    <button class={buttonClasses} on:click={nextDate} disabled={isToday(date)}>
      <Icon icon="ooui:previous-rtl" />
    </button>
  </div>
  <div>
    <button class={buttonClasses} on:click={showPicker}>
      <Icon icon="material-symbols:calendar-month-outline-sharp" />
      <input
        type="date"
        bind:this={picker}
        on:change={(e) => updateDate(e.currentTarget.value)}
        class="invisible h-px w-px"
      />
    </button>
  </div>
</div>
