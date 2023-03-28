<script lang="ts">
  import { roundUp } from "@/lib/dates";
  export let value: string;
  let ap: "AM" | "PM";
  let mm: number;
  let hh: number;

  $: if (value) {
    const pt = Temporal.PlainTime.from(value).round(roundUp);

    hh = pt.hour === 12 ? 12 : pt.hour % 12;
    ap = pt.hour >= 12 ? "PM" : "AM";
    mm = pt.minute;
  }

  function handleChange() {
    const hour =
      hh === 12 ? (ap === "AM" ? 23 : 12) : ap === "PM" ? hh + 12 : hh;

    const pt = new Temporal.PlainTime(hour, mm);
    value = pt.toString();
  }

  const inputClass =
    "focus:ring-2 rounded-md ring-blue-500 flex font-mono max-w-[3rem] w-fit appearance-none items-center justify-center text-xl lg:text-3xl";
</script>

<div class="ring-b mr-4 flex justify-center gap-2">
  <span class="flex items-center">
    <input
      step={1}
      min={1}
      max={12}
      type="number"
      class={inputClass}
      bind:value={hh}
      class:text-center={true}
      on:change={handleChange}
    />
    :
  </span>
  <select class={inputClass} bind:value={mm} on:change={handleChange}>
    <option value={0}>00</option>
    <option value={15}>15</option>
    <option value={30}>30</option>
    <option value={45}>45</option>
  </select>
  <select class={inputClass} bind:value={ap} on:change={handleChange}>
    <option value="AM">AM</option>
    <option value="PM">PM</option>
  </select>
</div>
