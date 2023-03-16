<script lang="ts">
  export let value: string;
  let ap: "AM" | "PM";
  let hh: number;
  let mm: number;

  const inputClass =
    "focus:ring-2 rounded-md ring-blue-500 flex font-mono max-w-[3rem] w-fit appearance-none items-center justify-center text-xl lg:text-3xl";

  $: if (value) {
    const plainTime = Temporal.PlainTime.from(value).round({
      smallestUnit: "minute",
      roundingIncrement: 15,
      roundingMode: "ceil",
    });
    hh =
      plainTime.hour === 12 || plainTime.hour === 24 ? 12 : plainTime.hour % 12;
    mm = plainTime.minute;
    ap = plainTime.hour > 12 ? "PM" : "AM";
  }

  function handleChange<T extends HTMLInputElement | HTMLSelectElement>(
    e: Event,
    place: "hh" | "mm" | "ap"
  ) {
    const target = e.target as T;
    let HH;
    let nv;

    switch (place) {
      case "hh":
        HH = ap === "PM" ? Number(target.value) + 12 : Number(target.value);
        nv = new Temporal.PlainTime(HH, mm);
        value = nv.toString();
        break;
      case "mm":
        HH = ap === "PM" ? Number(hh) + 12 : Number(hh);
        nv = new Temporal.PlainTime(HH, Number(target.value));
        value = nv.toString();
        break;
      case "ap":
        HH = target.value === "PM" ? Number(hh) + 12 : Number(hh);
        nv = new Temporal.PlainTime(HH, mm);
        value = nv.toString();
        break;
    }
  }
</script>

<div class="ring-b mr-4 flex justify-center gap-2">
  <span class="flex items-center">
    <input
      step={1}
      min={1}
      max={12}
      value={hh}
      type="number"
      class={inputClass}
      class:text-center={true}
      on:change={(e) => handleChange(e, "hh")}
    />
    :
  </span>
  <select
    class={inputClass}
    value={mm}
    on:change={(e) => handleChange(e, "mm")}
  >
    <option value={0}>00</option>
    <option value={15}>15</option>
    <option value={30}>30</option>
    <option value={45}>45</option>
  </select>
  <select
    class={inputClass}
    value={ap}
    on:change={(e) => handleChange(e, "ap")}
  >
    <option value="AM">AM</option>
    <option value="PM">PM</option>
  </select>
</div>
