<script lang="ts">
  import routes from "@/routes";
  import Router from "svelte-spa-router";
  import { Boundary } from "@crownframework/svelte-error-boundary";
</script>

<Boundary onError={console.error}>
  <Router {routes} />
</Boundary>
