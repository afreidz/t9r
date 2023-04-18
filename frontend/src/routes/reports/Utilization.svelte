<script lang="ts">
  import Layout from "@/core/Layout.svelte";
  import Header from "@/core/Header.svelte";
  import { getFiscalYearStartMonth } from "@/lib/dates";
  import Copy from "@/components/foundation/Copy.svelte";

  getFiscalYearStartMonth("2024-01-02").then((d) => console.log(d.toString()));

  let startMonth: Temporal.PlainYearMonth;
  let loader = getFiscalYearStartMonth(Temporal.Now.plainDateISO()).then(
    (pd) => (startMonth = pd)
  );
</script>

<Layout {loader}>
  <Header main="Utilization" sub="Report" />
  {#if startMonth}
    <div class="flex flex-wrap gap-10">
      {#each new Array(12).fill(null) as _, m}
        {@const month = startMonth.add({ months: m })}
        {@const weeks = Math.ceil(month.daysInMonth / 7)}
        <div>
          <Copy>{month.toString()}</Copy>
          <ul class="grid w-80 grid-cols-7 gap-1" style="grid-template-rows: {weeks}">
            {#each new Array(month.daysInMonth) as _}
              <li class="aspect-square w-full rounded-sm bg-neutral-700" />
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</Layout>
