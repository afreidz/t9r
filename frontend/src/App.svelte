<script lang="ts">
  import routes from "@/routes";
  import Router from "svelte-spa-router";
  import { globalError } from "@/lib/stores/ui";
</script>

<svelte:window on:unhandledrejection={(e) => ($globalError = e.reason)} />

<Router {routes} />
