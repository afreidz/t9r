<script lang="ts">
  import Icon from "@iconify/svelte";
  import Layout from "@/components/core/Layout.svelte";
  import Link from "@/components/foundation/Link.svelte";
</script>

<Layout>
  <div class="flex flex-1 flex-col items-center justify-center ">
    <div class="flex justify-center text-5xl font-bold opacity-50">
      <Icon icon="mdi:face-cry-outline" /> App Crashed
    </div>
    <Link
      to="/"
      class="m-6 bg-gradient-to-br from-violet-600 to-cyan-600 p-4 px-6 uppercase text-white"
      >Go Home</Link
    >
  </div>
</Layout>
