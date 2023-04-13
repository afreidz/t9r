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
    const hour = hh === 12 ? (ap === "AM" ? 23 : 12) : ap === "PM" ? hh + 12 : hh;

    const pt = new Temporal.PlainTime(hour, mm);
    value = pt.toString();
  }

  const inputClass =
    "focus:ring-2 text-center rounded-md ring-blue-500 flex font-mono max-w-[3rem] w-fit appearance-none items-center justify-center text-xl lg:text-3xl";
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
      on:change={handleChange}
      on:focus={(e) => e.currentTarget.select()}
    />
    :
  </span>
  <input
    type="number"
    class={inputClass}
    step={15}
    min="00"
    max={45}
    pattern="[0-9]*"
    bind:value={mm}
    on:change={handleChange}
    on:focus={(e) => e.currentTarget.select()}
    on:input={(e) => {
      if (e.currentTarget.value === "0") e.currentTarget.value = "00";
    }}
  />
  <select class={inputClass} bind:value={ap} on:change={handleChange}>
    <option value="AM">AM</option>
    <option value="PM">PM</option>
  </select>
</div>
