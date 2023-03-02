<script lang="ts">
  import routes from "@/routes";
  import Router from "svelte-spa-router";
  import Layout from "./components/core/Layout.svelte";
</script>

<Layout>
  <Router {routes} />
</Layout>
