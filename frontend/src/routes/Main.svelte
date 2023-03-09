<script lang="ts">
  import { getToday } from "@/lib/dates";
  import { replace } from "svelte-spa-router";
  replace(`/timers/daily/${getToday()}`);
</script>
