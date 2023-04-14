<script lang="ts">
  import { roundUp } from "@/lib/dates";
  export let value: string;
  let mm: number | string;
  let ap: "AM" | "PM";
  let hh: number;

  $: if (value) {
    const pt = Temporal.PlainTime.from(value).round(roundUp);

    hh = pt.hour === 12 ? 12 : pt.hour % 12;
    ap = pt.hour >= 12 ? "PM" : "AM";
    mm = pt.minute === 0 ? "00" : pt.minute;
  }

  function handleChange() {
    const hour = hh === 12 ? (ap === "AM" ? 23 : 12) : ap === "PM" ? hh + 12 : hh;

    const pt = new Temporal.PlainTime(hour, Number(mm));
    value = pt.toString();
  }

  const inputClass =
    "focus:ring-2 bg-white/5 p-3 text-center rounded-md ring-blue-500 flex font-mono w-fit appearance-none items-center justify-center text-xl lg:text-3xl";
</script>

<div class="flex justify-center gap-2">
  <input
    min={1}
    step={1}
    max={12}
    type="number"
    class={inputClass}
    bind:value={hh}
    on:change={handleChange}
    on:focus={(e) => e.currentTarget.select()}
  />
  <span class="flex items-center">:</span>
  <input
    type="number"
    min="00"
    max={45}
    step={15}
    bind:value={mm}
    pattern="[0-9]*"
    class={inputClass}
    on:change={handleChange}
    on:focus={(e) => e.currentTarget.select()}
    on:input={(e) => {
      if (e.currentTarget.value === "0") e.currentTarget.value = "00";
    }}
  />
  <select class={inputClass} class:ml-2={true} bind:value={ap} on:change={handleChange}>
    <option value="AM">AM</option>
    <option value="PM">PM</option>
  </select>
</div>
